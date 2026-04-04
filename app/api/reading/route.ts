import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import datesMapping from '../../bazi-data/dates_mapping.json'

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

const STEMS   = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
const ANIMALS  = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig']
const ELEMENTS_MAP: Record<string,string> = {
  '甲':'WOOD','乙':'WOOD','丙':'FIRE','丁':'FIRE','戊':'EARTH',
  '己':'EARTH','庚':'METAL','辛':'METAL','壬':'WATER','癸':'WATER',
}
const BRANCH_ELEMENTS: Record<string,string> = {
  '子':'WATER','丑':'EARTH','寅':'WOOD','卯':'WOOD','辰':'EARTH','巳':'FIRE',
  '午':'FIRE','未':'EARTH','申':'METAL','酉':'METAL','戌':'EARTH','亥':'WATER',
}
const EL_EN: Record<string,string> = {
  WOOD:'Wood', FIRE:'Fire', EARTH:'Earth', METAL:'Metal', WATER:'Water'
}
const NATURE_MAP: Record<string,string> = {
  '甲':'Yang','乙':'Yin','丙':'Yang','丁':'Yin','戊':'Yang',
  '己':'Yin','庚':'Yang','辛':'Yin','壬':'Yang','癸':'Yin',
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

// Shichen index → representative hour for lookup
const SHICHEN_HOUR = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]

// Branch for each hour (0-23)
function getHourBranch(hour: number): string {
  const map: [number, number, string][] = [
    [23, 24, '子'], [0, 1, '子'],
    [1, 3, '丑'], [3, 5, '寅'], [5, 7, '卯'],
    [7, 9, '辰'], [9, 11, '巳'], [11, 13, '午'],
    [13, 15, '未'], [15, 17, '申'], [17, 19, '酉'],
    [19, 21, '戌'], [21, 23, '亥'],
  ]
  for (const [s, e, b] of map) {
    if (hour >= s && hour < e) return b
  }
  return '子'
}

