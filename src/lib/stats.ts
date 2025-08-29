export type PlayerRecord = {
  win: number
  lose: number
  draw: number
}

const KEY = 'powpow_record_v1'

function safeGetStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function getRecord(): PlayerRecord {
  const ls = safeGetStorage()
  if (!ls) return { win: 0, lose: 0, draw: 0 }
  try {
    const raw = ls.getItem(KEY)
    if (!raw) return { win: 0, lose: 0, draw: 0 }
    const obj = JSON.parse(raw)
    const win = Number(obj?.win) || 0
    const lose = Number(obj?.lose) || 0
    const draw = Number(obj?.draw) || 0
    return { win, lose, draw }
  } catch {
    return { win: 0, lose: 0, draw: 0 }
  }
}

export function setRecord(rec: PlayerRecord): PlayerRecord {
  const ls = safeGetStorage()
  if (!ls) return rec
  try {
    ls.setItem(KEY, JSON.stringify(rec))
  } catch { /* noop */ }
  return rec
}

export function updateRecord(result: 'YOU WIN' | 'YOU LOSE' | 'DRAW'): PlayerRecord {
  const cur = getRecord()
  const next: PlayerRecord = { ...cur }
  if (result === 'YOU WIN') next.win += 1
  else if (result === 'YOU LOSE') next.lose += 1
  else next.draw += 1
  return setRecord(next)
}

