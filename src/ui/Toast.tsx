import { useStore } from '@/state/store'
import styles from './Toast.module.css'

export function ToastContainer() {
  const toasts = useStore(s => s.toasts)
  const dismiss = useStore(s => s.dismissToast)

  return (
    <div className={styles.container} aria-live="polite" aria-atomic="false">
      {toasts.map(t => (
        <button
          key={t.id}
          className={[styles.toast, styles[t.type]].join(' ')}
          onClick={() => dismiss(t.id)}
          aria-label={`Dismiss: ${t.message}`}
        >
          {t.message}
        </button>
      ))}
    </div>
  )
}
