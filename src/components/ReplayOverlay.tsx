type Props = {
  visible: boolean
  onClick: () => void
}

export default function ReplayOverlay({ visible, onClick }: Props) {
  if (!visible) return null
  return (
    <div
      onClick={onClick}
      style={{ position: 'absolute', inset: 0, background: 'rgba(80, 160, 255, 0.15)', mixBlendMode: 'multiply', cursor: 'pointer' }}
      title="クリックで新規ゲーム"
    />
  )
}

