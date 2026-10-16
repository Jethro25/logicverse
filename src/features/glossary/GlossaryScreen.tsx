import { useState, useMemo } from 'react'
import styles from './GlossaryScreen.module.css'

interface Term {
  id: string
  term: string
  short: string      // one-line definition
  detail?: string    // longer explanation
  tags: string[]     // e.g. 'gate', 'number', 'boolean', 'sequential'
  symbol?: string    // e.g. '∧', 'A⊕B'
}

const TERMS: Term[] = [
  // ── Gates ──
  { id: 'and', term: 'AND Gate', short: 'Output is 1 only when ALL inputs are 1.', detail: 'Implements logical conjunction. Symbol: A·B or AB. Truth table has a single 1 in the last row.', tags: ['gate'], symbol: '·' },
  { id: 'or', term: 'OR Gate', short: 'Output is 1 when AT LEAST ONE input is 1.', detail: 'Implements logical disjunction. Symbol: A+B. Output is 0 only when both inputs are 0.', tags: ['gate'], symbol: '+' },
  { id: 'not', term: 'NOT Gate', short: 'Inverts its input: 0→1, 1→0.', detail: 'Also called an inverter. Symbol: A′ or Ā. Single input, single output.', tags: ['gate'], symbol: '′' },
  { id: 'nand', term: 'NAND Gate', short: 'NOT-AND: output is 0 only when ALL inputs are 1.', detail: 'Functionally complete — any logic function can be built using only NAND gates.', tags: ['gate'], symbol: '↑' },
  { id: 'nor', term: 'NOR Gate', short: 'NOT-OR: output is 1 only when ALL inputs are 0.', detail: 'Also functionally complete. NOR is the universal gate alongside NAND.', tags: ['gate'], symbol: '↓' },
  { id: 'xor', term: 'XOR Gate', short: 'Output is 1 when inputs are DIFFERENT.', detail: 'Exclusive OR. Symbol: A⊕B. Key building block of adders and comparators.', tags: ['gate'], symbol: '⊕' },
  { id: 'xnor', term: 'XNOR Gate', short: 'Output is 1 when inputs are the SAME.', detail: 'Exclusive NOR. Also called equivalence gate. Symbol: A⊙B.', tags: ['gate'], symbol: '⊙' },

  // ── Boolean Algebra ──
  { id: 'boolean', term: 'Boolean Algebra', short: 'Algebra with only two values: 0 and 1.', detail: 'Defined by George Boole. Operations are AND (·), OR (+), and NOT (′). Governs all digital logic.', tags: ['boolean'] },
  { id: 'demorgans', term: "De Morgan's Laws", short: "̄(A·B) = Ā+B̄ and (A+B)̄ = Ā·B̄", detail: "Key theorems for converting between AND/OR forms. Complement of an AND is OR of complements, and vice versa.", tags: ['boolean'] },
  { id: 'complement', term: 'Complement', short: 'The negation of a variable: A′ = NOT A.', detail: "If A=0, A′=1. If A=1, A′=0. Also called logical inverse.", tags: ['boolean', 'number'], symbol: '′' },
  { id: 'duality', term: 'Duality Principle', short: 'Swap AND↔OR and 0↔1 to get the dual expression.', detail: 'If a Boolean expression is true, its dual is also true. Used to derive new identities from known ones.', tags: ['boolean'] },
  { id: 'minterms', term: 'Minterm', short: 'A product term that is 1 for exactly one input combination.', detail: 'Denoted mᵢ where i is the row number. A sum of minterms is the canonical SOP form.', tags: ['boolean'] },
  { id: 'maxterms', term: 'Maxterm', short: 'A sum term that is 0 for exactly one input combination.', detail: 'Denoted Mᵢ. A product of maxterms is the canonical POS form.', tags: ['boolean'] },
  { id: 'sop', term: 'Sum of Products (SOP)', short: 'Boolean expression as ORs of AND terms.', detail: 'Also called disjunctive normal form. Example: AB + A′C + BC′. Each AND term is called an implicant.', tags: ['boolean'] },
  { id: 'pos', term: 'Product of Sums (POS)', short: 'Boolean expression as ANDs of OR terms.', detail: 'Also called conjunctive normal form. Example: (A+B)(A′+C). Dual of SOP.', tags: ['boolean'] },

  // ── Number Systems ──
  { id: 'binary', term: 'Binary', short: 'Base-2 number system using only 0 and 1.', detail: 'Each digit is a "bit". 8 bits = 1 byte. Position weights are powers of 2: …8, 4, 2, 1.', tags: ['number'], symbol: '₂' },
  { id: 'octal', term: 'Octal', short: 'Base-8 number system using digits 0–7.', detail: 'Each octal digit represents exactly 3 binary bits. Convenient shorthand for binary.', tags: ['number'], symbol: '₈' },
  { id: 'hex', term: 'Hexadecimal', short: 'Base-16 system using digits 0–9 and A–F.', detail: 'Each hex digit represents 4 binary bits (a nibble). Widely used in computing for addresses and colors.', tags: ['number'], symbol: '₁₆' },
  { id: 'ones-comp', term: "1's Complement", short: 'Flip all bits of a binary number.', detail: 'To negate: invert every bit. Has two representations of zero (00…0 and 11…1), which complicates arithmetic.', tags: ['number'] },
  { id: 'twos-comp', term: "2's Complement", short: "Flip all bits then add 1.", detail: "Standard method for representing signed integers. Only one representation of zero. Simplifies subtraction: A−B = A + (−B) where −B is the 2's complement of B.", tags: ['number'] },
  { id: 'bcd', term: 'BCD (Binary Coded Decimal)', short: 'Each decimal digit encoded as 4 bits.', detail: 'Digit 0 = 0000, 9 = 1001. Codes 1010–1111 are invalid. Used in calculators and displays.', tags: ['number'] },
  { id: 'gray', term: 'Gray Code', short: 'Binary code where adjacent values differ by only 1 bit.', detail: 'Also called reflected binary code. Avoids multiple simultaneous bit changes, reducing errors in encoders and ADCs.', tags: ['number'] },
  { id: 'excess3', term: 'Excess-3 Code', short: 'BCD + 3: each decimal digit encoded as its BCD value plus 3.', detail: 'Self-complementing code: complement of digit n is digit (9−n). Useful for BCD arithmetic.', tags: ['number'] },

  // ── Combinational Circuits ──
  { id: 'half-adder', term: 'Half Adder', short: 'Adds two single bits, producing Sum and Carry.', detail: 'Sum = A⊕B, Carry = A·B. Cannot handle carry-in, so two half adders are needed to make a full adder.', tags: ['combinational'] },
  { id: 'full-adder', term: 'Full Adder', short: 'Adds two bits plus a carry-in.', detail: 'Sum = A⊕B⊕Cᵢₙ, Cout = AB + BCᵢₙ + ACᵢₙ. Chained to build ripple-carry or carry-lookahead adders.', tags: ['combinational'] },
  { id: 'decoder', term: 'Decoder', short: 'Converts an n-bit input into one of 2ⁿ outputs.', detail: 'Exactly one output is active for each input combination. Used in memory addressing and demultiplexing.', tags: ['combinational'] },
  { id: 'encoder', term: 'Encoder', short: 'Converts one of 2ⁿ inputs into an n-bit code.', detail: 'Inverse of a decoder. Priority encoder outputs the code for the highest-priority active input.', tags: ['combinational'] },
  { id: 'mux', term: 'Multiplexer (MUX)', short: 'Selects one of N inputs and routes it to output.', detail: '2ⁿ data inputs, n select lines, 1 output. Also called a data selector. Can implement any Boolean function.', tags: ['combinational'] },
  { id: 'demux', term: 'Demultiplexer (DEMUX)', short: 'Routes one input to one of N outputs.', detail: 'Inverse of MUX. 1 input, n select lines, 2ⁿ outputs. Often the same chip as a decoder.', tags: ['combinational'] },

  // ── Sequential ──
  { id: 'flip-flop', term: 'Flip-Flop', short: 'A bistable circuit that stores 1 bit.', detail: 'Output changes only on a clock edge (rising or falling). Types: D, JK, SR, T. The basic building block of registers and counters.', tags: ['sequential'] },
  { id: 'latch', term: 'Latch', short: 'A level-triggered storage element.', detail: 'Changes state while the enable signal is active (not just on an edge). Less predictable than flip-flops in synchronous designs.', tags: ['sequential'] },
  { id: 'register', term: 'Register', short: 'A group of flip-flops storing multi-bit data.', detail: 'An n-bit register holds n bits. Shift registers move bits left or right on each clock cycle.', tags: ['sequential'] },
  { id: 'counter', term: 'Counter', short: 'A sequential circuit that counts clock pulses.', detail: 'Up/down counters, ring counters, Johnson counters. Modulo-N counter resets after N states.', tags: ['sequential'] },

  // ── K-Map / Minimization ──
  { id: 'kmap', term: 'Karnaugh Map (K-Map)', short: 'A visual method for Boolean function minimization.', detail: 'Grid where adjacent cells differ by one variable (Gray code ordering). Group 1s in powers of 2 to find prime implicants.', tags: ['minimization'] },
  { id: 'prime-implicant', term: 'Prime Implicant', short: "A maximal group of 1s in a K-Map that can't be combined further.", detail: 'Essential prime implicant: covers at least one minterm not in any other prime implicant. Must appear in every minimal SOP.', tags: ['minimization'] },

  // ── State Machines ──
  { id: 'fsm', term: 'Finite State Machine (FSM)', short: 'A circuit that cycles through a finite set of states.', detail: 'Defined by: states, inputs, outputs, transitions, and initial state. Implemented with flip-flops + combinational logic.', tags: ['sequential'] },
  { id: 'moore', term: 'Moore Machine', short: 'Outputs depend only on the current state.', detail: 'Simpler to analyze. Output changes 1 clock cycle after the input that caused the state change.', tags: ['sequential'] },
  { id: 'mealy', term: 'Mealy Machine', short: 'Outputs depend on current state AND current inputs.', detail: 'Faster response — output can change immediately with input. Needs fewer states than Moore for the same behavior.', tags: ['sequential'] },
]

