<script setup lang="ts">
import { ref, onMounted, watch, compile } from 'vue';
import { initMIDI, useMIDINote, type MIDIDevice } from './midi';
import Keyboard from './components/Keyboard.vue'
import Notation from './components/Notation.vue'


const selectedDevice = ref('');
const midiDevices = ref<MIDIDevice[]>([]);
const { activeNotes } = useMIDINote(selectedDevice);
const audioEnabled = ref(false)

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
    <div v-if="!audioEnabled">
      <p>Please click or press any key to enable audio</p>
    </div>
    <h1>MIDI Piano Web App</h1>
    <select v-model="selectedDevice">
      <option value="">Select MIDI input</option>
      <option v-for="device in midiDevices" :key="device.id" :value="device.id">
        {{ device.name }}
      </option>
    </select>
    <div id="keyboard"></div>
    <Keyboard :activeNotes="activeNotes" />
    <Notation :activeNotes="activeNotes" />
  </div>
</template>


<style scoped>
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

</style>