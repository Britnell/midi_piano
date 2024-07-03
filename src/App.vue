<script setup lang="ts">
import { ref, onMounted, watch, compile } from 'vue';
import { initMIDI, useMIDINote, type MIDIDevice } from './midi';
import Keyboard from './components/Keyboard.vue'
import Notation from './components/Notation.vue'
import Instruments from './components/Instruments.vue'
import { cachedRef } from './lib';

const audioEnabled = ref(false)
const instrument = ref({
      real: [0, 1, 0.3, 0.1],
      im: [0,0,0,0]
    })

const selectedDevice = ref('');
const midiDevices = ref<MIDIDevice[]>([]);
const { activeNotes } = useMIDINote(selectedDevice,instrument);

// ENABLE SOUND IX
onMounted(()=>{
  const enable = ()=>{
    audioEnabled.value = true
    window.removeEventListener('click',enable)
    window.removeEventListener('keypress',enable)
  }
  window.addEventListener('click',enable)
  window.addEventListener('keypress',enable)
})

// CACHE MIDI DEV CHOICE
const saveMidiKey = 'saveMidiDev'
onMounted(async () => {
  const { devices } = await initMIDI();
  midiDevices.value = devices;  
});
watch(midiDevices,()=>{
  const saved  = localStorage.getItem(saveMidiKey);
  if(saved)
  selectedDevice.value = saved
})

watch(selectedDevice,(next)=> localStorage.setItem(saveMidiKey,next) )
</script>

<template>
  <div>
    
    <header>
      <h1>MIDI Piano Web App</h1>
      
      <select v-model="selectedDevice">
        <option value="">Select MIDI input</option>
        <option v-for="device in midiDevices" :key="device.id" :value="device.id">
          {{ device.name }}
        </option>
      </select>
    </header>
    
    <div v-if="!audioEnabled" >
      <div class="overlay"></div>
      <div class="enable">
        <p>Please click or press any key to enable audio</p>
      </div>
    </div>
    
    <Instruments v-model:instrument="instrument" />
    <Notation :activeNotes="activeNotes" />
    <Keyboard :activeNotes="activeNotes" />
  </div>
</template>


<style scoped>
header {
  display: flex;
  justify-content:space-between;
  align-items: center;
  padding: 0 1.5rem;
}
#keyboard {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  overflow-x: auto;
  padding: 10px 0;
}
canvas {
  display: block;
  margin: 20px auto;
}

.enable {
  position: fixed;
  top: 50%;
  left: 50%;
  padding: 2rem;
  border: 2px solid black;
  transform: translate(-50%,-50%);
  background: white;
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #0002;
}

</style>