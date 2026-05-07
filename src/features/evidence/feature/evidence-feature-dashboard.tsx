import { useWalletUi } from '@wallet-ui/react'
import { ShieldCheck } from 'lucide-react'

import type { SolanaUiWalletGuardRenderProps } from '@/solana/ui/solana-ui-wallet-guard'

import { SessionFeatureGate } from '@/features/session/feature/session-feature-gate'
import { SolanaUiWalletDialog } from '@/solana/ui/solana-ui-wallet-dialog'

import { useMplStatusQuery } from '../data-access/use-mpl-status-query'
import { EvidenceFeatureIntake } from './evidence-feature-intake'
import { EvidenceFeaturePublicWorkbench } from './evidence-feature-public-workbench'
import { EvidenceFeatureReviewWorkbench } from './evidence-feature-review-workbench'
import { EvidenceFeatureVerifier } from './evidence-feature-verifier'

export function EvidenceFeatureDashboard() {
  const { account, cluster, wallet } = useWalletUi()
  const mplStatusQuery = useMplStatusQuery()
  const walletProps = account && wallet ? { account, cluster, wallet } : null

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_34%),linear-gradient(180deg,#09090b,#101113_48%,#070707)]">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <EvidenceFeaturePublicWorkbench mplStatus={mplStatusQuery.data} />
        {walletProps ? (
          <EvidenceFeatureAuthenticated walletProps={walletProps} />
        ) : (
          <section className="grid gap-3 rounded-md border border-emerald-400/20 bg-zinc-950/80 p-4 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex min-w-0 items-start gap-3">
              <div className="rounded-md border border-emerald-400/30 bg-emerald-400/10 p-2 text-emerald-200">
                <ShieldCheck className="size-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-zinc-100">
                  Privileged evidence actions require wallet access
                </h2>
                <p className="mt-1 text-sm leading-6 text-zinc-400">
                  Connect a Solana wallet and complete SIWS to submit packets, save reviews, or issue MPL proof seals.
                </p>
              </div>
            </div>
            <SolanaUiWalletDialog />
          </section>
        )}
      </div>
    </div>
  )
}

function EvidenceFeatureAuthenticated({ walletProps }: { walletProps: SolanaUiWalletGuardRenderProps }) {
  return (
    <SessionFeatureGate walletProps={walletProps}>
      <div className="grid gap-5 lg:grid-cols-[410px_1fr]">
        <EvidenceFeatureIntake walletProps={walletProps} />
        <EvidenceFeatureVerifier />
      </div>
      <EvidenceFeatureReviewWorkbench walletProps={walletProps} />
    </SessionFeatureGate>
  )
}

export { EvidenceFeatureDashboard as Component }
