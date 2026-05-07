import { toast } from 'sonner'

import type { SolanaUiWalletGuardRenderProps } from '@/solana/ui/solana-ui-wallet-guard'

import { usePacketCreate } from '../data-access/use-packet-create'
import { EvidenceUiIntakeForm } from '../ui/evidence-ui-intake-form'

export function EvidenceFeatureIntake({ walletProps }: { walletProps: SolanaUiWalletGuardRenderProps }) {
  const createMutation = usePacketCreate()

  return (
    <EvidenceUiIntakeForm
      createPacket={async (input) => {
        try {
          await createMutation.mutateAsync(input)
          toast.success('Evidence packet saved')
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Unable to save packet')
        }
      }}
      disabled={false}
      isLoading={createMutation.isPending}
      walletAddress={walletProps.account.address}
    />
  )
}
