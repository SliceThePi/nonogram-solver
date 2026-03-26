import {
    Grid,
    Point,
    Puzzle,
    Rule,
    SolverRuleVector,
    VectorIndex,
} from '.'
import { binomial } from './utils'

export default class SolverPuzzle extends Puzzle {
    constructor(puzzle: Puzzle) {
        super(puzzle.column_rules, puzzle.row_rules)
    }

    /**
     * Calculates a first-pass heuristic for how constrained a row or column
     * is. Lower is better.
     *
     * Used to decide which row or column to solve first.
     * @param block_sizes A column or row rule
     * @param length The length of the column or row
     * @returns A heuristic to minimize
     */
    #constraintHeuristicFirstPass(rule: SolverRuleVector): number {
        /**
         * Number of valid states is exactly equal to n choose k, where n = (blocks + freedom) and k = (blocks).
         * Proof:
         * - we're abstracting out the lengths of the blocks and the 1 mandatory empty space between adjacent blocks
         * - therefore, we can represent the rule as a sequence of n binary choices,
         *      where 1 represents a block and 0 represents a non-mandatory empty cell
         * - there are k blocks, so k of those choices must be 1 and (n-k) must be 0
         * - therefore, the number of valid states is (n choose k)
         */
        return binomial(rule.length + rule.freedom, rule.length)
    }

    async solve() {
        throw new Error('Implementation WIP!')
        const columns = this.columns.map(column => new SolverRuleVector(column))
        const rows = this.rows.map(row => new SolverRuleVector(row))
        const column_constraints: [SolverRuleVector, number][] = columns.map((column, idx) =>
            [column, this.#constraintHeuristicFirstPass(column)])
        const row_constraints: [SolverRuleVector, number][] = rows.map((row, idx) =>
            [row, this.#constraintHeuristicFirstPass(row)])
        const all_constraints = column_constraints.concat(row_constraints).sort(([_, heuristicA], [__, heuristicB]) => heuristicA - heuristicB)
        for (const [vec, _heuristic] of all_constraints) {
            const freedom = vec.freedom + _heuristic
            if (freedom < vec.largest_block) {
            }
        }
    }
}