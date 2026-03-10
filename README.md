# Wú · The Book of Changes
## Deployment Guide

---

## What You Need Before Starting

1. A [Creem](https://creem.io) account (free to sign up)
2. An [Anthropic](https://console.anthropic.com) account with API key (min $5 credit)
3. A [Vercel](https://vercel.com) account (free)
4. A [GitHub](https://github.com) account (free) — needed to deploy to Vercel
5. Your domain name (buy from Namecheap or Cloudflare)

---

## Step 1 — Set Up Creem

1. Log in to Creem dashboard
2. Go to **Products → Create Product**
   - Name: "Wú Oracle Reading"
   - Price: $3.99 USD
   - Type: One-time payment
   - Save and copy the **Product ID** (starts with `prod_`)
3. Go to **Developers → API Keys**
   - Copy your **API Key** (starts with `ck_live_`)
4. Go to **Developers → Webhooks**
   - Add webhook URL: `https://your-domain.com/api/webhook`
   - Copy the **Webhook Secret**

---

## Step 2 — Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create account and add $5 credit
3. Go to **API Keys → Create Key**
4. Copy your key (starts with `sk-ant-`)

---

## Step 3 — Deploy to Vercel

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. In **Environment Variables**, add these:

| Key | Value |
|-----|-------|
| `CREEM_API_KEY` | `ck_live_...` |
| `CREEM_WEBHOOK_SECRET` | your webhook secret |
| `CREEM_PRODUCT_ID` | `prod_...` |
| `ANTHROPIC_API_KEY` | `sk-ant-...` |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` |
| `NEXT_PUBLIC_CREEM_PRODUCT_ID` | `prod_...` (same as above) |

4. Click **Deploy**

---

## Step 4 — Connect Your Domain

1. In Vercel → your project → **Settings → Domains**
2. Add your custom domain
3. Follow Vercel's instructions to update DNS at your domain registrar
4. Wait 5–30 minutes for DNS to propagate

---

## Step 5 — Update Creem Webhook URL

Once your domain is live, go back to Creem → Webhooks and update the URL to:
`https://your-domain.com/api/webhook`

---

## Step 6 — Test

1. In Creem dashboard, enable **Test Mode**
2. Make a test purchase using card number `4242 4242 4242 4242`
3. Confirm you're redirected to the success page with a reading
4. Disable Test Mode when ready to go live

---

## File Structure

```
wu-oracle/
├── app/
│   ├── page.tsx              # Main oracle page
│   ├── layout.tsx            # HTML head, fonts
│   ├── success/page.tsx      # Post-payment reading page
│   ├── privacy/page.tsx      # Privacy policy
│   ├── terms/page.tsx        # Terms of service
│   └── api/
│       ├── checkout/route.ts # Creates Creem checkout session
│       ├── webhook/route.ts  # Receives Creem payment events
│       └── reading/route.ts  # Verifies payment + calls Anthropic
├── .env.example              # Copy to .env.local, fill in keys
├── package.json
└── next.config.js
```

---

## How It Works

1. User fills in question → clicks "Cast the Coins"
2. Question + hexagram index saved to `sessionStorage`
3. User redirected to Creem checkout ($3.99)
4. User pays → Creem redirects back to `/success?checkout_id=...&signature=...`
5. Success page reads question from `sessionStorage`
6. Calls `/api/reading` with checkout ID + signature
7. Server verifies Creem signature (prevents bypassing payment)
8. Server calls Anthropic API to generate reading
9. Reading returned and displayed with typing animation

---

## Support

If users can't access their reading after payment, they can contact you.
Creem stores all transaction records in your dashboard.
