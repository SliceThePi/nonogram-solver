import {
    BlockBounds,
    Cell,
    GridSlice,
    Rule,
    RuleVector,
} from '.'

export default class SolverRuleVector extends RuleVector {
    readonly block_bounds: BlockBounds[]

    constructor(rule_vector: RuleVector) {
        super(rule_vector.grid, rule_vector.index, rule_vector.rule)
        this.block_bounds = this.rule.map(length => new BlockBounds(length, this))
        this.initialize()
    }

    /**
     * Calculates the amount of "wiggle room" the blocks have in the grid slice.
     * This is equal to the difference between the length of the grid slice and
     * the minimum size of the rule.
     *
     * For example, if the rule is [2 4 5] and the grid slice is 15 cells long,
     * then the minimum size of the rule is 13, so the function should return
     * 15-13=2 in this case.
     */
    get freedom(): number {
        return this.rule.length - this.minimum_size
    }

    get smallest_block(): number {
        if (this.rule.length === 0)
            return this.length
        return Math.min(...this.rule)
    }

    get largest_block(): number {
        if (this.rule.length === 0)
            return 0
        return Math.max(...this.rule)
    }

    /**
     * The minimum amount of space the contents of the rule occupy
     */
    get minimum_size(): number {
        if (this.rule.length === 0)
            return this.length
        // sum the lengths of the blocks and add the number of gaps between them
        return this.rule.reduce((acc, len) => acc + len, this.rule.length - 1)
    }

    initialize(): void {
        let pos = 0
        for (let i = 0; i < this.block_bounds.length; i++) {
            this.block_bounds[i]!.initialize(pos, pos + this.freedom)
            pos += this.rule[i]! + 1
        }
    }

    /**
     * Fills/empties any cells that are fully constrained by the rule
     * @returns Whether or not any changes were made
     */
    applyToCells(): boolean {
        if (this.block_bounds.length === 0)
            // if there are no blocks, all cells must be empty
            return Cell.emptyAll(this.cells)
        let updated: boolean = this.block_bounds.some(block => block.applyToCells())
        // if all blocks are fixed in position, then any cell outside of a block can be emptied
        if (this.block_bounds.every(block => block.is_fixed)) {
            // how many cells in this.grid_slice before our first block?
            const cells_to_empty_start = this.block_bounds[0]!.earliest_start - this.start_index
            // the cell bordering the block has already been emptied by block_bounds[0].apply_to_cells
            if (cells_to_empty_start > 1)
                updated = Cell.emptyAll(this.cells.slice(0, cells_to_empty_start - 1)) || updated
            for (let i = 0; i < this.block_bounds.length - 1; i++) {
                const first_cell_to_empty = this.block_bounds[i]!.latest_end + 1
                const last_cell_to_empty = this.block_bounds[i + 1]!.earliest_start - 1
                if (first_cell_to_empty <= last_cell_to_empty)
                    updated = Cell.emptyAll(this.cells.slice(first_cell_to_empty, last_cell_to_empty + 1)) || updated
            }
            const last_filled_cell: number = this.block_bounds[this.block_bounds.length - 1]!.latest_end - this.start_index
            if (last_filled_cell < this.end_index - 1)
                updated = Cell.emptyAll(this.cells.slice(last_filled_cell)) || updated
        }
        return updated
    }
}