import styles from './CreditsScreen.module.css'

interface Props {
  onBack: () => void
}

export function CreditsScreen({ onBack }: Props) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Back">←</button>
        <h1 className={styles.title}>Credits</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.hero}>
          <div className={styles.heroIcon}>⚡</div>
          <h2 className={styles.heroTitle}>LOGICVERSE</h2>
          <p className={styles.heroSub}>Restore the Digital World</p>
        </div>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>About</h3>
          <p className={styles.body}>
            An educational puzzle-adventure game designed to teach <strong>Logic Circuits &amp; Design (CPE 10)</strong> to
            BS Computer Engineering students. Play through 10 worlds covering the full midterm and finals syllabus —
            from digital signals and logic gates to Karnaugh maps, flip-flops, and state machines.
          </p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Development</h3>
          <div className={styles.creditRow}>
            <span className={styles.creditRole}>Game Design &amp; Content</span>
            <span className={styles.creditName}>Jethro</span>
          </div>
          <div className={styles.creditRow}>
            <span className={styles.creditRole}>Engineering &amp; Implementation</span>
            <span className={styles.creditName}>Claude Sonnet (Anthropic)</span>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Technology</h3>
          <div className={styles.techGrid}>
            {[
              ['React 18', 'UI framework'],
              ['TypeScript', 'Type safety'],
              ['Vite 5', 'Build tool'],
              ['Zustand', 'State management'],
              ['CSS Modules', 'Styling'],
            ].map(([name, desc]) => (
              <div key={name} className={styles.techCard}>
                <span className={styles.techName}>{name}</span>
                <span className={styles.techDesc}>{desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Course Reference</h3>
          <p className={styles.body}>
            Curriculum based on the CPE 10 Logic Circuits &amp; Design syllabus covering:
            digital number systems, Boolean algebra, logic gates, combinational circuits,
            K-map minimization, MSI components, and sequential logic.
          </p>
        </section>

        <div className={styles.footer}>
          <p className={styles.footerText}>Built with ❤ for CPE students everywhere.</p>
          <p className={styles.footerText}>LOGICVERSE v1.0 · 2026</p>
        </div>
      </div>
    </div>
  )
}
