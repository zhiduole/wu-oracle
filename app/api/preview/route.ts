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
const EL_EN: Record<string,string> = { WOOD:'Wood',FIRE:'Fire',EARTH:'Earth',METAL:'Metal',WATER:'Water' }
const EL_ZH: Record<string,string> = { WOOD:'木',FIRE:'火',EARTH:'土',METAL:'金',WATER:'水' }
const NATURE_MAP: Record<string,string> = {
  '甲':'Yang','乙':'Yin','丙':'Yang','丁':'Yin','戊':'Yang',
  '己':'Yin','庚':'Yang','辛':'Yin','壬':'Yang','癸':'Yin',
}
const NATURE_ZH: Record<string,string> = {
  '甲':'阳','乙':'阴','丙':'阳','丁':'阴','戊':'阳',
  '己':'阴','庚':'阳','辛':'阴','壬':'阳','癸':'阴',
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

  const hYear=parseInt(mapping.HYear), eYear=parseInt(mapping.EYear)
  const hMonth=parseInt(mapping.HMonth), eMonth=parseInt(mapping.EMonth)
  const hDay=parseInt(mapping.HDay), eDay=parseInt(mapping.EDay)

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
  const dmNatureZh = NATURE_ZH[dayStem] || '阳'

  const allPillars = [yearPillar, monthPillar, dayPillar, hourPillar]
  const ff: Record<string,number> = {WOOD:0,FIRE:0,EARTH:0,METAL:0,WATER:0}
  allPillars.forEach(p => {
    const s=p[0], b=p[1]
    if (ELEMENTS_MAP[s]) ff[ELEMENTS_MAP[s]] += 10
    if (BRANCH_ELEMENTS[b]) ff[BRANCH_ELEMENTS[b]] += 10
  })
  const total = Object.values(ff).reduce((a,b)=>a+b,0)
  const sorted = Object.entries(ff).sort((a,b)=>b[1]-a[1])
  const dominant = sorted[0][0]
  const weakest  = sorted[sorted.length-1][0]

  const formatPillarEn = (p: string) => {
    const stem=p[0], branch=p[1]
    const el = EL_EN[ELEMENTS_MAP[stem]] || ''
    const animal = ANIMALS[BRANCHES.indexOf(branch)] || ''
    return `${p} (${el} ${animal})`
  }

  return {
    yearPillar:  formatPillarEn(yearPillar),
    monthPillar: formatPillarEn(monthPillar),
    dayPillar:   formatPillarEn(dayPillar),
    hourPillar:  formatPillarEn(hourPillar),
    yearRaw: yearPillar, monthRaw: monthPillar,
    dayRaw: dayPillar, hourRaw: hourPillar,
    fullChinese: `${yearPillar}年${monthPillar}月${dayPillar}日${hourPillar}時`,
    dayMasterEn: `${dayStem} — ${dmNature} ${EL_EN[dmElement]}`,
    dayMasterZh: `${dayStem}（${dmNatureZh}${EL_ZH[dmElement]}）`,
    dayMaster: dayStem,
    dmElement, dmNature,
    dominant, weakest,
    elementBalanceEn: Object.entries(ff).map(([el,v])=>`${EL_EN[el]}: ${Math.round(v/total*100)}%`).join(', '),
    elementBalanceZh: Object.entries(ff).map(([el,v])=>`${EL_ZH[el]}: ${Math.round(v/total*100)}%`).join('，'),
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { year, month, day, hour, gender, lang = 'en' } = body

    const bazi = calculateBazi(parseInt(year), parseInt(month), parseInt(day), parseInt(hour))
    const currentYear = new Date().getFullYear()
    const isZh = lang === 'zh'

    const systemPrompt = isZh
      ? `你是一位精通传统八字命理的命理师，博览《穷通宝鉴》《三命通会》《滴天髓》《渊海子平》《千里命稿》《子平真诠》《神峰通考》等经典典籍。

已排出八字如下（请直接使用，不要重新计算）：
- 完整八字：${bazi.fullChinese}
- 年柱：${bazi.yearRaw}
- 月柱：${bazi.monthRaw}
- 日柱：${bazi.dayRaw}
- 时柱：${bazi.hourRaw}
- 日主：${bazi.dayMasterZh}
- 五行分布：${bazi.elementBalanceZh}
- 旺相元素：${EL_ZH[bazi.dominant]}
- 偏弱元素：${EL_ZH[bazi.weakest]}
- 性别：${gender === 'Male' ? '男' : '女'}
- 当前年份：${currentYear}年

请用200字左右写一段命书预览，目标是让读者感到"这说的就是我"，产生强烈想看完整命书的欲望。

结构（严格按照此顺序）：
1. [2-3句] 根据日主特质，精准点出此人的核心性格——要足够具体，让人觉得"你怎么知道的"。避免模糊套话。
2. [2句] 指出他/她最大的天赋优势，以及伴随而来的盲点或软肋——这对矛盾构成了他/她的人生张力。
3. [2句] 描述命盘中贯穿一生的核心主题或反复出现的人生课题，要有代入感。
4. [2句] 暗示${currentYear}年的运势方向——点出一个具体的人生领域（事业、感情、财运、健康）正在发生变化，说明能量是在积聚还是在释放，但不要给出具体建议。
5. [1-2句] 以悬念收尾：提及完整命书将揭示某个重要内容——例如"你命盘中最有利的大运何时开始"、"一直在暗中消耗你能量的那个模式"、"命盘中隐藏的转机"等。

语气：温暖、直接、略带神秘感。像一位真正看见你的智者在说话。
不要：用模糊套话、使用过于艰深的术语（或用了要立即解释）、给出具体趋吉避凶建议（留到完整版）。
读完之后，读者应该感觉：这是真的，我要看完整的。`
      : `You are a master Chinese Four Pillars astrologer writing a destiny preview for a Western reader.

The Four Pillars have been calculated (use these exactly, do not recalculate):
- Full chart: ${bazi.fullChinese}
- Year Pillar:  ${bazi.yearPillar}
- Month Pillar: ${bazi.monthPillar}
- Day Pillar:   ${bazi.dayPillar}
- Hour Pillar:  ${bazi.hourPillar}
- Day Master:   ${bazi.dayMasterEn}
- Element Balance: ${bazi.elementBalanceEn}
- Dominant element: ${EL_EN[bazi.dominant]}
- Weakest element: ${EL_EN[bazi.weakest]}
- Gender: ${gender}
- Current year: ${currentYear}

Write a compelling 180-200 word destiny PREVIEW. This is a teaser that makes the reader feel seen and hungry for the full reading.

Structure (follow exactly):
1. [2-3 sentences] Open with something uncannily accurate about their core personality based on the Day Master. Specific enough to make them think "how did it know that?" Avoid vague statements.
2. [2 sentences] Name their greatest natural strength AND the shadow side or blind spot that comes with it — the tension that defines them.
3. [2 sentences] Describe the central life theme running through their chart — the recurring pattern they keep returning to. Make it feel personally true.
4. [2 sentences] Hint at what ${currentYear} holds — name ONE specific area of life that is activated, and whether the energy is building or releasing — no details or advice.
5. [1-2 sentences] End with a hook. Mention something specific the full reading will reveal — "your most favorable period in the next decade", "the hidden pattern working against you", "the year your fortune turns", etc.

Tone: Warm, direct, slightly mysterious. Like a wise friend who genuinely sees you.
DO NOT: use vague horoscope language, reveal the full analysis, give specific advice.
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
          { role: 'user', content: isZh
            ? `请为以下用户写命书预览：${year}年${month}月${day}日，${hour}时辰，${gender === 'Male' ? '男' : '女'}命。`
            : `Write the destiny preview. Birth: ${year}-${month}-${day}, hour index ${hour}, ${gender}.`
          },
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
        dayMaster:   isZh ? bazi.dayMasterZh : bazi.dayMasterEn,
        elementBalance: isZh ? bazi.elementBalanceZh : bazi.elementBalanceEn,
      }
    })

  } catch (err) {
    console.error('Preview API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
