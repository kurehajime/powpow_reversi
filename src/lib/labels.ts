import i18n from 'i18next'

export function aiLevelLabel(depth: number): string {
  const key = `level.${depth}`
  return i18n.t(key, { defaultValue: `Lv.${depth}` })
}
