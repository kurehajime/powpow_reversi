type Props = {
  show: boolean
  title?: string
  onClose?: () => void
  children: React.ReactNode
}

export default function Modal({ show, title, onClose, children }: Props) {
  if (!show) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'grid', placeItems: 'center', zIndex: 1000
    }} onClick={onClose}
    >
      <div style={{ background: '#fff', padding: 16, borderRadius: 8, minWidth: 300 }} onClick={(e) => e.stopPropagation()}>
        {title && <h2 style={{ marginTop: 0 }}>{title}</h2>}
        {children}
      </div>
    </div>
  )
}

