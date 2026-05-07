import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { PacketDetail } from './evidence-types'

import { apiRequest } from './api-client'
import { packetsQueryKey } from './use-packets-query'

export interface CreatePacketInput {
  counterparty: string
  documentHash?: string
  documentTitle: string
  documentType: string
  pastedContent?: string
  summary: string
  walletAddress: string
}

export function usePacketCreate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePacketInput) =>
      apiRequest<PacketDetail>('/api/evidence', {
        body: JSON.stringify(input),
        method: 'POST',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: packetsQueryKey })
      await queryClient.invalidateQueries({ queryKey: ['verify'] })
    },
  })
}
