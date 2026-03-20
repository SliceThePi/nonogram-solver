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

class Grid {
    #width!: number
    #height!: number
    #cells!: Cell[][]

    constructor(width: number, height: number)
    constructor(cells: Cell[][])
    constructor(width_cells: number | Cell[][], height: number | undefined = undefined) {
        if (typeof width_cells === 'number') {
            if (typeof height !== 'number')
                throw new Error('Invalid usage of Grid constructor!')
            if (width_cells <= 0 || height <= 0)
                throw Error('Grid cannot be empty!')
            this.cells = new Array(width_cells).map(() => new Array(height).fill(null))
        }
        else {
            if (height !== undefined)
                throw new Error('Invalid usage of Grid constructor!')
            this.cells = width_cells
        }
    }

    get cells(): ReadonlyArray<ReadonlyArray<Cell>> {
        return this.#cells
    }

    set cells(value: Cell[][]) {
        if (value.length === 0 || value[0]!.length === 0)
            throw new Error('Grid cannot be empty!')
        for (const column of value)
            if (column.length != value[0]!.length)
                throw new Error('Mismatched column heights!')
        this.#cells = value.map(x => x.slice())
        this.#width = this.#cells.length
        this.#height = this.#cells[0]!.length
    }

    get width() {
        return this.#width
    }

    set width(value: number) {
        if (value <= 0)
            throw new Error('Grid cannot be empty!')
    }

    get height() {
        return this.#height
    }

    get(x: number, y: number): Cell {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            return false
        return this.#cells[x]![y]!
    }

    set(x: number, y: number, cell: Cell) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            throw new RangeError('Invalid cell coordinates!')
        this.#cells[x]![y] = cell
    }
}

class Puzzle {
    column_rules: ReadonlyArray<Rule>
    row_rules: ReadonlyArray<Rule>
    #input_grid: Grid
    #solved_grid: Grid | null | undefined

    constructor(column_rules: number[][], row_rules: number[][]) {
        this.column_rules = column_rules.map(rule => new Rule(rule))
        this.row_rules = row_rules.map(rule => new Rule(rule))
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

    get(x: number, y: number): Cell {
        return this.input_grid.get(x, y)
    }

    set(x: number, y: number, cell: Cell) {
        this.#input_grid.set(x, y, cell)
    }

    get solved_grid() {
        return this.#solved_grid
    }

    async solve() {
        throw new Error('Not implemented!')
    }
}