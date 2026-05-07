import { MPL_CORE_PROGRAM_ADDRESS } from '@obrera/mpl-core-kit-lib'
import { getCreateV1Instruction } from '@obrera/mpl-core-kit-lib/generated'

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
  if (!status.canIssue) {
    return {
      blocker: `Missing MPL runtime env: ${status.missing.join(', ')}`,
      ok: false as const,
      status,
    }
  }

  void getCreateV1Instruction
  return {
    blocker:
      'MPL runtime env is present, but this build intentionally stops before signing until an audited issuer key format and RPC submission path are configured.',
    ok: false as const,
    proofDraft: {
      documentHash: input.documentHash,
      name: `SealBench ${input.packetId}`,
      owner: input.walletAddress,
      uri: `sealbench://packet/${input.packetId}`,
    },
    status,
  }
}
