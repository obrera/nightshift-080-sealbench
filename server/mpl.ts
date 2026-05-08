import { MPL_CORE_PROGRAM_ADDRESS } from '@obrera/mpl-core-kit-lib'
import { getCreateV1Instruction } from '@obrera/mpl-core-kit-lib/generated'
import {
  address,
  appendTransactionMessageInstruction,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createTransactionMessage,
  generateKeyPairSigner,
  getBase58Encoder,
  getBase64Encoder,
  getSignatureFromTransaction,
  pipe,
  sendTransactionWithoutConfirmingFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from '@solana/kit'

export interface MplRuntimeStatus {
  canIssue: boolean
  missing: string[]
  mode: 'configured' | 'missing_config'
  programAddress: string
}

const requiredEnv = ['MPL_RPC_URL', 'MPL_ISSUER_PRIVATE_KEY', 'MPL_ISSUER_ADDRESS']

type IssueResult =
  | {
      assetAddress: string
      issuerWallet: string
      ok: true
      transactionSignature: string
    }
  | {
      blocker: string
      ok: false
      proofDraft?: {
        assetAddress?: string
        documentHash: string
        name: string
        owner: string
        uri: string
      }
      status: MplRuntimeStatus
    }

export function getMplRuntimeStatus(): MplRuntimeStatus {
  const missing = requiredEnv.filter((key) => !process.env[key])
  return {
    canIssue: missing.length === 0,
    missing,
    mode: missing.length === 0 ? 'configured' : 'missing_config',
    programAddress: String(MPL_CORE_PROGRAM_ADDRESS),
  }
}

export async function issueMplProofSeal(input: {
  documentHash: string
  packetId: string
  title: string
  walletAddress: string
}): Promise<IssueResult> {
  const status = getMplRuntimeStatus()
  const name = `SealBench ${input.packetId}`
  const uri = `sealbench://packet/${input.packetId}?sha256=${input.documentHash}`

  if (!status.canIssue) {
    return {
      blocker: `Missing MPL runtime env: ${status.missing.join(', ')}`,
      ok: false as const,
      proofDraft: {
        documentHash: input.documentHash,
        name,
        owner: input.walletAddress,
        uri,
      },
      status,
    }
  }

  const issuerResult = await getIssuerSigner()
  if (!issuerResult.ok) {
    return {
      blocker: issuerResult.blocker,
      ok: false as const,
      proofDraft: {
        documentHash: input.documentHash,
        name,
        owner: input.walletAddress,
        uri,
      },
      status,
    }
  }

  const issuer = issuerResult.signer
  const configuredIssuerAddress = process.env.MPL_ISSUER_ADDRESS
  if (configuredIssuerAddress !== issuer.address) {
    return {
      blocker: 'MPL_ISSUER_ADDRESS does not match MPL_ISSUER_PRIVATE_KEY',
      ok: false as const,
      proofDraft: {
        documentHash: input.documentHash,
        name,
        owner: input.walletAddress,
        uri,
      },
      status,
    }
  }

  const asset = await generateKeyPairSigner()
  const rpc = createSolanaRpc(process.env.MPL_RPC_URL!)
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send()
  const instruction = getCreateV1Instruction({
    asset,
    authority: issuer,
    name,
    owner: address(input.walletAddress),
    payer: issuer,
    updateAuthority: issuer.address,
    uri,
  })
  const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (message) => setTransactionMessageFeePayerSigner(issuer, message),
    (message) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, message),
    (message) => appendTransactionMessageInstruction(instruction, message),
  )
  const signedTransaction = await signTransactionMessageWithSigners(transactionMessage)
  const transactionSignature = getSignatureFromTransaction(signedTransaction)

  try {
    const sendTransaction = sendTransactionWithoutConfirmingFactory({ rpc })
    await sendTransaction(signedTransaction, { commitment: 'confirmed' })
  } catch (error) {
    return {
      blocker: `MPL Core transaction submission failed: ${error instanceof Error ? error.message : String(error)}`,
      ok: false as const,
      proofDraft: {
        assetAddress: asset.address,
        documentHash: input.documentHash,
        name,
        owner: input.walletAddress,
        uri,
      },
      status,
    }
  }

  return {
    assetAddress: asset.address,
    issuerWallet: issuer.address,
    ok: true as const,
    transactionSignature,
  }
}

async function getIssuerSigner() {
  try {
    const keypairBytes = parseSecretKey(process.env.MPL_ISSUER_PRIVATE_KEY!)
    return { ok: true as const, signer: await createKeyPairSignerFromBytes(keypairBytes) }
  } catch (error) {
    return {
      blocker: `Invalid MPL_ISSUER_PRIVATE_KEY: ${error instanceof Error ? error.message : String(error)}`,
      ok: false as const,
    }
  }
}

function parseSecretKey(rawValue: string) {
  const value = rawValue.trim()
  if (value.startsWith('[')) {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed)) {
      throw new Error('MPL_ISSUER_PRIVATE_KEY JSON must be an array')
    }
    return toSecretKeyBytes(parsed)
  }
  if (value.includes(',')) {
    return toSecretKeyBytes(value.split(',').map((part) => Number(part.trim())))
  }
  if (value.startsWith('base64:')) {
    return toSecretKeyBytes([...getBase64Encoder().encode(value.slice('base64:'.length).trim())])
  }
  return toSecretKeyBytes([...getBase58Encoder().encode(value)])
}

function toSecretKeyBytes(values: unknown[]) {
  const bytes = values.map((value) => {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 255) {
      throw new Error('MPL_ISSUER_PRIVATE_KEY must contain byte values from 0 to 255')
    }
    return value
  })
  if (bytes.length !== 64) {
    throw new Error('MPL_ISSUER_PRIVATE_KEY must decode to a 64-byte Solana secret key')
  }
  return new Uint8Array(bytes)
}
