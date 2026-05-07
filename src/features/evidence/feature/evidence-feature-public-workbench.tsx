import { Archive, FileSearch, Fingerprint, Scale, ScrollText, ShieldCheck, Stamp } from 'lucide-react'
import { useMemo } from 'react'

import { Badge } from '@/core/ui/badge'
import { Spinner } from '@/core/ui/spinner'

import type { EvidencePacket, MplRuntimeStatus } from '../data-access/evidence-types'

import { usePacketsQuery } from '../data-access/use-packets-query'
import { EvidenceUiRuntimeStrip } from '../ui/evidence-ui-runtime-strip'
import { EvidenceUiStatusBadge } from '../ui/evidence-ui-status-badge'
import { EvidenceFeatureVerifier } from './evidence-feature-verifier'

const demoPacket = {
  counterparty: 'North Pier Logistics',
  documentHash: 'sha256:8f3c6c5b1f0e7b2f9b3b9f92b1727fd7a607c41891de0adcb3af711be80f7f65',
  documentTitle: 'Demo escrow indemnity packet',
  documentType: 'Indemnity addendum',
  id: 'SB-080-DEMO',
  owner: 'VerifierDesk11111111111111111111111111111111',
  riskLevel: 'moderate',
  status: 'approved' as const,
  summary: 'Read-only sample showing how SealBench exposes provenance, review state, and seal readiness.',
}

export function EvidenceFeaturePublicWorkbench({ mplStatus }: { mplStatus: MplRuntimeStatus | undefined }) {
  const packetsQuery = usePacketsQuery()
  const packets = useMemo(() => packetsQuery.data ?? [], [packetsQuery.data])
  const previewPacket = packets[0]
  const sealedCount = packets.filter((packet) => packet.status === 'sealed').length
  const approvedCount = packets.filter((packet) => packet.status === 'approved').length

  return (
    <div className="grid gap-6">
      <section className="grid gap-5 border-b border-zinc-800 pb-6 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-start">
        <div className="grid min-w-0 gap-5">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-300">
              <Scale className="size-4" />
              Legal Documentation Provenance
            </div>
            <h1 className="text-3xl font-semibold tracking-normal text-zinc-50 md:text-5xl">SealBench</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
              Publicly verify legal evidence packet provenance, audit posture, and MPL Core seal readiness before a
              reviewer connects a wallet for privileged actions.
            </p>
          </div>
          <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2 sm:gap-3">
            <Metric
              icon={<Archive />}
              label="Server packets"
              value={packetsQuery.isLoading ? 'loading' : String(packets.length)}
            />
            <Metric icon={<ShieldCheck />} label="Approved" value={String(approvedCount)} />
            <Metric icon={<Stamp />} label="Sealed" value={String(sealedCount)} />
          </div>
          <EvidenceUiRuntimeStrip status={mplStatus} />
        </div>
        <ReadOnlyPacket isLoading={packetsQuery.isLoading} packet={previewPacket} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
        <EvidenceFeatureVerifier />
        <ProvenanceOverview packets={packets} />
      </section>
    </div>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-zinc-800 bg-zinc-950/80 p-3">
      <div className="flex min-w-0 items-center gap-2 text-xs text-zinc-500">
        <span className="text-cyan-300 [&_svg]:size-4">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-2 truncate text-lg font-semibold text-zinc-100">{value}</div>
    </div>
  )
}

function PacketPreview({ packet }: { packet: EvidencePacket | undefined }) {
  const title = packet?.documentTitle ?? demoPacket.documentTitle
  const summary = packet?.summary ?? demoPacket.summary
  const status = packet?.status ?? demoPacket.status
  const fields = [
    ['Packet', packet?.id ?? demoPacket.id],
    ['Type', packet?.documentType ?? demoPacket.documentType],
    ['Counterparty', packet?.counterparty ?? demoPacket.counterparty],
    ['Risk', packet?.riskLevel ?? demoPacket.riskLevel],
    ['Owner wallet', packet?.walletAddress ?? demoPacket.owner],
    ['Document hash', packet?.documentHash ?? demoPacket.documentHash],
  ]

  return (
    <div className="mt-4 grid gap-4">
      <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold break-words text-zinc-100">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{summary}</p>
          </div>
          <EvidenceUiStatusBadge status={status} />
        </div>
      </div>
      <dl className="grid gap-2 text-xs text-zinc-400 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div
            className={label === 'Document hash' || label === 'Owner wallet' ? 'sm:col-span-2' : undefined}
            key={label}
          >
            <dt className="text-zinc-500">{label}</dt>
            <dd className="break-all text-zinc-200">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function ProvenanceOverview({ packets }: { packets: EvidencePacket[] }) {
  const visiblePackets = packets.slice(0, 4)

  return (
    <div className="min-w-0 rounded-md border border-zinc-800 bg-zinc-950/80 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
        <FileSearch className="size-5 text-cyan-300" />
        Provenance Overview
      </div>
      <div className="mt-4 grid gap-3">
        {visiblePackets.length > 0 ? (
          visiblePackets.map((packet) => (
            <div className="rounded-md border border-zinc-800 bg-zinc-900/50 p-3" key={packet.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="min-w-0 truncate text-sm font-medium text-zinc-100">{packet.documentTitle}</span>
                <EvidenceUiStatusBadge status={packet.status} />
              </div>
              <div className="mt-2 flex min-w-0 items-center gap-2 font-mono text-xs text-zinc-500">
                <Fingerprint className="size-3 shrink-0 text-zinc-600" />
                <span className="truncate">{packet.documentHash}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-md border border-zinc-800 bg-zinc-900/50 p-3 text-sm leading-6 text-zinc-400">
            Live packets from `/api/evidence` will appear here after wallet-authenticated reviewers submit them.
          </div>
        )}
      </div>
    </div>
  )
}

function ReadOnlyPacket({ isLoading, packet }: { isLoading: boolean; packet: EvidencePacket | undefined }) {
  const live = Boolean(packet)

  return (
    <div className="min-w-0 rounded-md border border-zinc-800 bg-zinc-950/80 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
          <ScrollText className="size-5 text-amber-300" />
          Read-only packet preview
        </div>
        <Badge
          className={live ? 'border-cyan-300/30 text-cyan-100' : 'border-amber-300/30 text-amber-100'}
          variant="outline"
        >
          {live ? 'live server state' : 'demo packet'}
        </Badge>
      </div>
      {isLoading ? (
        <div className="mt-8 flex items-center gap-2 text-sm text-zinc-400">
          <Spinner />
          Loading server packets
        </div>
      ) : (
        <PacketPreview packet={packet} />
      )}
    </div>
  )
}
