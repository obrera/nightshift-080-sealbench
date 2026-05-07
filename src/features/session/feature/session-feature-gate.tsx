import type { ReactNode } from 'react'

import type { SolanaUiWalletGuardRenderProps } from '@/solana/ui/solana-ui-wallet-guard'

import { useSiwsSession } from '../data-access/use-siws-session'
import { SessionUiAuthCard } from '../ui/session-ui-auth-card'

export function SessionFeatureGate({
  children,
  walletProps,
}: {
  children: ReactNode
  walletProps: SolanaUiWalletGuardRenderProps
}) {
  const { account, cluster, wallet } = walletProps
  const session = useSiwsSession({ account, cluster: cluster.id, wallet })

  return (
    <div className="grid gap-5">
      <SessionUiAuthCard
        isAuthenticated={session.isAuthenticated}
        isLoading={session.isLoading}
        onAuthenticate={session.authenticate}
        walletAddress={account.address}
      />
      {session.isAuthenticated ? children : null}
    </div>
  )
}
