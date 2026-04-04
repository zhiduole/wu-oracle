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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [birthInfo, setBirthInfo] = useState('')
  const [done, setDone] = useState(false)

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

  // Typing animation via DOM manipulation to avoid cursor bug
  useEffect(() => {
    if (!reading) return

    const el = document.getElementById('readingContent')
    if (!el) return
    el.innerHTML = ''
    setDone(false)

    // Parse lines and build DOM structure first
    const lines = reading.split('\n')
    lines.forEach(line => {
      if (line.startsWith('## ')) {
        const h = document.createElement('h2')
        h.textContent = line.replace('## ', '')
        h.style.cssText = 'font-family:Georgia,serif;font-size:18px;font-weight:400;color:#c08e46;letter-spacing:0.08em;margin:28px 0 12px'
        el.appendChild(h)
      } else if (line === '---') {
        const hr = document.createElement('hr')
        hr.style.cssText = 'border:none;border-top:1px solid rgba(212,201,176,0.1);margin:20px 0'
        el.appendChild(hr)
      } else if (line.trim() === '') {
        const sp = document.createElement('div')
        sp.style.height = '10px'
        el.appendChild(sp)
      } else {
        const p = document.createElement('p')
        p.textContent = line
        p.style.cssText = 'font-size:16px;font-weight:300;line-height:1.9;color:rgba(232,224,204,0.82);margin-bottom:4px'
        el.appendChild(p)
      }
    })

    // Collect all text nodes to type into
    const typeable: { node: Element, original: string }[] = []
    el.querySelectorAll('h2, p').forEach(node => {
      const original = node.textContent || ''
      node.textContent = ''
      typeable.push({ node, original })
    })

    if (typeable.length === 0) { setDone(true); return }

    // Single cursor that moves between nodes
    const cursor = document.createElement('span')
    cursor.style.cssText = 'display:inline-block;width:1.5px;height:0.9em;background:#c08e46;margin-left:1px;vertical-align:text-bottom;animation:blink 0.7s step-end infinite'
    typeable[0].node.appendChild(cursor)

    let nodeIdx = 0
    let charIdx = 0

    const interval = setInterval(() => {
      if (nodeIdx >= typeable.length) {
        clearInterval(interval)
        cursor.remove()
        setDone(true)
        return
      }

      const { node, original } = typeable[nodeIdx]

      if (charIdx < original.length) {
        node.insertBefore(document.createTextNode(original[charIdx]), cursor)
        charIdx++
      } else {
        nodeIdx++
        charIdx = 0
        if (nodeIdx < typeable.length) {
          typeable[nodeIdx].node.appendChild(cursor)
        }
      }
    }, 12)

    return () => clearInterval(interval)
  }, [reading])

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

          <div id="readingContent" />

          {done && (
            <div style={s.readingFooter}>
              <span style={s.footerGlyph}>命</span>
              <p style={s.footerNote}>
                The Four Pillars do not imprison — they illuminate the patterns already moving through your life. Awareness is the beginning of mastery.
              </p>
            </div>
          )}
        </div>

       {done && (
          <div style={s.newReading}>
            <a href="/" style={s.newReadingBtn}>← Get Another Reading</a>
          </div>
        )}

        {done && (
          <div style={s.contactBox}>
            <p style={s.contactText}>
              Want a deeper consultation? Reach out directly —
            </p>
            <a href="mailto:iamxiaofeng.xu@gmail.com" style={s.contactEmail}>
              iamxiaofeng.xu@gmail.com
            </a>
          </div>
        )}

        <footer style={s.footer}>
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
  newReading: { textAlign: 'center', marginBottom: 20 },
  newReadingBtn: { display: 'inline-block', border: '1px solid rgba(192,142,70,0.25)', color: 'rgba(192,142,70,0.6)', fontFamily: 'Georgia, serif', fontSize: 12, letterSpacing: '0.25em', padding: '11px 24px', textDecoration: 'none' },
  contactBox: { textAlign: 'center', marginBottom: 40, padding: '28px 24px', border: '1px solid rgba(192,142,70,0.2)' },
  contactText: { fontSize: 14, color: 'rgba(232,224,204,0.45)', fontStyle: 'italic', marginBottom: 12, letterSpacing: '0.05em' },
  contactEmail: { fontSize: 17, color: '#c08e46', textDecoration: 'none', letterSpacing: '0.15em', fontFamily: 'Georgia, serif', borderBottom: '1px solid rgba(192,142,70,0.45)', paddingBottom: 3 },
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
