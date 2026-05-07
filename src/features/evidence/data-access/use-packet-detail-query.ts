import { useQuery } from '@tanstack/react-query'

import type { PacketDetail } from './evidence-types'

import { apiRequest } from './api-client'

export function usePacketDetailQuery(packetId: null | string) {
  return useQuery({
    enabled: Boolean(packetId),
    queryFn: () => apiRequest<PacketDetail>(`/api/evidence/${packetId}`),
    queryKey: ['packet-detail', packetId],
  })
}
