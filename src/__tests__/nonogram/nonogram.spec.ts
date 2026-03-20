import { describe, it, expect } from 'vitest'

import { Puzzle, Solver } from '../../nonogram/nonogram.ts'

describe('Puzzle', () => {
    it('initializes with correct dimensions', () => {
        const puzzle = new Puzzle(
            [[2], [1], [2]],
            [[2], [1]],
        )
        expect(puzzle.width).toBe(3)
        expect(puzzle.height).toBe(2)
    })
    it('solves a simple puzzle correctly', async () => {
        const solver = new Solver(new Puzzle(
            [[2], [1], [2]],
            [[3], [1, 1]],
        ))
        const solved = await solver.solve()
        expect(solved.cells).toStrictEqual([
            [true, true, true],
            [true, false, true],
        ])
    })
})