// Server-only database helpers — never import from client code.
import { eq, inArray } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { nlsTasks, orbitalAttempts, quizAttempts, students } from '../../db/schema.js'
import type { RuleKey, TaskKey } from '@/lib/chemistry'
import type { StudentSummary } from '@/lib/analysis'

export const touch = (studentId: number) =>
  db.update(students).set({ lastActiveAt: new Date() }).where(eq(students.id, studentId))

/** Builds full summaries for a set of students in four queries. */
export async function summarise(rows: (typeof students.$inferSelect)[]): Promise<StudentSummary[]> {
  if (!rows.length) return []
  const ids = rows.map((r) => r.id)
  const [quizzes, orbitals, tasks] = await Promise.all([
    db.select().from(quizAttempts).where(inArray(quizAttempts.studentId, ids)).orderBy(quizAttempts.createdAt),
    db.select().from(orbitalAttempts).where(inArray(orbitalAttempts.studentId, ids)),
    db.select().from(nlsTasks).where(inArray(nlsTasks.studentId, ids)),
  ])

  return rows.map((r) => {
    const q = quizzes.filter((x) => x.studentId === r.id)
    const best = q.reduce<(typeof q)[number] | null>((b, x) => (!b || x.score >= b.score ? x : b), null)
    const o = orbitals.filter((x) => x.studentId === r.id)
    const violations: Partial<Record<RuleKey, number>> = {}
    for (const a of o) for (const v of a.violations as RuleKey[]) violations[v] = (violations[v] ?? 0) + 1
    return {
      id: r.id,
      name: r.name,
      className: r.className,
      messageCount: r.messageCount,
      lastActiveAt: r.lastActiveAt.toISOString(),
      quizAttempts: q.length,
      bestScore: best?.score ?? null,
      latestScore: q.at(-1)?.score ?? null,
      topics: best?.topics ?? {},
      orbitalChecks: o.length,
      orbitalCorrect: [...new Set(o.filter((a) => a.correct).map((a) => a.element))],
      violations,
      tasks: tasks
        .filter((t) => t.studentId === r.id)
        .map((t) => ({ taskKey: t.taskKey as TaskKey, evidence: t.evidence })),
    }
  })
}
