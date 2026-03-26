import {
    Cell,
    Grid,
    GridRangeError,
    Point,
    SliceIndex,
    VectorIndex,
} from '.'

export default class GridSlice {
    readonly grid: Grid
    readonly index: SliceIndex

    constructor(grid: Grid, vector_index: VectorIndex, start: number, length: number)
    constructor(grid: Grid, slice_index: SliceIndex)
    constructor(grid: Grid, index: VectorIndex | SliceIndex, start?: number, length?: number) {
        let slice_index: SliceIndex
        if (start !== undefined && length !== undefined && 'axis' in index)
            slice_index = {
                vector: index,
                start,
                length,
            }
        else
            slice_index = index as SliceIndex
        const grid_size = slice_index.vector.axis === 'row' ? grid.width : grid.height
        if (slice_index.start < 0 || slice_index.start + slice_index.length >= grid_size)
            throw new GridRangeError()
        this.grid = grid
        this.index = slice_index
    }

    /**
     * @param index Cell index to get. Allows for selection of border cells.
     * @returns indicated cell, with -1 being the start border and length being the end border
     */
    get(index: number): Cell | null {
        if (index === this.start_index - 1)
            return this.start_border_cell
        if (index === this.end_index + 1)
            return this.end_border_cell
        return this.cells[index - this.start_index] || null
    }

    get start_index(): number {
        return this.index.start
    }

    get length(): number {
        return this.index.length
    }

    get end_index(): number {
        return this.start_index + this.length - 1
    }

    get cells(): readonly Cell[] {
        return this.points.map(point => this.grid.get(point))
    }

    get start_border(): Point {
        if (this.index.vector.axis === 'row')
            return {
                x: this.start_index - 1,
                y: this.index.vector.index,
            }
        else
            return {
                x: this.index.vector.index,
                y: this.start_index - 1,
            }
    }

    get end_border(): Point {
        if (this.index.vector.axis === 'row')
            return {
                x: this.end_index + 1,
                y: this.index.vector.index,
            }
        else
            return {
                x: this.index.vector.index,
                y: this.end_index + 1,
            }
    }

    get start_border_cell(): Cell | null {
        return this.grid.getCell(this.start_border)
    }

    get end_border_cell(): Cell | null {
        return this.grid.getCell(this.end_border)
    }

    get points(): readonly Point[] {
        const positions = []
        const { vector: { axis, index }, start, length } = this.index
        for (let i = start; i < start + length; i++)
            if (axis === 'row')
                positions.push({ x: i, y: index })
            else
                positions.push({ x: index, y: i })
        return positions
    }
}