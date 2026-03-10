import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Verify the Creem redirect signature to prevent spoofing
function verifyCreemSignature(params: Record<string, string>, apiKey: string): boolean {
  const { signature, ...rest } = params

  // Build signature string: sort keys, exclude nulls/undefined
  const signatureString = Object.keys(rest)
    .sort()
    .filter(k => rest[k] != null && rest[k] !== '')
    .map(k => `${k}=${rest[k]}`)
    .join('&')

  const expected = crypto
    .createHmac('sha256', apiKey)
    .update(signatureString)
    .digest('hex')

  return expected === signature
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { checkoutId, orderId, question, hexNumber, hexName, hexZh, timeStr, signature } = body

    // Verify signature from Creem redirect
    const isValid = verifyCreemSignature(
      { checkout_id: checkoutId, order_id: orderId, signature },
      process.env.CREEM_API_KEY!
    )

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 403 })
    }

    // Payment verified — now generate the reading
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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: `My question: ${question}` }],
      }),
    })

    const data = await response.json()
    const reading = data.content?.[0]?.text || 'The pattern is unclear. Return shortly and ask again.'

    return NextResponse.json({ reading })

  } catch (err) {
    console.error('Reading API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
