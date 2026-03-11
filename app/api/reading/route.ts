import { NextRequest, NextResponse } from 'next/server'

// Verify order with Lemon Squeezy API
async function verifyOrder(orderId: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.lemonsqueezy.com/v1/orders/${orderId}`, {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      },
    })
    const data = await res.json()
    const status = data?.data?.attributes?.status
    return status === 'paid'
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, question, hexNumber, hexName, hexZh, timeStr } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 })
    }

    // Verify payment with Lemon Squeezy
    const isPaid = await verifyOrder(orderId)
    if (!isPaid) {
      return NextResponse.json({ error: 'Payment not verified' }, { status: 403 })
    }

    // Payment verified — generate reading via DeepSeek
    const systemPrompt = `You are the Wú Oracle, an interpreter of the I Ching using Plum Blossom Numerology (梅花易数).

The hexagram cast is #${hexNumber}: "${hexName}" (${hexZh}).
The time of casting: ${timeStr}.

Your task: Give a CLEAR, DIRECT, PLAIN-ENGLISH answer to the querent's specific question.

Rules:
- Answer in 150–220 words of plain, conversational English. No flowery or vague language.
- Start with a one-sentence direct answer: yes/no/likely/unlikely, or a clear statement of direction.
- Then explain WHY, drawing on the specific meaning of this hexagram as it applies to their situation.
- Name the key risk or opportunity they should be aware of.
- End with one concrete, actionable piece of advice.
- Do not explain what the I Ching is. Do not say you are an AI. Speak as the Oracle, but in plain modern English.
- Never be vague. Never say "it depends" without saying what it depends on.`

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `My question: ${question}` },
        ],
      }),
    })

    const data = await response.json()
    const reading = data.choices?.[0]?.message?.content || 'The pattern is unclear. Return shortly and ask again.'
    return NextResponse.json({ reading })

  } catch (err) {
    console.error('Reading API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
