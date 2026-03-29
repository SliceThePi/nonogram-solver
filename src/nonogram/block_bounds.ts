import {
    Cell,
    GridSlice,
    UnsolvableError,
} from '.'

export default class BlockBounds {
    readonly length: number
    /**
     * Valid starting positions for the block, i.e. positions of the first cell of the block. Updated during solving.
     */
    readonly start_positions: Set<number>
    readonly grid_slice: GridSlice
    #initialized: boolean = false

    constructor(length: number, grid_slice: GridSlice) {
        this.length = length
        this.grid_slice = grid_slice
        this.start_positions = new Set<number>()
    }

    initialize(earliest_start: number, latest_start: number): void {
        this.start_positions.clear()
        for (let i = earliest_start; i <= latest_start; i++)
            this.start_positions.add(i)
        this.narrow()
        this.#initialized = true
    }

    /**
     * Fills/empties any cells that are fully constrained by the block
     * @returns Whether or not any changes were made
     */
    applyToCells(): boolean {
        if (!this.#initialized)
            return false
        let updated = false
        this.narrow()
        if (this.is_fixed) {
            if (this.grid_slice.start_border_cell)
                updated = this.grid_slice.start_border_cell.empty() || updated
            if (this.grid_slice.end_border_cell)
                updated = this.grid_slice.end_border_cell.empty() || updated
        }
        updated = Cell.fillAll(this.mandatory_cells) || updated
        return updated
    }

    /**
     * Based on the current state of the grid slice, eliminates invalid starting positions for this block.
     * - If a cell that would be covered by the block in a given starting position is empty, that starting position can be eliminated.
     * - If a cell that would be a border cell for the block in a given starting position is filled, that starting position can be eliminated.
     * @returns Whether or not any starting positions were eliminated
     */
    narrow(): boolean {
        if (!this.#initialized || this.is_fixed)
            return false
        let updated: boolean = false
        for (const start of this.start_positions)
            if (this.grid_slice.get(start - 1)?.state || this.grid_slice.get(start + this.length)?.state) {
                this.start_positions.delete(start)
                updated = true
            }
            else if (Cell.anyEmpty(this.grid_slice.subslice(start, this.length))) {
                this.start_positions.delete(start)
                updated = true
            }
        if (this.start_positions.size === 0)
            throw new UnsolvableError()
        return updated
    }

    get relevant_cells(): readonly Cell[] {
        if (!this.#initialized)
            return []
        const cells: Set<Cell> = new Set()
        for (const start of this.start_positions)
            for (let i = start - 1; i < start + this.length + 1; i++)
                cells.add(this.grid_slice.get(i)!)
        cells.delete(null)
        return [...cells.values()]
    }

    get is_fixed(): boolean {
        return this.latest_start - this.earliest_start === 0
    }

    get mandatory_cells(): readonly Cell[] {
        const cells: Cell[] = []
        if (!this.#initialized)
            return cells
        // if there are no mandatory cells, the body of this for loop will not be run
        for (let i = this.latest_start; i <= this.earliest_end; i++)
            cells.push(this.grid_slice.get(i)!)
        return cells
    }

    get freedom(): number {
        return this.start_positions.size - 1
    }

    get earliest_start(): number {
        return Math.min(...this.start_positions)
    }

    get latest_start(): number {
        return Math.max(...this.start_positions)
    }

    get earliest_end(): number {
        return this.earliest_start + this.length - 1
    }

    get latest_end(): number {
        return this.latest_start + this.length - 1
    }
}