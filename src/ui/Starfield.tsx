import { useEffect, useRef } from 'react'
import { useStore } from '@/state/store'

interface Star { x: number; y: number; vx: number; vy: number; r: number; opacity: number }
interface Trace { x1: number; y1: number; x2: number; y2: number; opacity: number; color: string }

const TRACE_COLORS = ['#00d4ff', '#a855f7', '#10b981', '#f59e0b']

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useStore(s => s.save.settings.reducedMotion)
  const ambientEffects = useStore(s => s.save.settings.ambientEffects)

  useEffect(() => {
    if (reducedMotion || !ambientEffects) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    let raf = 0
    let lastTime = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Stars
    const stars: Star[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
    }))

    // Circuit traces (static)
    const traces: Trace[] = Array.from({ length: 12 }, () => {
      const x1 = Math.random() * window.innerWidth
      const y1 = Math.random() * window.innerHeight
      const horiz = Math.random() > 0.5
      return {
        x1, y1,
        x2: horiz ? x1 + (Math.random() * 200 + 50) : x1,
        y2: horiz ? y1 : y1 + (Math.random() * 200 + 50),
        opacity: Math.random() * 0.12 + 0.04,
        color: TRACE_COLORS[Math.floor(Math.random() * TRACE_COLORS.length)],
      }
    })

    const draw = (time: number) => {
      if (time - lastTime < 33) {  // cap at 30fps
        raf = requestAnimationFrame(draw)
        return
      }
      lastTime = time

      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      // Draw circuit traces
      for (const t of traces) {
        ctx.beginPath()
        ctx.strokeStyle = t.color
        ctx.globalAlpha = t.opacity
        ctx.lineWidth = 1
        ctx.moveTo(t.x1, t.y1)
        ctx.lineTo(t.x2, t.y2)
        ctx.stroke()
        // Node dots
        ctx.globalAlpha = t.opacity * 2
        ctx.fillStyle = t.color
        ctx.beginPath()
        ctx.arc(t.x1, t.y1, 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(t.x2, t.y2, 2, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw stars
      ctx.globalAlpha = 1
      for (const s of stars) {
        s.x += s.vx
        s.y += s.vy
        if (s.x < 0) s.x = W
        if (s.x > W) s.x = 0
        if (s.y < 0) s.y = H
        if (s.y > H) s.y = 0

        ctx.globalAlpha = s.opacity
        ctx.fillStyle = '#a5c4e8'
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    // Pause when tab is hidden
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf)
      else raf = requestAnimationFrame(draw)
    }
    document.addEventListener('visibilitychange', onVisibility)
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reducedMotion, ambientEffects])

  if (reducedMotion || !ambientEffects) {
    return <div style={{ position: 'fixed', inset: 0, background: 'var(--color-bg)', zIndex: 0, pointerEvents: 'none' }} />
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    />
  )
}
