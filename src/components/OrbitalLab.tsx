import { useState } from 'react'
import { CheckCircle2, ExternalLink, Lightbulb, RotateCcw } from 'lucide-react'

import { CELL_CYCLE, CELL_LABEL, ELEMENTS, RULES, SUBSHELLS, emptyDiagram } from '@/lib/chemistry'
import type { Diagram, RuleKey } from '@/lib/chemistry'
import type { Student } from '@/lib/session'
import { submitOrbital } from '@/server/learning.functions'

const TOOLS = [
  { name: 'PhET – Build an Atom', href: 'https://phet.colorado.edu/vi/simulations/build-an-atom' },
  { name: 'Orbital Viewer', href: 'https://www.orbitals.com/orb/ov.htm' },
  { name: 'ChemDoodle Web', href: 'https://web.chemdoodle.com/demos/' },
]

export function OrbitalLab({ student, onChange }: { student: Student; onChange: () => void }) {
  const [z, setZ] = useState(8)
  const [diagram, setDiagram] = useState<Diagram>(emptyDiagram)
  const [result, setResult] = useState<RuleKey[] | null>(null)
  const [busy, setBusy] = useState(false)
  const el = ELEMENTS[z - 1]
  const count = diagram.flat().reduce((n, c) => n + c.length, 0)

  const cycle = (si: number, oi: number) => {
    setResult(null)
    setDiagram((d) =>
      d.map((cells, i) =>
        i !== si ? cells : cells.map((c, j) => (j !== oi ? c : CELL_CYCLE[(CELL_CYCLE.indexOf(c) + 1) % CELL_CYCLE.length])),
      ),
    )
  }

  const check = async () => {
    setBusy(true)
    try {
      const { violations } = await submitOrbital({ data: { studentId: student.id, z, diagram } })
      setResult(violations as RuleKey[])
      onChange()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_18rem] gap-5">
      <div className="bg-card border border-line rounded-2xl p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-amber">Phòng thí nghiệm</p>
            <h2 className="font-display text-2xl font-bold mt-1">Vẽ ô orbital</h2>
          </div>
          <label className="text-sm">
            <span className="text-ink-2 mr-2">Nguyên tố</span>
            <select
              value={z}
              onChange={(e) => {
                setZ(Number(e.target.value))
                setDiagram(emptyDiagram())
                setResult(null)
              }}
              className="border border-line rounded-lg px-3 py-2 bg-white font-medium"
            >
              {ELEMENTS.map((e) => (
                <option key={e.z} value={e.z}>
                  {e.symbol} – {e.name} (Z = {e.z})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-xl border-2 border-ink grid place-items-center relative">
            <span className="absolute top-1 left-2 text-xs font-mono">{el.z}</span>
            <span className="font-display text-3xl font-bold">{el.symbol}</span>
          </div>
          <p className="text-sm text-ink-2 max-w-md leading-relaxed">
            Nhấn vào ô để thêm electron: trống → ↑ → ↑↓ → ↓ → ↑↑. Các phân lớp được xếp theo
            <b> thứ tự mức năng lượng tăng dần</b>. Em đã đặt <b className="text-ink">{count}</b> electron.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-end gap-x-6 gap-y-6">
          {SUBSHELLS.map((s, si) => (
            <div key={s.key} className="text-center">
              <div className="flex">
                {diagram[si].map((c, oi) => (
                  <button
                    key={oi}
                    onClick={() => cycle(si, oi)}
                    aria-label={`Ô ${oi + 1} của phân lớp ${s.key}: ${CELL_LABEL[c] || 'trống'}`}
                    className={`w-12 h-12 -ml-px first:ml-0 border-2 border-ink text-xl font-bold leading-none transition hover:bg-cloud-soft ${
                      c === 'uu' ? 'text-[#d03b3b]' : 'text-ink'
                    }`}
                  >
                    {CELL_LABEL[c]}
                  </button>
                ))}
              </div>
              <div className="mt-1.5 font-mono text-sm">{s.key}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={check}
            disabled={busy || count === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-ink text-white px-5 py-2.5 font-semibold disabled:opacity-40"
          >
            <CheckCircle2 className="w-4 h-4" /> {busy ? 'Thầy đang kiểm tra…' : 'Nhờ Thầy kiểm tra'}
          </button>
          <button
            onClick={() => {
              setDiagram(emptyDiagram())
              setResult(null)
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2.5"
          >
            <RotateCcw className="w-4 h-4" /> Làm lại
          </button>
        </div>

        {result && (
          <div className={`mt-5 rounded-xl p-4 border ${result.length ? 'border-[#ec835a] bg-[#fdf0ea]' : 'border-[#0ca30c] bg-[#ecf8ec]'}`}>
            {result.length === 0 ? (
              <p className="font-medium">
                ✓ Xuất sắc! Ô orbital của {el.symbol} thỏa mãn cả ba quy tắc. Em thử viết cấu hình electron tương ứng và
                so với SGK nhé — {el.symbol} có bao nhiêu electron độc thân?
              </p>
            ) : (
              <>
                <p className="font-medium flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber" /> Gần đúng rồi! Thầy gợi ý:
                </p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {result.map((r) => (
                    <li key={r}>
                      <b>{RULES[r].name}:</b> {RULES[r].hint}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <div className="bg-card border border-line rounded-2xl p-5">
          <h3 className="font-semibold">Ba “luật chơi” của electron</h3>
          <ol className="mt-3 space-y-3 text-sm text-ink-2">
            <li><b className="text-ink">Vững bền:</b> điền từ mức năng lượng thấp lên cao.</li>
            <li><b className="text-ink">Pauli:</b> mỗi AO tối đa 2e, ngược chiều ↑↓.</li>
            <li><b className="text-ink">Hund:</b> trong một phân lớp, ưu tiên electron độc thân, cùng chiều.</li>
          </ol>
        </div>
        <div className="bg-ink text-white rounded-2xl p-5">
          <h3 className="font-semibold">Quan sát AO bằng phần mềm</h3>
          <p className="text-sm text-white/70 mt-1">Mở song song để so sánh hình dạng AO s và p.</p>
          <ul className="mt-3 space-y-2">
            {TOOLS.map((t) => (
              <li key={t.name}>
                <a href={t.href} target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm hover:text-amber">
                  {t.name} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
