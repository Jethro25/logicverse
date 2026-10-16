import { type ReactNode, useEffect } from 'react'
import styles from './Modal.module.css'
import { Button } from './Button'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  children: ReactNode
  onClose?: () => void
  footer?: ReactNode
  wide?: boolean
}

export function Modal({ title, children, onClose, footer, wide }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className={styles.overlay} role="dialog" aria-modal aria-label={title} onClick={e => { if (e.target === e.currentTarget && onClose) onClose() }}>
      <div className={[styles.panel, wide ? styles.wide : ''].join(' ')}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
              <X size={18} />
            </Button>
          )}
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  )
}
