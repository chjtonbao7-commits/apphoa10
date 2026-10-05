// Shared chemistry content for Bài 3 – Cấu trúc lớp vỏ electron nguyên tử.
// Used by both the browser (instant feedback) and the server (grading/recording).

export type Element = { z: number; symbol: string; name: string }

export const ELEMENTS: Element[] = [
  { z: 1, symbol: 'H', name: 'Hydrogen' },
  { z: 2, symbol: 'He', name: 'Helium' },
  { z: 3, symbol: 'Li', name: 'Lithium' },
  { z: 4, symbol: 'Be', name: 'Beryllium' },
  { z: 5, symbol: 'B', name: 'Boron' },
  { z: 6, symbol: 'C', name: 'Carbon' },
  { z: 7, symbol: 'N', name: 'Nitrogen' },
  { z: 8, symbol: 'O', name: 'Oxygen' },
  { z: 9, symbol: 'F', name: 'Fluorine' },
  { z: 10, symbol: 'Ne', name: 'Neon' },
  { z: 11, symbol: 'Na', name: 'Sodium' },
  { z: 12, symbol: 'Mg', name: 'Magnesium' },
  { z: 13, symbol: 'Al', name: 'Aluminium' },
  { z: 14, symbol: 'Si', name: 'Silicon' },
  { z: 15, symbol: 'P', name: 'Phosphorus' },
  { z: 16, symbol: 'S', name: 'Sulfur' },
  { z: 17, symbol: 'Cl', name: 'Chlorine' },
  { z: 18, symbol: 'Ar', name: 'Argon' },
  { z: 19, symbol: 'K', name: 'Potassium' },
  { z: 20, symbol: 'Ca', name: 'Calcium' },
]

/** Subshells in order of increasing energy (thứ tự mức năng lượng). */
export const SUBSHELLS = [
  { key: '1s', orbitals: 1 },
  { key: '2s', orbitals: 1 },
  { key: '2p', orbitals: 3 },
  { key: '3s', orbitals: 1 },
  { key: '3p', orbitals: 3 },
  { key: '4s', orbitals: 1 },
  { key: '3d', orbitals: 5 },
] as const

/** Cell state of one orbital box. 'uu' (↑↑) exists so students can make — and learn from — a Pauli mistake. */
export type Cell = '' | 'u' | 'ud' | 'd' | 'uu'
export const CELL_CYCLE: Cell[] = ['', 'u', 'ud', 'd', 'uu']
export const CELL_LABEL: Record<Cell, string> = {
  '': '',
  u: '↑',
  ud: '↑↓',
  d: '↓',
  uu: '↑↑',
}

export type Diagram = Cell[][] // one array of cells per subshell, same order as SUBSHELLS

export const emptyDiagram = (): Diagram =>
  SUBSHELLS.map((s) => Array.from({ length: s.orbitals }, () => '' as Cell))

const electronsIn = (c: Cell) => (c === '' ? 0 : c.length)

export type RuleKey = 'count' | 'aufbau' | 'pauli' | 'hund'

export const RULES: Record<RuleKey, { name: string; hint: string }> = {
  count: {
    name: 'Số electron',
    hint: 'Tổng số electron trong các ô chưa bằng số hiệu nguyên tử Z. Nguyên tử trung hòa có bao nhiêu electron?',
  },
  aufbau: {
    name: 'Nguyên lí vững bền',
    hint: 'Có electron đang ở phân lớp năng lượng cao trong khi phân lớp thấp hơn chưa đầy. Electron ưu tiên vào mức năng lượng nào trước?',
  },
  pauli: {
    name: 'Nguyên lí Pauli',
    hint: 'Có một ô orbital chứa 2 electron cùng chiều. Hai electron trong cùng một AO phải như thế nào?',
  },
  hund: {
    name: 'Quy tắc Hund',
    hint: 'Trong một phân lớp chưa đầy, electron đang ghép đôi quá sớm hoặc các electron độc thân không cùng chiều. Electron "thích" ở riêng hay ở chung trước?',
  },
}

