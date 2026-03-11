'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

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

function SuccessContent() {
  const params = useSearchParams()
  const [reading, setReading] = useState('')
  const [displayed, setDisplayed] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hex, setHex] = useState<typeof HEXAGRAMS[0] | null>(null)
  const [linesVisible, setLinesVisible] = useState<boolean[]>([])

  useEffect(() => {
    const orderId = params.get('order_id') || ''

    // Retrieve question + hex info stored before redirect
    const question = sessionStorage.getItem('wu_question') || ''
    const hexIndex = parseInt(sessionStorage.getItem('wu_hex_index') || '0')
    const timeStr = sessionStorage.getItem('wu_time') || ''

    const hexData = HEXAGRAMS[hexIndex % 64]
    setHex(hexData)

    // Animate lines in
    const timers: ReturnType<typeof setTimeout>[] = []
    hexData.lines.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setLinesVisible(prev => { const n = [...prev]; n[i] = true; return n })
      }, i * 120))
    })

    async function fetchReading() {
      try {
        const res = await fetch('/api/reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            
            orderId,
            
            question,
            hexNumber: hexData.n,
            hexName: hexData.en,
            hexZh: hexData.zh,
            timeStr,
          }),
        })
        const data = await res.json()
        if (data.error) { setError(data.error); setLoading(false); return }
        setReading(data.reading)
        setLoading(false)
        sessionStorage.removeItem('wu_question')
        sessionStorage.removeItem('wu_hex_index')
        sessionStorage.removeItem('wu_time')
      } catch {
        setError('Connection interrupted. Please contact support.')
        setLoading(false)
      }
    }

    fetchReading()
    return () => timers.forEach(clearTimeout)
  }, [params])

  // Typing effect
  useEffect(() => {
    const orderId = params.get('order_id') || ''
    if (!reading) return
    let i = 0
    setDisplayed('')
    const interval = setInterval(() => {
      if (i < reading.length) {
        setDisplayed(reading.slice(0, ++i))
      } else {
        clearInterval(interval)
      }
    }, 22)
    return () => clearInterval(interval)
  }, [reading])

  return (
    <div style={styles.page}>
      {hex && (
        <div style={styles.card}>
          <div style={styles.redBar} />
          <div style={styles.hexHeader}>
            {/* Hex lines */}
            <div style={styles.hexLines}>
              {hex.lines.map((yang, i) => (
                <div key={i} style={styles.hexLine}>
                  {yang ? (
                    <div style={{ ...styles.segment, ...styles.solid, opacity: linesVisible[i] ? 1 : 0 }} />
                  ) : (
                    <>
                      <div style={{ ...styles.segment, ...styles.broken, opacity: linesVisible[i] ? 1 : 0 }} />
                      <div style={{ ...styles.segment, ...styles.broken, opacity: linesVisible[i] ? 1 : 0 }} />
                    </>
                  )}
                </div>
              ))}
            </div>
            <div style={styles.hexMeta}>
              <p style={styles.hexNumber}>Hexagram {hex.n} of 64</p>
              <h2 style={styles.hexName}>{hex.en}</h2>
              <p style={styles.hexZh}>{hex.zh}</p>
              <div style={styles.hexSym}>{hex.sym}</div>
            </div>
          </div>

          <div style={styles.labelRow}>
            <span style={styles.label}>The Oracle Speaks</span>
            <div style={styles.labelLine} />
          </div>

          {loading && (
            <div style={styles.coins}>
              {['☰','☷','☵'].map((s, i) => (
                <div key={i} style={styles.coin}>{s}</div>
              ))}
            </div>
          )}

          {error && <p style={styles.errorText}>{error}</p>}

          {displayed && (
            <p style={styles.readingText}>
              {displayed}
              {displayed.length < reading.length && <span style={styles.cursor} />}
            </p>
          )}

          {displayed && displayed.length === reading.length && (
            <>
              <div style={styles.footer}>
                <span style={styles.footerSeal}>易</span>
                <p style={styles.footerNote}>
                  Plum Blossom Numerology uses the time and nature of your question to determine the hexagram.
                  The I Ching does not command — it illuminates the pattern already present in your situation.
                </p>
              </div>
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <a href="/" style={styles.backBtn}>Ask Another Question</a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { background: '#f5f0e8', minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 24px', fontFamily: 'Georgia, serif' },
  card: { background: 'white', border: '1px solid #d4c9b0', boxShadow: '0 4px 24px rgba(26,20,16,0.12)', padding: '52px 56px', maxWidth: 680, width: '100%', position: 'relative', marginTop: 20 },
  redBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #c0392b, #8b2a1e, transparent)' },
  hexHeader: { display: 'flex', alignItems: 'flex-start', gap: 36, marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid #e8e0cc' },
  hexLines: { display: 'flex', flexDirection: 'column-reverse', gap: 7, flexShrink: 0 },
  hexLine: { display: 'flex', gap: 5, alignItems: 'center' },
  segment: { height: 5, background: '#1a1410', borderRadius: 1, transition: 'opacity 0.4s' },
  solid: { width: 44 },
  broken: { width: 19 },
  hexMeta: { flex: 1 },
  hexNumber: { fontSize: 10, letterSpacing: '0.4em', color: '#8a7f6e', marginBottom: 6, fontFamily: 'Georgia, serif' },
  hexName: { fontSize: 34, fontWeight: 300, color: '#1a1410', lineHeight: 1.1, marginBottom: 6, fontFamily: 'Georgia, serif' },
  hexZh: { fontSize: 13, color: '#c0392b', letterSpacing: '0.3em', marginBottom: 10, fontFamily: 'serif' },
  hexSym: { fontSize: 34, color: '#8a7f6e', lineHeight: 1 },
  labelRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 },
  label: { fontSize: 10, letterSpacing: '0.4em', color: '#8a7f6e', textTransform: 'uppercase', fontFamily: 'Georgia, serif', whiteSpace: 'nowrap' },
  labelLine: { flex: 1, height: 1, background: '#e8e0cc' },
  coins: { display: 'flex', justifyContent: 'center', gap: 14, padding: '24px 0' },
  coin: { width: 28, height: 28, border: '1.5px solid #d4c9b0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#8a7f6e' },
  readingText: { fontSize: 17, fontWeight: 300, lineHeight: 1.95, color: '#3d3528', minHeight: 60 },
  cursor: { display: 'inline-block', width: 1.5, height: '0.9em', background: '#c0392b', marginLeft: 1, verticalAlign: 'text-bottom' },
  errorText: { color: '#c0392b', fontSize: 15, fontStyle: 'italic', padding: '20px 0' },
  footer: { marginTop: 28, paddingTop: 22, borderTop: '1px solid #e8e0cc', display: 'flex', alignItems: 'flex-start', gap: 14 },
  footerSeal: { fontFamily: 'serif', fontSize: 18, color: '#c0392b', opacity: 0.45, flexShrink: 0, border: '1px solid rgba(192,57,43,0.25)', padding: '4px 6px', lineHeight: 1 },
  footerNote: { fontSize: 12, fontStyle: 'italic', color: '#8a7f6e', lineHeight: 1.65 },
  backBtn: { display: 'inline-block', padding: '11px 26px', border: '1px solid #d4c9b0', fontFamily: 'Georgia, serif', fontSize: 12, letterSpacing: '0.35em', color: '#8a7f6e', textDecoration: 'none', textTransform: 'uppercase' },
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ background: '#f5f0e8', minHeight: '100vh' }} />}>
      <SuccessContent />
    </Suspense>
  )
}
