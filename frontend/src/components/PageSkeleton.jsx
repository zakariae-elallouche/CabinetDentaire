import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function PageSkeleton({ rows = 4 }) {
  return (
    <div style={{ padding: '32px clamp(20px, 3vw, 48px)', maxWidth: 800 }}>
      <Skeleton height={28} width={200} style={{ marginBottom: 24 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <Skeleton height={16} width={`${60 + Math.random() * 30}%`} style={{ marginBottom: 8 }} />
          <Skeleton height={48} borderRadius={8} />
        </div>
      ))}
      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <Skeleton height={40} width={120} borderRadius={8} />
        <Skeleton height={40} width={160} borderRadius={8} />
      </div>
    </div>
  )
}