/** Returns the rules a diagram violates for element with atomic number z. Empty array = correct. */
export function checkDiagram(z: number, diagram: Diagram): RuleKey[] {
  const violations = new Set<RuleKey>()
  const counts = diagram.map((cells) => cells.reduce((n, c) => n + electronsIn(c), 0))
  const total = counts.reduce((a, b) => a + b, 0)
  if (total !== z) violations.add('count')

  if (diagram.some((cells) => cells.includes('uu'))) violations.add('pauli')

  // Aufbau: any electron in a subshell while an earlier subshell is not full.
  let seenNotFull = false
  SUBSHELLS.forEach((s, i) => {
    if (seenNotFull && counts[i] > 0) violations.add('aufbau')
    if (counts[i] < s.orbitals * 2) seenNotFull = true
  })

  // Hund: within a partially filled subshell, no pairing before every orbital
  // has one electron, and single electrons point the same way (↑ by convention).
  SUBSHELLS.forEach((s, i) => {
    const cells = diagram[i]
    if (s.orbitals === 1 || counts[i] === 0 || counts[i] === s.orbitals * 2) return
    const paired = cells.filter((c) => c.length === 2).length
    const empty = cells.filter((c) => c === '').length
    if (paired > 0 && empty > 0) violations.add('hund')
    const singles = cells.filter((c) => c.length === 1)
    if (singles.includes('u') && singles.includes('d')) violations.add('hund')
  })

  return [...violations]
}

/** Electron configuration string, e.g. 1s²2s²2p⁴ — used by the teacher answer key, not shown to students. */
export function configuration(z: number): string {
  const sup = '⁰¹²³⁴⁵⁶⁷⁸⁹'
  let left = z
  const parts: string[] = []
  for (const s of SUBSHELLS) {
    if (left <= 0) break
    const n = Math.min(left, s.orbitals * 2)
    parts.push(s.key + String(n).split('').map((d) => sup[+d]).join(''))
    left -= n
  }
  return parts.join('')
}

// ───────────────────────── Challenge questions ─────────────────────────

export type TopicKey = 'model' | 'shape' | 'shell' | 'config' | 'rules'

export const TOPICS: Record<TopicKey, string> = {
  model: 'Mô hình nguyên tử hiện đại',
  shape: 'Hình dạng orbital',
  shell: 'Lớp & phân lớp',
  config: 'Cấu hình electron',
  rules: 'Nguyên lí & quy tắc',
}

export type Question = {
  topic: TopicKey
  text: string
  options: string[]
  answer: number
  /** Socratic nudge shown when the student gets it wrong — never the answer itself. */
  hint: string
}

export const QUESTIONS: Question[] = [
  {
    topic: 'model',
    text: 'Theo mô hình nguyên tử hiện đại, electron chuyển động như thế nào?',
    options: [
      'Theo quỹ đạo tròn xác định quanh hạt nhân',
      'Rất nhanh, không theo quỹ đạo xác định, tạo thành đám mây electron',
      'Đứng yên ở các vị trí cố định',
      'Theo quỹ đạo elip giống các hành tinh',
    ],
    answer: 1,
    hint: 'Nhớ lại: mô hình Bohr bị thay thế vì sao? Ta có thể biết chính xác vị trí electron không?',
  },
  {
    topic: 'model',
    text: 'Orbital nguyên tử (AO) là',
    options: [
      'Đường đi chính xác của electron',
      'Vùng không gian quanh hạt nhân mà xác suất có mặt electron lớn nhất (khoảng 90%)',
      'Hạt nhân của nguyên tử',
      'Một lớp electron chứa tối đa 8 electron',
    ],
    answer: 1,
    hint: 'Từ khóa của Thầy là "xác suất". Xem lại định nghĩa AO trong SGK.',
  },
  {
    topic: 'shape',
    text: 'Orbital s có hình dạng',
    options: ['Hình số 8 nổi', 'Hình cầu', 'Hình hoa bốn cánh', 'Hình đĩa phẳng'],
    answer: 1,
    hint: 'Mở PhET/Orbital Viewer và xoay AO 1s: nó có hướng ưu tiên nào không?',
  },
  {
    topic: 'shape',
    text: 'Phân lớp p có bao nhiêu orbital và chúng có hình dạng gì?',
    options: [
      '1 orbital hình cầu',
      '3 orbital hình số 8 nổi, định hướng theo các trục x, y, z',
      '5 orbital hình số 8 nổi',
      '3 orbital hình cầu lồng nhau',
    ],
    answer: 1,
    hint: 'Có bao nhiêu trục tọa độ trong không gian? Quan sát px, py, pz trên phần mềm.',
  },
  {
    topic: 'shell',
    text: 'Lớp electron thứ n chứa tối đa bao nhiêu electron?',
    options: ['n²', '2n', '2n²', '8'],
    answer: 2,
    hint: 'Thử với lớp 1 (chứa 2e) và lớp 2 (chứa 8e) — công thức nào khớp cả hai?',
  },
  {
    topic: 'shell',
    text: 'Lớp M (n = 3) gồm những phân lớp nào?',
    options: ['3s', '3s, 3p', '3s, 3p, 3d', '3s, 3p, 3d, 3f'],
    answer: 2,
    hint: 'Lớp thứ n có n phân lớp. Đếm xem lớp 3 có mấy phân lớp?',
  },
  {
    topic: 'config',
    text: 'Cấu hình electron của nguyên tử oxygen (Z = 8) là',
    options: ['1s²2s²2p⁴', '1s²2s⁴2p²', '1s²2p⁶', '1s²2s²2p³3s¹'],
    answer: 0,
    hint: 'Điền lần lượt theo thứ tự năng lượng: 1s → 2s → 2p… mỗi phân lớp s chứa tối đa bao nhiêu e?',
  },
  {
    topic: 'config',
    text: 'Nguyên tử potassium (K, Z = 19) có electron cuối cùng điền vào phân lớp',
    options: ['3p', '3d', '4s', '4p'],
    answer: 2,
    hint: 'So sánh mức năng lượng của 3d và 4s — phân lớp nào thấp hơn?',
  },
  {
    topic: 'rules',
    text: 'Theo nguyên lí Pauli, mỗi orbital chứa tối đa',
    options: [
      '1 electron',
      '2 electron cùng chiều tự quay',
      '2 electron ngược chiều tự quay',
      '8 electron',
    ],
    answer: 2,
    hint: 'Hãy nghĩ tới kí hiệu ↑↓ trong một ô orbital.',
  },
  {
    topic: 'rules',
    text: 'Ô orbital phân lớp 2p của nitrogen (Z = 7) đúng quy tắc Hund là',
    options: ['[↑↓][↑][ ]', '[↑][↑][↑]', '[↑↓][↑↓][↑]', '[↑][↓][↑]'],
    answer: 1,
    hint: 'Trong cùng phân lớp, electron ưu tiên ở độc thân hay ghép đôi? Và chiều của chúng?',
  },
]

