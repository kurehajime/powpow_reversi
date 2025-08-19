import type { Field } from '../model/Field'

export type ResultText = 'YOU WIN' | 'YOU LOSE' | 'DRAW'

export function resultTextForField(field: Field, humanSide: 1 | -1): ResultText {
  const { black, white } = field.Score()
  if (black === white) return 'DRAW'
  const winner: 1 | -1 = black > white ? 1 : -1
  return winner === humanSide ? 'YOU WIN' : 'YOU LOSE'
}

export function resultColorForText(text: ResultText): string {
  switch (text) {
    case 'YOU WIN':
      return '#4FC3F7' // vivid light blue
    case 'YOU LOSE':
      return '#FF5252' // vivid red
    case 'DRAW':
      return '#FFD740' // vivid amber
  }
}

