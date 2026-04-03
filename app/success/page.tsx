'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const MONTHS = ['','January','February','March','April','May','June','July','August','September','October','November','December']
const SHICHEN = [
  'Rat Hour (23:00–01:00)', 'Ox Hour (01:00–03:00)',
  'Tiger Hour (03:00–05:00)', 'Rabbit Hour (05:00–07:00)',
  'Dragon Hour (07:00–09:00)', 'Snake Hour (09:00–11:00)',
  'Horse Hour (11:00–13:00)', 'Goat Hour (13:00–15:00)',
  'Monkey Hour (15:00–17:00)', 'Rooster Hour (17:00–19:00)',
  'Dog Hour (19:00–21:00)', 'Pig Hour (21:00–23:00)',
]

function SuccessContent() {
  const params = useSearchParams()
  const [reading, setReading] = useState('')
  const [displayed, setDisplayed] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [birthInfo, setBirthInfo] = useState('')

  useEffect(() => {
    const checkoutId = params.get('checkout_id') || ''
    const orderId = params.get('order_id') || ''
    const signature = params.get('signature') || ''

    const year = sessionStorage.getItem('bazi_year') || ''
    const month = sessionStorage.getItem('bazi_month') || ''
    const day = sessionStorage.getItem('bazi_day') || ''
    const hour = sessionStorage.getItem('bazi_hour') || ''
    const gender = sessionStorage.getItem('bazi_gender') || ''

    if (year && month && day) {
      setBirthInfo(`${MONTHS[parseInt(month)]} ${day}, ${year} · ${SHICHEN[parseInt(hour)]} · ${gender}`)
    }

    async function fetchReading() {
      try {
        const res = await fetch('/api/reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutId, orderId, signature, year, month, day, hour, gender }),
        })
        const data = await res.json()
        if (data.error) { setError(data.error); setLoading(false); return }
        setReading(data.reading)
        setLoading(false)
        sessionStorage.removeItem('bazi_year')
        sessionStorage.removeItem('bazi_month')
        sessionStorage.removeItem('bazi_day')
        sessionStorage.removeItem('bazi_hour')
        sessionStorage.removeItem('bazi_gender')
      } catch {
        setError('Connection interrupted. Please contact support at xuxiaofeng0@gmail.com')
        setLoading(false)
      }
    }

    fetchReading()
  }, [params])

  useEffect(() => {
    if (!reading) return
    let i = 0
    setDisplayed('')
    const interval = setInterval(() => {
      if (i < reading.length) {
        setDisplayed(reading.slice(0, ++i))
      } else {
        clearInterval(interval)
      }
    }, 12)
    return () => clearInterval(interval)
  }, [reading])

  function renderReading(text: string) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h2 key={i} style={rs.sectionTitle}>{line.replace('## ', '')}</h2>
      }
      if (line.startsWith('---')) {
        return <div key={i} style={rs.divider} />
      }
      if (line.trim() === '') {
        return <div key={i} style={{ height: 10 }} />
      }
      return <p key={i} style={rs.para}>{line}</p>
    })
  }

  return (
    <div style={s.body}>
      <div style={s.starsLayer} aria-hidden="true" />

      <div style={s.nav}>
        <a href="/" style={s.navLink}>← New Reading</a>
        <span style={s.navTitle}>Four Pillars Reading</span>
        <div style={{ width: 100 }} />
      </div>

      <div style={s.page}>

        <header style={s.header}>
          <div style={s.headerBadge}>八字命理 · Four Pillars</div>
          <h1 style={s.headerTitle}>Your Destiny Chart</h1>
          {birthInfo && <p style={s.headerSub}>{birthInfo}</p>}
        </header>

        <div style={s.card}>
          <div style={s.cardTopLine} />

          {loading && (
            <div style={s.loadingWrap}>
              <div style={s.loadingGlyphs}>
                {['年','月','日','时'].map((g, i) => (
                  <span key={i} style={{ ...s.loadingGlyph, animationDelay: `${i * 0.3}s` }}>{g}</span>
                ))}
              </div>
              <p style={s.loadingText}>Calculating your Four Pillars…</p>
            </div>
          )}

          {error && <p style={s.errorText}>{error}</p>}

          {displayed && (
            <div>
              {renderReading(displayed)}
              {displayed.length < reading.length && <span style={s.cursor} />}
            </div>
          )}

          {displayed && displayed.length === reading.length && (
            <div style={s.readingFooter}>
              <span style={s.footerGlyph}>命</span>
              <p style={s.footerNote}>
                The Four Pillars do not imprison — they illuminate the patterns already moving through your life. Awareness is the beginning of mastery.
              </p>
            </div>
          )}
        </div>

        {displayed && displayed.length === reading.length && (
          <div style={s.newReading}>
            <a href="/" style={s.newReadingBtn}>← Get Another Reading</a>
          </div>
        )}

        <footer style={s.footer}>
          <div style={s.footerLinks}>
            <a href="mailto:xuxiaofeng0@gmail.com" style={s.footerLink}>xuxiaofeng0@gmail.com</a>
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
        @keyframes blink {
          0%,100%{opacity:1} 50%{opacity:0}
        }
      `}</style>
    </div>
  )
}

const rs: Record<string, React.CSSProperties> = {
  sectionTitle: { fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 400, color: '#c08e46', letterSpacing: '0.08em', marginTop: 28, marginBottom: 12 },
  divider: { height: 1, background: 'rgba(212,201,176,0.1)', margin: '20px 0' },
  para: { fontSize: 16, fontWeight: 300, lineHeight: 1.9, color: 'rgba(232,224,204,0.82)', marginBottom: 4 },
}

const s: Record<string, React.CSSProperties> = {
  body: { background: '#0d0f14', minHeight: '100vh', color: '#e8e0cc', fontFamily: "'Cormorant Garamond', Georgia, serif", position: 'relative' },
  starsLayer: {
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
    backgroundImage: [
      'radial-gradient(1px 1px at 10% 15%, rgba(212,201,176,0.5) 0%, transparent 100%)',
      'radial-gradient(1px 1px at 30% 45%, rgba(212,201,176,0.3) 0%, transparent 100%)',
      'radial-gradient(1.5px 1.5px at 50% 10%, rgba(212,201,176,0.4) 0%, transparent 100%)',
      'radial-gradient(1px 1px at 70% 60%, rgba(212,201,176,0.3) 0%, transparent 100%)',
      'radial-gradient(1px 1px at 85% 25%, rgba(212,201,176,0.4) 0%, transparent 100%)',
      'radial-gradient(ellipse 800px 400px at 50% 0%, rgba(139,90,60,0.06) 0%, transparent 70%)',
    ].join(','),
  },
  nav: { background: 'rgba(13,15,20,0.96)', borderBottom: '1px solid rgba(212,201,176,0.08)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 },
  navLink: { fontSize: 11, letterSpacing: '0.2em', color: 'rgba(212,201,176,0.35)', textDecoration: 'none', fontFamily: 'Georgia, serif' },
  navTitle: { fontSize: 10, letterSpacing: '0.35em', color: 'rgba(192,142,70,0.5)', textTransform: 'uppercase' },
  page: { position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', padding: '52px 24px 80px' },
  header: { textAlign: 'center', marginBottom: 40 },
  headerBadge: { display: 'inline-block', border: '1px solid rgba(192,142,70,0.3)', color: 'rgba(192,142,70,0.65)', fontSize: 10, letterSpacing: '0.35em', padding: '5px 16px', marginBottom: 16, textTransform: 'uppercase' },
  headerTitle: { fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 6vw, 54px)', fontWeight: 300, color: '#e8e0cc', letterSpacing: '0.06em', marginBottom: 10 },
  headerSub: { fontSize: 13, color: 'rgba(232,224,204,0.35)', fontStyle: 'italic', letterSpacing: '0.1em' },
  card: { background: 'rgba(18,20,26,0.92)', border: '1px solid rgba(212,201,176,0.12)', padding: '44px 48px', position: 'relative', marginBottom: 28 },
  cardTopLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(192,142,70,0.5), transparent)' },
  loadingWrap: { textAlign: 'center', padding: '44px 0' },
  loadingGlyphs: { display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 20 },
  loadingGlyph: { fontFamily: 'serif', fontSize: 30, color: 'rgba(192,142,70,0.5)', animation: 'glyph-pulse 1.8s ease-in-out infinite' },
  loadingText: { fontSize: 12, color: 'rgba(232,224,204,0.25)', letterSpacing: '0.35em', textTransform: 'uppercase', fontStyle: 'italic' },
  errorText: { color: 'rgba(192,57,43,0.8)', fontSize: 15, fontStyle: 'italic', padding: '20px 0' },
  cursor: { display: 'inline-block', width: '1.5px', height: '0.9em', background: '#c08e46', marginLeft: 1, verticalAlign: 'text-bottom', animation: 'blink 0.7s step-end infinite' },
  readingFooter: { marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(212,201,176,0.1)', display: 'flex', alignItems: 'flex-start', gap: 14 },
  footerGlyph: { fontFamily: 'serif', fontSize: 20, color: 'rgba(192,142,70,0.3)', border: '1px solid rgba(192,142,70,0.15)', padding: '4px 8px', lineHeight: 1, flexShrink: 0 },
  footerNote: { fontSize: 12, fontStyle: 'italic', color: 'rgba(232,224,204,0.25)', lineHeight: 1.7 },
  newReading: { textAlign: 'center', marginBottom: 48 },
  newReadingBtn: { display: 'inline-block', border: '1px solid rgba(192,142,70,0.25)', color: 'rgba(192,142,70,0.6)', fontFamily: 'Georgia, serif', fontSize: 12, letterSpacing: '0.25em', padding: '11px 24px', textDecoration: 'none' },
  footer: { textAlign: 'center' },
  footerLinks: { display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' as const },
  footerLink: { fontSize: 11, color: 'rgba(232,224,204,0.2)', textDecoration: 'none', letterSpacing: '0.1em' },
  footerDot: { color: 'rgba(232,224,204,0.1)' },
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ background: '#0d0f14', minHeight: '100vh' }} />}>
      <SuccessContent />
    </Suspense>
  )
}
