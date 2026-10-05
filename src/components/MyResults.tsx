import { analyse } from '@/lib/analysis'
import type { StudentSummary } from '@/lib/analysis'
import { TOPICS } from '@/lib/chemistry'
import type { TopicKey } from '@/lib/chemistry'
import { AnalysisCard } from './AnalysisCard'
import { HBarChart } from './charts'

export function MyResults({ progress }: { progress: StudentSummary | null }) {
  if (!progress) return <p className="text-ink-2">Đang tải kết quả…</p>
  const analysis = analyse(progress)
  const topicData = (Object.keys(TOPICS) as TopicKey[]).map((k) => {
    const [c, t] = progress.topics[k] ?? [0, 0]
    return { label: TOPICS[k], value: t ? Math.round((c / t) * 100) : 0, detail: t ? `${c}/${t} câu đúng` : 'Chưa làm' }
  })
  const tiles = [
    { label: 'Điểm thử thách cao nhất', value: progress.bestScore == null ? '—' : `${progress.bestScore}/10` },
    { label: 'Lượt làm thử thách', value: progress.quizAttempts },
    { label: 'Nguyên tố vẽ đúng', value: progress.orbitalCorrect.length },
    { label: 'Nhiệm vụ số', value: `${progress.tasks.length}/4` },
  ]
  return (
    <div className="space-y-5 max-w-4xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="bg-card border border-line rounded-xl p-4">
            <div className="font-display text-3xl font-bold">{t.value}</div>
            <div className="text-xs text-ink-2 mt-1">{t.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-card border border-line rounded-2xl p-6">
        <h3 className="font-display text-xl font-bold mb-4">Thầy Schrödinger nhận xét</h3>
        <AnalysisCard analysis={analysis} />
      </div>
      <div className="bg-card border border-line rounded-2xl p-6">
        <h3 className="font-semibold">Mức độ nắm vững theo chủ đề (%)</h3>
        <p className="text-xs text-ink-2 mb-4">Tính từ lượt thử thách tốt nhất của em</p>
        <HBarChart data={topicData} max={100} unit="%" />
      </div>
    </div>
  )
}
