export const LOG_SEPARATOR = '.'

export function parseLog(s: string): number[] {
  return (s ?? '')
    .trim()
    .split(LOG_SEPARATOR)
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && /^\d+$/.test(t))
    .map((t) => Number(t))
}

export function stringifyLog(moves: number[]): string {
  return moves.join(LOG_SEPARATOR)
}

