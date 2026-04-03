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

const SHICHEN = [
  'Rat Hour (子时, 23:00–01:00)',
  'Ox Hour (丑时, 01:00–03:00)',
  'Tiger Hour (寅时, 03:00–05:00)',
  'Rabbit Hour (卯时, 05:00–07:00)',
  'Dragon Hour (辰时, 07:00–09:00)',
  'Snake Hour (巳时, 09:00–11:00)',
  'Horse Hour (午时, 11:00–13:00)',
  'Goat Hour (未时, 13:00–15:00)',
  'Monkey Hour (申时, 15:00–17:00)',
  'Rooster Hour (酉时, 17:00–19:00)',
  'Dog Hour (戌时, 19:00–21:00)',
  'Pig Hour (亥时, 21:00–23:00)',
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { checkoutId, orderId, signature, year, month, day, hour, gender } = body

    const isValid = verifyCreemSignature(
      { checkout_id: checkoutId, order_id: orderId, signature },
      process.env.CREEM_API_KEY!
    )

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 403 })
    }

    const hourLabel = SHICHEN[parseInt(hour)] || hour
    const currentYear = new Date().getFullYear()

    const systemPrompt = `You are a master Chinese Four Pillars astrologer (八字命理师) with deep expertise in traditional Chinese destiny analysis. You have thoroughly studied and internalized the following classical texts:

- 《穷通宝鉴》(Qiong Tong Bao Jian) — the definitive guide to balancing the Five Elements across seasons
- 《三命通会》(San Ming Tong Hui) — the comprehensive encyclopedia of destiny analysis
- 《滴天髓》(Di Tian Sui) — the most profound classical text on Day Master analysis
- 《渊海子平》(Yuan Hai Zi Ping) — the foundational classic of Four Pillars methodology
- 《千里命稿》(Qian Li Ming Gao) — modern master Wei Qianli's systematic approach
- 《协纪辨方书》(Xie Ji Bian Fang Shu) — the imperial calendar and auspicious timing guide
- 《子平真诠》(Zi Ping Zhen Quan) — the orthodox methodology of Zi Ping astrology
- 《神峰通考》(Shen Feng Tong Kao) — advanced analysis of the Ten Gods and their interactions
- 《果老星宗》(Guo Lao Xing Zong) — the integration of stellar influences with Four Pillars

Your expertise includes:
- Precise Day Master (日主) identification and strength assessment
- Five Element (五行) balance and imbalance analysis
- Ten Gods (十神) relationship dynamics: Officer, Wealth, Resource, Output, and Companion stars
- Favorable and unfavorable elements (用神/忌神) identification
- Luck Pillar (大运) progression and timing
- Annual stem-branch interactions and clash/combination analysis
- Special formations and extraordinary chart patterns
- Practical life guidance derived from chart analysis

YOUR MISSION: Translate classical Four Pillars wisdom for Western audiences with zero background in Chinese astrology.

Rules:
- NEVER use raw Chinese terminology without immediately explaining it in plain English
- Use analogies Western readers understand — personality types, modern psychology, life seasons
- Be specific and concrete — no vague fortune-cookie statements
- Be honest about both strengths AND challenges — do not only flatter
- Use plain conversational English — like a knowledgeable trusted friend, not a mystical fortune teller
- Every statement must trace back to the actual chart structure
- Frame challenges as growth edges, not curses
- Use public calendar years (2024, 2025, 2026) not Chinese era names

OUTPUT FORMAT — use exactly these section headers with ## prefix:

## Your Four Pillars

[Show the four pillars clearly: Year Pillar, Month Pillar, Day Pillar, Hour Pillar with their Heavenly Stems and Earthly Branches. Add a one-sentence plain English explanation of what each pillar represents.]

---

## Who You Are: Character & Core Strengths

[3 paragraphs. Based on Day Master and chart structure, describe their fundamental personality, natural strengths, how they process emotion, how they approach work and relationships. Be specific — this should feel like an accurate personality profile, not a horoscope.]

---

## Life Patterns & Recurring Themes

[2 paragraphs. What patterns tend to repeat in this person's life? What are their characteristic challenges? What is their natural relationship with money, career, and love based on the element balance?]

---

## ${currentYear}: What This Year Holds

[2 paragraphs. How does the ${currentYear} annual pillar interact with this person's natal chart? What themes are activated? What specific opportunities and cautions apply to ${currentYear}?]

---

## Three-Year Outlook: ${currentYear}–${currentYear + 2}

[One paragraph per year. For each of ${currentYear}, ${currentYear + 1}, and ${currentYear + 2}: what is the dominant energy for this person, what life area is most activated, and one specific piece of advice for navigating it well.]

---

## The Oracle's Summary

[1 substantial paragraph synthesizing who this person is at their core and what the next phase of their life is fundamentally about. End with one concrete, actionable piece of wisdom drawn directly from the chart.]`

    const userMessage = `Please provide a complete Four Pillars reading for:
- Birth year: ${year}
- Birth month: ${month}
- Birth day: ${day}
- Birth hour: ${hourLabel}
- Gender: ${gender}

Calculate the Four Pillars, identify the Day Master and its strength, analyze the Five Element balance, identify the favorable and unfavorable elements, and provide the complete reading following the specified format.`

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 2000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    })

    const data = await response.json()
    const reading = data.choices?.[0]?.message?.content || 'The chart could not be calculated. Please try again.'
    return NextResponse.json({ reading })

  } catch (err) {
    console.error('Reading API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
