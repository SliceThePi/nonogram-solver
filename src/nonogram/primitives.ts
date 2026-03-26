export type NonogramPrimitiveDefinition<T, CreateArgs extends unknown[]> = {
    readonly create: (...args: CreateArgs) => T,
    readonly isInstance: (object: any) => object is T,
}
type _NPDAbstract = NonogramPrimitiveDefinition<unknown, unknown[]>
// i am a god among mortals. this works. do not question me.
export const NonogramPrimitiveDefinition: NonogramPrimitiveDefinition<_NPDAbstract, [_NPDAbstract['create'], _NPDAbstract['isInstance']]> = {
    create: (create, isInstance) => ({ create, isInstance }),
    isInstance: (object: any): object is _NPDAbstract =>
        'create' in object && typeof object.create === 'function' &&
        'isInstance' in object && typeof object.isInstance === 'function',
}

export type Axis = 'row' | 'column'
export const Axis: NonogramPrimitiveDefinition<Axis, [Axis]> = {
    create: value => value,
    isInstance: (object: any): object is Axis => object === 'row' || object === 'column',
}

/**
 * Represents the state of a single cell in the grid. Can be true (filled), false (empty), or undefined (unset).
 *
 * The "unset" state is used during solving to represent cells that have not yet been determined to be filled or empty.
 */
export type CellState = boolean | undefined
export const CellState: NonogramPrimitiveDefinition<CellState, [CellState]> = {
    create: value => value,
    isInstance: (object: any): object is CellState => typeof object === 'boolean' || object === undefined,
}

export type GridErrorType = Axis | 'slice' | 'grid'
export const GridErrorType: NonogramPrimitiveDefinition<GridErrorType, [GridErrorType]> = {
    create: value => value,
    isInstance: (object: any): object is GridErrorType =>
        Axis.isInstance(object) ||
        object === 'slice' ||
        object === 'grid',
}

export type Point = {
    readonly x: number,
    readonly y: number,
}
export const Point: NonogramPrimitiveDefinition<Point, [number, number]> = {
    create: (x, y) => ({ x, y }),
    isInstance: (object: any): object is Point =>
        'x' in object && typeof object.x === 'number' &&
        'y' in object && typeof object.y === 'number',
}

/**
 * Represents a single column or row rule, which consists of a list of block sizes.
 * 
 * For example, the rule [2 4 3] describes a column/row consisting of, in order:
 * - any number of consecutive empty cells
 * - a block of exactly 2 consecutive filled cells
 * - one or more consecutive empty cells
 * - a block of exactly 4 consecutive filled cells
 * - one or more consecutive empty cells
 * - a block of exactly 3 consecutive filled cells
 * - any number of consecutive empty cells.
 */
export type Rule = readonly number[]
export const Rule: NonogramPrimitiveDefinition<Rule, [readonly number[]]> = {
    create: nums => nums.filter(x => x > 0),
    isInstance: (object: any): object is Rule => Array.isArray(object) && object.every(item => typeof item === 'number' && item > 0),
}

export type PrimitiveGrid<T> = readonly (readonly T[])[]
export const PrimitiveGrid: NonogramPrimitiveDefinition<PrimitiveGrid<unknown>, [unknown[][]]> = {
    create: <T>(object: T[][]) => object.map(row => row.slice()) as PrimitiveGrid<T>,
    isInstance: <T>(object: any, type?: NonogramPrimitiveDefinition<T, unknown[]> | (new (...args: any[]) => T)): object is PrimitiveGrid<T> =>
        Array.isArray(object) &&
        object.every(row =>
            Array.isArray(row) &&
            (!type || (NonogramPrimitiveDefinition.isInstance(type)
                ? row.every(item => type.isInstance(item))
                : row.every(item => item instanceof type)))),
}

export type SliceIndex = {
    readonly vector: VectorIndex,
    readonly start: number,
    readonly length: number,
}
export const SliceIndex: NonogramPrimitiveDefinition<SliceIndex, [VectorIndex, number, number]> = {
    create: (vector, start, length) => ({ vector, start, length }),
    isInstance: (object: any): object is SliceIndex =>
        'vector' in object && VectorIndex.isInstance(object.vector) &&
        'start' in object && typeof object.start === 'number' &&
        'length' in object && typeof object.length === 'number',
}

export type SubgridIndex = {
    readonly corner: Point,
    readonly width: number,
    readonly height: number,
}
export const SubgridIndex: NonogramPrimitiveDefinition<SubgridIndex, [Point, number, number]> = {
    create: (corner, width, height) => ({ corner, width, height }),
    isInstance: (object: any): object is SubgridIndex =>
        'corner' in object && Point.isInstance(object.corner) &&
        'width' in object && typeof object.width === 'number' &&
        'height' in object && typeof object.height === 'number',
}

export type VectorIndex = {
    readonly axis: Axis,
    readonly index: number,
}
export const VectorIndex: NonogramPrimitiveDefinition<VectorIndex, [Axis, number]> = {
    create: (axis, index) => ({ axis, index }),
    isInstance: (object: any): object is VectorIndex =>
        'axis' in object && Axis.isInstance(object.axis) &&
        'index' in object && typeof object.index === 'number',
}