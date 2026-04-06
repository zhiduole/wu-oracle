import { NextRequest, NextResponse } from 'next/server'
import datesMapping from '../../bazi-data/dates_mapping.json'

const STEMS    = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
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
const SHICHEN_HOUR = [0,2,4,6,8,10,12,14,16,18,20,22]

function getHourBranch(hour: number): string {
  const map: [number,number,string][] = [
    [23,24,'子'],[0,1,'子'],[1,3,'丑'],[3,5,'寅'],[5,7,'卯'],
    [7,9,'辰'],[9,11,'巳'],[11,13,'午'],[13,15,'未'],
    [15,17,'申'],[17,19,'酉'],[19,21,'戌'],[21,23,'亥'],
  ]
  for (const [s,e,b] of map) {
    if (hour >= s && hour < e) return b
  }
  return '子'
}

function calculateBazi(year: number, month: number, day: number, hourIndex: number) {
  const mapping = (datesMapping as Record<string,Record<string,Record<string,Record<string,string>>>>)
    ?.[year]?.[month]?.[day]
  if (!mapping) throw new Error(`No mapping for ${year}-${month}-${day}`)

  const hYear  = parseInt(mapping.HYear)
  const eYear  = parseInt(mapping.EYear)
  const hMonth = parseInt(mapping.HMonth)
  const eMonth = parseInt(mapping.EMonth)
  const hDay   = parseInt(mapping.HDay)
  const eDay   = parseInt(mapping.EDay)

  const yearPillar  = STEMS[hYear-1]  + BRANCHES[eYear-1]
  const monthPillar = STEMS[hMonth-1] + BRANCHES[eMonth-1]
  const dayPillar   = STEMS[hDay-1]   + BRANCHES[eDay-1]

  const hour = SHICHEN_HOUR[hourIndex]
  const hourBranch = getHourBranch(hour)
  const hourStemBase = ((hDay-1) % 5) * 2
  const hourStem = STEMS[(hourStemBase + BRANCHES.indexOf(hourBranch)) % 10]
  const hourPillar = hourStem + hourBranch

  const dayStem = STEMS[hDay-1]
  const dmElement = ELEMENTS_MAP[dayStem] || 'EARTH'
  const dmNature  = NATURE_MAP[dayStem] || 'Yang'

  const allPillars = [yearPillar, monthPillar, dayPillar, hourPillar]
  const ff: Record<string,number> = {WOOD:0,FIRE:0,EARTH:0,METAL:0,WATER:0}
  allPillars.forEach(p => {
    const s = p[0], b = p[1]
    if (ELEMENTS_MAP[s]) ff[ELEMENTS_MAP[s]] += 10
    if (BRANCH_ELEMENTS[b]) ff[BRANCH_ELEMENTS[b]] += 10
  })
  const total = Object.values(ff).reduce((a,b) => a+b, 0)

  const formatPillar = (p: string) => {
    const stem = p[0], branch = p[1]
    const el = EL_EN[ELEMENTS_MAP[stem]] || ''
    const animal = ANIMALS[BRANCHES.indexOf(branch)] || ''
    return `${p} (${el} ${animal})`
  }

  // Find dominant and weakest element
  const sorted = Object.entries(ff).sort((a,b) => b[1]-a[1])
  const dominant = EL_EN[sorted[0][0]]
  const weakest  = EL_EN[sorted[sorted.length-1][0]]

  return {
    yearPillar:  formatPillar(yearPillar),
    monthPillar: formatPillar(monthPillar),
    dayPillar:   formatPillar(dayPillar),
    hourPillar:  formatPillar(hourPillar),
    fullChinese: `${yearPillar}年${monthPillar}月${dayPillar}日${hourPillar}時`,
    dayMaster: `${dayStem} — ${dmNature} ${EL_EN[dmElement]}`,
    dmElement: EL_EN[dmElement],
    dmNature,
    dominant,
    weakest,
    elementBalance: Object.entries(ff)
      .map(([el,v]) => `${EL_EN[el]}: ${Math.round(v/total*100)}%`)
      .join(', '),
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { year, month, day, hour, gender } = body

    const bazi = calculateBazi(
      parseInt(year), parseInt(month), parseInt(day), parseInt(hour)
    )

    const currentYear = new Date().getFullYear()

    const systemPrompt = `You are a master Chinese Four Pillars astrologer writing a destiny preview for a Western reader who has never encountered Chinese astrology before.

The Four Pillars have been calculated:
- Full chart: ${bazi.fullChinese}
- Year Pillar:  ${bazi.yearPillar}
- Month Pillar: ${bazi.monthPillar}
- Day Pillar:   ${bazi.dayPillar}
- Hour Pillar:  ${bazi.hourPillar}
- Day Master:   ${bazi.dayMaster}
- Element Balance: ${bazi.elementBalance}
- Dominant element: ${bazi.dominant}
- Weakest element: ${bazi.weakest}
- Gender: ${gender}
- Current year: ${currentYear}

Write a compelling 180-200 word destiny PREVIEW. This is NOT the full reading — it is a teaser that makes the reader feel seen and hungry for more.

Structure (follow this exactly):
1. [2-3 sentences] Open with something uncannily accurate about their core personality based on the Day Master. Be specific enough that they think "how did it know that?" Avoid vague statements.
2. [2 sentences] Name their greatest natural strength AND the shadow side or blind spot that comes with it — the tension that defines them.
3. [2 sentences] Describe the central life theme running through their chart — the recurring pattern or crossroads they keep returning to. Make it feel personally true, not generic.
4. [2 sentences] Hint at what ${currentYear} holds — name ONE specific area of life (career, relationships, finances, health) that is activated this year, and say whether the energy is building or releasing — but do NOT give details or advice.
5. [1-2 sentences] End with a powerful hook. Mention something specific that the full reading will reveal — something that sounds significant and personal. Examples: "your most favorable period in the next decade", "the hidden element your chart is missing and how to invite it in", "the year your fortune turns", "the one pattern that has been working against you without your knowing."

Tone: Warm, direct, slightly mysterious. Like a wise friend who genuinely sees you.
DO NOT: use vague horoscope language, use Chinese terms without explanation, reveal the full analysis, give specific year predictions, mention specific ages.
The reader should finish feeling: "This is real. I need to see the rest."`

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 600,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Write the destiny preview now. Birth: ${year}-${month}-${day}, ${hour}, ${gender}.` },
        ],
      }),
    })

    const data = await response.json()
    const preview = data.choices?.[0]?.message?.content || ''

    return NextResponse.json({
      preview,
      bazi: {
        fullChinese: bazi.fullChinese,
        yearPillar:  bazi.yearPillar,
        monthPillar: bazi.monthPillar,
        dayPillar:   bazi.dayPillar,
        hourPillar:  bazi.hourPillar,
        dayMaster:   bazi.dayMaster,
        elementBalance: bazi.elementBalance,
      }
    })

  } catch (err) {
    console.error('Preview API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
