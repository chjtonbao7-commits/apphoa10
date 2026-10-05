import { useEffect, useRef, useState } from 'react'
import { Send, Square } from 'lucide-react'
import { Streamdown } from 'streamdown'

import { useAIChat } from '@/lib/ai-hook'
import type { Student } from '@/lib/session'

const STARTERS = [
  'Thầy ơi, electron có chạy theo quỹ đạo tròn không ạ?',
  'Vì sao AO p lại có hình số 8 nổi?',
  'Em muốn tự vẽ ô orbital của oxygen, bắt đầu từ đâu ạ?',
  'Em nên dùng Canva thế nào để làm infographic về ô orbital?',
]

export function Chat({ student }: { student: Student }) {
  const [input, setInput] = useState('')
  const { messages, sendMessage, isLoading, stop, error } = useAIChat(student)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight })
  }, [messages])

  const send = (text: string) => {
    if (!text.trim() || isLoading) return
    sendMessage(text)
    setInput('')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)] min-h-[28rem] bg-card border border-line rounded-2xl overflow-hidden">
      <div ref={scroller} className="flex-1 overflow-y-auto p-5 space-y-5">
        <Bubble role="assistant">
          Chào {student.name.split(' ').at(-1)}! Thầy là Schrödinger — người từng tính toán rằng electron giống một làn
          sóng xác suất hơn là một viên bi. Hôm nay mình cùng khám phá lớp vỏ electron nhé. Theo em, nếu không thể biết
          chính xác electron ở đâu, ta mô tả nó bằng cách nào?
        </Bubble>
        {messages.map((m) => (
          <Bubble key={m.id} role={m.role === 'assistant' ? 'assistant' : 'user'}>
            {m.parts.map((p, i) =>
              p.type === 'text' && p.content ? <Streamdown key={i}>{p.content}</Streamdown> : null,
            )}
          </Bubble>
        ))}
        {isLoading && messages.at(-1)?.role === 'user' && (
          <Bubble role="assistant">
            <span className="text-ink-2 italic">Thầy đang suy nghĩ… (con mèo cũng vậy)</span>
          </Bubble>
        )}
        {error && <p className="text-sm text-[#d03b3b]">Thầy mất kết nối một chút. Em gửi lại câu hỏi nhé.</p>}
      </div>

      {messages.length === 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-left text-sm border border-line rounded-full px-3 py-1.5 hover:border-cloud hover:text-cloud transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="border-t border-line p-3 flex gap-2 bg-paper/50"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi Thầy Schrödinger về orbital, cấu hình electron…"
          className="flex-1 rounded-lg border border-line bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cloud"
        />
        {isLoading ? (
          <button type="button" onClick={stop} className="px-4 rounded-lg border border-line" aria-label="Dừng">
            <Square className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button disabled={!input.trim()} className="px-4 rounded-lg bg-ink text-white disabled:opacity-40" aria-label="Gửi">
            <Send className="w-4 h-4" />
          </button>
        )}
      </form>
    </div>
  )
}

function Bubble({ role, children }: { role: 'assistant' | 'user'; children: React.ReactNode }) {
  const teacher = role === 'assistant'
  return (
    <div className={`flex gap-3 ${teacher ? '' : 'flex-row-reverse'}`}>
      <div
        className={`w-9 h-9 shrink-0 rounded-full grid place-items-center text-sm font-display font-bold ${
          teacher ? 'bg-ink text-white' : 'bg-cloud-soft text-ink'
        }`}
      >
        {teacher ? 'ψ' : 'Em'}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed prose prose-sm ${
          teacher ? 'bg-paper rounded-tl-sm' : 'bg-cloud text-white rounded-tr-sm'
        }`}
      >
        {children}
      </div>
    </div>
  )
}
