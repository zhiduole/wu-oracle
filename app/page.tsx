'use client'

import { useState, useEffect } from 'react'

function formatTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}
function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

export default function HomePage() {
  const [clockTime, setClockTime] = useState('')
  const [clockDate, setClockDate] = useState('')
  const [form, setForm] = useState({ year: '', month: '', day: '', hour: '', gender: '' })
  const [ready, setReady] = useState(false)

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
    setReady(form.year.length === 4 && !!form.month && !!form.day && form.hour !== '' && !!form.gender)
  }, [form])

  function handleCast() {
    if (!ready) return
    sessionStorage.setItem('bazi_year', form.year)
    sessionStorage.setItem('bazi_month', form.month)
    sessionStorage.setItem('bazi_day', form.day)
    sessionStorage.setItem('bazi_hour', form.hour)
    sessionStorage.setItem('bazi_gender', form.gender)
    const successUrl = `${window.location.origin}/success`
    window.location.href = `/api/checkout?successUrl=${encodeURIComponent(successUrl)}`
  }

  const currentYear = new Date().getFullYear()

  return (
    <div style={s.body}>
      <div style={s.starsLayer} aria-hidden="true" />

      <div style={s.clockBanner}>
        <span style={s.clockLabel}>Your local time</span>
        <span style={s.clockDisplay}>{clockTime || '--:--:--'}</span>
        <span style={s.clockDate}>{clockDate}</span>
      </div>

      <div style={s.page}>

        <header style={s.hero}>
          <div style={s.eyebrow}>Chinese Astrology · 八字命理</div>
          <h1 style={s.heroTitle}>
            Know Your<br />
            <em style={s.heroEm}>Four Pillars</em>
          </h1>
          <p style={s.heroSub}>
            Your birth date encodes four pillars — year, month, day, and hour —
            each a window into your character, destiny, and the currents of time moving through your life.
          </p>
          <div style={s.divider}>
            <div style={s.dividerLine} />
            <span style={s.dividerGlyph}>命</span>
            <div style={s.dividerLine} />
          </div>
        </header>

        <div style={s.includesBox}>
          <div style={s.includesTopLine} />
          <p style={s.includesLabel}>What your reading includes</p>
          <div style={s.includesGrid}>
            {[
              { icon: '◈', title: 'Your Four Pillars', desc: 'Year, Month, Day & Hour — your cosmic coordinates at birth' },
              { icon: '◉', title: 'Character & Strengths', desc: 'What your chart says about who you naturally are' },
              { icon: '◎', title: 'Current Year Energy', desc: `How ${currentYear} interacts with your personal chart` },
              { icon: '◇', title: 'Three-Year Forecast', desc: 'The dominant patterns shaping the next three years' },
            ].map((item, i) => (
              <div key={i} style={s.includesItem}>
                <span style={s.includesIcon}>{item.icon}</span>
                <div>
                  <p style={s.includesTitle}>{item.title}</p>
                  <p style={s.includesDesc}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={s.card}>
          <div style={s.cardTopLine} />
          <h2 style={s.cardTitle}>Enter Your Birth Details</h2>
          <p style={s.cardSub}>Exact birth time significantly improves accuracy. If unknown, choose the closest window.</p>

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

          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Date of Birth</label>
            <div style={s.dateRow}>
              <div style={s.dateCol}>
                <span style={s.dateColLabel}>Year</span>
                <input
                  type="number" style={s.input}
                  placeholder="e.g. 1990"
                  min="1900" max={currentYear}
                  value={form.year}
                  onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                />
              </div>
              <div style={s.dateCol}>
                <span style={s.dateColLabel}>Month</span>
                <select style={s.select} value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))}>
                  <option value="">Month</option>
                  {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                    <option key={i} value={String(i + 1)}>{m}</option>
                  ))}
                </select>
              </div>
              <div style={s.dateCol}>
                <span style={s.dateColLabel}>Day</span>
                <select style={s.select} value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))}>
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={String(d)}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>
              Birth Hour <span style={s.fieldNote}>(Chinese two-hour period)</span>
            </label>
            <select style={{ ...s.select, width: '100%' }} value={form.hour} onChange={e => setForm(f => ({ ...f, hour: e.target.value }))}>
              <option value="">Select the time window of your birth…</option>
              {[
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
              ].map((label, i) => (
                <option key={i} value={String(i)}>{label}</option>
              ))}
            </select>
            <p style={s.hourNote}>Chinese astrology groups the 24-hour day into 12 two-hour periods, each governed by an animal sign.</p>
          </div>

          <div style={s.ctaRow}>
            <div>
              <p style={s.ctaPrice}>$9.99 · one reading</p>
              <p style={s.ctaNote}>Secure payment via Creem · Visa, Mastercard, Apple Pay, Google Pay</p>
            </div>
            <button
              style={{ ...s.castBtn, ...(ready ? {} : s.castBtnDisabled) }}
              onClick={handleCast}
              disabled={!ready}
            >
              Reveal My Destiny · $9.99 →
            </button>
          </div>
        </div>

        <div style={s.trustRow}>
          <span style={s.trustItem}>◈ Traditional Four Pillars methodology</span>
          <span style={s.trustItem}>◈ Interpreted for Western readers</span>
          <span style={s.trustItem}>◈ Instant delivery</span>
        </div>

        <footer style={s.footer}>
          <div style={s.footerGlyphs}>年 月 日 时</div>
          <p style={s.footerCopy}>The Four Pillars have charted human destiny for over a thousand years.</p>
          <div style={s.footerLinks}>
            <a href="mailto:xuxiaofeng0@gmail.com" style={s.footerLink}>xuxiaofeng0@gmail.com</a>
            <span style={s.footerDot}>·</span>
            <a href="/privacy" style={s.footerLink}>Privacy Policy</a>
            <span style={s.footerDot}>·</span>
            <a href="/terms" style={s.footerLink}>Terms of Service</a>
          </div>
        </footer>

      </div>
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
  hero: { textAlign: 'center', marginBottom: 52 },
  eyebrow: { display: 'inline-block', border: '1px solid rgba(192,142,70,0.35)', color: 'rgba(192,142,70,0.75)', fontSize: 10, letterSpacing: '0.4em', padding: '5px 18px', marginBottom: 24, textTransform: 'uppercase' },
  heroTitle: { fontFamily: 'Georgia, serif', fontSize: 'clamp(42px, 9vw, 80px)', fontWeight: 300, lineHeight: 1.05, color: '#e8e0cc', letterSpacing: '0.02em', marginBottom: 20 },
  heroEm: { color: '#c08e46', fontStyle: 'italic' },
  heroSub: { fontSize: 16, fontWeight: 300, lineHeight: 1.85, color: 'rgba(232,224,204,0.55)', maxWidth: 520, margin: '0 auto 28px' },
  divider: { display: 'flex', alignItems: 'center', gap: 18, maxWidth: 180, margin: '0 auto' },
  dividerLine: { flex: 1, height: 1, background: 'rgba(192,142,70,0.18)' },
  dividerGlyph: { fontFamily: 'serif', fontSize: 22, color: 'rgba(192,142,70,0.35)', lineHeight: 1 },
  includesBox: { border: '1px solid rgba(212,201,176,0.1)', background: 'rgba(255,255,255,0.018)', padding: '28px 32px', marginBottom: 28, position: 'relative' },
  includesTopLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(192,142,70,0.5), transparent)' },
  includesLabel: { fontSize: 9, letterSpacing: '0.45em', color: 'rgba(192,142,70,0.7)', textTransform: 'uppercase', marginBottom: 20 },
  includesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  includesItem: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  includesIcon: { fontSize: 16, color: 'rgba(192,142,70,0.6)', flexShrink: 0, marginTop: 2 },
  includesTitle: { fontSize: 14, color: '#e8e0cc', marginBottom: 3 },
  includesDesc: { fontSize: 12, color: 'rgba(232,224,204,0.45)', lineHeight: 1.55, fontStyle: 'italic' },
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
  ctaPrice: { fontSize: 14, color: 'rgba(232,224,204,0.55)', letterSpacing: '0.15em', fontStyle: 'italic' },
  ctaNote: { fontSize: 11, color: 'rgba(232,224,204,0.25)', marginTop: 4 },
  castBtn: { background: 'linear-gradient(135deg, #c08e46, #9a6e2e)', color: '#0d0f14', border: 'none', fontFamily: 'Georgia, serif', fontSize: 13, fontWeight: 600, letterSpacing: '0.25em', padding: '14px 28px', cursor: 'pointer', whiteSpace: 'nowrap' as const },
  castBtnDisabled: { background: 'rgba(192,142,70,0.15)', color: 'rgba(13,15,20,0.3)', cursor: 'not-allowed' },
  trustRow: { display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' as const, marginBottom: 64 },
  trustItem: { fontSize: 11, color: 'rgba(232,224,204,0.25)', letterSpacing: '0.1em' },
  footer: { textAlign: 'center' },
  footerGlyphs: { fontSize: 16, letterSpacing: 20, color: 'rgba(192,142,70,0.15)', marginBottom: 14 },
  footerCopy: { fontSize: 11, letterSpacing: '0.2em', color: 'rgba(232,224,204,0.2)', fontStyle: 'italic', marginBottom: 12 },
  footerLinks: { display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' as const },
  footerLink: { fontSize: 11, color: 'rgba(232,224,204,0.25)', textDecoration: 'none', letterSpacing: '0.1em' },
  footerDot: { color: 'rgba(232,224,204,0.1)' },
}
