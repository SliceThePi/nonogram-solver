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

    get mandatory_cells(): readonly Cell[] {
        return this.block_bounds.flatMap(block => block.mandatory_cells)
    }

    get non_mandatory_cells(): readonly Cell[] {
        const mandatory_cell_set = new Set(this.mandatory_cells)
        return this.cells.filter(cell => !mandatory_cell_set.has(cell))
    }

    get satisfied(): boolean {
        return this.block_bounds.every(block => block.is_fixed) &&
            Cell.allFull(this.mandatory_cells) &&
            Cell.allEmpty(this.non_mandatory_cells)
    }

    initialize(): void {
        let pos = 0
        for (let i = 0; i < this.block_bounds.length; i++) {
            this.block_bounds[i]!.initialize(pos, pos + this.freedom)
            pos += this.rule[i]! + 1
        }
    }

    narrowBlocks(): boolean {
        let updated: boolean = false
        for (const block of this.block_bounds)
            updated = block.narrow() || updated
        return updated
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
        if (this.block_bounds.every(block => block.is_fixed))
            updated = Cell.emptyAll(this.non_mandatory_cells) || updated
        else {
            // empty any cells before the first block
            const last_to_empty_at_start = this.block_bounds[0]!.earliest_start - 1
            if (last_to_empty_at_start >= this.start_index)
                updated = Cell.emptyAll(this.cells.slice(0, last_to_empty_at_start - this.start_index)) || updated
            // empty any cells between adjacent blocks
            for (let i = 0; i < this.block_bounds.length - 1; i++) {
                const first_cell_to_empty = this.block_bounds[i]!.latest_end + 1 - this.start_index
                const last_cell_to_empty = this.block_bounds[i + 1]!.earliest_start - 1 - this.start_index
                if (first_cell_to_empty <= last_cell_to_empty)
                    updated = Cell.emptyAll(this.cells.slice(first_cell_to_empty, last_cell_to_empty + 1)) || updated
            }
            // empty any cells after the last block
            const first_to_empty_at_end: number = this.block_bounds[this.block_bounds.length - 1]!.latest_end + 1
            if (first_to_empty_at_end <= this.end_index)
                updated = Cell.emptyAll(this.cells.slice(first_to_empty_at_end - this.start_index)) || updated
        }
        return updated
    }
}