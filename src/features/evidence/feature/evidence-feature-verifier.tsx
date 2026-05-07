import { useState } from 'react'

import { useVerifyQuery } from '../data-access/use-verify-query'
import { EvidenceUiVerifier } from '../ui/evidence-ui-verifier'

export function EvidenceFeatureVerifier() {
  const [query, setQuery] = useState('')
  const verifyQuery = useVerifyQuery(query)

  return <EvidenceUiVerifier isLoading={verifyQuery.isFetching} results={verifyQuery.data ?? []} search={setQuery} />
}
