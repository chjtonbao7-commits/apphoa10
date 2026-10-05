import { useCallback, useEffect, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Atom, Boxes, LogOut, MessageCircle, MonitorPlay, Sparkles, Trophy } from 'lucide-react'

import { Chat } from '@/components/Chat'
import { MyResults } from '@/components/MyResults'
import { OrbitalLab } from '@/components/OrbitalLab'
import { Quiz } from '@/components/Quiz'
import { Tasks } from '@/components/Tasks'
import type { StudentSummary } from '@/lib/analysis'
import { clearStudent, useStudent } from '@/lib/session'
import type { Student } from '@/lib/session'
import { getMyProgress } from '@/server/learning.functions'

export const Route = createFileRoute('/hoc')({
  head: () => ({ meta: [{ title: 'Phòng học · Thầy Schrödinger' }] }),
  component: Learn,
})

const TABS = [
  { key: 'chat', label: 'Trò chuyện', icon: MessageCircle },
  { key: 'lab', label: 'Ô orbital', icon: Boxes },
  { key: 'quiz', label: 'Thử thách', icon: Trophy },
  { key: 'tasks', label: 'Nhiệm vụ số', icon: MonitorPlay },
  { key: 'results', label: 'Kết quả của em', icon: Sparkles },
] as const
type TabKey = (typeof TABS)[number]['key']

function Learn() {
  const student = useStudent()
  const navigate = useNavigate()

  useEffect(() => {
    if (student === null) navigate({ to: '/' })
  }, [student, navigate])

  if (!student) return <div className="notebook min-h-screen" />
  return <Workspace student={student} />
}

function Workspace({ student }: { student: Student }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabKey>('chat')
  const [progress, setProgress] = useState<StudentSummary | null>(null)

  const refresh = useCallback(() => {
    getMyProgress({ data: { studentId: student.id } }).then((p) => {
      // The stored student was removed from the database: ask them to log in again.
      if (!p) {
        clearStudent()
        navigate({ to: '/' })
      } else setProgress(p)
    })
  }, [student.id, navigate])

  useEffect(refresh, [refresh])

  return (
    <div className="notebook min-h-screen">
      <header className="border-b border-line bg-paper/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-display font-bold">
            <Atom className="w-5 h-5 text-amber" /> <span className="hidden sm:inline">Thầy Schrödinger</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-right leading-tight">
              <b>{student.name}</b>
              <span className="block text-xs text-ink-2">Lớp {student.className}</span>
            </span>
            <button
              onClick={() => {
                clearStudent()
                navigate({ to: '/' })
              }}
              className="p-2 rounded-lg border border-line hover:bg-card"
              aria-label="Đăng xuất"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-5 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                tab === t.key ? 'border-amber text-ink' : 'border-transparent text-ink-2 hover:text-ink'
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-6">
        {/* Chat stays mounted so the conversation survives tab switches */}
        <div className={tab === 'chat' ? '' : 'hidden'}>
          <Chat student={student} />
        </div>
        {tab === 'lab' && <OrbitalLab student={student} onChange={refresh} />}
        {tab === 'quiz' && <Quiz student={student} onChange={refresh} />}
        {tab === 'tasks' && <Tasks student={student} progress={progress} onChange={refresh} />}
        {tab === 'results' && <MyResults progress={progress} />}
      </main>
    </div>
  )
}
