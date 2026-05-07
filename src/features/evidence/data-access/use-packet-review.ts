import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { PacketDetail, PacketStatus } from './evidence-types'

import { apiRequest } from './api-client'
import { packetsQueryKey } from './use-packets-query'

export interface ReviewPacketInput {
  actor: string
  detail: string
  expiresAt: string
  packetId: string
  riskLevel: string
  status: Extract<PacketStatus, 'approved' | 'needs-info' | 'rejected'>
}

export function usePacketReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ packetId, ...input }: ReviewPacketInput) =>
      apiRequest<PacketDetail>(`/api/evidence/${packetId}/review`, {
        body: JSON.stringify(input),
        method: 'PATCH',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: packetsQueryKey })
      await queryClient.invalidateQueries({ queryKey: ['packet-detail'] })
      await queryClient.invalidateQueries({ queryKey: ['verify'] })
    },
  })
}
