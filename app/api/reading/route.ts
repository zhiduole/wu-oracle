import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

function verifyCreemSignature(params: Record<string, string>, apiKey: string): boolean {
  const { signature, ...rest } = params
  const signatureString = Object.keys(rest)
    .sort()
    .filter(k => rest[k] != null && rest[k] !== '')
    .map(k => `${k}=${rest[k]}`)
    .join('&')
  const expected = crypto.createHmac('sha256', apiKey).update(signatureString).digest('hex')
  return expected === signature
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      checkoutId, orderId, signature,
      question, hexNumber, hexName, hexZh, timeStr,
      upperTrigram, lowerTrigram, upperTrigramEn, lowerTrigramEn, movingLine,
    } = body

    const isValid = verifyCreemSignature(
      { checkout_id: checkoutId, order_id: orderId, signature },
      process.env.CREEM_API_KEY!
    )
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 403 })
    }

    const systemPrompt = `You are the Wú Oracle, an interpreter of the I Ching using Plum Blossom Numerology (梅花易数).

The hexagram cast is #${hexNumber}: "${hexName}" (${hexZh}).
Upper trigram: ${upperTrigramEn} (${upperTrigram})
Lower trigram: ${lowerTrigramEn} (${lowerTrigram})
Moving line: Line ${movingLine} (counted from the bottom)
Time of casting: ${timeStr}

Your task: Give a CLEAR, DIRECT, PLAIN-ENGLISH answer to the querent's specific question.

Rules:
- Answer in 180–240 words of plain, conversational English. No flowery or vague language.
- Start with a one-sentence direct answer: yes/no/likely/unlikely, or a clear statement of direction.
- Briefly explain the meaning of the upper and lower trigrams as they relate to the situation.
- Reference the moving line and what it indicates about how the situation will develop.
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
