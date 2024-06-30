<script setup lang="ts">
import { computed, watch } from 'vue';
import { createKeyboard, getMidiKey } from '../midi';

const props = defineProps(['activeNotes'])
const activeKeys = computed(() => Array.from<number>(props.activeNotes.keys()).map(getMidiKey) );

const keyboard = createKeyboard()

// watch(activeKeys,()=>{    
    // console.log(activeKeys.value);     
// },{ deep: true})


</script>
<style scoped>
.keyboard {
    display: flex;
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