function calculateBazi(year: number, month: number, day: number, hourIndex: number) {
  try {
    const mapping = (datesMapping as Record<string, Record<string, Record<string, Record<string, string>>>>)
      ?.[year]?.[month]?.[day]

    if (!mapping) throw new Error(`No mapping for ${year}-${month}-${day}`)

    const hYear  = parseInt(mapping.HYear)
    const eYear  = parseInt(mapping.EYear)
    const hMonth = parseInt(mapping.HMonth)
    const eMonth = parseInt(mapping.EMonth)
    const hDay   = parseInt(mapping.HDay)
    const eDay   = parseInt(mapping.EDay)

    const yearPillar  = STEMS[hYear - 1]  + BRANCHES[eYear - 1]
    const monthPillar = STEMS[hMonth - 1] + BRANCHES[eMonth - 1]
    const dayPillar   = STEMS[hDay - 1]   + BRANCHES[eDay - 1]

    // Hour pillar: stem depends on day stem
    const hour = SHICHEN_HOUR[hourIndex]
    const hourBranch = getHourBranch(hour)
    const dayStemIndex = hDay - 1  // 0-based index
    const hourStemBase = (dayStemIndex % 5) * 2
    const hourStem = STEMS[(hourStemBase + BRANCHES.indexOf(hourBranch)) % 10]
    const hourPillar = hourStem + hourBranch

    // Day Master
    const dayStem = STEMS[hDay - 1]
    const dmElement = ELEMENTS_MAP[dayStem] || 'EARTH'
    const dmNature  = NATURE_MAP[dayStem] || 'Yang'

    // Five element balance
    const allPillars = [yearPillar, monthPillar, dayPillar, hourPillar]
    const ff: Record<string, number> = { WOOD:0, FIRE:0, EARTH:0, METAL:0, WATER:0 }
    allPillars.forEach(p => {
      const s = p[0], b = p[1]
      if (ELEMENTS_MAP[s]) ff[ELEMENTS_MAP[s]] += 10
      if (BRANCH_ELEMENTS[b]) ff[BRANCH_ELEMENTS[b]] += 10
    })
    const total = Object.values(ff).reduce((a, b) => a + b, 0)

    const formatPillar = (p: string) => {
      const stem = p[0], branch = p[1]
      const el = EL_EN[ELEMENTS_MAP[stem]] || ''
      const animal = ANIMALS[BRANCHES.indexOf(branch)] || ''
      return `${p} (${el} ${animal})`
    }

    return {
      yearPillar:  formatPillar(yearPillar),
      monthPillar: formatPillar(monthPillar),
      dayPillar:   formatPillar(dayPillar),
      hourPillar:  formatPillar(hourPillar),
      fullChinese: `${yearPillar}年${monthPillar}月${dayPillar}日${hourPillar}時`,
      dayMaster: `${dayStem} — ${dmNature} ${EL_EN[dmElement]}`,
      elementBalance: Object.entries(ff)
        .map(([el, v]) => `${EL_EN[el]}: ${Math.round(v / total * 100)}%`)
        .join(', '),
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

    // Temporarily disabled for testing — re-enable before go-live
    const isValid = verifyCreemSignature(
      { checkout_id: checkoutId, order_id: orderId, signature },
     process.env.CREEM_API_KEY!
    )
   if (!isValid) {
     return NextResponse.json({ error: 'Invalid payment signature' }, { status: 403 })
   }

    const yearNum  = parseInt(year)
    const monthNum = parseInt(month)
    const dayNum   = parseInt(day)
    const hourIndex = parseInt(hour)
    const hourLabel = SHICHEN_LABELS[hourIndex] || hour
    const currentYear = new Date().getFullYear()

    const bazi = calculateBazi(yearNum, monthNum, dayNum, hourIndex)

    let baziContext = ''
    if (bazi) {
      baziContext = `
CALCULATED FOUR PILLARS — use these exactly, do not recalculate:
- Full chart: ${bazi.fullChinese}
- Year Pillar:  ${bazi.yearPillar}
- Month Pillar: ${bazi.monthPillar}
- Day Pillar:   ${bazi.dayPillar}
- Hour Pillar:  ${bazi.hourPillar}
- Day Master:   ${bazi.dayMaster}
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
- The Four Pillars have been pre-calculated. Use them EXACTLY as provided. DO NOT recalculate or change any pillar.
- NEVER use raw Chinese terminology without immediately explaining it in plain English
- Be specific and concrete — no vague fortune-cookie statements
- Be honest about both strengths AND challenges
- Use plain conversational English — like a knowledgeable trusted friend
- Frame challenges as growth edges, not curses
- Use calendar years (${currentYear}, ${currentYear + 1}, ${currentYear + 2}), not Chinese era names
- Gender context: ${gender}

OUTPUT FORMAT — use exactly these section headers with ## prefix:

## Your Four Pillars

[Present the four pillars using the pre-calculated values. Format as a clear list. One sentence per pillar explaining what it represents in plain English.]

---

## Who You Are: Character & Core Strengths

[3 paragraphs. Based on the Day Master and element balance, describe fundamental personality, natural strengths, emotional style, approach to work and relationships. Be specific — this should feel like an accurate personality profile.]

---

## Life Patterns & Recurring Themes

[2 paragraphs. Recurring patterns in this person's life, characteristic challenges, natural relationship with money, career, and love based on element balance.]

---

## ${currentYear}: What This Year Holds

[2 paragraphs. How does the ${currentYear} annual pillar interact with this natal chart? What themes are activated? What specific opportunities and cautions apply?]

---

## Three-Year Outlook: ${currentYear}–${currentYear + 2}

[One paragraph per year for ${currentYear}, ${currentYear + 1}, ${currentYear + 2}. For each: dominant energy, most activated life area, one specific piece of advice.]

---

## The Oracle's Summary

[1 substantial paragraph synthesizing who this person is at their core and what the next phase is about. End with one concrete, actionable piece of wisdom from the chart.]`

    const userMessage = `Please provide a complete Four Pillars reading for:
- Birth date: ${year}-${month}-${day}
- Birth hour: ${hourLabel}
- Gender: ${gender}

${baziContext}

Use the pre-calculated Four Pillars above as the foundation for your entire reading.`

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
