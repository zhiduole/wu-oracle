import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-signature') || ''
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!

  // Verify webhook signature
  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  if (hmac !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  const eventName = payload?.meta?.event_name

  if (eventName === 'order_created') {
    const orderId = payload?.data?.id
    const email = payload?.data?.attributes?.user_email
    console.log(`Order created: ${orderId} by ${email}`)
    // Order data is stored — reading is generated on the success page
  }

  return NextResponse.json({ received: true })
}
