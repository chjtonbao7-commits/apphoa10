// Pure, shared analysis of a student's learning record — powers both the
// student's "Kết quả của em" panel and the teacher's class statistics.
import { NLS_TASKS, QUESTIONS, RULES, TOPICS } from './chemistry'
import type { RuleKey, TaskKey, TopicKey } from './chemistry'

export type StudentSummary = {
  id: number
  name: string
  className: string
  messageCount: number
  lastActiveAt: string
  quizAttempts: number
  bestScore: number | null
  latestScore: number | null
  /** Topic correctness from the best attempt: topic -> [correct, total]. */
  topics: Partial<Record<TopicKey, [number, number]>>
  orbitalChecks: number
  orbitalCorrect: string[]
  violations: Partial<Record<RuleKey, number>>
  tasks: { taskKey: TaskKey; evidence: string }[]
}

export type Level = 'good' | 'fair' | 'pass' | 'support'

export const LEVELS: Record<Level, { label: string; color: string; icon: string }> = {
  good: { label: 'Tốt', color: '#0ca30c', icon: '★' },
  fair: { label: 'Khá', color: '#2a78d6', icon: '▲' },
  pass: { label: 'Đạt', color: '#fab219', icon: '●' },
  support: { label: 'Cần hỗ trợ', color: '#d03b3b', icon: '!' },
}

/** Weighted 0–100 index: 50% challenge, 20% orbital lab, 30% digital tasks. */
export function masteryIndex(s: StudentSummary) {
  const quiz = s.bestScore == null ? 0 : s.bestScore / QUESTIONS.length
  const lab = Math.min(s.orbitalCorrect.length, 3) / 3
  const nls = s.tasks.length / NLS_TASKS.length
  return Math.round(quiz * 50 + lab * 20 + nls * 30)
}

export function levelOf(index: number): Level {
  if (index >= 80) return 'good'
  if (index >= 60) return 'fair'
  if (index >= 40) return 'pass'
  return 'support'
}

export type Analysis = {
  index: number
  level: Level
  strengths: string[]
  gaps: string[]
  next: string[]
}

export function analyse(s: StudentSummary): Analysis {
  const index = masteryIndex(s)
  const strengths: string[] = []
  const gaps: string[] = []
  const next: string[] = []

  if (s.bestScore == null) {
    gaps.push('Chưa làm Thử thách kiến thức.')
    next.push('Làm Thử thách 10 câu để Thầy biết em đang ở đâu.')
  } else {
    for (const [key, val] of Object.entries(s.topics) as [TopicKey, [number, number]][]) {
      const [c, t] = val
      if (c === t) strengths.push(`Nắm vững “${TOPICS[key]}”.`)
      else if (c / t < 0.5) gaps.push(`Còn hổng “${TOPICS[key]}” (${c}/${t}).`)
    }
    if (s.bestScore < 7) next.push('Xem lại SGK phần còn hổng rồi làm lại Thử thách.')
  }

  if (s.orbitalCorrect.length >= 3)
    strengths.push(`Vẽ đúng ô orbital của ${s.orbitalCorrect.length} nguyên tố (${s.orbitalCorrect.join(', ')}).`)
  else next.push(`Vẽ đúng thêm ${3 - s.orbitalCorrect.length} nguyên tố trong Phòng thí nghiệm ô orbital.`)

  const topRule = (Object.entries(s.violations) as [RuleKey, number][]).sort((a, b) => b[1] - a[1])[0]
  if (topRule && topRule[1] >= 2) gaps.push(`Hay mắc lỗi “${RULES[topRule[0]].name}” (${topRule[1]} lần).`)

  const done = new Set(s.tasks.map((t) => t.taskKey))
  if (done.size === NLS_TASKS.length) strengths.push('Hoàn thành đủ 4 nhiệm vụ năng lực số.')
  else {
    const missing = NLS_TASKS.filter((t) => !done.has(t.key))
    next.push(`Năng lực số: còn “${missing[0].title}”${missing.length > 1 ? ` và ${missing.length - 1} nhiệm vụ khác` : ''}.`)
  }

  if (s.messageCount >= 5) strengths.push('Chủ động trao đổi với Thầy Schrödinger.')
  else if (s.messageCount === 0) next.push('Hỏi Thầy Schrödinger ít nhất một câu về orbital.')

  return { index, level: levelOf(index), strengths, gaps, next }
}
