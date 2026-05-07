import { useQuery } from '@tanstack/react-query'

import type { PacketDetail } from './evidence-types'

import { apiRequest } from './api-client'

export function useVerifyQuery(query: string) {
  return useQuery({
    enabled: query.trim().length > 0,
    queryFn: () => apiRequest<PacketDetail[]>(`/api/verify?q=${encodeURIComponent(query.trim())}`),
    queryKey: ['verify', query],
  })
}
