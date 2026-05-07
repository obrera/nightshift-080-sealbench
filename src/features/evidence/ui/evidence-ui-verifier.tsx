import { SearchCheck } from 'lucide-react'
import { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/core/ui/card'
import { Input } from '@/core/ui/input'
import { Spinner } from '@/core/ui/spinner'

import type { PacketDetail } from '../data-access/evidence-types'

import { EvidenceUiStatusBadge } from './evidence-ui-status-badge'

export function EvidenceUiVerifier({
  isLoading,
  results,
  search,
}: {
  isLoading: boolean
  results: PacketDetail[]
  search: (query: string) => void
}) {
  const [query, setQuery] = useState('')

  return (
    <Card className="border-zinc-800 bg-zinc-950/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-zinc-100">
          <SearchCheck className="size-5 text-amber-300" />
          Public Verifier
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Input
          onChange={(event) => {
            setQuery(event.target.value)
            search(event.target.value)
          }}
          placeholder="Search packet id, document hash, asset address, title, or counterparty"
          value={query}
        />
        {isLoading ? <Spinner /> : null}
        {results.map(({ audit, packet }) => (
          <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-4" key={packet.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-zinc-100">{packet.documentTitle}</span>
              <EvidenceUiStatusBadge status={packet.status} />
            </div>
            <p className="mt-2 font-mono text-xs break-all text-zinc-400">{packet.documentHash}</p>
            <p className="mt-3 text-xs text-zinc-500">{audit.length} audit event(s)</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
