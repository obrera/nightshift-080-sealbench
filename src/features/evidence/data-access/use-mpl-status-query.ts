import { useQuery } from '@tanstack/react-query'

import type { MplRuntimeStatus } from './evidence-types'

import { apiRequest } from './api-client'

export function useMplStatusQuery() {
  return useQuery({
    queryFn: () => apiRequest<MplRuntimeStatus>('/api/mpl/status'),
    queryKey: ['mpl-status'],
  })
}
