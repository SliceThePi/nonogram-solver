import { GridElementLengthError } from './errors'
import type { CellState } from './primitives'

export default class Cell {
    state: CellState

    constructor(state?: CellState) {
        this.state = state
    }

    /**
     * Toggle between filled and empty; does nothing if the cell is undefined.
     * @returns Whether the state was updated
     */
    toggle(): boolean {
        if (this.state === undefined)
            return false
        this.state = !this.state
        return true
    }

    /**
     * For user input interaction; cycles between undefined/filled/empty, in that order
     */
    cycle() {
        this.state = this.state === undefined ? true : this.state ? false : undefined
    }

    empty(): boolean {
        return this.update(false)
    }

    fill(): boolean {
        return this.update(true)
    }

    unset(): boolean {
        return this.update(undefined)
    }

    /**
     * Updates the state of the cell
     * @param new_state
     * @returns whether or not the new state is different from the old state
     */
    update(new_state: CellState): boolean {
        if (this.state === new_state)
            return false
        this.state = new_state
        return true
    }

    static emptyAll(cells: readonly Cell[]): boolean {
        return cells.map(cell => cell.empty()).some(x => x)
    }

    static fillAll(cells: readonly Cell[]): boolean {
        return cells.map(cell => cell.fill()).some(x => x)
    }

    static unsetAll(cells: readonly Cell[]): boolean {
        return cells.map(cell => cell.unset()).some(x => x)
    }

    static setAll(cells: readonly Cell[], states: readonly CellState[]): boolean {
        if (cells.length != states.length)
            throw new GridElementLengthError('slice')
        return cells.map((cell, idx) => cell.update(states[idx])).some(x => x)
    }

    static allEmpty(cells: readonly Cell[]): boolean {
        return cells.every(cell => cell.state === false)
    }

    static allFull(cells: readonly Cell[]): boolean {
        return cells.every(cell => cell.state === true)
    }

    static allUnset(cells: readonly Cell[]): boolean {
        return cells.every(cell => cell.state === undefined)
    }

    static allSet(cells: readonly Cell[], states: readonly CellState[]): boolean {
        if (cells.length != states.length)
            throw new GridElementLengthError('slice')
        return cells.every((cell, idx) => cell.state === states[idx])
    }

    static anyEmpty(cells: readonly Cell[]): boolean {
        return cells.map(cell => cell.state === false).some(x => x)
    }

    static anyFull(cells: readonly Cell[]): boolean {
        return cells.map(cell => cell.state === true).some(x => x)
    }

    static anyUnset(cells: readonly Cell[]): boolean {
        return cells.map(cell => cell.state === undefined).some(x => x)
    }
}