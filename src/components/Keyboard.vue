<script setup lang="ts">
import { computed } from 'vue';
import { createKeyboard, getMidiKey } from '../midi';

const props = defineProps(['activeNotes'])
const activeKeys = computed(() => Array.from<number>(props.activeNotes.keys()).map(getMidiKey) );

const keyboard = createKeyboard()

</script>

<template>
    <div class="keyboard ">
        <div class="key"
        :class="activeKeys.includes(key)?'pressed':' '"
         v-for="key in keyboard" :key="key"
         >
            <span>{{key}}</span>
        </div>
    </div>

</template>

<style scoped>
.keyboard {
    display: flex;
    font-family: system-ui, sans-serif;
}
.key {
    flex: 0 0 auto;
    min-width: 0;
    border: 1px solid black;
    width:  2rem;
    height: 6rem;
    display: flex;
    align-items: center;
    justify-content: center;

    color: black;
    background: white;

    font-size: .8rem;
}

.key:where(:nth-child(12n+2),
:nth-child(12n+4),
:nth-child(12n+7),
:nth-child(12n+11),
:nth-child(12n+9)) {
    color: white;
    background: black;
    /* position: absolute; */
    width:  1.0rem;
    height: 4rem;
}

.pressed {
    background: red;
    color: black;
}
</style>
