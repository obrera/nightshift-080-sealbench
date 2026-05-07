import { Boxes } from 'lucide-react'

import type { MplRuntimeStatus } from '../data-access/evidence-types'

export function EvidenceUiRuntimeStrip({ status }: { status: MplRuntimeStatus | undefined }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm">
      <Boxes className="size-4 text-cyan-300" />
      <span className="font-medium text-zinc-100">MPL Core runtime</span>
      <span className={status?.canIssue ? 'text-emerald-300' : 'text-amber-300'}>
        {status?.canIssue ? 'configured' : `blocked: ${(status?.missing ?? []).join(', ') || 'loading'}`}
      </span>
      <span className="text-xs break-all text-zinc-500">{status?.programAddress}</span>
    </div>
  )
}
