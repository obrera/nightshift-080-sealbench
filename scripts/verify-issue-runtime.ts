import { type ChildProcess, spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const baseUrl = process.env.SEALBENCH_BASE_URL ?? 'http://localhost:3000'
const expectIssued = process.env.SEALBENCH_EXPECT_ISSUED === 'true'
const fallbackWalletAddress = '11111111111111111111111111111111'

interface IssueResponse {
  packet?: {
    assetAddress?: null | string
    transactionSignature?: null | string
  }
  status?: {
    mode?: string
  }
}

interface PacketResponse {
  packet: {
    id: string
  }
}

interface SessionResponse {
  id: string
}

async function main() {
  const localServer = process.argv.includes('--serve') ? await startLocalServer() : null

  try {
    await verifyIssuePath()
  } finally {
    localServer?.stop()
  }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  const payload = await response.json()
  if (!response.ok) {
    throw new Error(JSON.stringify(payload))
  }
  return payload as T
}

async function startLocalServer() {
  const tempDir = mkdtempSync(join(tmpdir(), 'sealbench-runtime-'))
  const server = spawn('bun', ['run', 'server'], {
    env: {
      ...process.env,
      PORT: '3000',
      SEALBENCH_DB_PATH: join(tempDir, 'sealbench.sqlite'),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  server.stdout?.on('data', (chunk: unknown) => process.stdout.write(String(chunk)))
  server.stderr?.on('data', (chunk: unknown) => process.stderr.write(String(chunk)))
  await waitForHealth(server)

  return {
    stop() {
      server.kill('SIGTERM')
      rmSync(tempDir, { force: true, recursive: true })
    },
  }
}

async function verifyIssuePath() {
  const walletAddress = process.env.SEALBENCH_VERIFY_WALLET?.trim() || fallbackWalletAddress
  await request('/api/health', { method: 'GET' })
  const bootstrap = await request('/api/bootstrap', { method: 'GET' })
  const session = await request<SessionResponse>('/api/session', {
    body: JSON.stringify({
      domain: new URL(baseUrl).host,
      statement: 'Scripted SIWS-shaped verification path for SealBench runtime check.',
      walletAddress,
    }),
    method: 'POST',
  })

  const packetDetail = await request<PacketResponse>('/api/evidence', {
    body: JSON.stringify({
      counterparty: 'Runtime Verification Counterparty',
      documentTitle: 'Runtime proof seal smoke packet',
      documentType: 'Verification Memorandum',
      pastedContent: `SealBench runtime verification ${session.id}`,
      summary: 'Script-created packet that exercises the same issue endpoint used by the UI.',
      walletAddress,
    }),
    method: 'POST',
  })

  const packet = packetDetail.packet
  await request(`/api/evidence/${packet.id}/review`, {
    body: JSON.stringify({
      actor: walletAddress,
      detail: 'Runtime smoke review approved for endpoint exercise.',
      expiresAt: '2027-05-07',
      riskLevel: 'scripted-low',
      status: 'approved',
    }),
    method: 'PATCH',
  })

  const issueResponse = await fetch(`${baseUrl}/api/evidence/${packet.id}/issue`, {
    body: JSON.stringify({ walletAddress }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  const issuePayload = (await issueResponse.json()) as IssueResponse

  if (!issueResponse.ok) {
    const result = issuePayload.status?.mode === 'missing_config' ? 'missing_config' : 'blocked'
    console.log(JSON.stringify({ bootstrap, expectIssued, issuePayload, packetId: packet.id, result }, null, 2))
    process.exitCode = expectIssued || issuePayload.status?.mode !== 'missing_config' ? 1 : 0
    return
  }

  const assetAddress = issuePayload.packet?.assetAddress
  const transactionSignature = issuePayload.packet?.transactionSignature
  if (!assetAddress || !transactionSignature) {
    console.log(
      JSON.stringify(
        {
          bootstrap,
          expectIssued,
          issuePayload,
          packetId: packet.id,
          result: 'issued_receipt_missing_asset_or_transaction',
        },
        null,
        2,
      ),
    )
    process.exitCode = 1
    return
  }

  console.log(
    JSON.stringify(
      {
        assetAddress,
        bootstrap,
        expectIssued,
        packetId: packet.id,
        result: 'issued',
        transactionSignature,
      },
      null,
      2,
    ),
  )
}

async function waitForHealth(server: ChildProcess) {
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`server exited before health check with code ${server.exitCode}`)
    }
    try {
      const response = await fetch(`${baseUrl}/api/health`)
      if (response.ok) {
        return
      }
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error('timed out waiting for local SealBench server')
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
