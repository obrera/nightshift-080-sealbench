import { useQuery } from '@tanstack/react-query'

import type { EvidencePacket } from './evidence-types'

import { apiRequest } from './api-client'

export const packetsQueryKey = ['packets']

export function usePacketsQuery() {
  return useQuery({
    queryFn: () => apiRequest<EvidencePacket[]>('/api/evidence'),
    queryKey: packetsQueryKey,
  })
}
