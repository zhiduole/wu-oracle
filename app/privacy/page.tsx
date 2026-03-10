export default function PrivacyPage() {
  return (
    <div style={{ background: '#f5f0e8', minHeight: '100vh', fontFamily: 'Georgia, serif', color: '#1a1410' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px' }}>
        <a href="/" style={{ fontSize: 12, color: '#8a7f6e', letterSpacing: '0.3em', textDecoration: 'none', textTransform: 'uppercase' }}>← Back</a>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 300, margin: '32px 0 8px', letterSpacing: '0.06em' }}>Privacy Policy</h1>
        <p style={{ fontSize: 12, color: '#8a7f6e', fontStyle: 'italic', marginBottom: 40 }}>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        {[
          ['Information We Collect', 'We collect the question you submit, your payment information (processed securely by Creem — we never see your card details), and your email address provided at checkout. We do not require account creation.'],
          ['How We Use Your Information', 'Your question is used solely to generate your I Ching reading via the Anthropic API. Your email is used by Creem to send your payment receipt. We do not use your question or reading for marketing purposes.'],
          ['Data Retention', 'Questions and readings are not stored on our servers beyond the duration of your session. Payment records are retained by Creem as required by law.'],
          ['Third-Party Services', 'We use Creem for payment processing and Anthropic for AI-generated readings. Each has their own privacy policy governing their data practices.'],
          ['Cookies', 'We use only session storage (cleared when you close your browser) to temporarily hold your question during the payment redirect. We do not use tracking cookies.'],
          ['Contact', 'For any privacy concerns, please contact us at the email listed on our website.'],
        ].map(([title, body]) => (
          <div key={title as string} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 14, letterSpacing: '0.3em', fontWeight: 400, textTransform: 'uppercase', color: '#8a7f6e', marginBottom: 10 }}>{title}</h2>
            <p style={{ fontSize: 15, lineHeight: 1.85, fontWeight: 300, color: '#3d3528' }}>{body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
