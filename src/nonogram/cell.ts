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
        return cells.some(cell => cell.empty())
    }

    static fillAll(cells: readonly Cell[]): boolean {
        return cells.some(cell => cell.fill())
    }

    static unsetAll(cells: readonly Cell[]): boolean {
        return cells.some(cell => cell.unset())
    }

    static setAll(cells: readonly Cell[], states: readonly CellState[]): boolean {
        if (cells.length != states.length)
            throw new GridElementLengthError('slice')
        return cells.some((cell, idx) => cell.update(states[idx]))
    }
}