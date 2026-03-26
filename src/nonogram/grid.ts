import {
    Axis,
    Cell,
    CellState,
    EmptyGridElementError,
    GridElementLengthError,
    GridRangeError,
    GridSlice,
    Point,
    PrimitiveGrid,
    VectorIndex,
    SliceIndex,
} from '.'

export default class Grid {
    #cells: Cell[][]

    constructor(width: number, height: number)
    constructor(cells: PrimitiveGrid<Cell>)
    constructor(arg: number | PrimitiveGrid<Cell>, height?: number) {
        if (typeof arg === 'number') {
            this.#cells = new Array(height).fill(null).map(() => new Array(arg).fill(null))
        }
        else {
            this.#cells = arg.map(row => row.slice())
        }
    }

    get cells(): PrimitiveGrid<Cell> {
        return this.#cells
    }

    set cells(value: PrimitiveGrid<Cell>) {
        if (value.length === 0 || value[0]!.length === 0)
            throw new EmptyGridElementError()
        for (const row of value)
            if (row.length != value[0]!.length)
                throw new GridElementLengthError('row')
        this.cell_states = value.map(row => row.map(cell => cell.state))
    }

    get cell_states(): PrimitiveGrid<CellState> {
        return this.#cells.map(row => row.map(cell => cell.state))
    }

    set cell_states(value: PrimitiveGrid<CellState>) {
        if (value.length !== this.#cells.length)
            throw new EmptyGridElementError()
        value.forEach((states, idx) => this.setRow(idx, states))
    }

    get width() {
        return this.cells[0]!.length
    }

    get height() {
        return this.cells.length
    }

    get(vec: VectorIndex): GridSlice
    get(slice_index: SliceIndex): GridSlice
    get(point: Point): Cell
    get(vec: VectorIndex | SliceIndex | Point): GridSlice | Cell {
        if ('axis' in vec)
            return new GridSlice(this, vec, 0, vec.axis === 'row' ? this.width : this.height)
        else if ('vector' in vec)
            return new GridSlice(this, vec)
        else {
            const cell = this.getCell(vec)
            if(!cell)
                throw new GridRangeError('cell')
            return cell
        }
    }

    set(vec: VectorIndex, value: readonly CellState[]): boolean
    set(slice_index: SliceIndex, value: readonly CellState[]): boolean
    set(point: Point, value: CellState): boolean
    set(vec: VectorIndex | SliceIndex | Point, value: readonly CellState[] | CellState): boolean {
        if ('axis' in vec) {
            const { axis, index } = vec
            if (axis === 'row')
                return this.setRow(index, value as readonly CellState[])
            else
                return this.setColumn(index, value as readonly CellState[])
        }
        else if ('vector' in vec) {
            const { vector: { axis, index }, start, length } = vec
            let cells: readonly Cell[]
            if (axis === 'row')
                cells = this.getRow(index)
            else
                cells = this.getColumn(index)
            return Cell.setAll(cells.slice(start, start + length), value as readonly CellState[])
        }
        else {
            const cell = this.get(vec)
            return cell.update(value as CellState)
        }
    }

    push(axis: Axis, value?: readonly Cell[]): number {
        return axis === 'row' ? this.pushRow(value) : this.pushColumn(value)
    }

    pop(axis: Axis): Cell[] {
        return axis === 'row' ? this.popRow() : this.popColumn()
    }

    unshift(axis: Axis, value?: readonly Cell[]): number {
        return axis === 'row' ? this.unshiftRow(value) : this.unshiftColumn(value)
    }

    shift(axis: Axis): Cell[] {
        return axis === 'row' ? this.shiftRow() : this.shiftColumn()
    }

    getCell(point: Point): Cell | null {
        if (point.x < 0 || point.x >= this.width || point.y < 0 || point.y >= this.height)
            return null
        return this.#cells[point.y]![point.x]!
    }

    getColumn(x: number): readonly Cell[] {
        if (x < 0 || x >= this.width)
            throw new GridRangeError('column')
        return this.#cells.map(row => row[x]!)
    }

    setColumn(x: number, column: readonly CellState[]): boolean {
        const cells = this.getColumn(x)
        if (cells.length != column.length)
            throw new GridElementLengthError('column')
        return Cell.setAll(cells, column)
    }

    getRow(y: number): readonly Cell[] {
        if (y < 0 || y >= this.height)
            throw new GridRangeError('row')
        return this.#cells[y]!
    }

    setRow(y: number, row: readonly CellState[]): boolean {
        const cells = this.getRow(y)
        if (cells.length != row.length)
            throw new GridElementLengthError('row')
        return Cell.setAll(cells, row)
    }

    pushColumn(column?: readonly Cell[]) {
        if (!column)
            this.#cells.forEach(row => row.push(new Cell()))
        else if (column.length != this.height)
            throw new GridElementLengthError('column')
        else
            this.#cells.forEach((row, idx) => row.push(column[idx]!))
        return this.width
    }

    popColumn(): Cell[] {
        if (this.#cells[0]!.length <= 1)
            throw new EmptyGridElementError('grid')
        return this.#cells.map(row => row.pop()!)
    }

    unshiftColumn(column?: readonly Cell[]) {
        if (!column)
            this.#cells.forEach(row => row.unshift(new Cell()))
        else if (column.length != this.height)
            throw new GridElementLengthError('column')
        else
            this.#cells.forEach((row, idx) => row.unshift(column[idx]!))
        return this.width
    }

    shiftColumn(): Cell[] {
        if (this.#cells[0]!.length <= 1)
            throw new EmptyGridElementError('grid')
        return this.#cells.map(row => row.shift()!)
    }

    pushRow(row?: readonly Cell[]) {
        if (!row)
            this.#cells.push(new Array(this.width).fill(null).map(() => new Cell()))
        else if (row.length != this.width)
            throw new GridElementLengthError('row')
        else
            this.#cells.push(row.slice())
        return this.height
    }

    popRow(): Cell[] {
        if (this.#cells.length <= 1)
            throw new EmptyGridElementError('grid')
        return this.#cells.pop()!
    }

    unshiftRow(row?: readonly Cell[]) {
        if (!row)
            this.#cells.unshift(new Array(this.width).fill(null).map(() => new Cell()))
        else if (row.length != this.width)
            throw new GridElementLengthError('row')
        else
            this.#cells.unshift(row.slice())
        return this.height
    }

    shiftRow(): Cell[] {
        if (this.#cells.length <= 1)
            throw new EmptyGridElementError('grid')
        return this.#cells.shift()!
    }

    getStartingBound(arg: Axis | VectorIndex | SliceIndex): number {
        if (typeof arg === 'object')
            if ('axis' in arg)
                return 0
            else
                return arg.start
        else
            return 0
    }

    getEndingBound(arg: Axis | VectorIndex | SliceIndex): number {
        if (typeof arg === 'object')
            if ('vector' in arg)
                return arg.start + arg.length
            else
                arg = arg.axis
        return arg === 'row' ? this.width : this.height
    }

    toVectorIndex(index: VectorIndex | SliceIndex): VectorIndex {
        return 'axis' in index ? index : index.vector
    }

    toSliceIndex(index: VectorIndex | SliceIndex): SliceIndex
    toSliceIndex(index: VectorIndex | SliceIndex, start: number, length: number): SliceIndex
    toSliceIndex(index: VectorIndex | SliceIndex, start?: number, length?: number): SliceIndex {
        if (start === undefined)
            start = this.getStartingBound(index)
        if (length === undefined)
            length = this.getEndingBound(index) - start
        return SliceIndex.create(this.toVectorIndex(index), start, length)
    }
}