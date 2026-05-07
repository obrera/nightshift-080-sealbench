import { FileText } from 'lucide-react'

import { Button } from '@/core/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/ui/card'

import type { EvidencePacket } from '../data-access/evidence-types'

import { EvidenceUiStatusBadge } from './evidence-ui-status-badge'

export function EvidenceUiPacketList({
  activePacketId,
  packets,
  selectPacket,
}: {
  activePacketId: null | string
  packets: EvidencePacket[]
  selectPacket: (packet: EvidencePacket) => void
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-950/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-zinc-100">
          <FileText className="size-5 text-cyan-300" />
          Review Docket
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {packets.map((packet) => (
          <Button
            className={`h-auto justify-start border p-3 text-left ${
              activePacketId === packet.id ? 'border-cyan-300/60 bg-cyan-300/10' : 'border-zinc-800 bg-zinc-900/50'
            }`}
            key={packet.id}
            onClick={() => selectPacket(packet)}
            variant="ghost"
          >
            <div className="grid min-w-0 flex-1 gap-2">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-medium text-zinc-100">{packet.documentTitle}</span>
                <EvidenceUiStatusBadge status={packet.status} />
              </div>
              <div className="grid gap-1 text-xs text-zinc-400">
                <span className="truncate">{packet.id}</span>
                <span className="truncate">{packet.documentHash}</span>
              </div>
            </div>
          </Button>
        ))}
        {packets.length === 0 ? <p className="text-sm text-zinc-400">No packets have been submitted.</p> : null}
      </CardContent>
    </Card>
  )
}
