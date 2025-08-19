type Props = {
  humanSide: 1 | -1
  depth: number
  onStart: () => void
  onChangeSide: (side: 1 | -1) => void
  onChangeDepth: (d: number) => void
}

export default function StartSettingsPanel({ humanSide, depth, onStart, onChangeSide, onChangeDepth }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, border: '2px solid #bbb', borderRadius: 8, width: '100%', height: '100%', boxSizing: 'border-box', justifyContent: 'center', fontWeight: 700 }}>
      <button style={{ fontWeight: 900 }} onClick={onStart}>ゲームスタート</button>
      <div>
        <span style={{ fontWeight: 700 }}>Player:</span>
        <label style={{ marginLeft: 8 }}>
          <input type="radio" name="side" checked={humanSide === 1} onChange={() => onChangeSide(1)} /> Black
        </label>
        <label style={{ marginLeft: 8 }}>
          <input type="radio" name="side" checked={humanSide === -1} onChange={() => onChangeSide(-1)} /> White
        </label>
      </div>
      <div>
        <span style={{ fontWeight: 700 }}>AI:</span>
        <div style={{ display: 'inline-block', position: 'relative', marginLeft: 8 }}>
          <select
            value={depth}
            onChange={(e) => onChangeDepth(Number(e.target.value))}
            style={{
              padding: '8px 40px 8px 12px',
              borderRadius: 12,
              border: '2px solid #bbb',
              background: '#ffffff',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <option value={0}>Lv.0 ひよこ</option>
            <option value={1}>Lv.1 ウサギ</option>
            <option value={2}>Lv.2 ネコ</option>
            <option value={3}>Lv.3 オオカミ</option>
            <option value={4}>Lv.4 くま</option>
            <option value={5}>Lv.5 ライオン</option>
            <option value={6}>Lv.6 ドラゴン</option>
          </select>
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666' }}>▼</span>
        </div>
      </div>
    </div>
  )
}

