'use client'

import { useState, useEffect } from 'react'

const HEXAGRAMS = [
  {n:1,en:"The Creative",zh:"乾 · Qián",sym:"䷀",lines:[1,1,1,1,1,1]},
  {n:2,en:"The Receptive",zh:"坤 · Kūn",sym:"䷁",lines:[0,0,0,0,0,0]},
  {n:3,en:"Difficulty at the Beginning",zh:"屯 · Zhūn",sym:"䷂",lines:[1,0,0,0,1,0]},
  {n:4,en:"Youthful Folly",zh:"蒙 · Méng",sym:"䷃",lines:[0,1,0,0,0,1]},
  {n:5,en:"Waiting",zh:"需 · Xū",sym:"䷄",lines:[0,1,1,1,0,1]},
  {n:6,en:"Conflict",zh:"讼 · Sòng",sym:"䷅",lines:[1,0,1,1,1,0]},
  {n:7,en:"The Army",zh:"师 · Shī",sym:"䷆",lines:[0,0,0,1,0,0]},
  {n:8,en:"Holding Together",zh:"比 · Bǐ",sym:"䷇",lines:[0,0,1,0,0,0]},
  {n:9,en:"Small Taming",zh:"小畜 · Xiǎo Chù",sym:"䷈",lines:[1,1,0,1,1,1]},
  {n:10,en:"Treading",zh:"履 · Lǚ",sym:"䷉",lines:[1,1,1,0,1,1]},
  {n:11,en:"Peace",zh:"泰 · Tài",sym:"䷊",lines:[0,0,0,1,1,1]},
  {n:12,en:"Standstill",zh:"否 · Pǐ",sym:"䷋",lines:[1,1,1,0,0,0]},
  {n:13,en:"Fellowship",zh:"同人 · Tóng Rén",sym:"䷌",lines:[1,0,1,1,1,1]},
  {n:14,en:"Great Possession",zh:"大有 · Dà Yǒu",sym:"䷍",lines:[1,1,1,1,0,1]},
  {n:15,en:"Modesty",zh:"谦 · Qiān",sym:"䷎",lines:[0,0,0,1,0,0]},
  {n:16,en:"Enthusiasm",zh:"豫 · Yù",sym:"䷏",lines:[0,0,1,0,0,0]},
  {n:17,en:"Following",zh:"随 · Suí",sym:"䷐",lines:[1,0,0,1,1,0]},
  {n:18,en:"Decay",zh:"蛊 · Gǔ",sym:"䷑",lines:[0,1,1,0,0,1]},
  {n:19,en:"Approach",zh:"临 · Lín",sym:"䷒",lines:[0,0,0,0,1,1]},
  {n:20,en:"Contemplation",zh:"观 · Guān",sym:"䷓",lines:[1,1,0,0,0,0]},
  {n:21,en:"Biting Through",zh:"噬嗑 · Shì Kè",sym:"䷔",lines:[1,0,1,0,0,1]},
  {n:22,en:"Grace",zh:"贲 · Bì",sym:"䷕",lines:[1,0,0,1,0,1]},
  {n:23,en:"Splitting Apart",zh:"剥 · Bō",sym:"䷖",lines:[0,0,0,0,0,1]},
  {n:24,en:"Return",zh:"复 · Fù",sym:"䷗",lines:[1,0,0,0,0,0]},
  {n:25,en:"Innocence",zh:"无妄 · Wú Wàng",sym:"䷘",lines:[1,0,0,1,1,1]},
  {n:26,en:"Great Taming",zh:"大畜 · Dà Chù",sym:"䷙",lines:[1,1,1,0,0,1]},
  {n:27,en:"Nourishment",zh:"颐 · Yí",sym:"䷚",lines:[1,0,0,0,0,1]},
  {n:28,en:"Great Excess",zh:"大过 · Dà Guò",sym:"䷛",lines:[0,1,1,1,1,0]},
  {n:29,en:"The Abysmal",zh:"坎 · Kǎn",sym:"䷜",lines:[0,1,0,0,1,0]},
  {n:30,en:"The Clinging",zh:"离 · Lí",sym:"䷝",lines:[1,0,1,1,0,1]},
  {n:31,en:"Influence",zh:"咸 · Xián",sym:"䷞",lines:[0,1,1,1,0,0]},
  {n:32,en:"Duration",zh:"恒 · Héng",sym:"䷟",lines:[0,0,1,1,1,0]},
  {n:33,en:"Retreat",zh:"遁 · Dùn",sym:"䷠",lines:[1,1,1,1,0,0]},
  {n:34,en:"Great Power",zh:"大壮 · Dà Zhuàng",sym:"䷡",lines:[0,0,1,1,1,1]},
  {n:35,en:"Progress",zh:"晋 · Jìn",sym:"䷢",lines:[0,0,0,1,0,1]},
  {n:36,en:"Darkening of the Light",zh:"明夷 · Míng Yí",sym:"䷣",lines:[1,0,1,0,0,0]},
  {n:37,en:"The Family",zh:"家人 · Jiā Rén",sym:"䷤",lines:[0,1,0,1,1,0]},
  {n:38,en:"Opposition",zh:"睽 · Kuí",sym:"䷥",lines:[0,1,1,0,1,0]},
  {n:39,en:"Obstruction",zh:"蹇 · Jiǎn",sym:"䷦",lines:[0,1,0,1,0,0]},
  {n:40,en:"Deliverance",zh:"解 · Xiè",sym:"䷧",lines:[0,0,1,0,1,0]},
  {n:41,en:"Decrease",zh:"损 · Sǔn",sym:"䷨",lines:[1,0,0,1,1,0]},
  {n:42,en:"Increase",zh:"益 · Yì",sym:"䷩",lines:[0,1,1,0,0,1]},
  {n:43,en:"Breakthrough",zh:"夬 · Guài",sym:"䷪",lines:[0,1,1,1,1,1]},
  {n:44,en:"Coming to Meet",zh:"姤 · Gòu",sym:"䷫",lines:[1,1,1,1,1,0]},
  {n:45,en:"Gathering Together",zh:"萃 · Cuì",sym:"䷬",lines:[0,0,1,1,0,0]},
  {n:46,en:"Pushing Upward",zh:"升 · Shēng",sym:"䷭",lines:[0,0,0,1,1,0]},
  {n:47,en:"Exhaustion",zh:"困 · Kùn",sym:"䷮",lines:[0,1,0,1,1,0]},
  {n:48,en:"The Well",zh:"井 · Jǐng",sym:"䷯",lines:[0,1,1,0,1,0]},
  {n:49,en:"Revolution",zh:"革 · Gé",sym:"䷰",lines:[0,1,1,1,0,1]},
  {n:50,en:"The Cauldron",zh:"鼎 · Dǐng",sym:"䷱",lines:[1,0,1,1,1,0]},
  {n:51,en:"The Arousing",zh:"震 · Zhèn",sym:"䷲",lines:[1,0,0,1,0,0]},
  {n:52,en:"Keeping Still",zh:"艮 · Gèn",sym:"䷳",lines:[0,0,1,0,0,1]},
  {n:53,en:"Gradual Progress",zh:"渐 · Jiàn",sym:"䷴",lines:[0,1,0,1,0,1]},
  {n:54,en:"The Marrying Maiden",zh:"归妹 · Guī Mèi",sym:"䷵",lines:[1,0,1,0,1,0]},
  {n:55,en:"Abundance",zh:"丰 · Fēng",sym:"䷶",lines:[1,0,0,1,0,1]},
  {n:56,en:"The Wanderer",zh:"旅 · Lǚ",sym:"䷷",lines:[1,0,1,0,0,1]},
  {n:57,en:"The Gentle",zh:"巽 · Xùn",sym:"䷸",lines:[0,1,1,0,1,1]},
  {n:58,en:"The Joyous",zh:"兑 · Duì",sym:"䷹",lines:[1,1,0,1,1,0]},
  {n:59,en:"Dispersion",zh:"涣 · Huàn",sym:"䷺",lines:[0,1,1,0,0,1]},
  {n:60,en:"Limitation",zh:"节 · Jié",sym:"䷻",lines:[1,1,0,0,1,0]},
  {n:61,en:"Inner Truth",zh:"中孚 · Zhōng Fú",sym:"䷼",lines:[0,1,1,1,1,0]},
  {n:62,en:"Small Excess",zh:"小过 · Xiǎo Guò",sym:"䷽",lines:[0,0,1,1,0,0]},
  {n:63,en:"After Completion",zh:"既济 · Jì Jì",sym:"䷾",lines:[0,1,0,1,0,1]},
  {n:64,en:"Before Completion",zh:"未济 · Wèi Jì",sym:"䷿",lines:[1,0,1,0,1,0]},
]

