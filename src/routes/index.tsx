import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Atom, BarChart3, Boxes, MessageCircle, MonitorPlay, Trophy } from 'lucide-react'

import { OrbitalCloud } from '@/components/OrbitalCloud'
import { saveStudent } from '@/lib/session'
import { login } from '@/server/learning.functions'

export const Route = createFileRoute('/')({ component: Home })

const STATIONS = [
  { icon: MessageCircle, title: 'Trò chuyện với Thầy', text: 'Hỏi – đáp gợi mở. Thầy không đưa đáp án, Thầy đưa câu hỏi.' },
  { icon: Boxes, title: 'Phòng thí nghiệm ô orbital', text: 'Tự điền ↑↓ vào ô, kiểm tra theo Pauli, Hund và nguyên lí vững bền.' },
  { icon: Trophy, title: 'Thử thách 10 câu', text: 'Kiểm chứng hiểu biết với 5 chủ đề trọng tâm của bài.' },
  { icon: MonitorPlay, title: 'Nhiệm vụ năng lực số', text: 'PhET, Orbital Viewer, ChemDoodle, Canva – tạo sản phẩm số của riêng em.' },
]

function Home() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [className, setClassName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 2 || !className.trim()) {
      setError('Em hãy nhập đầy đủ họ tên và lớp nhé.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const student = await login({ data: { name, className } })
      saveStudent(student)
      navigate({ to: '/hoc' })
    } catch {
      setError('Thầy chưa kết nối được phòng học. Em thử lại sau giây lát.')
      setBusy(false)
    }
  }

  return (
    <div className="notebook min-h-screen">
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-display text-lg font-bold">
          <Atom className="w-6 h-6 text-amber" /> Thầy Schrödinger
        </div>
        <Link to="/thong-ke" className="text-sm font-medium text-ink-2 hover:text-ink flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4" /> Thống kê lớp (giáo viên)
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        <section className="grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center pt-6 lg:pt-12">
          <div className="rise">
            <p className="font-mono text-xs tracking-widest uppercase text-amber mb-4">
              Hóa học 10 · Bài 3 · NLS 5.3.NC1a
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05]">
              Cấu trúc lớp vỏ <span className="italic text-cloud">electron</span> nguyên tử
            </h1>
            <p className="mt-5 text-lg text-ink-2 max-w-xl leading-relaxed">
              “Chào em! Thầy là Erwin Schrödinger. Electron không chạy trên đường ray nào cả — nó là một đám mây xác
              suất. Cùng Thầy khám phá orbital, tự vẽ ô orbital và tạo sản phẩm số của riêng em nhé.”
            </p>

            <form onSubmit={onSubmit} className="mt-8 bg-card border border-line rounded-2xl p-6 shadow-[0_1px_0_#ddd5c4,0_12px_32px_-18px_rgb(20_33_61/0.35)] max-w-xl">
              <h2 className="font-display text-xl font-bold mb-4">Đăng nhập phòng học</h2>
              <div className="grid sm:grid-cols-[1fr_8rem] gap-3">
                <label className="block">
                  <span className="text-sm font-medium text-ink-2">Họ và tên học sinh</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn An"
                    autoComplete="name"
                    className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cloud"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-ink-2">Lớp</span>
                  <input
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="10A1"
                    className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 uppercase focus:outline-none focus:ring-2 focus:ring-cloud"
                  />
                </label>
              </div>
              {error && <p className="mt-3 text-sm text-[#d03b3b]">{error}</p>}
              <button
                disabled={busy}
                className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-ink text-white px-6 py-3 font-semibold hover:bg-[#1f3160] disabled:opacity-60 transition"
              >
                {busy ? 'Đang mở phòng học…' : 'Vào học cùng Thầy'} <ArrowRight className="w-4 h-4" />
              </button>
              <p className="mt-3 text-xs text-ink-2">Nhập đúng họ tên và lớp để Thầy lưu lại tiến trình của em.</p>
            </form>
          </div>

          <div className="relative rise" style={{ animationDelay: '120ms' }}>
            <OrbitalCloud className="w-full max-w-md mx-auto" />
            <figure className="absolute bottom-2 left-0 right-0 text-center">
              <figcaption className="inline-block bg-card/90 border border-line rounded-full px-4 py-1.5 text-xs font-mono text-ink-2">
                ψ — xác suất tìm thấy electron ≈ 90% trong vùng AO
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATIONS.map((s, i) => (
            <div key={s.title} className="rise bg-card border border-line rounded-xl p-5" style={{ animationDelay: `${200 + i * 70}ms` }}>
              <s.icon className="w-6 h-6 text-cloud" />
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-ink-2 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
