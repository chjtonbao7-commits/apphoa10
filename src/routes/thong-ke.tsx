import { Fragment, useMemo, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Atom, ChevronDown, Download, Users } from 'lucide-react'
import { z } from 'zod'

import { AnalysisCard } from '@/components/AnalysisCard'
import { ColumnChart, HBarChart, LevelBadge } from '@/components/charts'
import { LEVELS, analyse } from '@/lib/analysis'
import type { Level, StudentSummary } from '@/lib/analysis'
import { NLS_TASKS, QUESTIONS, RULES, TOPICS } from '@/lib/chemistry'
import type { RuleKey, TopicKey } from '@/lib/chemistry'
import { getClassStats, listClasses } from '@/server/learning.functions'

export const Route = createFileRoute('/thong-ke')({
  validateSearch: z.object({ lop: z.string().optional() }),
  loaderDeps: ({ search }) => ({ lop: search.lop }),
  loader: async ({ deps }) => {
    const classes = await listClasses()
    const lop = deps.lop ?? classes[0]?.className
    const rows = lop ? await getClassStats({ data: { className: lop } }) : []
    return { classes, lop, rows }
  },
  head: () => ({ meta: [{ title: 'Thống kê lớp · Thầy Schrödinger' }] }),
  component: Stats,
})

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0)

