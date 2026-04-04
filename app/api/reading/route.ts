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

const SHICHEN_LABELS = [
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

// Map shichen index to representative hour for the library
const SHICHEN_HOUR = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]

function calculateBazi(year: number, month: number, day: number, hourIndex: number) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { BaziCalculator } = require('bazi-calculator-by-alvamind')
    const hour = SHICHEN_HOUR[hourIndex]
    const calc = new BaziCalculator(year, month, day, hour, 'male')
    const pillars = calc.calculatePillars()
    const analysis = calc.calculateBasicAnalysis()

    const ELEMENT_MAP: Record<string, string> = {
      WOOD: 'Wood', FIRE: 'Fire', EARTH: 'Earth', METAL: 'Metal', WATER: 'Water',
    }

    const yearPillar = `${pillars.year.chinese} (${ELEMENT_MAP[pillars.year.element] || pillars.year.element} ${pillars.year.animal})`
    const monthPillar = `${pillars.month.chinese} (${ELEMENT_MAP[pillars.month.element] || pillars.month.element} ${pillars.month.animal})`
    const dayPillar = `${pillars.day.chinese} (${ELEMENT_MAP[pillars.day.element] || pillars.day.element} ${pillars.day.animal})`
    const hourPillar = `${pillars.time.chinese} (${ELEMENT_MAP[pillars.time.element] || pillars.time.element} ${pillars.time.animal})`

    const dayMaster = `${analysis.dayMaster.stem} — ${analysis.dayMaster.nature} ${ELEMENT_MAP[analysis.dayMaster.element] || analysis.dayMaster.element}`

    const ff = analysis.fiveFactors
    const total = Object.values(ff).reduce<number>((a, b) => a + (b as number), 0)
    const elementBalance = Object.entries(ff)
      .map(([el, val]) => {
        const numVal = val as number;  // 先断言
        return `${ELEMENT_MAP[el] || el}: ${Math.round((numVal / total) * 100)}%`;
      })
      .join(', ')

    return {
      yearPillar, monthPillar, dayPillar, hourPillar,
      dayMaster, elementBalance,
      fullChinese: calc.toString(),
    }
  } catch (err) {
    console.error('Bazi calculation error:', err)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { checkoutId, orderId, signature, year, month, day, hour, gender } = body

//   const isValid = verifyCreemSignature(
//      { checkout_id: checkoutId, order_id: orderId, signature },
//      process.env.CREEM_API_KEY!
//    )

//    if (!isValid) {
//      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 403 })
//    }

    const yearNum = parseInt(year)
    const monthNum = parseInt(month)
    const dayNum = parseInt(day)
    const hourIndex = parseInt(hour)
    const hourLabel = SHICHEN_LABELS[hourIndex] || hour
    const currentYear = new Date().getFullYear()

    // Calculate Four Pillars using the library
    const bazi = calculateBazi(yearNum, monthNum, dayNum, hourIndex)

    let baziContext = ''
    if (bazi) {
      baziContext = `
CALCULATED FOUR PILLARS (use these exactly, do not recalculate):
- Full chart: ${bazi.fullChinese}
- Year Pillar: ${bazi.yearPillar}
- Month Pillar: ${bazi.monthPillar}
- Day Pillar: ${bazi.dayPillar}
- Hour Pillar: ${bazi.hourPillar}
- Day Master: ${bazi.dayMaster}
- Five Element Balance: ${bazi.elementBalance}
`
    }

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

YOUR MISSION: Translate classical Four Pillars wisdom for Western audiences with zero background in Chinese astrology.

Rules:
- The Four Pillars have already been calculated for you. Use them exactly as provided. DO NOT recalculate.
- NEVER use raw Chinese terminology without immediately explaining it in plain English
- Use analogies Western readers understand — personality types, modern psychology, life seasons
- Be specific and concrete — no vague fortune-cookie statements
- Be honest about both strengths AND challenges
- Use plain conversational English — like a knowledgeable trusted friend
- Frame challenges as growth edges, not curses
- Use public calendar years (${currentYear}, ${currentYear + 1}, ${currentYear + 2}) not Chinese era names
- Gender context: ${gender}

OUTPUT FORMAT — use exactly these section headers with ## prefix:

## Your Four Pillars

[Present the four pillars clearly using the calculated values above. Format as a simple table or list. Add one sentence explaining what each pillar represents in plain English.]

---

## Who You Are: Character & Core Strengths

[3 paragraphs. Based on the Day Master and element balance, describe their fundamental personality, natural strengths, emotional style, and approach to work and relationships. Be specific — this should feel like an accurate personality profile, not a horoscope.]

---

## Life Patterns & Recurring Themes

[2 paragraphs. What patterns tend to repeat in this person's life? What are their characteristic challenges? What is their natural relationship with money, career, and love based on the element balance?]

---

## ${currentYear}: What This Year Holds

[2 paragraphs. Analyze how the ${currentYear} annual Heavenly Stem and Earthly Branch interact with this person's natal chart. What themes are activated? What specific opportunities and cautions apply?]

---

## Three-Year Outlook: ${currentYear}–${currentYear + 2}

[One paragraph per year for ${currentYear}, ${currentYear + 1}, and ${currentYear + 2}. For each year: what is the dominant energy for this person, what life area is most activated, and one specific piece of advice.]

---

## The Oracle's Summary

[1 substantial paragraph synthesizing who this person is at their core and what the next phase of their life is fundamentally about. End with one concrete, actionable piece of wisdom drawn directly from the chart.]`

    const userMessage = `Please provide a complete Four Pillars reading for:
- Birth date: ${year}-${month}-${day}
- Birth hour: ${hourLabel}
- Gender: ${gender}

${baziContext}

Use the pre-calculated Four Pillars above as the foundation for your entire reading. Provide the complete reading following the specified format.`

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
