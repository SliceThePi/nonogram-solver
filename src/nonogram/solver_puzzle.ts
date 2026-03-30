import {
    BlockBounds,
    Cell,
    CellState,
    NonogramError,
    Puzzle,
    PrimitiveGrid,
    RuleVector,
    SolverRuleVector,
    UnsolvableError,
    VectorIndex,
} from '.'
import { binomial } from './utils'

export default class SolverPuzzle extends Puzzle {
    #terminate: boolean = false

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
    #constraintHeuristicFirstPass(rule: RuleVector): number {
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

    abortSolve() {
        this.#terminate = true
    }

    yieldSolve() {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                if (this.#terminate) {
                    this.#terminate = false
                    reject(new NonogramError('Solve terminated'))
                }
                else
                    resolve()
            }, 0)
        })
    }

    static #compareBlocks(a: BlockBounds, b: BlockBounds): number {
        return a.freedom - b.freedom
    }

    async solve() {
        console.warn('Implementation incomplete! Complex puzzles will likely fail to solve.')
        const column_constraints: [RuleVector, number][] = this.columns.map(column =>
            [column, this.#constraintHeuristicFirstPass(column)])
        const row_constraints: [RuleVector, number][] = this.rows.map(row =>
            [row, this.#constraintHeuristicFirstPass(row)])
        const all_constraints = column_constraints.concat(row_constraints).sort(([_, heuristicA], [__, heuristicB]) => heuristicA - heuristicB)
        // indices of blocks within a certain rule or column that have already been chosen for brute force
        const blocks_bruteforced: { vector: VectorIndex, block_index: number, remaining_in_stack: number }[] = []
        const backup_stack: PrimitiveGrid<CellState>[] = []
        let solver_constraints: [SolverRuleVector, number][] = []
        do {
            try {
                let updated: boolean = false
                solver_constraints = all_constraints.map(([vec, heuristic]) => [new SolverRuleVector(vec), heuristic])
                for (const [vec] of solver_constraints) {
                    updated = vec.applyToCells() || updated
                }
                if (!updated) {
                    const blocks = solver_constraints
                        .flatMap(([vec, _heuristic]) => vec.block_bounds.map((block, index) => ({
                            vector: vec.index.vector,
                            block_index: index,
                            block: block,
                        })))
                        // ignore fixed blocks and blocks that have already been chosen for brute force
                        .filter(entry => !entry.block.is_fixed && !blocks_bruteforced.some(entry2 =>
                            entry.block_index === entry2.block_index && entry.vector === entry2.vector
                        ))
                        .sort((a, b) => SolverPuzzle.#compareBlocks(a.block, b.block))
                    if (blocks_bruteforced.length > 0 && blocks_bruteforced[0]!.remaining_in_stack === 0)
                        blocks_bruteforced.shift()
                    // i can't think of a circumstance in which blocks would be empty here
                    blocks_bruteforced.unshift({
                        vector: blocks[0]!.vector,
                        block_index: blocks[0]!.block_index,
                        remaining_in_stack: blocks[0]!.block.start_positions.size
                    })
                    const block = blocks[0]!.block
                    const start_positions = [...block.start_positions]
                    const cells = block.relevant_cells
                    const states = cells.map(cell => cell.state)
                    for (const start of start_positions) {
                        // reset the cells to their previous states before trying the next starting position
                        Cell.setAll(cells, states)
                        block.start_positions.clear()
                        block.start_positions.add(start)
                        block.applyToCells()
                        backup_stack.unshift(this.cell_states)
                    }
                }
            }
            catch (err) {
                if (err instanceof UnsolvableError) {
                    if (backup_stack.length === 0)
                        throw err
                    blocks_bruteforced[0]!.remaining_in_stack--
                    this.cell_states = backup_stack.shift()!
                    solver_constraints = []
                }
                else
                    throw err
            }
            await this.yieldSolve()
        } while (solver_constraints.length === 0 || !solver_constraints.every(([vec, _]) => vec.satisfied))
    }
}