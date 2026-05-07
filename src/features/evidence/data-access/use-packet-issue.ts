import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { PacketDetail } from './evidence-types'

import { apiRequest } from './api-client'
import { packetsQueryKey } from './use-packets-query'

export function usePacketIssue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { packetId: string; walletAddress: string }) =>
      apiRequest<PacketDetail>(`/api/evidence/${input.packetId}/issue`, {
        body: JSON.stringify({ walletAddress: input.walletAddress }),
        method: 'POST',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: packetsQueryKey })
      await queryClient.invalidateQueries({ queryKey: ['packet-detail'] })
      await queryClient.invalidateQueries({ queryKey: ['verify'] })
    },
  })
}