const ALL_TAGS = ['gate', 'number', 'boolean', 'combinational', 'minimization', 'sequential'] as const
const TAG_LABELS: Record<string, string> = {
  gate: 'Gates', number: 'Numbers', boolean: 'Boolean', combinational: 'Combinational', minimization: 'Minimization', sequential: 'Sequential',
}

interface Props {
  onBack: () => void
  initialTermId?: string
}

export function GlossaryScreen({ onBack, initialTermId }: Props) {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(initialTermId ?? null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return TERMS.filter(t => {
      const matchesTag = !activeTag || t.tags.includes(activeTag)
      const matchesQuery = !q || t.term.toLowerCase().includes(q) || t.short.toLowerCase().includes(q)
      return matchesTag && matchesQuery
    })
  }, [query, activeTag])

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Back">←</button>
        <h1 className={styles.title}>Glossary</h1>
      </header>

      <div className={styles.searchBar}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search terms…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search glossary"
        />
      </div>

      <div className={styles.tags}>
        <button
          className={styles.tagBtn}
          data-active={activeTag === null}
          onClick={() => setActiveTag(null)}
        >
          All
        </button>
        {ALL_TAGS.map(tag => (
          <button
            key={tag}
            className={styles.tagBtn}
            data-active={activeTag === tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
          >
            {TAG_LABELS[tag]}
          </button>
        ))}
      </div>

      <ul className={styles.list} role="list">
        {filtered.length === 0 && (
          <li className={styles.empty}>No terms match "{query}"</li>
        )}
        {filtered.map(t => {
          const open = expanded === t.id
          return (
            <li key={t.id}>
              <button
                className={styles.termRow}
                data-open={open}
                onClick={() => setExpanded(open ? null : t.id)}
                aria-expanded={open}
              >
                <div className={styles.termMain}>
                  <span className={styles.termName}>{t.term}</span>
                  {t.symbol && <span className={styles.termSymbol}>{t.symbol}</span>}
                </div>
                <span className={styles.termShort}>{t.short}</span>
                <span className={styles.chevron}>{open ? '▲' : '▼'}</span>
              </button>
              {open && t.detail && (
                <div className={styles.termDetail}>{t.detail}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
