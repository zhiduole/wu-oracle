import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const successUrl = searchParams.get('successUrl') || `${process.env.NEXT_PUBLIC_SITE_URL}/success`

  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID!
  const storeId = process.env.LEMONSQUEEZY_STORE_ID!

  try {
    const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            product_options: {
              redirect_url: successUrl,
              enabled_variants: [variantId],
            },
            checkout_options: {
              button_color: '#c0392b',
            },
          },
          relationships: {
            store: { data: { type: 'stores', id: storeId } },
            variant: { data: { type: 'variants', id: variantId } },
          },
        },
      }),
    })

    const data = await res.json()
    const checkoutUrl = data?.data?.attributes?.url

    if (!checkoutUrl) {
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
    }

    return NextResponse.redirect(checkoutUrl)
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
