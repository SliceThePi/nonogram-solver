import {
    Cell,
    GridSlice,
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
        if (this.is_fixed) {
            if (this.grid_slice.start_border_cell)
                updated = this.grid_slice.start_border_cell.empty() || updated
            if (this.grid_slice.end_border_cell)
                updated = this.grid_slice.end_border_cell.empty() || updated
        }
        updated = Cell.fillAll(this.mandatory_cells) || updated
        return updated
    }

    get is_fixed(): boolean {
        return this.freedom === 0
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
        return this.latest_start - this.earliest_start
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