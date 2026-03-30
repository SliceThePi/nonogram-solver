import {
    CellState,
    NonogramParseError,
    Puzzle,
    Rule,
} from '.'

export function parse(input: string): Puzzle {
    const lines = input.trim().split(/\r?\n/g)
        .filter(line => line[0] !== ';')
    let current_step: 'start' | 'columns' | 'rows' | 'cells' = 'start'

    let columns_declared = false
    let columns: number = -1;
    const column_rules: Rule[] = []

    let rows_declared = false
    let rows: number = -1;
    const row_rules: Rule[] = []

    let cells_declared = false
    let cell_columns: number = -1;
    let cell_rows: number = -1;
    const cells: CellState[][] = []

    function completeCurrentStep() {
        switch (current_step) {
            case 'columns':
                if (columns === -1)
                    columns = column_rules.length
                else if (column_rules.length !== columns)
                    throw new NonogramParseError('number of column rules does not match declared column count')
                columns_declared = true
                break
            case 'rows':
                if (rows === -1)
                    rows = row_rules.length
                else if (row_rules.length !== rows)
                    throw new NonogramParseError('number of row rules does not match declared row count')
                rows_declared = true
                break
            case 'cells':
                if (cell_rows === -1) {
                    cell_rows = cells.length
                    cell_columns = Math.max(...cells.map(row => row.length), 0)
                    for (const row of cells)
                        while (row.length < cell_columns)
                            row.push(undefined)
                }
                else if (cells.length !== cell_rows)
                    throw new NonogramParseError(`number of cell rows does not match declared cell row count`)
                else if (cells.some(row => row.length !== cell_columns))
                    throw new NonogramParseError('number of cell columns does not match declared cell column count')
                cells_declared = true
                break
        }
    }

    const declarations = ['COLUMNS', 'ROWS', 'CELLS']
    for (const line of lines) {
        const line_parts = line.trim().split(/\s+/g)
        const keyword = line_parts[0]
        if (keyword && declarations.includes(keyword)) {
            completeCurrentStep()
            switch (keyword) {
                case 'COLUMNS':
                    if (columns_declared)
                        throw new NonogramParseError('multiple column block declarations')
                    if (line_parts.length > 2)
                        throw new NonogramParseError('too many arguments on column block declaration')
                    current_step = 'columns'
                    if (line_parts.length === 2)
                        columns = parseInt(line_parts[1]!)
                    break
                case 'ROWS':
                    if (rows_declared)
                        throw new NonogramParseError('multiple row block declarations')
                    if (line_parts.length > 2)
                        throw new NonogramParseError('too many arguments on row block declaration')
                    current_step = 'rows'
                    if (line_parts.length === 2)
                        rows = parseInt(line_parts[1]!)
                    break
                case 'CELLS':
                    if (cells_declared)
                        throw new NonogramParseError('multiple cell block declarations')
                    if (line_parts.length !== 1 && line_parts.length !== 3)
                        throw new NonogramParseError('wrong number of arguments on cell block declaration')
                    current_step = 'cells'
                    if (line_parts.length === 3) {
                        cell_columns = parseInt(line_parts[1]!)
                        cell_rows = parseInt(line_parts[2]!)
                    }
                    break
            }
        }
        else {
            switch (current_step) {
                case 'start':
                    throw new NonogramParseError('first non-comment line is not a block declaration')
                case 'columns':
                    column_rules.push(Rule.create(line_parts.map(part => parseInt(part!))))
                    break
                case 'rows':
                    row_rules.push(Rule.create(line_parts.map(part => parseInt(part!))))
                    break
                case 'cells':
                    if (line.match(/[^#. ;]/))
                        throw new NonogramParseError('cell lines can only contain #, ., space, or ; characters')
                    const clean_line = line.replace(/;/g, '')
                    if (cell_columns !== -1 && clean_line.length != cell_columns)
                        throw new NonogramParseError(`cell line length ${clean_line.length} does not match declared cell column count ${cell_columns}`)
                    cells.push(clean_line.split('').map(char => char === '#' ? true : char === '.' ? false : undefined))
            }
        }
    }

    completeCurrentStep()

    if (rows_declared !== columns_declared)
        throw new NonogramParseError('rows and columns must either both be declared or both be undeclared')

    /**
     * The goal here is to allow for the ability to omit column and row
     * declarations if the cell declaration is provided, and vice-versa.
     */
    if (cells_declared) {
        if (!rows_declared && !columns_declared) {
            rows = 0
            columns = 0
        }
    }
    else if (rows_declared && columns_declared) {
        cell_rows = 0
        cell_columns = 0
    }
    else
        throw new NonogramParseError('cell block was not declared, so columns and rows must be declared explicitly')

    /**
     * Fill any missing row declarations based on what was already provided.
     */
    if (rows === 0)
        if (cell_rows === 0)
            throw new NonogramParseError('no rows provided')
        else {
            rows = cell_rows
            while (row_rules.length < rows)
                row_rules.push(Rule.create([]))
        }
    else
        if (cell_rows === 0) {
            cell_rows = rows
            while (cells.length < cell_rows)
                cells.push(Array.from({ length: cell_columns }, () => undefined))
        }
        else if (rows !== cell_rows)
            throw new NonogramParseError('mismatch between row count and number of cell rows provided')

    /**
     * Same for columns.
     */
    if (columns === 0)
        if (cell_columns === 0)
            throw new NonogramParseError('no columns provided')
        else {
            columns = cell_columns
            while (column_rules.length < columns)
                column_rules.push(Rule.create([]))
        }
    else
        if (cell_columns === 0) {
            cell_columns = columns
            for (const row of cells)
                while (row.length < cell_columns)
                    row.push(undefined)
        }
        else if (columns !== cell_columns)
            throw new NonogramParseError('mismatch between column count and number of cell columns provided')

    const puzzle = new Puzzle(column_rules, row_rules)
    puzzle.cell_states = cells
    return puzzle
}

export function stringify(puzzle: Puzzle): string {
    let output = '; Automatically generated by the nonogram solver.\n'
    output += `COLUMNS ${puzzle.column_rules.length}\n`
    for (let i = 0; i < puzzle.column_rules.length; i++) {
        output += puzzle.column_rules[i]!.join(' ') + '\n'
        if (i % 5 === 4)
            output += ';\n' // visual separator for every 5 columns
    }
    output += `ROWS ${puzzle.row_rules.length}\n`
    for (let i = 0; i < puzzle.row_rules.length; i++) {
        output += puzzle.row_rules[i]!.join(' ') + '\n'
        if (i % 5 === 4)
            output += ';\n' // visual separator for every 5 rows
    }
    output += `CELLS ${puzzle.width} ${puzzle.height}\n`
    for (let y = 0; y < puzzle.height; y++) {
        for (let x = 0; x < puzzle.width; x++) {
            const cell_state = puzzle.get({ x, y }).state
            output += cell_state === true ? '#' : cell_state === false ? '.' : ' '
            if (x % 5 === 0 && x !== 0)
                // semicolon only indicates a comment if it's the first non-whitespace character on the line,
                // so it can be used as a visual separator in the middle of a row
                output += ';'
        }
        output += ';\n' // always end the line with a semicolon so that spaces are more readable
        if (y % 5 === 4)
            output += ';\n' // visual separator for every 5 rows
    }
    return output
}