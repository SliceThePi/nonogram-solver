import type { GridErrorType } from './primitives'

export class NonogramError extends Error {
    constructor(message?: string) {
        super(`NonogramError${message ? ': ' + message : ''}`)
    }
}

export class GridElementLengthError extends NonogramError {
    constructor(type?: GridErrorType) {
        if (type === 'row')
            super('Row width mismatch!')
        else if (type === 'column')
            super('Column height mismatch!')
        else if (type === 'slice')
            super('Slice length mismatch!')
        else if (type === 'grid')
            super('grid size mismatch!')
        else
            super('Grid element length mismatch!')
    }
}

export class EmptyGridElementError extends NonogramError {
    constructor(type?: GridErrorType) {
        if (type === 'row')
            super('Row cannot be empty!')
        else if (type === 'column')
            super('Column cannot be empty!')
        else if (type === 'slice')
            super('Slice cannot be empty!')
        else if (type === 'grid')
            super('grid cannot be empty!')
        else
            super('Grid elements cannot be empty!')
    }
}

export class GridRangeError extends NonogramError {
    constructor(type?: GridErrorType | 'cell') {
        if (type === 'row')
            super('Row index out of range!')
        else if (type === 'column')
            super('Column index out of range!')
        else if (type === 'cell')
            super('Cell index out of range!')
        else if (type === 'slice')
            super('Slice index out of range!')
        else if (type === 'grid')
            super('Subgrid index out of range!')
        else
            super('Grid coordinates out of range!')
    }
}

export class UnsolvableError extends NonogramError {
    constructor() {
        super('Puzzle is unsolvable!')
    }
}

export class NonogramParseError extends NonogramError {
    constructor(message?: string) {
        super(`Failed to parse Nonogram${message ? ': ' + message : ''}`)
    }
}