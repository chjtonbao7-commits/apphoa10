import type { Analysis } from '@/lib/analysis'
import { LEVELS } from '@/lib/analysis'
import { LevelBadge } from './charts'

/** Personalised analysis: strengths, gaps and next steps for one student. */
export function AnalysisCard({ analysis, compact = false }: { analysis: Analysis; compact?: boolean }) {
  const cols = [
    { title: 'Điểm mạnh', items: analysis.strengths, empty: 'Chưa có dữ liệu.' },
    { title: 'Cần củng cố', items: analysis.gaps, empty: 'Không phát hiện lỗ hổng.' },
    { title: 'Bước tiếp theo', items: analysis.next, empty: 'Đã hoàn thành tất cả — thử thách bạn bè nhé!' },
  ]
  return (
    <div>
      {!compact && (
        <div className="flex items-center gap-4 mb-4">
          <div className="font-display text-4xl font-bold">
            {analysis.index}
            <span className="text-lg text-ink-2">/100</span>
          </div>
          <LevelBadge level={LEVELS[analysis.level]} />
        </div>
      )}
      <div className="grid md:grid-cols-3 gap-4">
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-xs font-mono uppercase tracking-wider text-ink-2 mb-2">{c.title}</h4>
            <ul className="space-y-1.5 text-sm">
              {(c.items.length ? c.items : [c.empty]).map((t) => (
                <li key={t} className="leading-snug">• {t}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
