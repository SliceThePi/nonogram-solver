type Cell = boolean | null

class Rule {
    #block_sizes!: number[]

    constructor(block_sizes: number[]) {
        this.block_sizes = block_sizes
    }

    set block_sizes(block_sizes: number[]) {
        const normalized_sizes = []
        for (const block of block_sizes)
            if (block > 0)
                normalized_sizes.push(block)
        this.#block_sizes = normalized_sizes
    }

    get block_sizes() {
        return this.#block_sizes
    }
}

class GridError extends Error {
    constructor(message?: string) {
        super(`GridError${message ? ': ' + message : ''}`)
    }
}

class GridMismatchError extends GridError {
    constructor(type: 'row' | 'column') {
        if (type === 'row')
            super('Row width mismatch!')
        else
            super('Column height mismatch!')
    }
}

class ColumnMismatchError extends GridMismatchError {
    constructor() {
        super('column')
    }
}

class RowMismatchError extends GridMismatchError {
    constructor() {
        super('row')
    }
}

class EmptyGridError extends GridError {
    constructor() {
        super('Grid cannnot be empty!')
    }
}

class Grid {
    #cells!: Cell[][]

    constructor(width: number, height: number)
    constructor(cells: Cell[][])
    constructor(width_cells: number | Cell[][], height?: number) {
        if (typeof width_cells === 'number') {
            if (typeof height !== 'number')
                throw new GridError('Invalid usage of Grid constructor!')
            this.cells = new Array(height).fill(null).map(() => new Array(width_cells).fill(null))
        }
        else {
            if (height !== undefined)
                throw new GridError('Invalid usage of Grid constructor!')
            this.cells = width_cells
        }
    }

    get cells(): ReadonlyArray<ReadonlyArray<Cell>> {
        return this.#cells
    }

    set cells(value: Cell[][]) {
        if (value.length === 0 || value[0]!.length === 0)
            throw new EmptyGridError()
        for (const row of value)
            if (row.length != value[0]!.length)
                throw new RowMismatchError()
        this.#cells = value.map(x => x.slice())
    }

    get width() {
        return this.cells[0]!.length
    }

    get height() {
        return this.cells.length
    }

    get(x: number, y: number): Cell {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            return false
        return this.#cells[y]![x]!
    }

