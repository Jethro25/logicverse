export interface WorldMeta {
  id: string
  name: string
  subtitle: string
  syllabusTopics: string[]
  term: 'midterm' | 'finals'
  lessonIds: string[]
  puzzleIds: string[]
  unlocksAfter?: string    // worldId of prerequisite
  palette: {
    accent: string
    bg: string
    glow: string
  }
  icon: string            // emoji or symbol
  description: string
}

export const WORLDS: WorldMeta[] = [
  {
    id: 'w1',
    name: 'Valley of Signals',
    subtitle: 'Where every journey begins',
    syllabusTopics: ['intro'],
    term: 'midterm',
    lessonIds: ['w1-l1', 'w1-l2'],
    puzzleIds: ['w1-p1', 'w1-p2', 'w1-p3', 'w1-p4', 'w1-p5'],
    palette: { accent: '#00d4ff', bg: '#0a1628', glow: '#00d4ff66' },
    icon: '⚡',
    description: 'Learn what digital signals are — 0, 1, ON, OFF — and how inputs become outputs.',
  },
  {
    id: 'w2',
    name: 'Number Nexus',
    subtitle: 'The language of machines',
    syllabusTopics: ['1.1a', '1.1b', '1.1c', '1.1d', '1.1e'],
    term: 'midterm',
    lessonIds: ['w2-l1', 'w2-l2', 'w2-l3', 'w2-l4', 'w2-l5'],
    puzzleIds: ['w2-p1', 'w2-p2', 'w2-p3', 'w2-p4', 'w2-p5', 'w2-p6', 'w2-p7', 'w2-p8', 'w2-p9'],
    unlocksAfter: 'w1',
    palette: { accent: '#a855f7', bg: '#0d0a1e', glow: '#a855f766' },
    icon: '🔢',
    description: 'Binary, octal, hex, 1\'s and 2\'s complement, BCD, Gray code — the number systems of computing.',
  },
  {
    id: 'w3',
    name: 'Gate Gardens',
    subtitle: 'The building blocks of logic',
    syllabusTopics: ['1.2', '1.5'],
    term: 'midterm',
    lessonIds: ['w3-l1', 'w3-l2', 'w3-l3'],
    puzzleIds: ['w3-p1', 'w3-p2', 'w3-p3', 'w3-p4', 'w3-p5', 'w3-p6', 'w3-p7', 'w3-p8'],
    unlocksAfter: 'w2',
    palette: { accent: '#10b981', bg: '#041a12', glow: '#10b98166' },
    icon: '🌿',
    description: 'AND, OR, NOT, NAND, NOR, XOR, XNOR — and how NAND alone can build anything.',
  },
  {
    id: 'w4',
    name: 'Boolean Library',
    subtitle: 'Laws that simplify everything',
    syllabusTopics: ['1.3', '1.4'],
    term: 'midterm',
    lessonIds: ['w4-l1', 'w4-l2'],
    puzzleIds: ['w4-p1', 'w4-p2', 'w4-p3', 'w4-p4', 'w4-p5', 'w4-p6'],
    unlocksAfter: 'w3',
    palette: { accent: '#f59e0b', bg: '#1a1200', glow: '#f59e0b66' },
    icon: '📚',
    description: 'Boolean algebra, De Morgan\'s laws, and simplification — fewer gates, same result.',
  },
  {
    id: 'w5',
    name: 'Karnaugh Caverns',
    subtitle: 'The art of minimization',
    syllabusTopics: ['1.6', '1.7', '1.8'],
    term: 'midterm',
    lessonIds: ['w5-l1', 'w5-l2'],
    puzzleIds: ['w5-p1', 'w5-p2', 'w5-p3', 'w5-p4', 'w5-p5', 'w5-p6'],
    unlocksAfter: 'w4',
    palette: { accent: '#ec4899', bg: '#1a0012', glow: '#ec489966' },
    icon: '🗺',
    description: 'Canonical forms, K-maps and the Quine–McCluskey method — simplify by drawing loops.',
  },
  {
    id: 'w6',
    name: 'Combinational Foundry',
    subtitle: 'Building useful machines',
    syllabusTopics: ['2.1', '2.2', '2.3', '2.4'],
    term: 'midterm',
    lessonIds: ['w6-l1', 'w6-l2', 'w6-l3'],
    puzzleIds: ['w6-p1', 'w6-p2', 'w6-p3', 'w6-p4', 'w6-p5', 'w6-p6'],
    unlocksAfter: 'w5',
    palette: { accent: '#f97316', bg: '#1a0800', glow: '#f9731666' },
    icon: '⚙',
    description: 'Adders, subtractors, decoders, encoders, code converters and the 7-segment display.',
  },
  {
    id: 'w7',
    name: 'MSI Junction',
    subtitle: 'Medium-scale integration',
    syllabusTopics: ['2.5', '2.6', '2.7', '2.8', '3.4', '5'],
    term: 'finals',
    lessonIds: ['w7-l1', 'w7-l2'],
    puzzleIds: ['w7-p1', 'w7-p2', 'w7-p3', 'w7-p4', 'w7-p5'],
    unlocksAfter: 'w6',
    palette: { accent: '#06b6d4', bg: '#001418', glow: '#06b6d466' },
    icon: '🔌',
    description: 'MUX, DEMUX, comparators, ROM, PLA, ALU and memory addressing.',
  },
  {
    id: 'w8',
    name: 'Memory Core',
    subtitle: 'Circuits that remember',
    syllabusTopics: ['3.1', '3.2', '3.3'],
    term: 'finals',
    lessonIds: ['w8-l1', 'w8-l2'],
    puzzleIds: ['w8-p1', 'w8-p2', 'w8-p3', 'w8-p4', 'w8-p5'],
    unlocksAfter: 'w7',
    palette: { accent: '#8b5cf6', bg: '#0d0018', glow: '#8b5cf666' },
    icon: '💾',
    description: 'Latches, flip-flops, clocks, registers and counters — sequential logic.',
  },
  {
    id: 'w9',
    name: 'State Machine Spire',
    subtitle: 'Designing behavior over time',
    syllabusTopics: ['3.5', '3.6', '4'],
    term: 'finals',
    lessonIds: ['w9-l1', 'w9-l2'],
    puzzleIds: ['w9-p1', 'w9-p2', 'w9-p3', 'w9-p4', 'w9-p5'],
    unlocksAfter: 'w8',
    palette: { accent: '#14b8a6', bg: '#001614', glow: '#14b8a666' },
    icon: '🤖',
    description: 'State diagrams, tables, excitation functions, ASM charts, Mealy and Moore machines.',
  },
  {
    id: 'w10',
    name: 'The Final Logicverse',
    subtitle: 'Restore the Digital World',
    syllabusTopics: ['all'],
    term: 'finals',
    lessonIds: [],
    puzzleIds: ['w10-p1', 'w10-p2', 'w10-p3', 'w10-p4', 'w10-p5', 'w10-p6'],
    unlocksAfter: 'w9',
    palette: { accent: '#fbbf24', bg: '#1a1000', glow: '#fbbf2466' },
    icon: '🏆',
    description: 'The final challenge. Repair CORE-9, the malfunctioning supercomputer, using everything you\'ve learned.',
  },
]

export function getWorld(id: string): WorldMeta | undefined {
  return WORLDS.find(w => w.id === id)
}
