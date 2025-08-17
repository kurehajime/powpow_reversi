import type { Cell } from './types'

// Immutable Field model holding board cells
export class Field {
  private readonly _cells: Cell[]
  private readonly _turn: 1 | -1

  public get Cells(): Readonly<Cell[]> {
    // return a frozen copy to ensure immutability at the edges
    return Object.freeze([...this._cells])
  }
  public get Turn(): 1 | -1 { return this._turn }

  constructor(cells: Cell[], turn: 1 | -1 = 1) {
    this._cells = [...cells]
    this._turn = turn
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
    return new Field(cells, 1)
  }

  // Whether a move at index is valid for current turn
  public CanPlace(index: number): boolean {
    if (index < 0 || index >= this._cells.length) return false
    if (this._cells[index] !== 0) return false
    return this.getFlips(index, this._turn).length > 0
  }

  // Place a stone for current player if valid; otherwise returns self
  public Place(index: number): Field {
    if (!this.CanPlace(index)) return this
    const nextCells = [...this._cells]
    const flips = this.getFlips(index, this._turn)
    // place new stone: 2 points with current player's sign
    nextCells[index] = 2 * this._turn
    // flip captured stones: invert sign and double magnitude
    for (const i of flips) {
      nextCells[i] = -(nextCells[i]) * 2 as Cell
    }
    return new Field(nextCells, this._turn === 1 ? -1 : 1)
  }

  // Compute list of indices to flip for placing at index with given turn
  private getFlips(index: number, turn: 1 | -1): number[] {
    const size = this.Size()
    const x0 = index % size
    const y0 = Math.floor(index / size)
    if (this._cells[index] !== 0) return []
    const flips: number[] = []
    const dirs: Array<[number, number]> = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [-1, -1], [1, -1], [-1, 1],
    ]
    for (const [dx, dy] of dirs) {
      const line: number[] = []
      let x = x0 + dx
      let y = y0 + dy
      while (x >= 0 && x < size && y >= 0 && y < size) {
        const i = x + y * size
        const v = this._cells[i]
        if (v === 0) { // empty ends the line
          line.length = 0
          break
        }
        if ((v * turn) < 0) { // opponent
          line.push(i)
        } else if ((v * turn) > 0) { // own stone closes
          // only valid if we captured at least one opponent
          break
        } else {
          break
        }
        x += dx
        y += dy
      }
      // To be a valid direction, we must end on our own stone (not out of bounds/empty)
      const endX = x
      const endY = y
      if (line.length > 0 && endX >= 0 && endX < size && endY >= 0 && endY < size) {
        const endIdx = endX + endY * size
        const endVal = this._cells[endIdx]
        if ((endVal * turn) > 0) {
          flips.push(...line)
        }
      }
    }
    return flips
  }
}
