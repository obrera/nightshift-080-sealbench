const baseUrl = process.env.SEALBENCH_BASE_URL ?? 'http://localhost:3000'

interface IssueResponse {
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
  const walletAddress = 'SealBenchVerifier111111111111111111111111111111'
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
    console.log(JSON.stringify({ issuePayload, packetId: packet.id, result: 'blocked' }, null, 2))
    process.exitCode = issuePayload.status?.mode === 'missing_config' ? 0 : 1
    return
  }

  console.log(JSON.stringify({ issuePayload, packetId: packet.id, result: 'issued' }, null, 2))
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

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
