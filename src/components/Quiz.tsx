import { useState } from 'react'
import { Lightbulb } from 'lucide-react'

import { QUESTIONS, TOPICS } from '@/lib/chemistry'
import type { QuizResult } from '@/lib/chemistry'
import type { Student } from '@/lib/session'
import { submitQuiz } from '@/server/learning.functions'

export function Quiz({ student, onChange }: { student: Student; onChange: () => void }) {
  const [answers, setAnswers] = useState<number[]>(() => QUESTIONS.map(() => -1))
  const [result, setResult] = useState<QuizResult | null>(null)
  const [busy, setBusy] = useState(false)
  const answered = answers.filter((a) => a >= 0).length

  const submit = async () => {
    setBusy(true)
    try {
      setResult(await submitQuiz({ data: { studentId: student.id, answers } }))
      onChange()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-3xl">
      {result && (
        <div className="mb-6 bg-ink text-white rounded-2xl p-6 flex flex-wrap items-center gap-6">
          <div>
            <div className="font-display text-5xl font-bold">
              {result.score}<span className="text-white/50 text-2xl">/{result.total}</span>
            </div>
            <div className="text-sm text-white/70">câu đúng</div>
          </div>
          <p className="flex-1 min-w-[14rem] text-white/90 leading-relaxed">
            {result.score >= 9
              ? 'Tuyệt vời! Em đã nắm vững bài. Thử giải thích cho bạn bên cạnh bằng một infographic nhé?'
              : result.score >= 6
                ? 'Khá lắm! Các câu đánh dấu cam có gợi ý của Thầy — em đối chiếu SGK rồi làm lại xem sao?'
                : 'Đừng lo, electron cũng cần thời gian để "ổn định". Đọc gợi ý, hỏi Thầy trong mục Trò chuyện, rồi thử lại nhé.'}
          </p>
          <button
            onClick={() => {
              setResult(null)
              setAnswers(QUESTIONS.map(() => -1))
            }}
            className="rounded-lg bg-white text-ink px-4 py-2 font-semibold"
          >
            Làm lại
          </button>
        </div>
      )}

      <ol className="space-y-4">
        {QUESTIONS.map((q, i) => {
          const wrong = result && !result.correct[i]
          return (
            <li key={i} className={`bg-card border rounded-2xl p-5 ${wrong ? 'border-[#ec835a]' : result ? 'border-[#0ca30c]' : 'border-line'}`}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium">
                  <span className="font-mono text-amber mr-2">{String(i + 1).padStart(2, '0')}</span>
                  {q.text}
                </p>
                <span className="shrink-0 text-[11px] font-mono uppercase text-ink-2">{TOPICS[q.topic]}</span>
              </div>
              <div className="mt-3 grid sm:grid-cols-2 gap-2">
                {q.options.map((o, j) => (
                  <label
                    key={j}
                    className={`flex gap-2 items-start rounded-lg border px-3 py-2 text-sm cursor-pointer transition ${
                      answers[i] === j ? 'border-cloud bg-cloud-soft/50' : 'border-line hover:border-ink-2'
                    } ${result ? 'pointer-events-none' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`q${i}`}
                      checked={answers[i] === j}
                      onChange={() => setAnswers((a) => a.map((x, k) => (k === i ? j : x)))}
                      className="mt-1 accent-[#2a78d6]"
                    />
                    <span>
                      <b className="font-mono mr-1">{'ABCD'[j]}.</b>
                      {o}
                    </span>
                  </label>
                ))}
              </div>
              {wrong && (
                <p className="mt-3 text-sm flex gap-2 text-ink">
                  <Lightbulb className="w-4 h-4 text-amber shrink-0 mt-0.5" /> {q.hint}
                </p>
              )}
              {result && !wrong && <p className="mt-3 text-sm text-[#0a7a0a]">✓ Chính xác</p>}
            </li>
          )
        })}
      </ol>

      {!result && (
        <div className="sticky bottom-4 mt-6 flex justify-end">
          <button
            onClick={submit}
            disabled={busy || answered < QUESTIONS.length}
            className="rounded-lg bg-ink text-white px-6 py-3 font-semibold shadow-lg disabled:opacity-50"
          >
            {busy ? 'Đang chấm…' : `Nộp bài (${answered}/${QUESTIONS.length})`}
          </button>
        </div>
      )}
    </div>
  )
}
