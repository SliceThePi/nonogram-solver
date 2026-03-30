<script setup lang='ts'>
import { ref } from 'vue'
import {
  Puzzle,
  Parser,
} from './nonogram'
import NonogramPuzzle from './NonogramPuzzle.vue'

// hardcoded puzzle for testing
const puzzle: Puzzle = Parser.parse(
  'COLUMNS 3\n' +
  '2 1\n' +
  '3\n' +
  '1 2\n' +
  'ROWS 4\n' +
  '1 1\n' +
  '2\n' +
  '2\n' +
  '3\n' +
  'CELLS 3 4\n' +
  '.##\n' +
  '##.;\n' +
  '.##;\n' +
  '###;\n'
)
const cells = ref(puzzle.cells)
const column_rules = ref(puzzle.column_rules)
const row_rules = ref(puzzle.row_rules)

</script>

<template>
  <h1>Nonogram Solver</h1>
  <main>
    <RouterView />
    <NonogramPuzzle :cells="cells" :column_rules="column_rules" :row_rules="row_rules" />
  </main>
</template>

<style>
@import 'tailwindcss';
</style>
