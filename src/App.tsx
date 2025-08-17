import './App.css'
import GameElement from './components/GameElement'

export default function App() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <GameElement />
    </div>
  )
}
