import { Field } from '../model/Field'

export type AiResult = { index: number | null, score: number }

const scoreMap = [
  120, -20, 20, 5, 5, 20, -20, 120,
  -20, -40, -5, -5, -5, -5, -40, -20,
  20, -5, 15, 3, 3, 15, -5, 20,
  5, -5, 3, 3, 3, 3, -5, 5,
  5, -5, 3, 3, 3, 3, -5, 5,
  20, -5, 15, 3, 3, 15, -5, 20,
  -20, -40, -5, -5, -5, -5, -40, -20,
  120, -20, 20, 5, 5, 20, -20, 120,
]

// 評価関数（Evaluation Function）
// 仕様は .codex/評価値.md に基づき、以下の3段で計算する:
// 1) ポイント計算値: 1000点到達の勝敗を強く反映（到達側の合計を10倍、未到達は0）
// 2) 地形計算値: 盤上の位置重み（scoreMap）に応じて、石の位置と大きさを評価
// 3) 最終得点: 1 + 2 の合計。正の値は黒有利、負の値は白有利。
function evaluate(field: Field): number {
  // Cells 配列は「黒=正、白=負」、かつ「ひっくり返るたびに倍化」された点数を保持する。
  const cells = field.Cells

  // --- 1) ポイント計算値 ---
  // A: 黒番プレイヤーの合計（正の石の和）
  // B: 白番プレイヤーの合計（負の石の和 -> 負値になる）
  // A', B': それぞれ絶対値が1000以上なら 10倍、未満なら 0 とする
  // ポイント計算値 = A' + B'
  // 補足: Field.Score() は { black: 正値合計, white: 正値合計 } を返すため
  //       B を「負の合計」にするには -white を用いる。
  const { black, white } = field.Score() // 両方とも正値（絶対値）
  const A = black // 黒の総点は正のまま
  const B = -white // 白の総点は負で表現
  const Ap = Math.abs(A) >= 1000 ? (A * 10) : 0
  const Bp = Math.abs(B) >= 1000 ? (B * 10) : 0
  const pointScore = Ap + Bp

  // --- 2) 地形計算値 ---
  // ドキュメント修正により、地形は「石の符号×重み」のみを合算する:
  //   Σ Math.sign(Cells[i]) * scoreMap[i]
  // つまり石の“大きさ（倍率）”は地形評価に影響させず、位置と色のみを反映する。
  //（倍率効果はポイント計算値で強く反映されるため、役割分担を明確化）
  const useScoreMap = scoreMap.length === cells.length // 現在は8x8を想定
  let terrainScore = 0
  for (let i = 0; i < cells.length; i++) {
    const v = cells[i] // 符号付きの石の点数（黒=+, 白=-）
    const w = useScoreMap ? scoreMap[i] : 0 // サイズ不一致時は重み0
    const s = v === 0 ? 0 : (v > 0 ? 1 : -1) // Math.sign を安全に再現
    terrainScore += s * w
  }

  // --- 3) 最終得点 ---
  // 黒有利ほど正、大きいほど好ましい。白有利は負。
  return pointScore + terrainScore
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

  // Depth 0: stop search and return static evaluation of this node
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

// One-ply greedy move: pick the child with best static score
export function thinkGreedy(field: Field): AiResult {
  const legal = field.ListLegalMoves()
  if (legal.length === 0) return { index: null, score: evaluate(field) }
  const maximizing = field.Turn === 1
  let bestIndex: number | null = null
  let bestScore = maximizing ? -1_000_000_000 : 1_000_000_000
  for (const idx of legal) {
    const sc = evaluate(field.Place(idx))
    if (bestIndex === null) { bestIndex = idx; bestScore = sc }
    else if (maximizing ? sc > bestScore : sc < bestScore) { bestIndex = idx; bestScore = sc }
  }
  return { index: bestIndex, score: bestScore }
}
