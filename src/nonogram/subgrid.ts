import {
    Cell,
    EmptyGridElementError,
    Grid,
    GridRangeError,
    Point,
    SliceIndex,
    SubgridIndex,
    VectorIndex,
} from '.'

export default class Subgrid {
    readonly grid: Grid
    readonly index: SubgridIndex

    constructor(grid: Grid, vector_index: VectorIndex, start?: number, length?: number)
    constructor(grid: Grid, slice_index: SliceIndex)
    constructor(grid: Grid, subgrid_index: SubgridIndex)
    constructor(grid: Grid, corner: Point, width: number, height: number)
    constructor(grid: Grid, index: VectorIndex | SliceIndex | SubgridIndex | Point, start?: number, length?: number) {
        let subgrid_index: SubgridIndex
        if ('x' in index) {
            subgrid_index = {
                corner: index,
                width: start!,
                height: length!,
            }
        }
        else if (!('corner' in index)) {
            let slice_index: SliceIndex
            if ('axis' in index)
                slice_index = {
                    vector: index,
                    start: start || 0,
                    length: length || index.axis === 'row' ? grid.width : grid.height
                }
            else
                slice_index = index as SliceIndex

            if (slice_index.vector.axis === 'row')
                subgrid_index = {
                    corner: {
                        x: slice_index.start,
                        y: slice_index.vector.index,
                    },
                    width: slice_index.length,
                    height: 1,
                }
            else
                subgrid_index = {
                    corner: {
                        x: slice_index.vector.index,
                        y: slice_index.start,
                    },
                    width: 1,
                    height: slice_index.length,
                }
        }
        else
            subgrid_index = index as SubgridIndex

        if (subgrid_index.corner.x < 0 || subgrid_index.corner.x + subgrid_index.width > grid.width ||
            subgrid_index.corner.y < 0 || subgrid_index.corner.y + subgrid_index.height > grid.height
        )
            throw new GridRangeError('grid')
        if (subgrid_index.width <= 0 || subgrid_index.height <= 0)
            throw new EmptyGridElementError()

        this.grid = grid
        this.index = subgrid_index
    }

    get top_left(): Point {
        return this.index.corner
    }

    get bottom_right(): Point {
        return {
            x: this.top_left.x + this.index.width - 1,
            y: this.top_left.y + this.index.height - 1,
        }
    }

    get top_right(): Point {
        return {
            x: this.bottom_right.x,
            y: this.top_left.y,
        }
    }

    get bottom_left(): Point {
        return {
            x: this.top_left.x,
            y: this.bottom_right.y,
        }
    }

    get width(): number {
        return this.index.width
    }

    get height(): number {
        return this.index.height
    }

    get cells(): readonly Cell[][] {
        return this.points.map(row => row.map(point => this.grid.get(point)))
    }

    get points(): readonly Point[][] {
        const positions = []
        for (let y = this.top_left.y; y <= this.bottom_right.y; y++) {
            const row = []
            for (let x = this.top_left.x; x <= this.bottom_right.x; x++)
                row.push({ x, y })
            positions.push(row)
        }
        return positions
    }
}