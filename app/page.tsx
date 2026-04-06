'use client'

import { useState, useEffect } from 'react'

function formatTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}
function formatDate(d: Date, lang: 'en' | 'zh') {
  if (lang === 'zh') {
    return d.toLocaleDateString('zh-CN', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })
  }
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

const T = {
  en: {
    eyebrow: 'Chinese Astrology · 八字命理',
    heroTitle1: 'Your Chinese Astrology',
    heroTitle2: 'Birth Chart',
    heroSub: 'Based on the Four Pillars system — the ancient Chinese method that uses your exact birth date and hour to reveal your character, life patterns, and what the next three years hold.',
    cardTitle: 'Enter Your Birth Details',
    cardSub: 'Enter your details below and receive a free preview of your destiny chart instantly — no payment required to begin.',
    genderLabel: 'Gender',
    male: '♂  Male', female: '♀  Female',
    dobLabel: 'Date of Birth',
    yearLabel: 'Year', monthLabel: 'Month', dayLabel: 'Day',
    yearPlaceholder: 'e.g. 1990',
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    hourLabel: 'Birth Hour', hourNote2: '(Chinese two-hour period)',
    hourPlaceholder: 'Select the time window of your birth…',
    hourFootnote: 'Chinese astrology groups the 24-hour day into 12 two-hour periods, each governed by an animal sign.',
    shichen: [
      '23:00 – 01:00 — Rat (子时)', '01:00 – 03:00 — Ox (丑时)',
      '03:00 – 05:00 — Tiger (寅时)', '05:00 – 07:00 — Rabbit (卯时)',
      '07:00 – 09:00 — Dragon (辰时)', '09:00 – 11:00 — Snake (巳时)',
      '11:00 – 13:00 — Horse (午时)', '13:00 – 15:00 — Goat (未时)',
      '15:00 – 17:00 — Monkey (申时)', '17:00 – 19:00 — Rooster (酉时)',
      '19:00 – 21:00 — Dog (戌时)', '21:00 – 23:00 — Pig (亥时)',
    ],
    ctaFree: '✦ Free instant preview', ctaNote: 'No payment needed to see your chart',
    previewBtn: 'Reveal My Chart →', loadingBtn: 'Reading your chart…',
    loadingText: 'Calculating your Four Pillars…',
    pillarsLabel: 'Your Four Pillars',
    pillarSubs: ['Roots & Heritage', 'Career & Social Self', 'Core Self · Day Master', 'Inner World & Later Life'],
    dayMasterLabel: 'Day Master',
    previewLabel: '✦ Your Destiny Preview',
    paywallTitle: 'Your Full Destiny Chart Awaits',
    paywallSub: 'The preview above is just the surface. Your complete reading includes:',
    paywallItems: [
      'Deep character analysis — your strengths, blind spots, and what drives you',
      'Life patterns & recurring themes — why certain things keep happening',
      'This year in detail — what is opening, what is closing, and when',
      'Three-year forecast broken down year by year',
      'How to work with your chart — specific, actionable guidance',
      'The turning point your chart reveals — and how to prepare for it',
    ],
    paywallPrice: '$9.99 · Complete reading',
    paywallNote: 'Delivered instantly · Secure payment via Creem',
    payBtn: 'Unlock My Full Reading · $9.99 →',
    disclaimer: 'Your chart details are already saved. Payment takes you directly to your complete reading.',
    trustItems: ['◈ Traditional Four Pillars methodology', '◈ Interpreted for Western readers', '◈ Free preview · Full reading $9.99'],
    footerCopy: 'The Four Pillars have charted human destiny for over a thousand years.',
    errorMsg: 'Something went wrong. Please try again.',
    localTime: 'Your local time',
    pillarYearLabel: '年', pillarMonthLabel: '月', pillarDayLabel: '日', pillarHourLabel: '时',
  },
  zh: {
    eyebrow: '中国传统命理 · 八字四柱',
    heroTitle1: '探索你的',
    heroTitle2: '八字命盘',
    heroSub: '八字命理，又称四柱推命，是中国传承千年的命理学。以你出生的年、月、日、时为基础，揭示你的性格、人生规律与未来三年的运势走向。',
    cardTitle: '输入你的出生信息',
    cardSub: '填写下方信息，即可免费获得你的八字命盘预览，无需付款即可开始。',
    genderLabel: '性别',
    male: '♂  男', female: '♀  女',
    dobLabel: '出生日期',
    yearLabel: '年', monthLabel: '月', dayLabel: '日',
    yearPlaceholder: '例如 1990',
    months: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    hourLabel: '出生时辰', hourNote2: '（中国传统十二时辰）',
    hourPlaceholder: '请选择你出生的时间段…',
    hourFootnote: '中国传统将一天分为十二个时辰，每个时辰对应两小时，由十二生肖守护。',
    shichen: [
      '23:00 – 01:00 — 子时（鼠）', '01:00 – 03:00 — 丑时（牛）',
      '03:00 – 05:00 — 寅时（虎）', '05:00 – 07:00 — 卯时（兔）',
      '07:00 – 09:00 — 辰时（龙）', '09:00 – 11:00 — 巳时（蛇）',
      '11:00 – 13:00 — 午时（马）', '13:00 – 15:00 — 未时（羊）',
      '15:00 – 17:00 — 申时（猴）', '17:00 – 19:00 — 酉时（鸡）',
      '19:00 – 21:00 — 戌时（狗）', '21:00 – 23:00 — 亥时（猪）',
    ],
    ctaFree: '✦ 免费即时预览', ctaNote: '无需付款即可查看命盘',
    previewBtn: '查看我的命盘 →', loadingBtn: '正在解读命盘…',
    loadingText: '正在排列四柱八字…',
    pillarsLabel: '你的四柱八字',
    pillarSubs: ['年柱 · 祖先根基', '月柱 · 事业社交', '日柱 · 自我 · 日主', '时柱 · 内心晚年'],
    dayMasterLabel: '日主',
    previewLabel: '✦ 命盘预览',
    paywallTitle: '查看完整命书',
    paywallSub: '以上仅为命盘预览，完整命书包含：',
    paywallItems: [
      '深度性格分析 — 你的优势、盲点与内在驱动力',
      '人生规律与主题 — 为何某些模式反复出现',
      '今年详细运势 — 哪些方面正在开启，哪些正在收尾',
      '未来三年运势 — 逐年详细解析',
      '趋吉避凶建议 — 如何顺应命盘，做出更好的选择',
      '命盘中的关键转折点 — 及如何提前准备',
    ],
    paywallPrice: '$9.99 · 完整命书',
    paywallNote: '即时送达 · 通过 Creem 安全付款',
    payBtn: '解锁完整命书 · $9.99 →',
    disclaimer: '你的出生信息已保存，付款后直接查看完整命书。',
    trustItems: ['◈ 传统四柱八字命理', '◈ 融合现代解读方式', '◈ 免费预览 · 完整命书 $9.99'],
    footerCopy: '八字命理，传承千年，照见人生。',
    errorMsg: '出现错误，请重试。',
    localTime: '当前时间',
    pillarYearLabel: '年', pillarMonthLabel: '月', pillarDayLabel: '日', pillarHourLabel: '时',
  },
}

