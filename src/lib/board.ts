import type { Field } from '../model/Field'

export function computeJitterScale(field: Field): number {
  const { black, white } = field.Score()
  const m = Math.max(black, white)
  return Math.min(5, Math.max(1, Math.ceil(m / 200)))
}

