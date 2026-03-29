import { describe, it, expect } from 'vitest'

import {
    NonogramParseError,
    Parser,
    Puzzle,
    SolverPuzzle,
} from '../../nonogram'

import { binomial } from '../../nonogram/utils'

import fs from 'fs'

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

describe('Parser', () => {
    it('errors when parsing an invalid puzzle string', () => {
        const loaded = 'asdf'
        expect(() => Parser.parse(loaded)).toThrow(NonogramParseError)
    })
    it('parses a valid puzzle string correctly (cells only)', () => {
        const parsed = Parser.parse(
            'CELLS 5 5\n' +
            '#####\n' +
            '.....;\n' +
            '     ;\n' +
            '#. .#;\n' +
            ' .#. ;\n'
        )
        expect(parsed).toBeInstanceOf(Puzzle)
        expect(parsed.cell_states).toStrictEqual([
            [true, true, true, true, true],
            [false, false, false, false, false],
            [undefined, undefined, undefined, undefined, undefined],
            [true, false, undefined, false, true],
            [undefined, false, true, false, undefined],
        ])
        expect(parsed.row_rules).toStrictEqual([
            [],
            [],
            [],
            [],
            [],
        ])
        expect(parsed.column_rules).toStrictEqual([
            [],
            [],
            [],
            [],
            [],
        ])
    })
    it('parses a valid puzzle string correctly (rows and columns only)', () => {
        const parsed = Parser.parse(
            'COLUMNS 3\n' +
            '1 1\n' +
            '4\n' +
            '1 2\n' +
            'ROWS 4\n' +
            '2\n' +
            '2\n' +
            '2\n' +
            '3'
        )
        expect(parsed).toBeInstanceOf(Puzzle)
        expect(parsed.cell_states).toStrictEqual([
            [undefined, undefined, undefined],
            [undefined, undefined, undefined],
            [undefined, undefined, undefined],
            [undefined, undefined, undefined],
        ])
        expect(parsed.row_rules).toStrictEqual([
            [2],
            [2],
            [2],
            [3],
        ])
        expect(parsed.column_rules).toStrictEqual([
            [1, 1],
            [4],
            [1, 2],
        ])
    })
})

describe('SolverPuzzle', () => {
    it('solves a simple puzzle correctly', async () => {
        const solver = new SolverPuzzle(new Puzzle(
            [[2], [1], [2]],
            [[3], [1, 1]],
        ))
        await solver.solve()
        expect(solver.cell_states).toStrictEqual([
            [true, true, true],
            [true, false, true],
        ])
    })
    it('solves the simple test puzzle correctly', async () => {
        const input = fs.readFileSync('./src/__tests__/nonogram/test1.nonogram', 'utf-8')
        const test_puzzle = Parser.parse(input)
        const solver_puzzle = new SolverPuzzle(new Puzzle(test_puzzle.column_rules, test_puzzle.row_rules))
        expect(solver_puzzle.row_rules).toStrictEqual(test_puzzle.row_rules)
        expect(solver_puzzle.column_rules).toStrictEqual(test_puzzle.column_rules)
        setTimeout(() => solver_puzzle.abortSolve(), 4000)
        await expect(solver_puzzle.solve()).resolves.not.toThrow()
        expect(solver_puzzle.cell_states).toStrictEqual(test_puzzle.cell_states)
    })
    it('solves the complex test puzzle correctly', async () => {
        const input = fs.readFileSync('./src/__tests__/nonogram/test2.nonogram', 'utf-8')
        const test_puzzle = Parser.parse(input)
        const solver_puzzle = new SolverPuzzle(new Puzzle(test_puzzle.column_rules, test_puzzle.row_rules))
        expect(solver_puzzle.row_rules).toStrictEqual(test_puzzle.row_rules)
        expect(solver_puzzle.column_rules).toStrictEqual(test_puzzle.column_rules)
        setTimeout(() => solver_puzzle.abortSolve(), 4000)
        await expect(solver_puzzle.solve()).resolves.not.toThrow()
        expect(solver_puzzle.cell_states).toStrictEqual(test_puzzle.cell_states)
    })
})