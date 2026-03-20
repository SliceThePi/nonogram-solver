import { readonly } from "vue"

type Cell = boolean | null
type Axis = 'row' | 'column'
type VectorIndex = readonly [Axis, number]
type Point = readonly [number, number]
type _ReadonlyMatrix<T> = readonly (readonly T[])[]

class GridError extends Error {
    constructor(message?: string) {
        super(`GridError${message ? ': ' + message : ''}`)
    }
}

class GridVectorMismatchError extends GridError {
    constructor(type: Axis) {
        if (type === 'row')
            super('Row width mismatch!')
        else
            super('Column height mismatch!')
    }
}

class ColumnMismatchError extends GridVectorMismatchError {
    constructor() {
        super('column')
    }
}

class RowMismatchError extends GridVectorMismatchError {
    constructor() {
        super('row')
    }
}

class EmptyGridError extends GridError {
    constructor() {
        super('Grid cannnot be empty!')
    }
}

/**
 * Represents a single column or row rule, which consists of a list of block sizes.
 * 
 * For example, the rule [2 4 3] describes a column/row consisting of, in order:
 * - any number of empty cells
 * - a block of exactly 2 filled cells
 * - one or more empty cells
 * - a block of exactly 4 filled cells
 * - one or more empty cells
 * - a block of exactly 3 filled cells
 * - any number of empty cells.
 */
class Rule {
    #block_sizes!: number[]

    /**
     * @param rule Rule to copy
     */
    constructor(rule: Readonly<Rule>)
    constructor(block_sizes: readonly number[])
    constructor(arg: Readonly<Rule> | readonly number[]) {
        if (arg instanceof Array)
            this.block_sizes = arg.slice()
        else
            this.#block_sizes = arg.block_sizes.slice() // no need to normalize since the original rule should already be normalized
    }

    set block_sizes(block_sizes: readonly number[]) {
        const normalized_sizes = []
        for (const block of block_sizes)
            if (block > 0)
                normalized_sizes.push(block)
        this.#block_sizes = normalized_sizes
    }

    get block_sizes(): readonly number[] {
        return this.#block_sizes
    }

    get length(): number {
        return this.#block_sizes.length
    }

    /**
     * Calculates the minimum amount of space taken up by the blocks described
     * by the rule when including the gaps between adjacent blocks.
     *
     * For example, the 3-block rule [2 4 5] takes up a minimum of 2+4+5=11
     * filled cells plus 3-1=2 one-cell gaps, so the function should
     * return 11+2=13 in this case.
     * @returns The minimum size of the rule
     */
    get minimum_size(): number {
        let sum = 0
        for (const block of this.block_sizes)
            sum += block
        return sum + this.block_sizes.length - 1
    }

    get largest_block(): number {
        return Math.max(...this.block_sizes, 0)
    }
}

class Vector {
    #rule: Rule
    #cells: Cell[]

    constructor(rule: Readonly<Rule>, cells: readonly Cell[]) {
        this.#rule = new Rule(rule)
        this.#cells = cells.slice()
    }

    get rule(): Readonly<Rule> {
        return this.#rule
    }

    get cells(): readonly Cell[] {
        return this.#cells
    }

    /**
     * Calculates the difference between the length of the vector and the
     * minimum size of the rule.
     *
     * For example, if the rule is [2 4 5] and the vector is 15 cells long,
     * then the minimum size of the rule is 13, so the function should return
     * 15-13=2 in this case.
     */
    get naive_freedom(): number {
        return this.#cells.length - this.#rule.minimum_size
    }
}

class Grid {
    #cells!: Cell[][]

    constructor(width: number, height: number)
    constructor(cells: _ReadonlyMatrix<Cell>)
    constructor(grid: Readonly<Grid>)
    constructor(arg: number | _ReadonlyMatrix<Cell> | Readonly<Grid>, height?: number) {
        if (typeof arg === 'number') {
            const width = arg
            if (typeof height !== 'number')
                throw new GridError('Invalid usage of Grid constructor!')
            this.cells = new Array(height).fill(null).map(() => new Array(width).fill(null))
        }
        else {
            if (height !== undefined)
                throw new GridError('Invalid usage of Grid constructor!')
            if (arg instanceof Array)
                this.cells = arg
            else
                this.cells = arg.cells
        }
    }

    get cells(): _ReadonlyMatrix<Cell> {
        return this.#cells
    }

