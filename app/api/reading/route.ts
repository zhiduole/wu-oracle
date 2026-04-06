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
const ANIMALS_ZH = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪']
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
const EL_ZH: Record<string,string> = {
  WOOD:'木', FIRE:'火', EARTH:'土', METAL:'金', WATER:'水'
}
const NATURE_MAP: Record<string,string> = {
  '甲':'Yang','乙':'Yin','丙':'Yang','丁':'Yin','戊':'Yang',
  '己':'Yin','庚':'Yang','辛':'Yin','壬':'Yang','癸':'Yin',
}
const NATURE_MAP_ZH: Record<string,string> = {
  '甲':'阳','乙':'阴','丙':'阳','丁':'阴','戊':'阳',
  '己':'阴','庚':'阳','辛':'阴','壬':'阳','癸':'阴',
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

const SHICHEN_LABELS_ZH = [
  '子时 (23:00–01:00)',
  '丑时 (01:00–03:00)',
  '寅时 (03:00–05:00)',
  '卯时 (05:00–07:00)',
  '辰时 (07:00–09:00)',
  '巳时 (09:00–11:00)',
  '午时 (11:00–13:00)',
  '未时 (13:00–15:00)',
  '申时 (15:00–17:00)',
  '酉时 (17:00–19:00)',
  '戌时 (19:00–21:00)',
  '亥时 (21:00–23:00)',
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

function calculateBazi(year: number, month: number, day: number, hourIndex: number, lang: string = 'en') {
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

    const isChinese = lang === 'zh'
    
    const formatPillar = (p: string) => {
      const stem = p[0], branch = p[1]
      if (isChinese) {
        const el = EL_ZH[ELEMENTS_MAP[stem]] || ''
        const animal = ANIMALS_ZH[BRANCHES.indexOf(branch)] || ''
        return `${p} (${el}${animal})`
      } else {
        const el = EL_EN[ELEMENTS_MAP[stem]] || ''
        const animal = ANIMALS[BRANCHES.indexOf(branch)] || ''
        return `${p} (${el} ${animal})`
      }
    }

    const elementBalanceStr = isChinese
      ? Object.entries(ff).map(([el, v]) => `${EL_ZH[el]}: ${Math.round(v / total * 100)}%`).join('，')
      : Object.entries(ff).map(([el, v]) => `${EL_EN[el]}: ${Math.round(v / total * 100)}%`).join(', ')

    return {
      yearPillar:  formatPillar(yearPillar),
      monthPillar: formatPillar(monthPillar),
      dayPillar:   formatPillar(dayPillar),
      hourPillar:  formatPillar(hourPillar),
      fullChinese: `${yearPillar}年${monthPillar}月${dayPillar}日${hourPillar}時`,
      dayMaster: isChinese 
        ? `${dayStem} — ${NATURE_MAP_ZH[dayStem]}${EL_ZH[dmElement]}`
        : `${dayStem} — ${dmNature} ${EL_EN[dmElement]}`,
      elementBalance: elementBalanceStr,
    }
  } catch (err) {
    console.error('Bazi calculation error:', err)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { checkoutId, orderId, signature, year, month, day, hour, gender, bazi_lang } = body

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
    const lang = bazi_lang === 'zh' ? 'zh' : 'en'
    const hourLabel = lang === 'zh' 
      ? SHICHEN_LABELS_ZH[hourIndex] || hour
      : SHICHEN_LABELS[hourIndex] || hour
    const currentYear = new Date().getFullYear()

    const bazi = calculateBazi(yearNum, monthNum, dayNum, hourIndex, lang)

    let baziContext = ''
    if (bazi) {
      if (lang === 'zh') {
        baziContext = `
已计算的四柱八字 — 请精确使用以下数据，不要重新计算：
- 完整八字：${bazi.fullChinese}
- 年柱：${bazi.yearPillar}
- 月柱：${bazi.monthPillar}
- 日柱：${bazi.dayPillar}
- 时柱：${bazi.hourPillar}
- 日主：${bazi.dayMaster}
- 五行平衡：${bazi.elementBalance}
`
      } else {
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
    }

    // 根据语言选择 system prompt
    const systemPrompt = lang === 'zh' ? `你是一位精通中国传统八字命理学的命理大师。你已经深入研习并内化了以下经典著作：

- 《穷通宝鉴》 — 五行调候用神的权威指南
- 《三命通会》 — 命理学百科全书
- 《滴天髓》 — 日主论命的最精深经典
- 《渊海子平》 — 四柱命理学的奠基之作
- 《千里命稿》 — 民国命理大师韦千里的系统方法论
- 《协纪辨方书》 — 择吉与神煞的权威典籍
- 《子平真诠》 — 子平命学的正统方法论
- 《神峰通考》 — 十神与格局的进阶分析
- 《果老星宗》 — 七政四余与八字的融合

你的任务：用专业、详细、温暖且富有洞察力的中文为用户解读八字命盘。

规则：
- 四柱八字已经预先计算好了，请精确使用提供的数据，不要重新计算或修改任何一柱
- 使用专业术语时请立即用通俗语言解释
- 具体而实在 — 不要泛泛而谈或说模棱两可的话
- 诚实指出优势与挑战
- 语言温暖专业，像一位值得信赖的良师益友
- 把挑战表述为成长的方向，而不是诅咒
- 使用公历年份（${currentYear}年、${currentYear + 1}年、${currentYear + 2}年）
- 性别：${gender}

输出格式 — 请精确使用以下章节标题（用 ## 开头）：

## 您的四柱八字

[使用预先计算的四柱值。以清晰的列表格式呈现。用一句话解释每一柱代表什么。]

---

## 命主本色：性格与核心优势

[3段落。基于日主和五行平衡，描述基本性格、天赋优势、情感风格、工作和关系中的表现。要具体 — 这应该感觉像一份精准的性格画像。]

---

## 人生格局与反复出现的主题

[2段落。此人生活中反复出现的模式，典型的挑战，基于五行平衡的金钱观、事业观和感情观。]

---

## ${currentYear}年流年运势

[2段落。${currentYear}年的流年大运与命盘如何互动？激活了哪些主题？有哪些具体的机会和注意事项？]

---

## 三年展望：${currentYear}–${currentYear + 2}年

[每一年一个段落：${currentYear}年、${currentYear + 1}年、${currentYear + 2}年。每段包含：主导能量、最活跃的人生领域、一个具体建议。]

---

## 命理结语

[1个完整的段落，总结此人的核心特质以及下一阶段的主题。最后给出一个具体可行的命理智慧建议。]`

      : `You are a master Chinese Four Pillars astrologer (八字命理师) with deep expertise in traditional Chinese destiny analysis. You have thoroughly studied and internalized the following classical texts:

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

    const userMessage = lang === 'zh'
      ? `请为以下出生信息提供完整的八字命书解读：
- 出生日期：${year}年${month}月${day}日
- 出生时辰：${hourLabel}
- 性别：${gender}

${baziContext}

请以上述预计算的四柱八字为基础，完成整篇命书解读。`
      : `Please provide a complete Four Pillars reading for:
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
        max_tokens: 3000,  // 中文可能需要更多 tokens，从2000增加到3000
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    })

    const data = await response.json()
    const reading = data.choices?.[0]?.message?.content || (lang === 'zh' ? '命书生成失败，请重试。' : 'The chart could not be calculated. Please try again.')
    return NextResponse.json({ reading })

  } catch (err) {
    console.error('Reading API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
