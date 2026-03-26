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
}