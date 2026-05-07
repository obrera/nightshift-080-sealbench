import { ShieldCheck, WalletCards } from 'lucide-react'

import { Button } from '@/core/ui/button'
import { Card, CardContent } from '@/core/ui/card'
import { Spinner } from '@/core/ui/spinner'

export function SessionUiAuthCard({
  isAuthenticated,
  isLoading,
  onAuthenticate,
  walletAddress,
}: {
  isAuthenticated: boolean
  isLoading: boolean
  onAuthenticate: () => Promise<unknown>
  walletAddress: string
}) {
  return (
    <Card className="border-emerald-400/20 bg-zinc-950/70">
      <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex min-w-0 items-start gap-3">
          <div className="rounded-md border border-emerald-400/30 bg-emerald-400/10 p-2 text-emerald-200">
            {isAuthenticated ? <ShieldCheck className="size-5" /> : <WalletCards className="size-5" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-100">
              {isAuthenticated ? 'SIWS session active' : 'Wallet session required'}
            </p>
            <p className="truncate text-xs text-zinc-400">{walletAddress}</p>
          </div>
        </div>
        <Button disabled={isAuthenticated || isLoading} onClick={() => void onAuthenticate()}>
          {isLoading ? <Spinner /> : <ShieldCheck />}
          {isAuthenticated ? 'Authenticated' : 'Sign in with Solana'}
        </Button>
      </CardContent>
    </Card>
  )
}
