import { Webhook } from '@creem_io/nextjs'

export const POST = Webhook({
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,
  onCheckoutCompleted: async ({ customer, product, metadata }) => {
    // Payment confirmed — log for your records
    console.log(`Payment received: ${customer.email} purchased ${product.name}`)
    // metadata.question contains the user's question (passed in at checkout)
    // The actual reading is generated client-side after redirect verification
  },
})
