import {
    Grid,
    PrimitiveGrid,
    Rule,
    RuleVector,
    VectorIndex,
} from '.'

export default class Puzzle extends Grid {
    #column_rules: Rule[]
    #row_rules: Rule[]

    constructor(column_rules: PrimitiveGrid<number>, row_rules: PrimitiveGrid<number>) {
        super(column_rules.length, row_rules.length)
        this.#column_rules = column_rules.slice()
        this.#row_rules = row_rules.slice()
    }

    get column_rules(): readonly Rule[] {
        return this.#column_rules
    }

    get row_rules(): readonly Rule[] {
        return this.#row_rules
    }

    get columns(): readonly RuleVector[] {
        return this.#column_rules.map((rule, idx) => new RuleVector(this, VectorIndex.create('column', idx), rule))
    }

    get rows(): readonly RuleVector[] {
        return this.#row_rules.map((rule, idx) => new RuleVector(this, VectorIndex.create('row', idx), rule))
    }

    getRule({ axis, index }: VectorIndex): Readonly<Rule> {
        return axis === 'row' ? this.#row_rules[index]! : this.#column_rules[index]!
    }
}