<script setup lang='ts'>
import {
    Cell,
    PrimitiveGrid,
    Rule,
} from './nonogram';
import { computed } from 'vue';
import NonogramCell from './NonogramCell.vue';

const props = defineProps({
    cells: {
        type: Object as () => PrimitiveGrid<Cell>,
        required: true
    },
    column_rules: {
        type: Object as () => readonly Rule[],
        required: true
    },
    row_rules: {
        type: Object as () => readonly Rule[],
        required: true
    },
})

function mapRules(rules: readonly Rule[]): readonly string[][] {
    const max_length = Math.max(...rules.map(rule => rule.length))
    const output: string[][] = []
    for (const rule of rules) {
        const line = rule.map(r => `${r}`)
        if (rule.length === 0)
            line.push('0')
        while (line.length < max_length)
            line.unshift('\u00A0') // &nbsp;
        output.push(line)
    }
    return output
}

const column_rules = computed(() => mapRules(props.column_rules))
const row_rules = computed(() => mapRules(props.row_rules))
const column_rules_transformed = computed(() => {
    const rule_length = column_rules.value[0]?.length || 0
    const transformed: string[][] = []
    for (let i = 0; i < rule_length; i++) {
        const line: string[] = []
        for (const col of column_rules.value) {
            line.push(col[i]!)
        }
        transformed.push(line)
    }
    return transformed
})
const row_rule_length = computed(() => row_rules.value[0]?.length || 0)
// const column_rule_length = computed(() => column_rules.value[0]?.length || 0)
// const row_rule_length = computed(() => row_rules.value[0]?.length || 0)
</script>

<template>
    <table class="table-fixed border-collapse">
        <thead>
            <tr v-for="(col, colIndex) in column_rules_transformed" :key="colIndex">
                <td v-for="i in row_rule_length" :key="i"></td>
                <th scope="col" class="nonogram-grid-cell" v-for="(rule, ruleIndex) in col" :key="ruleIndex">
                    <span>{{ rule }}</span>
                </th>
            </tr>
            <tr v-for="(row, rowIndex) in row_rules" :key="rowIndex">
                <th scope="row" class="nonogram-grid-cell" v-for="(rule, ruleIndex) in row" :key="ruleIndex">
                    <span>{{ rule }}</span>
                </th>
                <td class="nonogram-grid-cell" v-for="(cell, cellIndex) in props.cells[rowIndex]" :key="cellIndex">
                    <span>
                        <NonogramCell :cell="cell" />
                    </span>
                </td>
            </tr>
        </thead>

    </table>
</template>

<style scoped>
.nonogram-grid-cell {
    border: 1px solid var(--color-gray-400);
    font-weight: 100;
    background-color: var(--color-gray-800);
    color: white;
}

.nonogram-grid-cell>span {
    width: 1.25em;
    height: 1.25em;
    overflow-y: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>