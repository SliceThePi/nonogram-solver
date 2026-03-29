import {
    Grid,
    GridSlice,
    Rule,
    SliceIndex,
    VectorIndex,
} from '.'

export default class RuleVector extends GridSlice {
    readonly rule: Rule

    constructor(grid: Grid, index: SliceIndex | VectorIndex, blocks: Rule) {
        super(grid, grid.toSliceIndex(index))
        this.rule = Rule.create(blocks)
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
        return this.length - this.minimum_size
    }
}