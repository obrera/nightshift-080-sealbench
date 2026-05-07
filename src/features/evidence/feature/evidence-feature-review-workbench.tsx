import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { SolanaUiWalletGuardRenderProps } from '@/solana/ui/solana-ui-wallet-guard'

import type { EvidencePacket } from '../data-access/evidence-types'

import { usePacketDetailQuery } from '../data-access/use-packet-detail-query'
import { usePacketIssue } from '../data-access/use-packet-issue'
import { usePacketReview } from '../data-access/use-packet-review'
import { usePacketsQuery } from '../data-access/use-packets-query'
import { EvidenceUiPacketList } from '../ui/evidence-ui-packet-list'
import { EvidenceUiReviewPanel } from '../ui/evidence-ui-review-panel'

export function EvidenceFeatureReviewWorkbench({ walletProps }: { walletProps: SolanaUiWalletGuardRenderProps }) {
  const packetsQuery = usePacketsQuery()
  const reviewMutation = usePacketReview()
  const issueMutation = usePacketIssue()
  const [activePacketId, setActivePacketId] = useState<null | string>(null)

  const packets = useMemo(() => packetsQuery.data ?? [], [packetsQuery.data])
  const activePacket = useMemo(
    () => packets.find((packet) => packet.id === activePacketId) ?? packets[0] ?? null,
    [activePacketId, packets],
  )
  const packetDetailQuery = usePacketDetailQuery(activePacket?.id ?? null)
  const activeDetail = packetDetailQuery.data

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <EvidenceUiPacketList
        activePacketId={activePacket?.id ?? null}
        packets={packets}
        selectPacket={(packet: EvidencePacket) => setActivePacketId(packet.id)}
      />
      {activePacket ? (
        <EvidenceUiReviewPanel
          audit={activeDetail?.audit ?? []}
          isIssuing={issueMutation.isPending}
          isReviewing={reviewMutation.isPending}
          issuePacket={async (input) => {
            try {
              await issueMutation.mutateAsync(input)
              toast.success('Proof seal issued')
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Unable to issue proof seal')
            }
          }}
          packet={activeDetail?.packet ?? activePacket}
          reviewPacket={async (input) => {
            try {
              await reviewMutation.mutateAsync(input)
              toast.success('Review saved')
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Unable to save review')
            }
          }}
          walletAddress={walletProps.account.address}
        />
      ) : (
        <div className="rounded-md border border-zinc-800 bg-zinc-950/80 p-6 text-sm text-zinc-400">
          Submit an evidence packet to begin review.
        </div>
      )}
    </div>
  )
}
