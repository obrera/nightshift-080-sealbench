export interface AuditEntry {
  action: string
  actor: string
  at: string
  detail: string
  id: number
  packetId: string
}

export interface EvidencePacket {
  assetAddress: null | string
  counterparty: string
  createdAt: string
  documentHash: string
  documentTitle: string
  documentType: string
  expiresAt: null | string
  id: string
  issuedAt: null | string
  issuerWallet: null | string
  riskLevel: null | string
  status: PacketStatus
  summary: string
  transactionSignature: null | string
  updatedAt: string
  walletAddress: string
}

export interface IssueBlocker {
  blocker: string
  ok: false
  status: MplRuntimeStatus
}

export interface MplRuntimeStatus {
  canIssue: boolean
  missing: string[]
  mode: 'configured' | 'missing_config'
  programAddress: string
}

export interface PacketDetail {
  audit: AuditEntry[]
  packet: EvidencePacket
}

export type PacketStatus = 'approved' | 'draft' | 'needs-info' | 'rejected' | 'sealed'
