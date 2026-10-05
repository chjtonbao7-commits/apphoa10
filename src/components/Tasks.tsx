import { useEffect, useState } from 'react'
import { Check, Save } from 'lucide-react'

import { NLS_TASKS } from '@/lib/chemistry'
import type { TaskKey } from '@/lib/chemistry'
import type { StudentSummary } from '@/lib/analysis'
import type { Student } from '@/lib/session'
import { saveTask } from '@/server/learning.functions'

export function Tasks({
  student,
  progress,
  onChange,
}: {
  student: Student
  progress: StudentSummary | null
  onChange: () => void
}) {
  const saved = Object.fromEntries((progress?.tasks ?? []).map((t) => [t.taskKey, t.evidence])) as Partial<Record<TaskKey, string>>
  const [drafts, setDrafts] = useState<Partial<Record<TaskKey, string>>>({})
  const [busy, setBusy] = useState<TaskKey | null>(null)

  useEffect(() => {
    setDrafts((d) => ({ ...saved, ...d }))
  }, [progress])

  const labCorrect = progress?.orbitalCorrect.length ?? 0

  return (
    <div className="max-w-3xl">
      <div className="bg-card border border-line rounded-2xl p-5 mb-5">
        <p className="font-mono text-xs uppercase tracking-widest text-amber">NLS 5.3.NC1a</p>
        <p className="mt-1 text-ink-2 leading-relaxed">
          Sử dụng công cụ số một cách sáng tạo để khám phá và trình bày kiến thức. Hoàn thành 4 nhiệm vụ dưới đây và nộp
          minh chứng (ghi chú hoặc link sản phẩm) để Thầy và giáo viên của em ghi nhận.
        </p>
      </div>
      <ol className="space-y-4">
        {NLS_TASKS.map((t, i) => {
          const done = Boolean(saved[t.key])
          const value = drafts[t.key] ?? ''
          return (
            <li key={t.key} className="bg-card border border-line rounded-2xl p-5">
              <div className="flex gap-4">
                <div className={`w-9 h-9 shrink-0 rounded-full grid place-items-center font-bold ${done ? 'bg-[#0ca30c] text-white' : 'border-2 border-line text-ink-2'}`}>
                  {done ? <Check className="w-5 h-5" /> : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{t.title}</h3>
                  <p className="text-xs font-mono text-cloud mt-0.5">{t.tools}</p>
                  <p className="text-sm text-ink-2 mt-2">{t.detail}</p>
                  {t.key === 'draw' && (
                    <p className="text-sm mt-2">
                      Phòng thí nghiệm: <b>{labCorrect}/3</b> nguyên tố đã vẽ đúng
                      {labCorrect > 0 && ` (${progress?.orbitalCorrect.join(', ')})`}.
                    </p>
                  )}
                  <textarea
                    value={value}
                    onChange={(e) => setDrafts((d) => ({ ...d, [t.key]: e.target.value }))}
                    placeholder={t.placeholder}
                    rows={2}
                    className="mt-3 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cloud"
                  />
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      disabled={busy === t.key || value.trim().length < 3 || value === saved[t.key]}
                      onClick={async () => {
                        setBusy(t.key)
                        try {
                          await saveTask({ data: { studentId: student.id, taskKey: t.key, evidence: value } })
                          onChange()
                        } finally {
                          setBusy(null)
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-ink text-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
                    >
                      <Save className="w-4 h-4" /> {done ? 'Cập nhật' : 'Nộp minh chứng'}
                    </button>
                    {done && <span className="text-sm text-[#0a7a0a]">✓ Đã ghi nhận</span>}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