    set(x: number, y: number, cell: Cell) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            throw new RangeError('Invalid cell coordinates!')
        this.#cells[y]![x] = cell
    }

    get_column(x: number): ReadonlyArray<Cell> {
        if (x < 0 || x >= this.width)
            throw new RangeError('Invalid column index!')
        return this.#cells.map(row => row[x]!)
    }

    set_column(x: number, column: Cell[]) {
        if (x < 0 || x >= this.width)
            throw new RangeError('Invalid column index!')
        if (column.length != this.height)
            throw new ColumnMismatchError()
        this.#cells.forEach((row, idx) => row[x] = column[idx]!)
    }

    get_row(y: number): ReadonlyArray<Cell> {
        if (y < 0 || y >= this.height)
            throw new RangeError('Invalid row index!')
        return this.#cells[y]!
    }

    set_row(y: number, row: Cell[]) {
        if (y < 0 || y >= this.height)
            throw new RangeError('Invalid row index!')
        if (row.length != this.width)
            throw new RowMismatchError()
        this.#cells[y] = row.slice()
    }

    push_column(column?: Cell[]) {
        if (!column)
            this.#cells.forEach(row => row.push(null))
        else if (column.length != this.height)
            throw new ColumnMismatchError()
        else
            this.#cells.forEach((row, idx) => row.push(column[idx]!))
        return this.width
    }

    pop_column(): Cell[] {
        if (this.#cells[0]!.length <= 1)
            throw new EmptyGridError()
        return this.#cells.map(row => row.pop()!)
    }

    unshift_column(column?: Cell[]) {
        if (!column)
            this.#cells.forEach(row => row.unshift(null))
        else if (column.length != this.height)
            throw new ColumnMismatchError()
        else
            this.#cells.forEach((row, idx) => row.unshift(column[idx]!))
        return this.width
    }

    shift_column(): Cell[] {
        if (this.#cells[0]!.length <= 1)
            throw new EmptyGridError()
        return this.#cells.map(row => row.shift()!)
    }

    push_row(row?: Cell[]) {
        if (!row)
            this.#cells.push(new Array(this.width).fill(null))
        else if (row.length != this.width)
            throw new RowMismatchError()
        else
            this.#cells.push(row.slice())
        return this.height
    }

    pop_row(): Cell[] {
        if (this.#cells.length <= 1)
            throw new EmptyGridError()
        return this.#cells.pop()!
    }

    unshift_row(row?: Cell[]) {
        if (!row)
            this.#cells.unshift(new Array(this.width).fill(null))
        else if (row.length != this.width)
            throw new RowMismatchError()
        else
            this.#cells.unshift(row.slice())
        return this.height
    }

    shift_row(): Cell[] {
        if (this.#cells.length <= 1)
            throw new EmptyGridError()
        return this.#cells.shift()!
    }
}

class Puzzle {
    #column_rules: Rule[]
    #row_rules: Rule[]
    #input_grid: Grid
    #solved_grid: Grid | null | undefined

    constructor(column_rules: number[][], row_rules: number[][]) {
        this.#column_rules = column_rules.map(rule => new Rule(rule))
        this.#row_rules = row_rules.map(rule => new Rule(rule))
        this.#input_grid = new Grid(column_rules.length, row_rules.length)
    }

    get input_grid(): Readonly<Grid> {
        return this.#input_grid
    }

    get width() {
        return this.input_grid.width
    }

    get height() {
        return this.input_grid.height
    }

    get column_rules() {
        return this.#column_rules
    }

    get row_rules() {
        return this.#row_rules
    }

    get(x: number, y: number): Cell {
        return this.input_grid.get(x, y)
    }

    set(x: number, y: number, cell: Cell) {
        this.#input_grid.set(x, y, cell)
    }

    push_column(column?: [Rule, Cell[]]) {
        if (column) {
            const [rule, cells] = column
            this.column_rules.push(rule)
            this.#input_grid.push_column(cells)
        }
        else {
            this.column_rules.push(new Rule([]))
            this.#input_grid.push_column()
        }
        return this.width
    }

    pop_column(): [Rule, Cell[]] {
        if (this.width <= 1)
            throw new EmptyGridError()
        return [this.column_rules.pop()!, this.#input_grid.pop_column()]
    }

    unshift_column(column?: [Rule, Cell[]]) {
        if (column) {
            const [rule, cells] = column
            this.column_rules.unshift(rule)
            this.#input_grid.unshift_column(cells)
        }
        else {
            this.column_rules.unshift(new Rule([]))
            this.#input_grid.unshift_column()
        }
        return this.width
    }

    shift_column(): [Rule, Cell[]] {
        if (this.width <= 1)
            throw new EmptyGridError()
        return [this.column_rules.shift()!, this.#input_grid.shift_column()]
    }

    push_row(row?: [Rule, Cell[]]) {
        if (row) {
            const [rule, cells] = row
            this.row_rules.push(rule)
            this.#input_grid.push_row(cells)
        }
        else {
            this.row_rules.push(new Rule([]))
            this.#input_grid.push_row()
        }
        return this.height
    }

    pop_row(): [Rule, Cell[]] {
        if (this.height <= 1)
            throw new EmptyGridError()
        return [this.row_rules.pop()!, this.#input_grid.pop_row()]
    }

    unshift_row(row?: [Rule, Cell[]]) {
        if (row) {
            const [rule, cells] = row
            this.row_rules.unshift(rule)
            this.#input_grid.unshift_row(cells)
        }
        else {
            this.row_rules.unshift(new Rule([]))
            this.#input_grid.unshift_row()
        }
        return this.height
    }

    shift_row(): [Rule, Cell[]] {
        if (this.height <= 1)
            throw new EmptyGridError()
        return [this.row_rules.shift()!, this.#input_grid.shift_row()]
    }

    get solved_grid() {
        return this.#solved_grid
    }

    async solve() {
        throw new Error('Not implemented!')
    }
}

export type {
    Cell
}

export {
    Rule,
    Grid,
    Puzzle,
    GridError,
    GridMismatchError,
    ColumnMismatchError,
    RowMismatchError,
    EmptyGridError,
}