type BaziData = {
  fullChinese: string
  yearPillar: string
  monthPillar: string
  dayPillar: string
  hourPillar: string
  dayMaster: string
  elementBalance: string
}

export default function HomePage() {
  const [lang, setLang] = useState<'en'|'zh'>('en')
  const [clockTime, setClockTime] = useState('')
  const [clockDate, setClockDate] = useState('')
  const [form, setForm] = useState({ year: '', month: '', day: '', hour: '', gender: '' })
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState('')
  const [bazi, setBazi] = useState<BaziData | null>(null)
  const [displayed, setDisplayed] = useState('')
  const [typingDone, setTypingDone] = useState(false)

  useEffect(() => {
    const browserLang = navigator.language || ''
    if (browserLang.startsWith('zh')) setLang('zh')
    else setLang('en')
  }, [])

  const t = T[lang]

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setClockTime(formatTime(d))
      setClockDate(formatDate(d, lang))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [lang])

  useEffect(() => {
    setReady(
      form.year.length === 4 &&
      parseInt(form.year) >= 1930 &&
      parseInt(form.year) <= 2006 &&
      !!form.month && !!form.day &&
      form.hour !== '' && !!form.gender
    )
  }, [form])

  useEffect(() => {
    if (!preview) return
    let i = 0
    setDisplayed('')
    setTypingDone(false)
    const interval = setInterval(() => {
      if (i < preview.length) {
        setDisplayed(preview.slice(0, ++i))
      } else {
        clearInterval(interval)
        setTypingDone(true)
      }
    }, 18)
    return () => clearInterval(interval)
  }, [preview])

  async function handlePreview() {
    if (!ready || loading) return
    setLoading(true)
    setPreview('')
    setBazi(null)
    setTypingDone(false)

    sessionStorage.setItem('bazi_year', form.year)
    sessionStorage.setItem('bazi_month', form.month)
    sessionStorage.setItem('bazi_day', form.day)
    sessionStorage.setItem('bazi_hour', form.hour)
    sessionStorage.setItem('bazi_gender', form.gender)
    sessionStorage.setItem('bazi_lang', lang)

    try {
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lang }),
      })
      const data = await res.json()
      if (data.preview) {
        setPreview(data.preview)
        setBazi(data.bazi)
        setTimeout(() => {
          document.getElementById('previewSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    } catch {
      setPreview(t.errorMsg)
    } finally {
      setLoading(false)
    }
  }

  function handlePay() {
    const successUrl = `${window.location.origin}/success`
    window.location.href = `/api/checkout?successUrl=${encodeURIComponent(successUrl)}`
  }

  const currentYear = new Date().getFullYear()
  const pillarLabels = [t.pillarYearLabel, t.pillarMonthLabel, t.pillarDayLabel, t.pillarHourLabel]

  return (
    <div style={s.body}>
      <div style={s.starsLayer} aria-hidden="true" />

      <div style={s.clockBanner}>
        <span style={s.clockLabel}>{t.localTime}</span>
        <span style={s.clockDisplay}>{clockTime || '--:--:--'}</span>
        <span style={s.clockDate}>{clockDate}</span>
      </div>

      <div style={s.page}>

        <header style={s.hero}>
          <div style={s.eyebrow}>{t.eyebrow}</div>
          <h1 style={s.heroTitle}>
            {t.heroTitle1}<br />
            <em style={s.heroEm}>{t.heroTitle2}</em>
          </h1>
          <p style={s.heroSub}>{t.heroSub}</p>
          <div style={s.divider}>
            <div style={s.dividerLine} />
            <span style={s.dividerGlyph}>命</span>
            <div style={s.dividerLine} />
          </div>
        </header>

        <div style={s.card}>
          <div style={s.cardTopLine} />
          <h2 style={s.cardTitle}>{t.cardTitle}</h2>
          <p style={s.cardSub}>{t.cardSub}</p>

          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>{t.genderLabel}</label>
            <div style={s.genderRow}>
              {(['Male','Female'] as const).map((g,i) => (
                <button
                  key={g}
                  style={{ ...s.genderBtn, ...(form.gender === g ? s.genderBtnActive : {}) }}
                  onClick={() => setForm(f => ({ ...f, gender: g }))}
                >
                  {i === 0 ? t.male : t.female}
                </button>
              ))}
            </div>
          </div>

          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>{t.dobLabel}</label>
            <div style={s.dateRow}>
              <div style={s.dateCol}>
                <span style={s.dateColLabel}>{t.yearLabel}</span>
                <input type="number" style={s.input} placeholder={t.yearPlaceholder}
                  min="1930" max={currentYear} value={form.year}
                  onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
              </div>
              <div style={s.dateCol}>
                <span style={s.dateColLabel}>{t.monthLabel}</span>
                <select style={s.select} value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))}>
                  <option value="">{t.monthLabel}</option>
                  {t.months.map((m,i) => <option key={i} value={String(i+1)}>{m}</option>)}
                </select>
              </div>
              <div style={s.dateCol}>
                <span style={s.dateColLabel}>{t.dayLabel}</span>
                <select style={s.select} value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))}>
                  <option value="">{t.dayLabel}</option>
                  {Array.from({ length: 31 }, (_,i) => i+1).map(d => <option key={d} value={String(d)}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>{t.hourLabel} <span style={s.fieldNote}>{t.hourNote2}</span></label>
            <select style={{ ...s.select, width: '100%' }} value={form.hour} onChange={e => setForm(f => ({ ...f, hour: e.target.value }))}>
              <option value="">{t.hourPlaceholder}</option>
              {t.shichen.map((label,i) => <option key={i} value={String(i)}>{label}</option>)}
            </select>
            <p style={s.hourNote}>{t.hourFootnote}</p>
          </div>

          <div style={s.ctaRow}>
            <div>
              <p style={s.ctaFree}>{t.ctaFree}</p>
              <p style={s.ctaNote}>{t.ctaNote}</p>
            </div>
            <button
              style={{ ...s.previewBtn, ...(!ready || loading ? s.previewBtnDisabled : {}) }}
              onClick={handlePreview} disabled={!ready || loading}
            >
              {loading ? t.loadingBtn : t.previewBtn}
            </button>
          </div>
        </div>

        {loading && (
          <div style={s.loadingBox}>
            <div style={s.loadingGlyphs}>
              {['年','月','日','时'].map((g,i) => (
                <span key={i} style={{ ...s.loadingGlyph, animationDelay: `${i*0.3}s` }}>{g}</span>
              ))}
            </div>
            <p style={s.loadingText}>{t.loadingText}</p>
          </div>
        )}

        {preview && (
          <div id="previewSection" style={s.previewSection}>
            <div style={s.previewTopLine} />

            {bazi && (
              <div style={s.pillarsBox}>
                <p style={s.pillarsLabel}>{t.pillarsLabel} · {bazi.fullChinese}</p>
                <div style={s.pillarsGrid}>
                  {[bazi.yearPillar, bazi.monthPillar, bazi.dayPillar, bazi.hourPillar].map((p,i) => (
                    <div key={i} style={s.pillarItem}>
                      <p style={s.pillarLabel}>{pillarLabels[i]}</p>
                      <p style={s.pillarValue}>{p.split(' ')[0]}</p>
                      <p style={s.pillarSub}>{t.pillarSubs[i]}</p>
                    </div>
                  ))}
                </div>
                <p style={s.pillarsDayMaster}>{t.dayMasterLabel}: {bazi.dayMaster}</p>
              </div>
            )}

            <div style={s.previewCard}>
              <p style={s.previewCardLabel}>{t.previewLabel}</p>
              <div style={s.previewText}>
                {displayed}
                {!typingDone && <span style={s.cursor} />}
              </div>
            </div>

            {typingDone && (
              <div style={s.paywallBox}>
                <div style={s.paywallGlow} />
                <p style={s.paywallTitle}>{t.paywallTitle}</p>
                <p style={s.paywallSub}>{t.paywallSub}</p>
                <div style={s.paywallList}>
                  {t.paywallItems.map((item,i) => (
                    <div key={i} style={s.paywallItem}>
                      <span style={s.paywallCheck}>◈</span>
                      <span style={s.paywallItemText}>{item}</span>
                    </div>
                  ))}
                </div>
                <div style={s.paywallCta}>
                  <div>
                    <p style={s.paywallPrice}>{t.paywallPrice}</p>
                    <p style={s.paywallNote}>{t.paywallNote}</p>
                  </div>
                  <button style={s.payBtn} onClick={handlePay}>{t.payBtn}</button>
                </div>
                <p style={s.paywallDisclaimer}>{t.disclaimer}</p>
              </div>
            )}
          </div>
        )}

        {!preview && (
          <div style={s.trustRow}>
            {t.trustItems.map((item,i) => <span key={i} style={s.trustItem}>{item}</span>)}
          </div>
        )}

        <footer style={s.footer}>
          <div style={s.footerGlyphs}>年 月 日 时</div>
          <p style={s.footerCopy}>{t.footerCopy}</p>
          <div style={s.footerLinks}>
            <a href="mailto:iamxiaofeng.xu@gmail.com" style={s.footerLink}>iamxiaofeng.xu@gmail.com</a>
            <span style={s.footerDot}>·</span>
            <a href="/privacy" style={s.footerLink}>Privacy Policy</a>
            <span style={s.footerDot}>·</span>
            <a href="/terms" style={s.footerLink}>Terms of Service</a>
          </div>
        </footer>

      </div>

      <style>{`
        @keyframes glyph-pulse { 0%,100%{opacity:0.2;transform:scale(0.85)} 50%{opacity:0.8;transform:scale(1.1)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  body: { background: '#0d0f14', minHeight: '100vh', color: '#e8e0cc', fontFamily: "'Cormorant Garamond', Georgia, serif", position: 'relative', overflow: 'hidden' },
  starsLayer: {
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
    backgroundImage: [
      'radial-gradient(1px 1px at 8% 12%, rgba(212,201,176,0.7) 0%, transparent 100%)',
      'radial-gradient(1px 1px at 22% 38%, rgba(212,201,176,0.5) 0%, transparent 100%)',
      'radial-gradient(1.5px 1.5px at 38% 7%, rgba(212,201,176,0.6) 0%, transparent 100%)',
      'radial-gradient(1px 1px at 52% 28%, rgba(212,201,176,0.4) 0%, transparent 100%)',
      'radial-gradient(1px 1px at 67% 52%, rgba(212,201,176,0.5) 0%, transparent 100%)',
      'radial-gradient(1.5px 1.5px at 79% 18%, rgba(212,201,176,0.6) 0%, transparent 100%)',
      'radial-gradient(1px 1px at 91% 68%, rgba(212,201,176,0.4) 0%, transparent 100%)',
      'radial-gradient(1px 1px at 14% 72%, rgba(212,201,176,0.5) 0%, transparent 100%)',
      'radial-gradient(ellipse 900px 450px at 50% 0%, rgba(139,90,60,0.07) 0%, transparent 70%)',
      'radial-gradient(ellipse 600px 300px at 85% 100%, rgba(90,60,139,0.05) 0%, transparent 70%)',
    ].join(','),
  },
  clockBanner: { background: 'rgba(13,15,20,0.96)', borderBottom: '1px solid rgba(212,201,176,0.08)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 50 },
  clockLabel: { fontSize: 9, letterSpacing: '0.4em', color: 'rgba(212,201,176,0.35)', textTransform: 'uppercase' },
  clockDisplay: { fontSize: 18, fontWeight: 300, letterSpacing: '0.1em', color: '#e8e0cc' },
  clockDate: { fontSize: 10, color: 'rgba(212,201,176,0.35)', letterSpacing: '0.15em', fontStyle: 'italic' },
  page: { position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', padding: '64px 24px 100px' },
  hero: { textAlign: 'center', marginBottom: 48 },
  eyebrow: { display: 'inline-block', border: '1px solid rgba(192,142,70,0.35)', color: 'rgba(192,142,70,0.75)', fontSize: 10, letterSpacing: '0.4em', padding: '5px 18px', marginBottom: 24, textTransform: 'uppercase' },
  heroTitle: { fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 7vw, 62px)', fontWeight: 300, lineHeight: 1.05, color: '#e8e0cc', letterSpacing: '0.02em', marginBottom: 20 },
  heroEm: { color: '#c08e46', fontStyle: 'italic' },
  heroSub: { fontSize: 16, fontWeight: 300, lineHeight: 1.85, color: 'rgba(232,224,204,0.55)', maxWidth: 540, margin: '0 auto 28px' },
  divider: { display: 'flex', alignItems: 'center', gap: 18, maxWidth: 180, margin: '0 auto' },
  dividerLine: { flex: 1, height: 1, background: 'rgba(192,142,70,0.18)' },
  dividerGlyph: { fontFamily: 'serif', fontSize: 22, color: 'rgba(192,142,70,0.35)', lineHeight: 1 },
  card: { background: 'rgba(18,20,26,0.92)', border: '1px solid rgba(212,201,176,0.12)', padding: '44px 48px', position: 'relative', marginBottom: 20 },
  cardTopLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(192,142,70,0.5), transparent)' },
  cardTitle: { fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 300, color: '#e8e0cc', letterSpacing: '0.08em', marginBottom: 8 },
  cardSub: { fontSize: 13, color: 'rgba(232,224,204,0.4)', fontStyle: 'italic', lineHeight: 1.65, marginBottom: 36 },
  fieldGroup: { marginBottom: 28 },
  fieldLabel: { display: 'block', fontSize: 9, letterSpacing: '0.45em', color: 'rgba(192,142,70,0.7)', textTransform: 'uppercase', marginBottom: 10 },
  fieldNote: { fontSize: 10, color: 'rgba(232,224,204,0.3)', letterSpacing: '0.1em', textTransform: 'none', fontStyle: 'italic' },
  genderRow: { display: 'flex', gap: 12 },
  genderBtn: { flex: 1, padding: '13px 0', background: 'transparent', border: '1px solid rgba(212,201,176,0.15)', color: 'rgba(232,224,204,0.45)', fontFamily: 'Georgia, serif', fontSize: 15, letterSpacing: '0.2em', cursor: 'pointer' },
  genderBtnActive: { border: '1px solid rgba(192,142,70,0.7)', color: '#c08e46', background: 'rgba(192,142,70,0.07)' },
  dateRow: { display: 'flex', gap: 12 },
  dateCol: { flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },
  dateColLabel: { fontSize: 9, letterSpacing: '0.3em', color: 'rgba(232,224,204,0.3)', textTransform: 'uppercase' },
  input: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,201,176,0.15)', color: '#e8e0cc', fontFamily: 'Georgia, serif', fontSize: 15, padding: '11px 12px', outline: 'none' },
  select: { background: 'rgba(18,20,26,0.95)', border: '1px solid rgba(212,201,176,0.15)', color: '#e8e0cc', fontFamily: 'Georgia, serif', fontSize: 14, padding: '11px 12px', outline: 'none', cursor: 'pointer' },
  hourNote: { fontSize: 11, color: 'rgba(232,224,204,0.3)', fontStyle: 'italic', marginTop: 8, lineHeight: 1.6 },
  ctaRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' as const, paddingTop: 28, borderTop: '1px solid rgba(212,201,176,0.08)', marginTop: 4 },
  ctaFree: { fontSize: 14, color: '#c08e46', letterSpacing: '0.1em', marginBottom: 4 },
  ctaNote: { fontSize: 11, color: 'rgba(232,224,204,0.3)' },
  previewBtn: { background: 'linear-gradient(135deg, #c08e46, #9a6e2e)', color: '#0d0f14', border: 'none', fontFamily: 'Georgia, serif', fontSize: 13, fontWeight: 600, letterSpacing: '0.25em', padding: '14px 28px', cursor: 'pointer', whiteSpace: 'nowrap' as const },
  previewBtnDisabled: { background: 'rgba(192,142,70,0.15)', color: 'rgba(13,15,20,0.3)', cursor: 'not-allowed' },
  loadingBox: { textAlign: 'center', padding: '44px 0' },
  loadingGlyphs: { display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 20 },
  loadingGlyph: { fontFamily: 'serif', fontSize: 30, color: 'rgba(192,142,70,0.5)', animation: 'glyph-pulse 1.8s ease-in-out infinite' },
  loadingText: { fontSize: 12, color: 'rgba(232,224,204,0.25)', letterSpacing: '0.35em', textTransform: 'uppercase', fontStyle: 'italic' },
  previewSection: { background: 'rgba(18,20,26,0.92)', border: '1px solid rgba(212,201,176,0.12)', padding: '44px 48px', position: 'relative', marginBottom: 20 },
  previewTopLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(192,142,70,0.5), transparent)' },
  pillarsBox: { marginBottom: 32, paddingBottom: 28, borderBottom: '1px solid rgba(212,201,176,0.08)' },
  pillarsLabel: { fontSize: 10, letterSpacing: '0.35em', color: 'rgba(192,142,70,0.5)', textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' as const },
  pillarsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 },
  pillarItem: { textAlign: 'center' as const, padding: '12px 8px', border: '1px solid rgba(212,201,176,0.08)', background: 'rgba(255,255,255,0.02)' },
  pillarLabel: { fontSize: 16, color: 'rgba(192,142,70,0.6)', marginBottom: 6 },
  pillarValue: { fontSize: 22, color: '#e8e0cc', marginBottom: 4, fontFamily: 'serif' },
  pillarSub: { fontSize: 10, color: 'rgba(232,224,204,0.3)', fontStyle: 'italic', lineHeight: 1.4 },
  pillarsDayMaster: { fontSize: 11, color: 'rgba(192,142,70,0.5)', textAlign: 'center' as const, letterSpacing: '0.2em', fontStyle: 'italic' },
  previewCard: { marginBottom: 32 },
  previewCardLabel: { fontSize: 10, letterSpacing: '0.4em', color: 'rgba(192,142,70,0.7)', textTransform: 'uppercase', marginBottom: 16 },
  previewText: { fontSize: 17, fontWeight: 300, lineHeight: 1.95, color: 'rgba(232,224,204,0.85)', minHeight: 60 },
  cursor: { display: 'inline-block', width: '1.5px', height: '0.9em', background: '#c08e46', marginLeft: 1, verticalAlign: 'text-bottom', animation: 'blink 0.7s step-end infinite' },
  paywallBox: { border: '1px solid rgba(192,142,70,0.25)', padding: '36px 40px', position: 'relative', background: 'rgba(192,142,70,0.03)' },
  paywallGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(192,142,70,0.6), transparent)' },
  paywallTitle: { fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 300, color: '#e8e0cc', letterSpacing: '0.06em', marginBottom: 10, textAlign: 'center' as const },
  paywallSub: { fontSize: 14, color: 'rgba(232,224,204,0.45)', fontStyle: 'italic', textAlign: 'center' as const, marginBottom: 24, lineHeight: 1.6 },
  paywallList: { marginBottom: 28 },
  paywallItem: { display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 },
  paywallCheck: { color: '#c08e46', flexShrink: 0, fontSize: 14, marginTop: 2 },
  paywallItemText: { fontSize: 14, color: 'rgba(232,224,204,0.65)', lineHeight: 1.6 },
  paywallCta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' as const, paddingTop: 24, borderTop: '1px solid rgba(192,142,70,0.15)' },
  paywallPrice: { fontSize: 15, color: 'rgba(232,224,204,0.6)', letterSpacing: '0.15em', fontStyle: 'italic', marginBottom: 4 },
  paywallNote: { fontSize: 11, color: 'rgba(232,224,204,0.3)' },
  payBtn: { background: 'linear-gradient(135deg, #c08e46, #9a6e2e)', color: '#0d0f14', border: 'none', fontFamily: 'Georgia, serif', fontSize: 13, fontWeight: 600, letterSpacing: '0.25em', padding: '15px 30px', cursor: 'pointer', whiteSpace: 'nowrap' as const },
  paywallDisclaimer: { fontSize: 11, color: 'rgba(232,224,204,0.25)', textAlign: 'center' as const, marginTop: 16, fontStyle: 'italic' },
  trustRow: { display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' as const, marginBottom: 64 },
  trustItem: { fontSize: 11, color: 'rgba(232,224,204,0.25)', letterSpacing: '0.1em' },
  footer: { textAlign: 'center', marginTop: 60 },
  footerGlyphs: { fontSize: 16, letterSpacing: 20, color: 'rgba(192,142,70,0.15)', marginBottom: 14 },
  footerCopy: { fontSize: 11, letterSpacing: '0.2em', color: 'rgba(232,224,204,0.2)', fontStyle: 'italic', marginBottom: 12 },
  footerLinks: { display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' as const },
  footerLink: { fontSize: 11, color: 'rgba(232,224,204,0.25)', textDecoration: 'none', letterSpacing: '0.1em' },
  footerDot: { color: 'rgba(232,224,204,0.1)' },
}
