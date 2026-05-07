import type { PacketStatus } from '../data-access/evidence-types'

const statusClassName: Record<PacketStatus, string> = {
  approved: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  draft: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-200',
  'needs-info': 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  rejected: 'border-red-400/30 bg-red-400/10 text-red-200',
  sealed: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
}

export function EvidenceUiStatusBadge({ status }: { status: PacketStatus }) {
  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${statusClassName[status]}`}>
      {status}
    </span>
  )
}
