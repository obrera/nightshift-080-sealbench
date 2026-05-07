import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import { getMplRuntimeStatus, issueMplProofSeal } from './mpl'
import {
  createPacket,
  createSession,
  getAudit,
  getPacket,
  listPackets,
  reviewPacket,
  sealPacket,
  sha256Hex,
  verify,
} from './store'

const app = new Hono()

app.use('/api/*', cors())
app.use('/api/*', logger())

app.get('/api/health', (context) =>
  context.json({
    build: '080',
    date: '2026-05-07',
    ok: true,
    service: 'SealBench',
  }),
)

app.get('/api/mpl/status', (context) => context.json(getMplRuntimeStatus()))

app.post('/api/session', async (context) => {
  const body = await context.req.json()
  const walletAddress = requiredString(body.walletAddress, 'walletAddress')
  const domain = requiredString(body.domain, 'domain')
  const statement = requiredString(body.statement, 'statement')

  return context.json(createSession({ domain, statement, walletAddress }), 201)
})

app.get('/api/evidence', (context) => context.json(listPackets()))

app.post('/api/evidence', async (context) => {
  const body = await context.req.json()
  const pastedContent = optionalString(body.pastedContent)
  const providedHash = optionalString(body.documentHash)
  const documentHash = pastedContent ? await sha256Hex(pastedContent) : providedHash

  if (!documentHash) {
    return context.json({ error: 'documentHash or pastedContent is required' }, 400)
  }

  const packet = createPacket({
    counterparty: requiredString(body.counterparty, 'counterparty'),
    documentHash,
    documentTitle: requiredString(body.documentTitle, 'documentTitle'),
    documentType: requiredString(body.documentType, 'documentType'),
    summary: requiredString(body.summary, 'summary'),
    walletAddress: requiredString(body.walletAddress, 'walletAddress'),
  })

  return context.json({ audit: packet ? getAudit(packet.id) : [], packet }, 201)
})

app.get('/api/evidence/:id', (context) => {
  const packet = getPacket(context.req.param('id'))
  if (!packet) {
    return context.json({ error: 'packet not found' }, 404)
  }
  return context.json({ audit: getAudit(packet.id), packet })
})

app.patch('/api/evidence/:id/review', async (context) => {
  const body = await context.req.json()
  const status = requiredString(body.status, 'status')
  if (!['approved', 'needs-info', 'rejected'].includes(status)) {
    return context.json({ error: 'status must be needs-info, approved, or rejected' }, 400)
  }

  const packet = reviewPacket({
    actor: requiredString(body.actor, 'actor'),
    detail: requiredString(body.detail, 'detail'),
    expiresAt: optionalString(body.expiresAt),
    packetId: context.req.param('id'),
    riskLevel: requiredString(body.riskLevel, 'riskLevel'),
    status: status as 'approved' | 'needs-info' | 'rejected',
  })

  if (!packet) {
    return context.json({ error: 'packet not found' }, 404)
  }

  return context.json({ audit: getAudit(packet.id), packet })
})

app.post('/api/evidence/:id/issue', async (context) => {
  const body = await context.req.json()
  const packet = getPacket(context.req.param('id'))

  if (!packet) {
    return context.json({ error: 'packet not found' }, 404)
  }

  if (packet.status !== 'approved') {
    return context.json({ error: 'packet must be approved before seal issuance' }, 409)
  }

  const result = await issueMplProofSeal({
    documentHash: packet.documentHash,
    packetId: packet.id,
    title: packet.documentTitle,
    walletAddress: requiredString(body.walletAddress, 'walletAddress'),
  })

  if (!result.ok) {
    return context.json(result, 409)
  }

  const sealed = sealPacket({
    assetAddress: result.assetAddress,
    issuerWallet: result.issuerWallet,
    packetId: packet.id,
    transactionSignature: result.transactionSignature,
  })

  return context.json({ audit: sealed ? getAudit(sealed.id) : [], packet: sealed })
})

app.get('/api/verify', (context) => {
  const query = context.req.query('q')?.trim()
  if (!query) {
    return context.json([])
  }
  return context.json(verify(query))
})

app.use('/assets/*', serveStatic({ root: './dist' }))
app.use('/vite.svg', serveStatic({ path: './dist/vite.svg' }))
app.get('*', serveStatic({ path: './dist/index.html' }))

const port = Number(process.env.PORT ?? 3000)
serve({ fetch: app.fetch, port })
console.log(`SealBench API listening on ${port}`)

function optionalString(value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null
  }
  return value.trim()
}

function requiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required`)
  }
  return value.trim()
}