export type QuizResult = {
  score: number
  total: number
  correct: boolean[]
  topics: Record<string, [number, number]>
}

export function gradeQuiz(answers: number[]): QuizResult {
  const topics: Record<string, [number, number]> = {}
  const correct = QUESTIONS.map((q, i) => answers[i] === q.answer)
  QUESTIONS.forEach((q, i) => {
    const t = (topics[q.topic] ??= [0, 0])
    t[1] += 1
    if (correct[i]) t[0] += 1
  })
  return { score: correct.filter(Boolean).length, total: QUESTIONS.length, correct, topics }
}

// ───────────────────────── Digital-competence tasks (NLS 5.3.NC1a) ─────────────────────────

export type TaskKey = 'observe' | 'draw' | 'product' | 'reflect'

export const NLS_TASKS: { key: TaskKey; title: string; tools: string; detail: string; placeholder: string }[] = [
  {
    key: 'observe',
    title: 'Quan sát hình dạng AO bằng phần mềm',
    tools: 'PhET · Orbital Viewer · ChemDoodle',
    detail: 'Mở mô phỏng, xoay và quan sát AO s, px, py, pz. Ghi lại điều em thấy (hoặc dán link ảnh chụp màn hình).',
    placeholder: 'VD: AO s đối xứng mọi hướng; AO p có 2 thùy nằm dọc trục…',
  },
  {
    key: 'draw',
    title: 'Vẽ ô orbital cho 3 nguyên tố',
    tools: 'Phòng thí nghiệm ô orbital · ChemDoodle',
    detail: 'Hoàn thành đúng ô orbital của ít nhất 3 nguyên tố trong Phòng thí nghiệm, rồi ghi lại nguyên tố em đã vẽ.',
    placeholder: 'VD: Đã vẽ N, O, Cl — khó nhất là…',
  },
  {
    key: 'product',
    title: 'Tạo sản phẩm số: quy trình vẽ ô orbital',
    tools: 'Canva · PowerPoint · CapCut',
    detail: 'Thiết kế Infographic hoặc video ngắn (≤ 90 giây) trình bày 4 bước vẽ ô orbital. Dán link chia sẻ sản phẩm.',
    placeholder: 'https://www.canva.com/design/…',
  },
  {
    key: 'reflect',
    title: 'Tự đánh giá & chia sẻ',
    tools: 'Padlet · Google Classroom',
    detail: 'Em đã dùng công cụ số nào, học được gì, và sẽ cải thiện sản phẩm ra sao?',
    placeholder: 'Em thấy công cụ … giúp em …',
  },
]
