<script setup lang="ts">
import { Cell } from './nonogram';

const props = defineProps({
    cell: {
        type: Object as () => Cell,
        required: true
    },
})
</script>

<template>
    <div class="nonogram-cell" @click="props.cell.cycle">
        <div class="bg-white" v-if="props.cell.state === true"></div>
        <div class="bg-transparent" v-else-if="props.cell.state === false">
            <svg xmlns='http://www.w3.org/2000/svg' version='1.1' preserveAspectRatio='none' viewBox='0 0 100 100'>
                <path d='M100 0 L0 100 ' stroke='currentColor' stroke-width='10' />
                <path d='M0 0 L100 100 ' stroke='currentColor' stroke-width='10' />
            </svg>
        </div>
        <div class="bg-transparent" v-else></div>
    </div>
</template>

<style scoped>
.nonogram-cell {
    width: 100%;
    height: 100%;
    display: block;
    padding: 2px;
}

.nonogram-cell>div {
    width: 100%;
    height: 100%;
    border-radius: 2px;
    display: block;
}
</style>