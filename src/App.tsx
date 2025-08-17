import './App.css'
import GameElement from './components/GameElement'

export default function App() {
  return (
    <div style={{ display: 'grid', alignItems: 'start', justifyItems: 'center', padding: 8, width: '100%' }}>
      <GameElement />
    </div>
  )
}
