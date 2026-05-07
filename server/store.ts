import Database from 'better-sqlite3'
import { webcrypto } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

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

export type PacketStatus = 'approved' | 'draft' | 'needs-info' | 'rejected' | 'sealed'

export interface Session {
  createdAt: string
  domain: string
  id: string
  statement: string
  walletAddress: string
}

const dbPath = resolve(process.env.SEALBENCH_DB_PATH ?? './data/sealbench.sqlite')
mkdirSync(dirname(dbPath), { recursive: true })

const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

db.exec(`
  create table if not exists sessions (
    id text primary key,
    wallet_address text not null,
    domain text not null,
    statement text not null,
    created_at text not null
  );

  create table if not exists packets (
    id text primary key,
    wallet_address text not null,
    document_title text not null,
    document_type text not null,
    counterparty text not null,
    summary text not null,
    document_hash text not null,
    status text not null,
    risk_level text,
    expires_at text,
    asset_address text,
    transaction_signature text,
    issuer_wallet text,
    issued_at text,
    created_at text not null,
    updated_at text not null
  );

  create table if not exists audits (
    id integer primary key autoincrement,
    packet_id text not null,
    actor text not null,
    action text not null,
    detail text not null,
    at text not null,
    foreign key(packet_id) references packets(id)
  );
`)

export function createPacket(input: {
  counterparty: string
  documentHash: string
  documentTitle: string
  documentType: string
  summary: string
  walletAddress: string
}) {
  const timestamp = now()
  const packet: EvidencePacket = {
    assetAddress: null,
    counterparty: input.counterparty,
    createdAt: timestamp,
    documentHash: input.documentHash,
    documentTitle: input.documentTitle,
    documentType: input.documentType,
    expiresAt: null,
    id: createPacketId(),
    issuedAt: null,
    issuerWallet: null,
    riskLevel: null,
    status: 'draft',
    summary: input.summary,
    transactionSignature: null,
    updatedAt: timestamp,
    walletAddress: input.walletAddress,
  }

  db.prepare(
    `insert into packets (
      id, wallet_address, document_title, document_type, counterparty, summary, document_hash,
      status, risk_level, expires_at, asset_address, transaction_signature, issuer_wallet,
      issued_at, created_at, updated_at
    ) values (
      @id, @walletAddress, @documentTitle, @documentType, @counterparty, @summary, @documentHash,
      @status, @riskLevel, @expiresAt, @assetAddress, @transactionSignature, @issuerWallet,
      @issuedAt, @createdAt, @updatedAt
    )`,
  ).run(packet)

  addAudit({
    action: 'packet.created',
    actor: input.walletAddress,
    detail: 'Evidence packet submitted',
    packetId: packet.id,
  })
  return getPacket(packet.id)
}

export function createSession(input: { domain: string; statement: string; walletAddress: string }) {
  const session: Session = {
    createdAt: now(),
    domain: input.domain,
    id: crypto.randomUUID(),
    statement: input.statement,
    walletAddress: input.walletAddress,
  }

  db.prepare(
    `insert into sessions (id, wallet_address, domain, statement, created_at)
     values (@id, @walletAddress, @domain, @statement, @createdAt)`,
  ).run(session)

  return session
}

export function getAudit(packetId: string) {
  return db.prepare(`select * from audits where packet_id = ? order by id asc`).all(packetId).map(mapAudit)
}

export function getPacket(id: string) {
  const row = db.prepare(`select * from packets where id = ?`).get(id)
  return row ? mapPacket(row) : null
}

export function listPackets() {
  return db.prepare(`select * from packets order by created_at desc`).all().map(mapPacket)
}

export function reviewPacket(input: {
  actor: string
  detail: string
  expiresAt: null | string
  packetId: string
  riskLevel: string
  status: Exclude<PacketStatus, 'draft' | 'sealed'>
}) {
  const timestamp = now()
  db.prepare(
    `update packets
     set status = @status, risk_level = @riskLevel, expires_at = @expiresAt, updated_at = @timestamp
     where id = @packetId`,
  ).run({ ...input, timestamp })
  addAudit({
    action: `review.${input.status}`,
    actor: input.actor,
    detail: `${input.riskLevel}: ${input.detail}`,
    packetId: input.packetId,
  })
  return getPacket(input.packetId)
}

export function sealPacket(input: {
  assetAddress: string
  issuerWallet: string
  packetId: string
  transactionSignature: string
}) {
  const timestamp = now()
  db.prepare(
    `update packets
     set status = 'sealed',
       asset_address = @assetAddress,
       transaction_signature = @transactionSignature,
       issuer_wallet = @issuerWallet,
       issued_at = @timestamp,
       updated_at = @timestamp
     where id = @packetId`,
  ).run({ ...input, timestamp })
  addAudit({
    action: 'seal.issued',
    actor: input.issuerWallet,
    detail: `MPL Core receipt recorded as ${input.assetAddress}`,
    packetId: input.packetId,
  })
  return getPacket(input.packetId)
}

export async function sha256Hex(input: string) {
  const bytes = new TextEncoder().encode(input)
  const digest = await webcrypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function verify(query: string) {
  const term = `%${query}%`
  const rows = db
    .prepare(
      `select * from packets
       where id = ?
          or document_hash = ?
          or asset_address = ?
          or document_title like ?
          or counterparty like ?
       order by updated_at desc
       limit 20`,
    )
    .all(query, query, query, term, term)

  return rows.map((row) => {
    const packet = mapPacket(row)
    return { audit: getAudit(packet.id), packet }
  })
}

function addAudit(input: { action: string; actor: string; detail: string; packetId: string }) {
  db.prepare(
    `insert into audits (packet_id, actor, action, detail, at)
     values (@packetId, @actor, @action, @detail, @at)`,
  ).run({ ...input, at: now() })
}

function createPacketId() {
  const token = crypto.randomUUID().slice(0, 8).toUpperCase()
  return `SB-080-${token}`
}

function mapAudit(row: unknown): AuditEntry {
  const value = row as Record<string, number | string>
  return {
    action: String(value.action),
    actor: String(value.actor),
    at: String(value.at),
    detail: String(value.detail),
    id: Number(value.id),
    packetId: String(value.packet_id),
  }
}

function mapPacket(row: unknown): EvidencePacket {
  const value = row as Record<string, null | string>
  return {
    assetAddress: value.asset_address,
    counterparty: String(value.counterparty),
    createdAt: String(value.created_at),
    documentHash: String(value.document_hash),
    documentTitle: String(value.document_title),
    documentType: String(value.document_type),
    expiresAt: value.expires_at,
    id: String(value.id),
    issuedAt: value.issued_at,
    issuerWallet: value.issuer_wallet,
    riskLevel: value.risk_level,
    status: String(value.status) as PacketStatus,
    summary: String(value.summary),
    transactionSignature: value.transaction_signature,
    updatedAt: String(value.updated_at),
    walletAddress: String(value.wallet_address),
  }
}

function now() {
  return new Date().toISOString()
}