    set cells(value: _ReadonlyMatrix<Cell>) {
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

    get(vec: VectorIndex): readonly Cell[]
    get(point: Point): Cell
    get(vec: VectorIndex | Point): readonly Cell[] | Cell {
        if (typeof vec[0] === 'string') {
            const [axis, idx] = vec
            if (axis === 'row')
                return this.get_row(idx)
            else
                return this.get_column(idx)
        }
        else
            return this.get_cell(vec[0], vec[1])
    }

    set(vec: VectorIndex, value: readonly Cell[]): void
    set(point: Point, value: Cell): void
    set(vec: VectorIndex | Point, value: readonly Cell[] | Cell): void {
        if (typeof vec[0] === 'string' && value instanceof Array) {
            const [axis, idx] = vec
            if (axis === 'row')
                this.set_row(idx, value)
            else
                this.set_column(idx, value)
        }
        else if (typeof vec[0] === 'number' && !(value instanceof Array))
            this.set_cell(vec[0], vec[1], value)
    }

    push(axis: Axis, value?: readonly Cell[]): number {
        return axis === 'row' ? this.push_row(value) : this.push_column(value)
    }

    pop(axis: Axis): Cell[] {
        return axis === 'row' ? this.pop_row() : this.pop_column()
    }

    unshift(axis: Axis, value?: readonly Cell[]): number {
        return axis === 'row' ? this.unshift_row(value) : this.unshift_column(value)
    }

    shift(axis: Axis): Cell[] {
        return axis === 'row' ? this.shift_row() : this.shift_column()
    }

    get_cell(x: number, y: number): Cell {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            return false
        return this.#cells[y]![x]!
    }

    set_cell(x: number, y: number, cell: Cell) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height)
            throw new RangeError('Invalid cell coordinates!')
        this.#cells[y]![x] = cell
    }

    get_column(x: number): readonly Cell[] {
        if (x < 0 || x >= this.width)
            throw new RangeError('Invalid column index!')
        return this.#cells.map(row => row[x]!)
    }

    set_column(x: number, column: readonly Cell[]) {
        if (x < 0 || x >= this.width)
            throw new RangeError('Invalid column index!')
        if (column.length != this.height)
            throw new ColumnMismatchError()
        this.#cells.forEach((row, idx) => row[x] = column[idx]!)
    }

    get_row(y: number): readonly Cell[] {
        if (y < 0 || y >= this.height)
            throw new RangeError('Invalid row index!')
        return this.#cells[y]!
    }

    set_row(y: number, row: readonly Cell[]) {
        if (y < 0 || y >= this.height)
            throw new RangeError('Invalid row index!')
        if (row.length != this.width)
            throw new RowMismatchError()
        this.#cells[y] = row.slice()
    }

    push_column(column?: readonly Cell[]) {
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

    unshift_column(column?: readonly Cell[]) {
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

    push_row(row?: readonly Cell[]) {
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
        return this.#cells.pop()!.slice()
    }

    unshift_row(row?: readonly Cell[]) {
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
        return this.#cells.shift()!.slice()
    }
}

class Puzzle {
    #column_rules: Rule[]
    #row_rules: Rule[]
    #grid: Grid

    constructor(column_rules: _ReadonlyMatrix<number>, row_rules: _ReadonlyMatrix<number>) {
        this.#column_rules = column_rules.map(rule => new Rule(rule))
        this.#row_rules = row_rules.map(rule => new Rule(rule))
        this.#grid = new Grid(column_rules.length, row_rules.length)
    }

    get grid(): Readonly<Grid> {
        return this.#grid
    }

    get width(): number {
        return this.#grid.width
    }

    get height(): number {
        return this.#grid.height
    }

    get column_rules(): readonly Rule[] {
        return this.#column_rules
    }

    get row_rules(): readonly Rule[] {
        return this.#row_rules
    }

    get columns(): readonly Vector[] {
        return this.#column_rules.map((rule, idx) => new Vector(rule, this.#grid.get_column(idx)))
    }

    get rows(): readonly Vector[] {
        return this.#row_rules.map((rule, idx) => new Vector(rule, this.#grid.get_row(idx)))
    }

    get_rule([axis, idx]: VectorIndex): Readonly<Rule> {
        return axis === 'row' ? this.#row_rules[idx]! : this.#column_rules[idx]!
    }

    get(vec: VectorIndex): Vector
    get(point: Point): Cell
    get(vec: VectorIndex | Point): Vector | Cell {
        if (typeof vec[0] === 'string') {
            if (vec[0] === 'row')
                return this.rows[vec[1]]!
            else
                return this.columns[vec[1]]!
        }
        else
            return this.#grid.get_cell(vec[0], vec[1])
    }

    get_cell(x: number, y: number): Cell {
        return this.#grid.get_cell(x, y)
    }

    set_cell(x: number, y: number, cell: Cell) {
        this.#grid.set_cell(x, y, cell)
    }

    push_column(column?: Vector) {
        if (column) {
            const { rule, cells } = column
            this.#column_rules.push(new Rule(rule))
            this.#grid.push_column(cells.slice())
        }
        else {
            this.#column_rules.push(new Rule([]))
            this.#grid.push_column()
        }
        return this.width
    }

    pop_column(): Vector {
        if (this.width <= 1)
            throw new EmptyGridError()
        return new Vector(this.#column_rules.pop()!, this.#grid.pop_column())
    }

    unshift_column(column?: Vector) {
        if (column) {
            const { rule, cells } = column
            this.#column_rules.unshift(new Rule(rule))
            this.#grid.unshift_column(cells.slice())
        }
        else {
            this.#column_rules.unshift(new Rule([]))
            this.#grid.unshift_column()
        }
        return this.width
    }

    shift_column(): Vector {
        if (this.width <= 1)
            throw new EmptyGridError()
        return new Vector(this.#column_rules.shift()!, this.#grid.shift_column())
    }

    push_row(row?: Vector) {
        if (row) {
            const { rule, cells } = row
            this.#row_rules.push(new Rule(rule.block_sizes))
            this.#grid.push_row(cells.slice())
        }
        else {
            this.#row_rules.push(new Rule([]))
            this.#grid.push_row()
        }
        return this.height
    }

    pop_row(): Vector {
        if (this.height <= 1)
            throw new EmptyGridError()
        return new Vector(this.#row_rules.pop()!, this.#grid.pop_row())
    }

    unshift_row(row?: Vector) {
        if (row) {
            const { rule, cells } = row
            this.#row_rules.unshift(new Rule(rule))
            this.#grid.unshift_row(cells.slice())
        }
        else {
            this.#row_rules.unshift(new Rule([]))
            this.#grid.unshift_row()
        }
        return this.height
    }

    shift_row(): Vector {
        if (this.height <= 1)
            throw new EmptyGridError()
        return new Vector(this.#row_rules.shift()!, this.#grid.shift_row())
    }
}

class Solver {
    puzzle: Puzzle

    constructor(puzzle: Puzzle) {
        this.puzzle = puzzle
    }

    /**
     * Calculates a first-pass heuristic for how constrained a row or column
     * is. Lower is better.
     *
     * Used to decide which row or column to solve first.
     * @param block_sizes A column or row rule
     * @param length The length of the column or row
     * @returns A heuristic to minimize
     */
    #constraint_heuristic_first_pass(rule: Rule, length: number): number {
        // Fewer blocks and less "wiggle-room" is better
        return (length - rule.minimum_size) * rule.length
    }

    async solve(): Promise<Grid> {
        const p = this.puzzle
        const solved_grid = new Grid(p.width, p.height)
        const column_constraints: [VectorIndex, number][] = p.column_rules
            .map((rule, idx) => [['column', idx], this.#constraint_heuristic_first_pass(rule, p.height)])
        const row_constraints: [VectorIndex, number][] = p.row_rules
            .map((rule, idx) => [['row', idx], this.#constraint_heuristic_first_pass(rule, p.width)])
        const all_constraints = column_constraints.concat(row_constraints).sort(([_, idxA], [__, idxB]) => idxA - idxB)
        for (const [idx, constraint] of all_constraints) {
            const vec = p.get(idx)
            const freedom = vec.naive_freedom
            if (freedom < vec.rule.largest_block) {
            }
        }
        return solved_grid
        throw new Error('Not implemented!')
    }
}

export type {
    Cell,
    Axis,
    VectorIndex,
    Point,
}

export {
    GridError,
    GridVectorMismatchError,
    ColumnMismatchError,
    RowMismatchError,
    EmptyGridError,
    Rule,
    Vector,
    Grid,
    Puzzle,
    Solver,
}