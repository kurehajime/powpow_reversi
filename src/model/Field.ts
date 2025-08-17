import type { Cell } from './types'

// Immutable Field model holding board cells
export class Field {
  private readonly _cells: Cell[]

  public get Cells(): Readonly<Cell[]> {
    // return a frozen copy to ensure immutability at the edges
    return Object.freeze([...this._cells])
  }

  constructor(cells: Cell[]) {
    this._cells = [...cells]
  }

  public Size(): number {
    const n = Math.sqrt(this._cells.length)
    return Number.isInteger(n) ? n : 0
  }

  // Phase 1: provide an initial 8x8 board with the standard Othello starting position.
  // Stone points: initial placement is 2 points as per spec.
  public static Initial(size = 8): Field {
    const len = size * size
    const cells: Cell[] = Array(len).fill(0)
    const mid = size / 2
    const idx = (x: number, y: number) => x + y * size
    // Center four discs
    // White: negative, Black: positive
    cells[idx(mid - 1, mid - 1)] = -2
    cells[idx(mid, mid)] = -2
    cells[idx(mid - 1, mid)] = +2
    cells[idx(mid, mid - 1)] = +2
    return new Field(cells)
  }
}
