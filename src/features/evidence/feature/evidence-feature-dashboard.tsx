import { Scale } from 'lucide-react'

import type { SolanaUiWalletGuardRenderProps } from '@/solana/ui/solana-ui-wallet-guard'

import { SessionFeatureGate } from '@/features/session/feature/session-feature-gate'
import { SolanaUiWalletGuard } from '@/solana/ui/solana-ui-wallet-guard'

import { useMplStatusQuery } from '../data-access/use-mpl-status-query'
import { EvidenceUiRuntimeStrip } from '../ui/evidence-ui-runtime-strip'
import { EvidenceFeatureIntake } from './evidence-feature-intake'
import { EvidenceFeatureReviewWorkbench } from './evidence-feature-review-workbench'
import { EvidenceFeatureVerifier } from './evidence-feature-verifier'

export function EvidenceFeatureDashboard() {
  return <SolanaUiWalletGuard render={(walletProps) => <EvidenceFeatureAuthenticated walletProps={walletProps} />} />
}

function EvidenceFeatureAuthenticated({ walletProps }: { walletProps: SolanaUiWalletGuardRenderProps }) {
  const mplStatusQuery = useMplStatusQuery()

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_34%),linear-gradient(180deg,#09090b,#101113_48%,#070707)]">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <section className="grid gap-4 border-b border-zinc-800 pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-300">
                <Scale className="size-4" />
                Legal Documentation Provenance
              </div>
              <h1 className="text-3xl font-semibold tracking-normal text-zinc-50 md:text-5xl">SealBench</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
                Intake legal evidence, review provenance risk, and issue MPL Core proof receipts for approved document
                packets.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <Metric label="Packets" value="durable" />
              <Metric label="Review" value="audited" />
              <Metric label="Seals" value="MPL Core" />
            </div>
          </div>
          <EvidenceUiRuntimeStrip status={mplStatusQuery.data} />
        </section>
        <SessionFeatureGate walletProps={walletProps}>
          <div className="grid gap-5 lg:grid-cols-[410px_1fr]">
            <EvidenceFeatureIntake walletProps={walletProps} />
            <EvidenceFeatureVerifier />
          </div>
          <EvidenceFeatureReviewWorkbench walletProps={walletProps} />
        </SessionFeatureGate>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-20 rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-sm font-semibold text-zinc-100">{value}</div>
    </div>
  )
}

export { EvidenceFeatureDashboard as Component }
