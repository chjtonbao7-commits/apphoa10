import { createServerFn } from '@tanstack/react-start'
import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../../db/index.js'
import { nlsTasks, orbitalAttempts, quizAttempts, students } from '../../db/schema.js'
import { ELEMENTS, NLS_TASKS, QUESTIONS, checkDiagram, gradeQuiz } from '@/lib/chemistry'
import type { Diagram, TaskKey } from '@/lib/chemistry'
import { summarise, touch } from './learning.server'

const clean = (s: string) => s.trim().replace(/\s+/g, ' ')
const normClass = (s: string) => clean(s).toUpperCase()

export const login = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ name: z.string().min(2).max(80), className: z.string().min(1).max(20) }))
  .handler(async ({ data }) => {
    const name = clean(data.name)
    const className = normClass(data.className)
    const [row] = await db
      .insert(students)
      .values({ name, className })
      .onConflictDoUpdate({
        target: [students.name, students.className],
        set: { lastActiveAt: new Date() },
      })
      .returning({ id: students.id, name: students.name, className: students.className })
    return row
  })

export const submitQuiz = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({ studentId: z.number().int(), answers: z.array(z.number().int()).length(QUESTIONS.length) }),
  )
  .handler(async ({ data }) => {
    const result = gradeQuiz(data.answers)
    await db.insert(quizAttempts).values({
      studentId: data.studentId,
      score: result.score,
      total: result.total,
      topics: result.topics,
    })
    await touch(data.studentId)
    return result
  })

const cell = z.enum(['', 'u', 'ud', 'd', 'uu'])

export const submitOrbital = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({ studentId: z.number().int(), z: z.number().int().min(1).max(20), diagram: z.array(z.array(cell)) }),
  )
  .handler(async ({ data }) => {
    const violations = checkDiagram(data.z, data.diagram as Diagram)
    const element = ELEMENTS[data.z - 1].symbol
    await db.insert(orbitalAttempts).values({
      studentId: data.studentId,
      element,
      correct: violations.length === 0,
      violations,
    })
    await touch(data.studentId)
    return { violations }
  })

export const saveTask = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      studentId: z.number().int(),
      taskKey: z.enum(NLS_TASKS.map((t) => t.key) as [TaskKey, ...TaskKey[]]),
      evidence: z.string().min(3).max(2000),
    }),
  )
  .handler(async ({ data }) => {
    await db
      .insert(nlsTasks)
      .values({ studentId: data.studentId, taskKey: data.taskKey, evidence: data.evidence.trim() })
      .onConflictDoUpdate({
        target: [nlsTasks.studentId, nlsTasks.taskKey],
        set: { evidence: data.evidence.trim(), createdAt: new Date() },
      })
    await touch(data.studentId)
    return { ok: true }
  })

export const getMyProgress = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ studentId: z.number().int() }))
  .handler(async ({ data }) => {
    const rows = await db.select().from(students).where(eq(students.id, data.studentId))
    const [summary] = await summarise(rows)
    return summary ?? null
  })

export const listClasses = createServerFn({ method: 'GET' }).handler(async () => {
  return db
    .select({ className: students.className, count: sql<number>`count(*)::int` })
    .from(students)
    .groupBy(students.className)
    .orderBy(students.className)
})

export const getClassStats = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ className: z.string().min(1) }))
  .handler(async ({ data }) => {
    const rows = await db
      .select()
      .from(students)
      .where(eq(students.className, normClass(data.className)))
      .orderBy(students.name)
    return summarise(rows)
  })
