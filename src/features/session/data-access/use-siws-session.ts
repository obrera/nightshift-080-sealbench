import { useMutation } from '@tanstack/react-query'
import {
  type SolanaClusterId,
  type SolanaSignInInput,
  type UiWallet,
  type UiWalletAccount,
  useSignIn,
} from '@wallet-ui/react'
import { useState } from 'react'

import { apiRequest } from '@/features/evidence/data-access/api-client'

interface SessionPayload {
  createdAt: string
  domain: string
  id: string
  statement: string
  walletAddress: string
}

export function useSiwsSession({
  account,
  cluster,
  wallet,
}: {
  account: UiWalletAccount
  cluster: SolanaClusterId
  wallet: UiWallet
}) {
  const [session, setSession] = useState<null | SessionPayload>(null)
  const signInWithWallet = useSignIn(wallet)

  const { isPending: isLoading, mutateAsync: authenticate } = useMutation({
    mutationFn: async () => {
      const payload = createPayload({ account, cluster })
      await signInWithWallet(payload)
      const nextSession = await apiRequest<SessionPayload>('/api/session', {
        body: JSON.stringify({
          domain: payload.domain,
          statement: payload.statement,
          walletAddress: account.address,
        }),
        method: 'POST',
      })
      setSession(nextSession)
      return nextSession
    },
  })

  return {
    authenticate,
    isAuthenticated: Boolean(session),
    isLoading,
    session,
  }
}

function createPayload({
  account,
  cluster,
}: {
  account: UiWalletAccount
  cluster: SolanaClusterId
}): SolanaSignInInput {
  const url = new URL(window.location.href)
  const issuedAt = new Date()
  return {
    address: account.address,
    chainId: cluster,
    domain: url.host,
    expirationTime: new Date(issuedAt.getTime() + 10 * 60 * 1000).toISOString(),
    issuedAt: issuedAt.toISOString(),
    nonce: crypto.randomUUID().replaceAll('-', '').slice(0, 24),
    requestId: crypto.randomUUID(),
    resources: [`${url.origin}/api/evidence`, `${url.origin}/api/verify`],
    statement: 'Authenticate to SealBench to submit and manage legal-document provenance packets.',
    uri: url.origin,
    version: '1',
  }
}
