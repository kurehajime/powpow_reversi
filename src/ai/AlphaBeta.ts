import { Field } from '../model/Field'

export type AiResult = { index: number | null, score: number }

// Simple evaluation: positive favors Black, negative favors White
function evaluate(field: Field): number {
  return field.Cells.reduce((s, v) => s + v, 0)
}

export function thinkAlphaBeta(field: Field, depth: number, alphaIn?: number, betaIn?: number): AiResult {
  const alpha0 = alphaIn ?? -1_000_000_000
  const beta0 = betaIn ?? 1_000_000_000
  const maximizing = field.Turn === 1 // Black maximizes, White minimizes

  // terminal by score rule
  if (field.IsEndByScore()) {
    return { index: null, score: evaluate(field) }
  }

  const legal = field.ListLegalMoves()
  // Pass node if no legal moves but opponent has moves
  if (legal.length === 0) {
    if (field.HasAnyMoveFor(field.Turn === 1 ? -1 : 1)) {
      if (depth <= 0) return { index: null, score: evaluate(field) }
      return { index: null, score: thinkAlphaBeta(field.Pass(), depth - 1, alpha0, beta0).score }
    }
    // Both cannot move: terminal
    return { index: null, score: evaluate(field) }
  }

  if (depth <= 0) {
    return { index: null, score: evaluate(field) }
  }

  let bestIndex: number | null = null
  let alpha = alpha0
  let beta = beta0
  let bestScore = maximizing ? -1_000_000_000 : 1_000_000_000

  for (const idx of legal) {
    const child = field.Place(idx)
    const { score } = thinkAlphaBeta(child, depth - 1, alpha, beta)
    if (bestIndex === null) {
      bestIndex = idx
      bestScore = score
    }
    if (maximizing) {
      if (score > bestScore) {
        bestScore = score
        bestIndex = idx
      }
      if (bestScore > alpha) alpha = bestScore
      if (alpha >= beta) break
    } else {
      if (score < bestScore) {
        bestScore = score
        bestIndex = idx
      }
      if (bestScore < beta) beta = bestScore
      if (alpha >= beta) break
    }
  }

  return { index: bestIndex, score: bestScore }
}