function Stats() {
  const { classes, lop, rows } = Route.useLoaderData()
  const navigate = useNavigate({ from: '/thong-ke' })

  return (
    <div className="notebook min-h-screen">
      <header className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-sm text-ink-2 hover:text-ink">
          <ArrowLeft className="w-4 h-4" /> Trang chủ
        </Link>
        <div className="flex items-center gap-2 font-display font-bold">
          <Atom className="w-5 h-5 text-amber" /> Thống kê kết quả học tập
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-amber">Bài 3 · Cấu trúc lớp vỏ electron · NLS 5.3.NC1a</p>
            <h1 className="font-display text-4xl font-bold mt-1">{lop ? `Lớp ${lop}` : 'Chưa có lớp nào'}</h1>
          </div>
          {classes.length > 0 && (
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Chọn lớp">
              {classes.map((c) => (
                <button
                  key={c.className}
                  onClick={() => navigate({ search: { lop: c.className } })}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium border transition ${
                    c.className === lop ? 'bg-ink text-white border-ink' : 'bg-card border-line hover:border-ink-2'
                  }`}
                >
                  {c.className} <span className="opacity-60">· {c.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="mt-10 bg-card border border-line rounded-2xl p-10 text-center">
            <Users className="w-8 h-8 mx-auto text-ink-2" />
            <p className="mt-3 text-ink-2">
              Chưa có học sinh nào đăng nhập. Chia sẻ đường dẫn trang chủ để học sinh vào học cùng Thầy Schrödinger.
            </p>
          </div>
        ) : (
          <ClassReport rows={rows} lop={lop!} />
        )}
      </main>
    </div>
  )
}

function ClassReport({ rows, lop }: { rows: StudentSummary[]; lop: string }) {
  const [open, setOpen] = useState<number | null>(null)
  const data = useMemo(() => {
    const analyses = rows.map((r) => ({ r, a: analyse(r) }))
    const tested = rows.filter((r) => r.bestScore != null)
    const avg = tested.length ? tested.reduce((s, r) => s + r.bestScore!, 0) / tested.length : 0

    const dist = Array.from({ length: QUESTIONS.length + 1 }, (_, score) => {
      const n = tested.filter((r) => r.bestScore === score).length
      return { label: String(score), value: n, detail: `${score} điểm: ${n} học sinh` }
    })

    const topics = (Object.keys(TOPICS) as TopicKey[]).map((k) => {
      let c = 0
      let t = 0
      for (const r of tested) {
        const v = r.topics[k]
        if (v) {
          c += v[0]
          t += v[1]
        }
      }
      return { label: TOPICS[k], value: pct(c, t), detail: `${c}/${t} câu trả lời đúng` }
    })

    const tasks = NLS_TASKS.map((t) => {
      const n = rows.filter((r) => r.tasks.some((x) => x.taskKey === t.key)).length
      return { label: t.title, value: pct(n, rows.length), detail: `${n}/${rows.length} học sinh đã nộp` }
    })

    const rules = (Object.keys(RULES) as RuleKey[]).map((k) => {
      const n = rows.reduce((s, r) => s + (r.violations[k] ?? 0), 0)
      return { label: RULES[k].name, value: n, detail: `${n} lượt vi phạm` }
    })

    const levels = (Object.keys(LEVELS) as Level[]).map((l) => ({
      level: l,
      n: analyses.filter((x) => x.a.level === l).length,
    }))

    return { analyses, tested, avg, dist, topics, tasks, rules, levels }
  }, [rows])

  const fullNls = rows.filter((r) => r.tasks.length === NLS_TASKS.length).length
  const tiles = [
    { label: 'Học sinh tham gia', value: rows.length },
    { label: 'Điểm thử thách TB', value: data.tested.length ? data.avg.toFixed(1) : '—', sub: `${data.tested.length} HS đã làm` },
    { label: 'Đạt ≥ 5 điểm', value: `${pct(data.tested.filter((r) => r.bestScore! >= 5).length, data.tested.length)}%` },
    { label: 'Hoàn thành đủ NLS', value: `${pct(fullNls, rows.length)}%`, sub: `${fullNls}/${rows.length} học sinh` },
  ]

  const exportCsv = () => {
    const head = ['Họ và tên', 'Lớp', 'Điểm cao nhất', 'Số lượt', 'Nguyên tố vẽ đúng', 'Nhiệm vụ số', 'Tin nhắn', 'Chỉ số', 'Xếp loại']
    const lines = data.analyses.map(({ r, a }) =>
      [r.name, r.className, r.bestScore ?? '', r.quizAttempts, r.orbitalCorrect.join(' '), r.tasks.length, r.messageCount, a.index, LEVELS[a.level].label]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    )
    const blob = new Blob(['﻿' + [head.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `ket-qua-lop-${lop}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="mt-8 space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="bg-card border border-line rounded-xl p-4">
            <div className="font-display text-3xl font-bold">{t.value}</div>
            <div className="text-xs text-ink-2 mt-1">{t.label}</div>
            {t.sub && <div className="text-[11px] text-ink-2/80 font-mono mt-0.5">{t.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title="Phân bố điểm thử thách" sub="Số học sinh theo điểm cao nhất (thang 10)">
          <ColumnChart data={data.dist} xLabel="Điểm" />
        </Panel>
        <Panel title="Xếp loại năng lực" sub="Chỉ số tổng hợp: 50% thử thách · 20% ô orbital · 30% năng lực số">
          <div className="flex h-8 rounded-[4px] overflow-hidden gap-[2px] bg-card">
            {data.levels.filter((l) => l.n).map((l) => (
              <div
                key={l.level}
                title={`${LEVELS[l.level].label}: ${l.n} học sinh`}
                style={{ flex: l.n, background: LEVELS[l.level].color }}
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {data.levels.map((l) => (
              <div key={l.level} className="flex items-center justify-between text-sm">
                <LevelBadge level={LEVELS[l.level]} />
                <span className="font-mono">{l.n} HS · {pct(l.n, rows.length)}%</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Mức nắm vững theo chủ đề" sub="Tỉ lệ câu trả lời đúng của cả lớp (%)">
          <HBarChart data={data.topics} max={100} unit="%" />
        </Panel>
        <Panel title="Hoàn thành nhiệm vụ năng lực số" sub="Tỉ lệ học sinh đã nộp minh chứng (%)">
          <HBarChart data={data.tasks} max={100} unit="%" />
        </Panel>
        <Panel title="Lỗi quy tắc thường gặp khi vẽ ô orbital" sub="Tổng số lượt vi phạm trong Phòng thí nghiệm">
          <HBarChart data={data.rules} color="#eb6834" />
        </Panel>
        <Panel title="Gợi ý cho giáo viên" sub="Rút ra từ dữ liệu của lớp">
          <ClassInsights topics={data.topics} rules={data.rules} tasks={data.tasks} support={data.levels.find((l) => l.level === 'support')!.n} />
        </Panel>
      </div>

      <div className="bg-card border border-line rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <div>
            <h3 className="font-semibold">Phân tích cá nhân hóa</h3>
            <p className="text-xs text-ink-2">Nhấn vào từng học sinh để xem nhận xét chi tiết</p>
          </div>
          <button onClick={exportCsv} className="inline-flex items-center gap-1.5 text-sm border border-line rounded-lg px-3 py-2 hover:bg-paper">
            <Download className="w-4 h-4" /> Xuất CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper text-ink-2 text-xs uppercase tracking-wide">
              <tr>
                {['Học sinh', 'Điểm cao nhất', 'Lượt làm', 'Ô orbital đúng', 'NLS', 'Tin nhắn', 'Chỉ số', 'Xếp loại', ''].map((h) => (
                  <th key={h} className="text-left font-medium px-4 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.analyses.map(({ r, a }) => (
                <Fragment key={r.id}>
                  <tr onClick={() => setOpen(open === r.id ? null : r.id)} className="border-t border-line cursor-pointer hover:bg-paper/60">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 font-mono">{r.bestScore ?? '—'}</td>
                    <td className="px-4 py-3 font-mono">{r.quizAttempts}</td>
                    <td className="px-4 py-3 font-mono">{r.orbitalCorrect.length ? r.orbitalCorrect.join(', ') : '—'}</td>
                    <td className="px-4 py-3 font-mono">{r.tasks.length}/{NLS_TASKS.length}</td>
                    <td className="px-4 py-3 font-mono">{r.messageCount}</td>
                    <td className="px-4 py-3 font-mono font-semibold">{a.index}</td>
                    <td className="px-4 py-3"><LevelBadge level={LEVELS[a.level]} /></td>
                    <td className="px-4 py-3"><ChevronDown className={`w-4 h-4 transition ${open === r.id ? 'rotate-180' : ''}`} /></td>
                  </tr>
                  {open === r.id && (
                    <tr className="bg-paper/40">
                      <td colSpan={9} className="px-6 py-5">
                        <AnalysisCard analysis={a} compact />
                        {r.tasks.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-xs font-mono uppercase tracking-wider text-ink-2 mb-2">Minh chứng năng lực số</h4>
                            <ul className="space-y-1 text-sm">
                              {r.tasks.map((t) => (
                                <li key={t.taskKey} className="break-words">
                                  <b>{NLS_TASKS.find((x) => x.key === t.taskKey)?.title}:</b>{' '}
                                  {/^https?:\/\//.test(t.evidence) ? (
                                    <a href={t.evidence} target="_blank" rel="noreferrer" className="text-cloud underline">{t.evidence}</a>
                                  ) : (
                                    t.evidence
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Panel({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="bg-card border border-line rounded-2xl p-6">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-xs text-ink-2 mb-5">{sub}</p>
      {children}
    </section>
  )
}

type D = { label: string; value: number }

function ClassInsights({ topics, rules, tasks, support }: { topics: D[]; rules: D[]; tasks: D[]; support: number }) {
  const weakTopic = [...topics].sort((a, b) => a.value - b.value)[0]
  const topRule = [...rules].sort((a, b) => b.value - a.value)[0]
  const weakTask = [...tasks].sort((a, b) => a.value - b.value)[0]
  const items = [
    weakTopic && `Chủ đề yếu nhất: “${weakTopic.label}” (${weakTopic.value}%). Nên dành 5–10 phút đầu tiết sau để củng cố.`,
    topRule?.value ? `Lỗi phổ biến nhất khi vẽ ô orbital: ${topRule.label}. Gợi ý: cho học sinh tự phát hiện lỗi trên ví dụ sai.` : null,
    weakTask && `Nhiệm vụ số ít hoàn thành nhất: “${weakTask.label}” (${weakTask.value}%).`,
    support > 0 ? `${support} học sinh cần hỗ trợ thêm — xem danh sách bên dưới.` : 'Không có học sinh nào ở mức cần hỗ trợ.',
  ].filter(Boolean) as string[]
  return (
    <ul className="space-y-3 text-sm leading-relaxed">
      {items.map((t) => (
        <li key={t} className="flex gap-2"><span className="text-amber">→</span>{t}</li>
      ))}
    </ul>
  )
}
