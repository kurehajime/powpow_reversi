export function aiLevelLabel(depth: number): string {
  switch (depth) {
    case 0: return 'Lv.0 ひよこ'
    case 1: return 'Lv.1 ウサギ'
    case 2: return 'Lv.2 ネコ'
    case 3: return 'Lv.3 オオカミ'
    case 4: return 'Lv.4 くま'
    case 5: return 'Lv.5 ライオン'
    case 6: return 'Lv.6 ドラゴン'
    default: return `Lv.${depth}`
  }
}

