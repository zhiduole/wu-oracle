'use client'

import { useState, useEffect } from 'react'

function formatTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}
function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

const SHICHEN_LABELS = [
  '23:00 – 01:00 — Rat (子时)',
  '01:00 – 03:00 — Ox (丑时)',
  '03:00 – 05:00 — Tiger (寅时)',
  '05:00 – 07:00 — Rabbit (卯时)',
  '07:00 – 09:00 — Dragon (辰时)',
  '09:00 – 11:00 — Snake (巳时)',
  '11:00 – 13:00 — Horse (午时)',
  '13:00 – 15:00 — Goat (未时)',
  '15:00 – 17:00 — Monkey (申时)',
  '17:00 – 19:00 — Rooster (酉时)',
  '19:00 – 21:00 — Dog (戌时)',
  '21:00 – 23:00 — Pig (亥时)',
]

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
    const tick = () => {
      const d = new Date()
      setClockTime(formatTime(d))
      setClockDate(formatDate(d))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    setReady(
      form.year.length === 4 &&
      parseInt(form.year) >= 1930 &&
      parseInt(form.year) <= 2006 &&
      !!form.month && !!form.day &&
      form.hour !== '' && !!form.gender
    )
  }, [form])

  // Typing animation for preview
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

    // Save to sessionStorage for after payment
    sessionStorage.setItem('bazi_year', form.year)
    sessionStorage.setItem('bazi_month', form.month)
    sessionStorage.setItem('bazi_day', form.day)
    sessionStorage.setItem('bazi_hour', form.hour)
    sessionStorage.setItem('bazi_gender', form.gender)

    try {
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
      setPreview('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handlePay() {
    const successUrl = `${window.location.origin}/success`
    window.location.href = `/api/checkout?successUrl=${encodeURIComponent(successUrl)}`
  }

  const currentYear = new Date().getFullYear()

  return (
    <div style={s.body}>
      <div style={s.starsLayer} aria-hidden="true" />

      {/* Clock banner */}
      <div style={s.clockBanner}>
        <span style={s.clockLabel}>Your local time</span>
        <span style={s.clockDisplay}>{clockTime || '--:--:--'}</span>
        <span style={s.clockDate}>{clockDate}</span>
      </div>

      <div style={s.page}>

        {/* Hero */}
        <header style={s.hero}>
          <div style={s.eyebrow}>Chinese Astrology · 八字命理</div>
          <h1 style={s.heroTitle}>
            Your Chinese Astrology<br />
            <em style={s.heroEm}>Birth Chart</em>
          </h1>
          <p style={s.heroSub}>
            Based on the Four Pillars system — the ancient Chinese method that uses your exact birth date and hour to reveal your character, life patterns, and what the next three years hold.
          </p>
          <div style={s.divider}>
            <div style={s.dividerLine} />
            <span style={s.dividerGlyph}>命</span>
            <div style={s.dividerLine} />
          </div>
        </header>

        {/* Form card */}
        <div style={s.card}>
          <div style={s.cardTopLine} />
          <h2 style={s.cardTitle}>Enter Your Birth Details</h2>
          <p style={s.cardSub}>
            Enter your details below and receive a free preview of your destiny chart instantly —
            no payment required to begin.
          </p>

          {/* Gender */}
          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Gender</label>
            <div style={s.genderRow}>
              {['Male', 'Female'].map(g => (
                <button
                  key={g}
                  style={{ ...s.genderBtn, ...(form.gender === g ? s.genderBtnActive : {}) }}
                  onClick={() => setForm(f => ({ ...f, gender: g }))}
                >
                  {g === 'Male' ? '♂  Male' : '♀  Female'}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Date of Birth</label>
            <div style={s.dateRow}>
              <div style={s.dateCol}>
                <span style={s.dateColLabel}>Year</span>
                <input
                  type="number" style={s.input}
                  placeholder="e.g. 1990"
                  min="1930" max={currentYear}
                  value={form.year}
                  onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                />
              </div>
              <div style={s.dateCol}>
                <span style={s.dateColLabel}>Month</span>
                <select style={s.select} value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))}>
                  <option value="">Month</option>
                  {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m,i) => (
                    <option key={i} value={String(i+1)}>{m}</option>
                  ))}
                </select>
              </div>
              <div style={s.dateCol}>
                <span style={s.dateColLabel}>Day</span>
                <select style={s.select} value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))}>
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_,i) => i+1).map(d => (
                    <option key={d} value={String(d)}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Hour */}
          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>
              Birth Hour <span style={s.fieldNote}>(Chinese two-hour period)</span>
            </label>
            <select style={{ ...s.select, width: '100%' }} value={form.hour} onChange={e => setForm(f => ({ ...f, hour: e.target.value }))}>
              <option value="">Select the time window of your birth…</option>
              {SHICHEN_LABELS.map((label, i) => (
                <option key={i} value={String(i)}>{label}</option>
              ))}
            </select>
            <p style={s.hourNote}>Chinese astrology groups the 24-hour day into 12 two-hour periods, each governed by an animal sign.</p>
          </div>

          {/* Free preview button */}
          <div style={s.ctaRow}>
            <div>
              <p style={s.ctaFree}>✦ Free instant preview</p>
              <p style={s.ctaNote}>No payment needed to see your chart</p>
            </div>
            <button
              style={{ ...s.previewBtn, ...(!ready || loading ? s.previewBtnDisabled : {}) }}
              onClick={handlePreview}
              disabled={!ready || loading}
            >
              {loading ? 'Reading your chart…' : 'Reveal My Chart →'}
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={s.loadingBox}>
            <div style={s.loadingGlyphs}>
              {['年','月','日','时'].map((g,i) => (
                <span key={i} style={{ ...s.loadingGlyph, animationDelay: `${i*0.3}s` }}>{g}</span>
              ))}
            </div>
            <p style={s.loadingText}>Calculating your Four Pillars…</p>
          </div>
        )}

        {/* Preview section */}
        {preview && (
          <div id="previewSection" style={s.previewSection}>
            <div style={s.previewTopLine} />

            {/* Four Pillars display */}
            {bazi && (
              <div style={s.pillarsBox}>
                <p style={s.pillarsLabel}>Your Four Pillars · {bazi.fullChinese}</p>
                <div style={s.pillarsGrid}>
                  {[
                    { label: 'Year', value: bazi.yearPillar, sub: 'Roots & Heritage' },
                    { label: 'Month', value: bazi.monthPillar, sub: 'Career & Social Self' },
                    { label: 'Day', value: bazi.dayPillar, sub: 'Core Self · Day Master' },
                    { label: 'Hour', value: bazi.hourPillar, sub: 'Inner World & Later Life' },
                  ].map((p,i) => (
                    <div key={i} style={s.pillarItem}>
                      <p style={s.pillarLabel}>{p.label}</p>
                      <p style={s.pillarValue}>{p.value.split(' ')[0]}</p>
                      <p style={s.pillarSub}>{p.sub}</p>
                    </div>
                  ))}
                </div>
                <p style={s.pillarsDayMaster}>Day Master: {bazi.dayMaster}</p>
              </div>
            )}

            {/* Preview text */}
            <div style={s.previewCard}>
              <p style={s.previewCardLabel}>✦ Your Destiny Preview</p>
              <div style={s.previewText}>
                {displayed}
                {!typingDone && <span style={s.cursor} />}
              </div>
            </div>

            {/* Paywall / upsell */}
            {typingDone && (
              <div style={s.paywallBox}>
                <div style={s.paywallGlow} />
                <p style={s.paywallTitle}>Your Full Destiny Chart Awaits</p>
                <p style={s.paywallSub}>
                  The preview above is just the surface. Your complete reading includes:
                </p>
                <div style={s.paywallList}>
                  {[
                    'Deep character analysis — your strengths, blind spots, and what drives you',
                    'Life patterns & recurring themes — why certain things keep happening',
                    `${currentYear} in detail — what is opening, what is closing, and when`,
                    `Three-year forecast — ${currentYear}, ${currentYear+1}, ${currentYear+2} broken down`,
                    'How to work with your chart — specific, actionable guidance',
                    'The turning point your chart reveals — and how to prepare for it',
                  ].map((item,i) => (
                    <div key={i} style={s.paywallItem}>
                      <span style={s.paywallCheck}>◈</span>
                      <span style={s.paywallItemText}>{item}</span>
                    </div>
                  ))}
                </div>

                <div style={s.paywallCta}>
                  <div>
                    <p style={s.paywallPrice}>$9.99 · Complete reading</p>
                    <p style={s.paywallNote}>Delivered instantly · Secure payment via Creem</p>
                  </div>
                  <button style={s.payBtn} onClick={handlePay}>
                    Unlock My Full Reading · $9.99 →
                  </button>
                </div>

                <p style={s.paywallDisclaimer}>
                  Your chart details are already saved. Payment takes you directly to your complete reading.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Trust row */}
        {!preview && (
          <div style={s.trustRow}>
            <span style={s.trustItem}>◈ Traditional Four Pillars methodology</span>
            <span style={s.trustItem}>◈ Interpreted for Western readers</span>
            <span style={s.trustItem}>◈ Free preview · Full reading $9.99</span>
          </div>
        )}

        {/* Footer */}
        <footer style={s.footer}>
          <div style={s.footerGlyphs}>年 月 日 时</div>
          <p style={s.footerCopy}>The Four Pillars have charted human destiny for over a thousand years.</p>
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
        @keyframes glyph-pulse {
          0%,100%{ opacity:0.2; transform:scale(0.85); }
          50%{ opacity:0.8; transform:scale(1.1); }
        }
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
      'radial-gradient(1px 1px at 44% 82%, rgba(212,201,176,0.3) 0%, transparent 100%)',
      'radial-gradient(1.5px 1.5px at 62% 91%, rgba(212,201,176,0.4) 0%, transparent 100%)',
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

  // Preview section
  previewSection: { background: 'rgba(18,20,26,0.92)', border: '1px solid rgba(212,201,176,0.12)', padding: '44px 48px', position: 'relative', marginBottom: 20 },
  previewTopLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(192,142,70,0.5), transparent)' },

  // Pillars display
  pillarsBox: { marginBottom: 32, paddingBottom: 28, borderBottom: '1px solid rgba(212,201,176,0.08)' },
  pillarsLabel: { fontSize: 10, letterSpacing: '0.35em', color: 'rgba(192,142,70,0.5)', textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' as const },
  pillarsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 },
  pillarItem: { textAlign: 'center' as const, padding: '12px 8px', border: '1px solid rgba(212,201,176,0.08)', background: 'rgba(255,255,255,0.02)' },
  pillarLabel: { fontSize: 9, letterSpacing: '0.3em', color: 'rgba(192,142,70,0.5)', textTransform: 'uppercase', marginBottom: 6 },
  pillarValue: { fontSize: 20, color: '#e8e0cc', marginBottom: 4, fontFamily: 'serif' },
  pillarSub: { fontSize: 10, color: 'rgba(232,224,204,0.3)', fontStyle: 'italic', lineHeight: 1.4 },
  pillarsDayMaster: { fontSize: 11, color: 'rgba(192,142,70,0.5)', textAlign: 'center' as const, letterSpacing: '0.2em', fontStyle: 'italic' },

  // Preview card
  previewCard: { marginBottom: 32 },
  previewCardLabel: { fontSize: 10, letterSpacing: '0.4em', color: 'rgba(192,142,70,0.7)', textTransform: 'uppercase', marginBottom: 16 },
  previewText: { fontSize: 17, fontWeight: 300, lineHeight: 1.95, color: 'rgba(232,224,204,0.85)', minHeight: 60 },
  cursor: { display: 'inline-block', width: '1.5px', height: '0.9em', background: '#c08e46', marginLeft: 1, verticalAlign: 'text-bottom', animation: 'blink 0.7s step-end infinite' },

  // Paywall
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
