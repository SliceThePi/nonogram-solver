import { describe, it, expect } from 'vitest'

import { Puzzle, SolverPuzzle } from '../../nonogram'

import { binomial } from '../../nonogram/utils'

describe('binomial', () => {
    it('calculates binomial coefficients correctly', () => {
        expect(binomial(5, 2)).toBe(10)
        expect(binomial(2, 1)).toBe(2)
        expect(binomial(5, 3)).toBe(10)
        expect(binomial(0, 0)).toBe(1)
    })
    it('returns 0 for invalid inputs', () => {
        expect(binomial(-1, 2)).toBe(0)
        expect(binomial(5, -1)).toBe(0)
        expect(binomial(5, 6)).toBe(0)
    })
})

describe('Puzzle', () => {
    it('initializes with correct dimensions', () => {
        const puzzle = new Puzzle(
            [[2], [1], [2]],
            [[2], [1]],
        )
        expect(puzzle.width).toBe(3)
        expect(puzzle.height).toBe(2)
    })
})

describe('SolverPuzzle', () => {
    it('solves a simple puzzle correctly', async () => {
        const solver = new SolverPuzzle(new Puzzle(
            [[2], [1], [2]],
            [[3], [1, 1]],
        ))
        await solver.solve()
        expect(solver.cells).toStrictEqual([
            [true, true, true],
            [true, false, true],
        ])
    })
})