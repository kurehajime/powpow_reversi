import './App.css'
import GameElement from './components/GameElement'

export default function App() {
  return (
    <div style={{ display: 'grid', alignItems: 'start', justifyItems: 'center', paddingTop: 4 }}>
      <GameElement />
    </div>
  )
}
