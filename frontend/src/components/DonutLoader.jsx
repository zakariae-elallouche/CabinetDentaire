const styleId = 'donut-loader-keyframes'
if (!document.getElementById(styleId)) {
  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    @keyframes donut-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `
  document.head.appendChild(style)
}

export default function DonutLoader({ size = 36, inline }) {
  const spinner = (
    <div
      style={{
        width: size,
        height: size,
        border: '3.5px solid var(--line)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'donut-spin 0.7s linear infinite',
      }}
    />
  )
  if (inline) return spinner
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        minHeight: 180,
      }}
    >
      {spinner}
    </div>
  )
}