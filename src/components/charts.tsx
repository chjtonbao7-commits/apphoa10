// Lightweight single-series charts in plain HTML/CSS. Thin bars, 4px rounded
// data-ends, recessive gridlines, a hover tooltip on every mark.
import { useState } from 'react'

type Datum = { label: string; value: number; detail?: string }

function Tooltip({ text }: { text: string }) {
  return (
    <div className="pointer-events-none absolute z-10 -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-ink text-white text-xs px-2.5 py-1.5 shadow-lg">
      {text}
    </div>
  )
}

/** Horizontal bars — for comparing named categories (topics, tasks, rules). */
export function HBarChart({
  data,
  max,
  unit = '',
  color = '#2a78d6',
}: {
  data: Datum[]
  max?: number
  unit?: string
  color?: string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const top = max ?? Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div
          key={d.label}
          className="grid grid-cols-[minmax(7rem,11rem)_1fr_3rem] items-center gap-3 text-sm py-0.5"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        >
          <span className="text-ink-2 truncate" title={d.label}>{d.label}</span>
          <div className="relative h-4">
            <div className="absolute inset-y-0 left-0 right-0 border-l border-line" />
            <div
              className="absolute inset-y-[3px] left-0 rounded-r-[4px] transition-all"
              style={{ width: `${(d.value / top) * 100}%`, background: color, opacity: hover === null || hover === i ? 1 : 0.45 }}
            />
            {hover === i && <Tooltip text={d.detail ?? `${d.label}: ${d.value}${unit}`} />}
          </div>
          <span className="font-mono text-xs text-ink text-right">
            {d.value}
            {unit}
          </span>
        </div>
      ))}
    </div>
  )
}

/** Vertical columns — for a distribution over ordered bins (e.g. scores 0–10). */
export function ColumnChart({
  data,
  color = '#2a78d6',
  xLabel,
}: {
  data: Datum[]
  color?: string
  xLabel?: string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const top = Math.max(1, ...data.map((d) => d.value))
  const ticks = Array.from(new Set([0, Math.ceil(top / 2), top]))
  return (
    <div>
      <div className="relative h-44 grid gap-[2px] pl-6" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
        {ticks.map((t) => (
          <div key={t} className="absolute left-0 right-0 border-t border-line/70" style={{ bottom: `${(t / top) * 100}%` }}>
            <span className="absolute -left-0 -translate-y-1/2 font-mono text-[10px] text-ink-2">{t}</span>
          </div>
        ))}
        {data.map((d, i) => (
          <div
            key={d.label}
            className="relative flex items-end justify-center h-full"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <div
              className="w-[70%] max-w-6 rounded-t-[4px] transition-all"
              style={{
                height: `${(d.value / top) * 100}%`,
                minHeight: d.value ? 2 : 0,
                background: color,
                opacity: hover === null || hover === i ? 1 : 0.45,
              }}
            />
            {hover === i && <Tooltip text={d.detail ?? `${d.label}: ${d.value}`} />}
          </div>
        ))}
      </div>
      <div className="grid gap-[2px] pl-6 mt-1.5" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
        {data.map((d) => (
          <span key={d.label} className="text-center font-mono text-[11px] text-ink-2">{d.label}</span>
        ))}
      </div>
      {xLabel && <p className="text-center text-xs text-ink-2 mt-1">{xLabel}</p>}
    </div>
  )
}

export function LevelBadge({ level }: { level: { label: string; color: string; icon: string } }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-0.5 text-xs font-semibold text-ink">
      <span className="w-4 h-4 rounded-full grid place-items-center text-[10px] text-white" style={{ background: level.color }}>
        {level.icon}
      </span>
      {level.label}
    </span>
  )
}
