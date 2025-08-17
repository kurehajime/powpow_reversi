import type { CSSProperties, ReactNode } from 'react'

type Props = {
  show: boolean
  title?: string
  onClose?: () => void
  children: ReactNode
  panelStyle?: CSSProperties
  placement?: 'center-screen' | 'top-of-parent'
}

export default function Modal({ show, title, onClose, children, panelStyle, placement = 'center-screen' }: Props) {
  if (!show) return null
  if (placement === 'center-screen') {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'grid', placeItems: 'center', zIndex: 1000
      }} onClick={onClose}
      >
        <div style={{ background: '#fff', padding: 16, borderRadius: 8, minWidth: 300, ...panelStyle }} onClick={(e) => e.stopPropagation()}>
          {title && <h2 style={{ marginTop: 0 }}>{title}</h2>}
          {children}
        </div>
      </div>
    )
  }
  // placement === 'top-of-parent': render overlay within parent box
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 1000
    }} onClick={onClose}
    >
      <div
        style={{
          position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)',
          background: '#fff', padding: 16, borderRadius: 8, minWidth: 300, ...panelStyle
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 style={{ marginTop: 0 }}>{title}</h2>}
        {children}
      </div>
    </div>
  )
}
