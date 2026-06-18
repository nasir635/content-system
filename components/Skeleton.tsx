'use client'

export function Skeleton({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton ${className}`} style={style} />
}

// Placeholder grid shown while the store hydrates, mirroring the card layout.
export function CardSkeletonGrid({ count = 8 }: { count?: number }) {
  const heights = [210, 250, 190, 230, 200, 260, 210, 220]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden" style={{ border: '1px solid #DFE3EB', background: '#FFFFFF' }}>
          <Skeleton style={{ height: heights[i % heights.length], borderRadius: 0 }} />
          <div className="p-4 space-y-2">
            <Skeleton style={{ height: 12, width: '80%' }} />
            <Skeleton style={{ height: 10, width: '50%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
