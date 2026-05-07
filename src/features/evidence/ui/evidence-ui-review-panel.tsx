import { BadgeCheck, BadgeX, CircleAlert, Stamp } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import { Button } from '@/core/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/ui/card'
import { Input } from '@/core/ui/input'
import { Label } from '@/core/ui/label'
import { Spinner } from '@/core/ui/spinner'
import { Textarea } from '@/core/ui/textarea'

import type { AuditEntry, EvidencePacket, PacketStatus } from '../data-access/evidence-types'
import type { ReviewPacketInput } from '../data-access/use-packet-review'

import { EvidenceUiStatusBadge } from './evidence-ui-status-badge'

export function EvidenceUiReviewPanel({
  audit,
  isIssuing,
  isReviewing,
  issuePacket,
  packet,
  reviewPacket,
  walletAddress,
}: {
  audit: AuditEntry[]
  isIssuing: boolean
  isReviewing: boolean
  issuePacket: (input: { packetId: string; walletAddress: string }) => Promise<unknown>
  packet: EvidencePacket
  reviewPacket: (input: ReviewPacketInput) => Promise<unknown>
  walletAddress: string
}) {
  const [status, setStatus] = useState<ReviewPacketInput['status']>('approved')
  const [riskLevel, setRiskLevel] = useState('moderate')
  const [expiresAt, setExpiresAt] = useState('2027-05-07')
  const [detail, setDetail] = useState('Identity, hash, and counterparty metadata reviewed against intake materials.')

  async function submitReview(event: FormEvent) {
    event.preventDefault()
    await reviewPacket({
      actor: walletAddress,
      detail,
      expiresAt,
      packetId: packet.id,
      riskLevel,
      status,
    })
  }

  return (
    <Card className="border-zinc-800 bg-zinc-950/80">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3 text-base text-zinc-100">
          <span className="flex items-center gap-2">
            <Stamp className="size-5 text-emerald-300" />
            Packet Workbench
          </span>
          <EvidenceUiStatusBadge status={packet.status} />
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="grid gap-2">
            <p className="text-lg font-semibold text-zinc-100">{packet.documentTitle}</p>
            <p className="text-sm text-zinc-400">{packet.summary}</p>
            <dl className="grid gap-2 pt-2 text-xs text-zinc-400 md:grid-cols-2">
              <Meta label="Packet" value={packet.id} />
              <Meta label="Type" value={packet.documentType} />
              <Meta label="Counterparty" value={packet.counterparty} />
              <Meta label="Owner wallet" value={packet.walletAddress} />
              <Meta label="Hash" value={packet.documentHash} wide />
              <Meta label="Asset" value={packet.assetAddress ?? 'Not issued'} wide />
            </dl>
          </div>
        </div>
        <form
          className="grid gap-4 rounded-md border border-zinc-800 p-4"
          onSubmit={(event) => void submitReview(event)}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Decision">
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                onChange={(event) => setStatus(event.target.value as ReviewPacketInput['status'])}
                value={status}
              >
                <option value="approved">Approved</option>
                <option value="needs-info">Needs info</option>
                <option value="rejected">Rejected</option>
              </select>
            </Field>
            <Field label="Risk">
              <Input onChange={(event) => setRiskLevel(event.target.value)} value={riskLevel} />
            </Field>
            <Field label="Expiry">
              <Input onChange={(event) => setExpiresAt(event.target.value)} type="date" value={expiresAt} />
            </Field>
          </div>
          <Field label="Review note">
            <Textarea onChange={(event) => setDetail(event.target.value)} rows={3} value={detail} />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button disabled={isReviewing}>
              {isReviewing ? <Spinner /> : reviewIcon(status)}
              Save Review
            </Button>
            <Button
              disabled={packet.status !== 'approved' || isIssuing}
              onClick={() => void issuePacket({ packetId: packet.id, walletAddress })}
              type="button"
              variant="secondary"
            >
              {isIssuing ? <Spinner /> : <Stamp />}
              Issue MPL Proof Seal
            </Button>
          </div>
        </form>
        <div className="grid gap-3">
          <p className="text-sm font-semibold text-zinc-100">Audit Chain</p>
          {audit.map((entry) => (
            <div className="rounded-md border border-zinc-800 bg-zinc-900/50 p-3" key={entry.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs text-cyan-200">{entry.action}</span>
                <span className="text-xs text-zinc-500">{new Date(entry.at).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-300">{entry.detail}</p>
              <p className="mt-1 truncate text-xs text-zinc-500">{entry.actor}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="grid gap-2">
      <Label className="text-xs tracking-normal text-zinc-400 uppercase">{label}</Label>
      {children}
    </label>
  )
}

function Meta({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? 'md:col-span-2' : undefined}>
      <dt className="text-zinc-500">{label}</dt>
      <dd className="break-all text-zinc-200">{value}</dd>
    </div>
  )
}

function reviewIcon(status: PacketStatus) {
  if (status === 'approved') {
    return <BadgeCheck />
  }
  if (status === 'rejected') {
    return <BadgeX />
  }
  return <CircleAlert />
}
