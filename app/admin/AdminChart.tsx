'use client'

type Day = { date: string; count: number }

export default function AdminChart({ days }: { days: Day[] }) {
  const max = Math.max(...days.map(d => d.count), 1)

  const labels = days.map(d => {
    const [, , dd] = d.date.split('-')
    return dd
  })

  return (
    <div>
      <div className="flex items-end gap-1.5 h-20">
        {days.map((d, i) => {
          const pct = d.count / max
          const height = Math.max(pct * 80, d.count > 0 ? 6 : 2)
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none z-10">
                {d.count} scan{d.count !== 1 ? 's' : ''}
              </div>
              <div
                className="w-full rounded-t-md transition-all duration-300"
                style={{
                  height: `${height}px`,
                  background: d.count > 0 ? '#056E4B' : '#E5E7EB',
                }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex gap-1.5 mt-1">
        {labels.map((l, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-gray-400">{l}</div>
        ))}
      </div>
    </div>
  )
}