function getHexIndex(question: string, offsetMs: number): number {
  const d = new Date(Date.now() + offsetMs)
  const seed = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds() + question.length
  return seed % 64
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}
function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

export default function HomePage() {
  const [question, setQuestion] = useState('')
  const [timeOffset, setTimeOffset] = useState(0)
  const [clockTime, setClockTime] = useState('')
  const [clockDate, setClockDate] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTime, setModalTime] = useState('')
  const [timeAdjusted, setTimeAdjusted] = useState(false)

  useEffect(() => {
    const tick = () => {
      const d = new Date(Date.now() + timeOffset)
      setClockTime(formatTime(d))
      setClockDate(formatDate(d))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [timeOffset])

  function applyTime() {
    if (!modalTime) { setModalOpen(false); return }
    const [hh, mm] = modalTime.split(':').map(Number)
    const now = new Date()
    const target = new Date()
    target.setHours(hh, mm, 0, 0)
    setTimeOffset(target.getTime() - now.getTime())
    setTimeAdjusted(true)
    setModalOpen(false)
  }

  function handleCast() {
    if (!question.trim()) return
    const hexIdx = getHexIndex(question, timeOffset)
    const d = new Date(Date.now() + timeOffset)
    sessionStorage.setItem('wu_question', question)
    sessionStorage.setItem('wu_hex_index', String(hexIdx))
    sessionStorage.setItem('wu_time', formatTime(d))
    const successUrl = `${window.location.origin}/success`
    window.location.href = `/api/checkout?successUrl=${encodeURIComponent(successUrl)}`
  }

  return (
    <div style={s.body}>
      <div style={s.clockBanner}>
        <span style={s.clockLabel}>Your local time</span>
        <span style={s.clockDisplay}>{clockTime || '--:--:--'}</span>
        <span style={s.clockDate}>{clockDate}</span>
        <button style={s.clockBtn} onClick={() => setModalOpen(true)}>Not correct? Adjust →</button>
        {timeAdjusted && (
          <div style={s.clockWarning}>⚠ Time adjusted. The hexagram will be cast using your corrected local time.</div>
        )}
      </div>

      {modalOpen && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div style={s.modal}>
            <div style={s.modalBar} />
            <p style={s.modalTitle}>Adjust Your Local Time</p>
            <p style={s.modalNote}>In Plum Blossom Numerology, the exact hour of your question shapes the hexagram cast. If the clock above does not match your local time, correct it here before proceeding.</p>
            <label style={s.modalLabel}>Enter your current local time</label>
            <input type="time" style={s.timeInput} value={modalTime} onChange={e => setModalTime(e.target.value)} />
            <div style={s.modalActions}>
              <button style={s.btnSecondary} onClick={() => setModalOpen(false)}>Cancel</button>
              <button style={s.btnPrimary} onClick={applyTime}>Apply Time</button>
            </div>
          </div>
        </div>
      )}

      <div style={s.page}>
        <header style={s.masthead}>
          <div style={s.seal}><span style={s.sealChar}>易</span></div>
          <h1 style={s.title}>Wú · <em style={{ color: '#c0392b', fontStyle: 'normal' }}>The Book of Changes</em></h1>
          <div style={s.rule}>
            <div style={s.ruleLine} />
            <span style={s.ruleTrigs}>☰ ☷ ☵</span>
            <div style={s.ruleLine} />
          </div>
          <p style={s.tagline}>Ancient Chinese divination for the crossroads of now</p>
        </header>

        <div style={s.instrBox}>
          <div style={s.instrBar} />
          <p style={s.instrHeading}>Before You Ask</p>
          <p style={s.instrText}>Take three slow, deep breaths. Clear your mind completely. Then bring your full attention to your question — not just the words, but the weight of it.</p>
          <p style={{ ...s.instrText, marginTop: 12 }}>The oracle answers best when your question is specific and personal. Vague questions receive vague answers — the more clearly you name your situation, the more useful the reading will be.</p>
          <div style={s.example}>
            <strong>Instead of:</strong> "What should I do about my job?"<br />
            <strong>Ask:</strong> "I have been offered a new position at a different company with higher pay but more risk. Should I leave my current job and take it?"
          </div>
        </div>

        <div style={s.card}>
          <div style={s.cardBar} />
          <p style={s.cardLabel}>Lay your question before the Oracle <span style={s.labelLine2} /></p>
          <textarea
            style={s.textarea}
            rows={3}
            maxLength={400}
            placeholder="Describe your situation and what you need to know. Be as specific as you can…"
            value={question}
            onChange={e => setQuestion(e.target.value)}
          />
          <div style={s.cardFooter}>
            <span style={s.charCount}>{question.length} / 400</span>
            <div style={s.priceTag}>$3.99 · one reading</div>
            <button style={s.castBtn} onClick={handleCast} disabled={!question.trim()}>
              Cast the Coins · $3.99 →
            </button>
          </div>
          <p style={s.payNote}>Secure payment via Creem · Visa, Mastercard, Apple Pay, Google Pay accepted</p>
        </div>

        <footer style={s.siteFooter}>
          <span style={s.footerTrigs}>☰ ☱ ☲ ☳ ☴ ☵ ☶ ☷</span>
          <p style={s.footerCopy}>The Book of Changes has been consulted for three thousand years.</p>
          <div style={s.footerLinks}>
            <a href="mailto:xuxiaofeng0@gmail.com" style={s.footerLink}>xuxiaofeng0@gmail.com</a>
            <span style={{ color: '#d4c9b0' }}>·</span>
            <a href="/privacy" style={s.footerLink}>Privacy Policy</a>
            <span style={{ color: '#d4c9b0' }}>·</span>
            <a href="/terms" style={s.footerLink}>Terms of Service</a>
          </div>
        </footer>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  body: { background: '#f5f0e8', minHeight: '100vh', fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#1a1410' },
  clockBanner: { background: '#1a1410', color: '#f5f0e8', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, position: 'sticky', top: 0, zIndex: 50, flexWrap: 'wrap' },
  clockLabel: { fontSize: 10, letterSpacing: '0.35em', color: '#d4c9b0', textTransform: 'uppercase', flexShrink: 0 },
  clockDisplay: { fontSize: 22, fontWeight: 300, letterSpacing: '0.12em', color: '#fff', minWidth: 110, textAlign: 'center' },
  clockDate: { fontSize: 11, color: '#d4c9b0', letterSpacing: '0.2em', fontStyle: 'italic' },
  clockBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#d4c9b0', fontFamily: 'Georgia, serif', fontSize: 10, letterSpacing: '0.25em', padding: '5px 12px', cursor: 'pointer', flexShrink: 0 },
  clockWarning: { width: '100%', textAlign: 'center', fontSize: 11, color: '#e8a87c', letterSpacing: '0.15em', fontStyle: 'italic', paddingTop: 4 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(26,20,16,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#f5f0e8', border: '1px solid #d4c9b0', boxShadow: '0 20px 60px rgba(26,20,16,0.3)', padding: '40px 44px', maxWidth: 400, width: '90%', position: 'relative' },
  modalBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #c0392b, #8b2a1e, transparent)' },
  modalTitle: { fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 400, letterSpacing: '0.12em', marginBottom: 8 },
  modalNote: { fontSize: 13, fontStyle: 'italic', color: '#8a7f6e', lineHeight: 1.6, marginBottom: 24 },
  modalLabel: { display: 'block', fontSize: 10, letterSpacing: '0.4em', color: '#8a7f6e', textTransform: 'uppercase', marginBottom: 8 },
  timeInput: { width: '100%', background: 'white', border: '1px solid #d4c9b0', fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, color: '#1a1410', padding: '10px 14px', outline: 'none', marginBottom: 24 },
  modalActions: { display: 'flex', gap: 12 },
  btnPrimary: { flex: 1, padding: 12, background: '#1a1410', color: '#f5f0e8', border: 'none', fontFamily: 'Georgia, serif', fontSize: 12, letterSpacing: '0.3em', cursor: 'pointer', textTransform: 'uppercase' },
  btnSecondary: { flex: 1, padding: 12, background: 'transparent', border: '1px solid #d4c9b0', color: '#8a7f6e', fontFamily: 'Georgia, serif', fontSize: 12, letterSpacing: '0.3em', cursor: 'pointer', textTransform: 'uppercase' },
  page: { maxWidth: 700, margin: '0 auto', padding: '64px 24px 100px', position: 'relative', zIndex: 1 },
  masthead: { textAlign: 'center', marginBottom: 64 },
  seal: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, border: '2px solid #c0392b', borderRadius: 4, transform: 'rotate(-6deg)', marginBottom: 24, position: 'relative' },
  sealChar: { fontFamily: 'serif', fontSize: 22, color: '#c0392b', lineHeight: 1 },
 title: { fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 300, letterSpacing: '0.06em', color: '#1a1410', lineHeight: 1.1, whiteSpace: 'nowrap' },
  rule: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, margin: '20px auto', maxWidth: 260 },
  ruleLine: { flex: 1, height: 1, background: '#d4c9b0' },
  ruleTrigs: { fontSize: 18, color: '#8a7f6e', letterSpacing: 6 },
  tagline: { fontSize: 13, fontStyle: 'italic', color: '#8a7f6e', letterSpacing: '0.12em', fontWeight: 300 },
  instrBox: { border: '1px solid #d4c9b0', background: 'white', padding: '28px 36px', marginBottom: 28, position: 'relative' },
  instrBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #9a7b3a, transparent)' },
  instrHeading: { fontFamily: 'Georgia, serif', fontSize: 11, letterSpacing: '0.4em', color: '#9a7b3a', textTransform: 'uppercase', marginBottom: 14 },
  instrText: { fontSize: 15, lineHeight: 1.85, color: '#3d3528', fontWeight: 300 },
  example: { marginTop: 14, padding: '12px 16px', background: '#f5f0e8', borderLeft: '2px solid #9a7b3a', fontSize: 14, fontStyle: 'italic', color: '#8a7f6e', lineHeight: 1.7 },
  card: { background: 'white', border: '1px solid #d4c9b0', boxShadow: '0 4px 24px rgba(26,20,16,0.12), 0 20px 60px rgba(26,20,16,0.06)', padding: '52px 56px', position: 'relative' },
  cardBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #c0392b, #8b2a1e, transparent)' },
  cardLabel: { fontFamily: 'Georgia, serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.4em', color: '#8a7f6e', textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 },
  labelLine2: { flex: 1, height: 1, background: '#e8e0cc', display: 'block' },
  textarea: { width: '100%', border: 'none', borderBottom: '1.5px solid #d4c9b0', background: 'transparent', fontFamily: 'Georgia, serif', fontSize: 19, fontWeight: 300, color: '#1a1410', lineHeight: 1.7, padding: '0 0 16px', resize: 'none', outline: 'none', minHeight: 88 },
  cardFooter: { display: 'flex', alignItems: 'center', gap: 16, marginTop: 28, flexWrap: 'wrap' },
  charCount: { fontSize: 11, color: '#8a7f6e', fontStyle: 'italic' },
  priceTag: { fontSize: 12, color: '#8a7f6e', letterSpacing: '0.15em', fontStyle: 'italic', marginLeft: 'auto' },
  castBtn: { background: '#c0392b', color: '#f5f0e8', border: 'none', fontFamily: 'Georgia, serif', fontSize: 13, fontWeight: 600, letterSpacing: '0.3em', padding: '14px 32px', cursor: 'pointer' },
  payNote: { fontSize: 11, color: '#8a7f6e', fontStyle: 'italic', marginTop: 16, letterSpacing: '0.05em' },
  siteFooter: { textAlign: 'center', marginTop: 80 },
  footerTrigs: { fontSize: 22, letterSpacing: 10, color: '#d4c9b0', marginBottom: 14, display: 'block' },
  footerCopy: { fontSize: 11, letterSpacing: '0.25em', color: '#8a7f6e', fontStyle: 'italic' },
  footerMethod: { fontFamily: 'Georgia, serif', fontSize: 10, letterSpacing: '0.4em', color: '#d4c9b0', marginTop: 8, textTransform: 'uppercase' },
  footerLinks: { display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 },
  footerLink: { fontSize: 11, color: '#8a7f6e', textDecoration: 'none', letterSpacing: '0.15em' },
}
