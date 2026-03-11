import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('creem-signature') || ''
  const secret = process.env.CREEM_WEBHOOK_SECRET!

  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  if (hmac !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  const eventType = payload?.eventType

  if (eventType === 'checkout.completed') {
    const orderId = payload?.object?.id
    const email = payload?.object?.customer?.email
    console.log(`Payment received: ${orderId} by ${email}`)
  }

  return NextResponse.json({ received: true })
}
