import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const successUrl = searchParams.get('successUrl') || `${process.env.NEXT_PUBLIC_SITE_URL}/success`

  try {
    const res = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CREEM_API_KEY!,
      },
      body: JSON.stringify({
        product_id: process.env.CREEM_PRODUCT_ID,
        success_url: successUrl,
      }),
    })

    const data = await res.json()
    const checkoutUrl = data?.checkout_url

    if (!checkoutUrl) {
      console.error('Creem checkout error:', data)
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
    }

    return NextResponse.json({ checkoutUrl })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
