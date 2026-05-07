import { FileCheck2, Hash } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import { Button } from '@/core/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/ui/card'
import { Input } from '@/core/ui/input'
import { Label } from '@/core/ui/label'
import { Spinner } from '@/core/ui/spinner'
import { Textarea } from '@/core/ui/textarea'

import type { CreatePacketInput } from '../data-access/use-packet-create'

export function EvidenceUiIntakeForm({
  createPacket,
  disabled,
  isLoading,
  walletAddress,
}: {
  createPacket: (input: CreatePacketInput) => Promise<unknown>
  disabled: boolean
  isLoading: boolean
  walletAddress: string
}) {
  const [documentTitle, setDocumentTitle] = useState('Mutual NDA - Acme diligence')
  const [documentType, setDocumentType] = useState('NDA')
  const [counterparty, setCounterparty] = useState('Acme Legal Ops')
  const [summary, setSummary] = useState('Countersigned diligence agreement for confidential disclosure review.')
  const [pastedContent, setPastedContent] = useState('')
  const [documentHash, setDocumentHash] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    await createPacket({
      counterparty,
      documentHash,
      documentTitle,
      documentType,
      pastedContent,
      summary,
      walletAddress,
    })
    setPastedContent('')
    setDocumentHash('')
  }

  return (
    <Card className="border-zinc-800 bg-zinc-950/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-zinc-100">
          <FileCheck2 className="size-5 text-emerald-300" />
          Evidence Intake
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={(event) => void submit(event)}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Document title">
              <Input onChange={(event) => setDocumentTitle(event.target.value)} required value={documentTitle} />
            </Field>
            <Field label="Document type">
              <Input onChange={(event) => setDocumentType(event.target.value)} required value={documentType} />
            </Field>
          </div>
          <Field label="Counterparty">
            <Input onChange={(event) => setCounterparty(event.target.value)} required value={counterparty} />
          </Field>
          <Field label="Summary">
            <Textarea onChange={(event) => setSummary(event.target.value)} required rows={3} value={summary} />
          </Field>
          <Field label="Pasted document content">
            <Textarea
              onChange={(event) => setPastedContent(event.target.value)}
              placeholder="Paste document text to have the server compute SHA-256, or leave empty and record an existing hash below."
              rows={5}
              value={pastedContent}
            />
          </Field>
          <Field label="Existing SHA-256 hash">
            <div className="flex gap-2">
              <Hash className="mt-2 size-4 shrink-0 text-zinc-500" />
              <Input
                onChange={(event) => setDocumentHash(event.target.value)}
                placeholder="64-character digest"
                value={documentHash}
              />
            </div>
          </Field>
          <Button className="justify-self-start" disabled={disabled || isLoading}>
            {isLoading ? <Spinner /> : <FileCheck2 />}
            Save Evidence Packet
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="grid gap-2">
      <Label className="text-xs tracking-normal text-zinc-400 uppercase">{label}</Label>
      {children}
    </div>
  )
}
