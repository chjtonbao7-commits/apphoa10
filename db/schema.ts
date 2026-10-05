import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const students = pgTable(
  'students',
  {
    id: serial().primaryKey(),
    name: text().notNull(),
    className: text('class_name').notNull(),
    messageCount: integer('message_count').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    lastActiveAt: timestamp('last_active_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('students_name_class_idx').on(t.name, t.className)],
)

/** One attempt at the 10-question challenge. `topics` maps topic key -> [correct, total]. */
export const quizAttempts = pgTable('quiz_attempts', {
  id: serial().primaryKey(),
  studentId: integer('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  score: integer().notNull(),
  total: integer().notNull(),
  topics: jsonb().$type<Record<string, [number, number]>>().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

/** One check of an orbital diagram in the orbital lab. `violations` lists rule keys broken. */
export const orbitalAttempts = pgTable('orbital_attempts', {
  id: serial().primaryKey(),
  studentId: integer('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  element: text().notNull(),
  correct: boolean().notNull(),
  violations: jsonb().$type<string[]>().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

/** Digital-competence (NLS 5.3.NC1a) task evidence submitted by a student. */
export const nlsTasks = pgTable(
  'nls_tasks',
  {
    id: serial().primaryKey(),
    studentId: integer('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    taskKey: text('task_key').notNull(),
    evidence: text().notNull().default(''),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('nls_tasks_student_task_idx').on(t.studentId, t.taskKey)],
)
