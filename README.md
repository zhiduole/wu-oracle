# Wú · The Book of Changes
## Deployment Guide

---

## What You Need Before Starting

1. A [Lemon Squeezy](https://lemonsqueezy.com) accoun t (free to sign up)
2. A [DeepSeek](https://platform.deepseek.com) account with API key (min $2 credit)
3. A [Vercel](https://vercel.com) account (free)
4. A [GitHub](https://github.com) account (free)
5. Your domain name

---

## Step 1 — Set Up Lemon Squeezy

1. Register at lemonsqueezy.com and complete store setup
2. Go to **Products → Create Product**
   - Name: Wú Oracle Reading
   - Price: $3.99
   - Type: Single payment
3. After creating the product, click into the variant — copy the **Variant ID** from the URL
4. Go to **Settings → Store** — copy your **Store ID** from the URL
5. Go to **Settings → API → New API Key** — copy your **API Key**
6. Go to **Settings → Webhooks → Add webhook**
   - URL: `https://your-domain.com/api/webhook`
   - Events: check `order_created`
   - Copy the **Signing Secret**

---

## Step 2 — Get DeepSeek API Key

1. Go to [platform.deepseek.com](https://platform.deepseek.com)
2. Register and top up $2
3. Go to **API Keys → Create Key** — copy your key

---

## Step 3 — Deploy to Vercel

1. Push this project to GitHub
2. Go to vercel.com → **New Project** → import your repo
3. Add these **Environment Variables**:

| Key | Where to find it |
|-----|-----------------|
| `LEMONSQUEEZY_API_KEY` | LS Settings → API |
| `LEMONSQUEEZY_STORE_ID` | LS Settings → Store (from URL) |
| `LEMONSQUEEZY_VARIANT_ID` | LS Product variant (from URL) |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | LS Settings → Webhooks |
| `DEEPSEEK_API_KEY` | platform.deepseek.com → API Keys |
| `NEXT_PUBLIC_SITE_URL` | your domain e.g. https://askwu.com |

4. Click **Deploy**

---

## Step 4 — Connect Your Domain

1. Vercel → your project → **Settings → Domains** → add your domain
2. Follow DNS instructions (add A record or CNAME at your domain registrar)
3. Wait 10–30 mins for SSL certificate to activate

---

## Step 5 — Update Webhook URL

Once domain is live, update the webhook URL in Lemon Squeezy to your real domain.

---

## Step 6 — Test

1. Enable **Test Mode** in Lemon Squeezy
2. Use test card `4242 4242 4242 4242`
3. Confirm you land on success page with a reading
4. Disable Test Mode when ready to go live

---

## How Payment Works

1. User fills question → clicks Cast the Coins
2. Question + hexagram saved to sessionStorage
3. Redirected to Lemon Squeezy checkout ($3.99)
4. User pays → redirected back to `/success?order_id=...`
5. Success page calls `/api/reading` with order ID
6. Server verifies order is `paid` via Lemon Squeezy API
7. Server calls DeepSeek to generate reading
8. Reading displayed with typing animation
