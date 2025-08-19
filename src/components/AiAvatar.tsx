type Props = {
  src: string
  alt: string
  awaiting?: boolean
}

export default function AiAvatar({ src, alt, awaiting = false }: Props) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', padding: 6, boxSizing: 'border-box', borderRadius: 12, display: 'grid', placeItems: 'center', position: 'relative' }}>
      <img
        src={src}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, filter: 'url(#distortionFilter)' }}
      />
      {awaiting && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', cursor: 'wait' }} />
      )}
    </div>
  )
}

