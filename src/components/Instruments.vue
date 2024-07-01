<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { cachedRef } from '../lib';

const emit = defineEmits<{
  (e: 'update:instrument', value: { real: number[], im: number[] }): void
}>();

const defaultRe = '[0, 0.5, 0.3, 0.1, 0.1, 0.01 ]'
const defaultIm = '[0, 0, 0 ,0 ,0, 0]'
const instrumentList = ['piano', '2harmonic', '1harmonic','beep',  'custom' ]

const preset = cachedRef('instrumentPreset',instrumentList[0])
const real = cachedRef('customInstrumentReal',defaultRe)
const im = cachedRef('customInstrumentIm',defaultIm)


const instrumentCoeff = {
    beep: { real: [0,1], im: [0,0] },
    '1harmonic': { real: [ 0, 1, 0.3 ], im: [0,0,0] },
    '2harmonic': { real: [ 0, 1, 0.3, 0.1 ], im: [0,0,0,0] },
    piano: { real: [0, 0.4, 0.4, 0.1, 0.1, 0.05], im:  [0,0,0,0,0,0]}
}

watch(preset,()=>{
    const coeff = instrumentCoeff[preset.value]
    if(preset.value==='custom') loadCustom()
    else emit('update:instrument',coeff)
})

onMounted(()=>{
    const coeff = instrumentCoeff[preset.value]
    if(preset.value==='custom') loadCustom()
    else emit('update:instrument',coeff)
})
const loadCustom = ()=>{
    const re = safeParse(real.value)
    const i = safeParse(im.value)
    if(!re || !i) {
        real.value = defaultRe
        im.value = defaultIm
        loadCustom()
        return 
    }
    emit('update:instrument',{real:re,im:i})
}

const safeParse = (val:string)=>{
    try {
        return JSON.parse(val)
    }
    catch(e){
        return null
    }
}

// watch([real,im],()=>{
    // })
    
    const update = (ev)=>{
        if(ev.key==='Enter') return loadCustom()
    }

</script>
<template>
    <section>

        <h2>instruments</h2>
        <div class="grid">

        <div>
            <select v-model="preset">
                <option v-for="ins in instrumentList" :key="ins" :value="ins" >{{ ins }}</option>
            </select>
    </div>
    <div>

        <div class="custom" v-if="preset==='custom'">
            <h3>custom harmonics</h3>
            <label><span>Real:</span> <input @keydown="update" name="real" v-model="real" /></label>
            <label><span>Im:</span> <input @keydown="update" name="im" v-model="im" /></label>
        </div>
    </div>
</div>
</section>
    
</template>

<style scoped>
    section {
        margin: 2rem 0;
    }
    .grid {
        display: grid;
        grid-template-columns: 200px 1fr;
    }
    h2, h3 {
        margin: 0;
    }
    label {
        display: flex;
        gap: .8rem;
    }
    .custom {
        display: flex;
        gap: 2rem;
    }
</style>