const IcoLoader = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="12" y1="2"     x2="12" y2="6"/>
    <line x1="12" y1="18"    x2="12" y2="22"/>
    <line x1="4.93" y1="4.93"   x2="7.76" y2="7.76"/>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
    <line x1="2"  y1="12"    x2="6"  y2="12"/>
    <line x1="18" y1="12"    x2="22" y2="12"/>
    <line x1="4.93" y1="19.07"  x2="7.76" y2="16.24"/>
    <line x1="16.24" y1="7.76"  x2="19.07" y2="4.93"/>
  </svg>
)

export default function EmptyState({ title, sub }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '4rem 2rem', textAlign: 'center',
    }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '16px',
        background: 'var(--surface)', border: '1px solid var(--line)',
        display: 'grid', placeItems: 'center',
        color: 'var(--ink-3)', marginBottom: '18px',
      }}>
        <IcoLoader />
      </div>
      <p style={{
        fontFamily: "'Inter', sans-serif", fontWeight: '400',
        fontSize: '19px', color: 'var(--ink)', margin: '0 0 6px',
        letterSpacing: '-0.01em',
      }}>{title}</p>
      {sub && (
        <p style={{ fontSize: '13.5px', color: 'var(--ink-3)', margin: 0 }}>{sub}</p>
      )}
    </div>
  )
}
