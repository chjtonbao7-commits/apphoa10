// Decorative electron-cloud drawing: a probability "dot plot" of an s orbital
// overlaid with a p orbital's two lobes. Deterministic so SSR and client match.

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}

function gaussian(r: () => number) {
  return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r())
}

const rand = rng(42)
const S_DOTS = Array.from({ length: 420 }, () => {
  const a = rand() * Math.PI * 2
  const d = Math.abs(gaussian(rand)) * 38
  return [Math.cos(a) * d, Math.sin(a) * d]
})
const P_DOTS = Array.from({ length: 520 }, () => {
  const side = rand() < 0.5 ? -1 : 1
  const x = side * (34 + Math.abs(gaussian(rand)) * 30)
  const y = gaussian(rand) * 22 * Math.min(1, Math.abs(x) / 50)
  return [x, y]
})

export function OrbitalCloud({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="-160 -160 320 320" className={className} role="img" aria-label="Đám mây electron: AO s hình cầu và AO p hình số 8 nổi">
      <circle r="150" fill="none" stroke="#14213d" strokeOpacity="0.08" strokeDasharray="2 6" />
      <circle r="100" fill="none" stroke="#14213d" strokeOpacity="0.08" strokeDasharray="2 6" />
      <line x1="-150" x2="150" stroke="#14213d" strokeOpacity="0.15" />
      <line y1="-150" y2="150" stroke="#14213d" strokeOpacity="0.15" />
      <text x="140" y="-6" fontSize="10" fill="#52514e" fontFamily="JetBrains Mono">x</text>
      <text x="6" y="-140" fontSize="10" fill="#52514e" fontFamily="JetBrains Mono">y</text>
      <g className="drift">
        {P_DOTS.map(([x, y], i) => (
          <circle key={`p${i}`} cx={x * 1.6} cy={y * 1.6} r="1.3" fill="#d9822b" opacity="0.55" />
        ))}
        {S_DOTS.map(([x, y], i) => (
          <circle key={`s${i}`} cx={x} cy={y} r="1.3" fill="#2a78d6" opacity="0.6" />
        ))}
      </g>
      <circle r="5" fill="#14213d" />
      <text x="-150" y="150" fontSize="11" fill="#2a78d6" fontFamily="JetBrains Mono">● AO s</text>
      <text x="90" y="150" fontSize="11" fill="#d9822b" fontFamily="JetBrains Mono">● AO pₓ</text>
    </svg>
  )
}
