import { memo } from 'react'

export default memo(function AnimateIn({ children, delay = 0 }) {
  return (
    <div
      style={{
        animation: `slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both`,
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
})