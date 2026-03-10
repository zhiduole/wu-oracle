import { Checkout } from '@creem_io/nextjs'

// This creates a Creem checkout session and redirects user to payment page
export const GET = Checkout({
  apiKey: process.env.CREEM_API_KEY!,
  testMode: process.env.NODE_ENV !== 'production',
  defaultSuccessUrl: '/success',
})
