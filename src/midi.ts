
import { ref, watch, Ref } from 'vue';
import { MIDIMessageEvent } from 'webmidi';

export interface MIDIDevice {
  id: string;
  name: string;
}

export async function initMIDI(): Promise<{ devices: MIDIDevice[] }> {
  if (!navigator.requestMIDIAccess) {
    console.error("Web MIDI API is not supported in this browser.");
    return { devices: [] };
  }

  try {
    const midiAccess = await navigator.requestMIDIAccess();
    const devices: MIDIDevice[] = Array.from(midiAccess.inputs.values()).map(input => ({
      id: input.id,
      name: input.name
    } as MIDIDevice));

    return { devices };
  } catch (error) {
    console.error("Failed to get MIDI access:", error);
    return { devices: [] };
  }
}


// Audio context and nodes
let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let lpFilter: BiquadFilterNode | null = null;

// Constants
const MAX_POLYPHONY = 10;

// Active notes
const activeNotes = ref(new Map<number, OscillatorNode>());

export const getMidiKey = (note:number)=>{
  const names = 'C,C♯,D,D♯,E,F,F♯,G,G♯,A,A♯,B'.split(',')
  let pitch = note % 12
  const oct = Math.floor(note / 12) - 1
  return `${names[pitch]}${oct}`
}

// note 36 = C2
export const createKeyboard = ()=> new Array(12 * 4).fill(1).map((v,i)=>( 36 + i)).map(getMidiKey)


interface Instrument {
  real: number[], im:number[]
}

export function useMIDINote(selectedDevice: Ref<string>, instrument: Ref<Instrument> ) {
  
  watch([selectedDevice], () => {        
    if (!selectedDevice.value) return 
    if (!audioContext) initAudio();

    navigator.requestMIDIAccess().then(midiAccess => {
        const input = midiAccess.inputs.get(selectedDevice.value);
        if (!input) return

        input.onmidimessage = (event: MIDIMessageEvent) => {
          const [status, note, velocity] = event.data;
          const command = status >> 4;

          if (command === 8 || (command === 9 && velocity === 0)){
            stopNote(note);
          }
          else if (command === 9) {
            playMidiNote(note, velocity,instrument.value);
          }
          
          
          const div = activeNotes.value.size >0 ? Math.sqrt(activeNotes.value.size) : 1;
            if(!masterGain || !audioContext) return
            masterGain.gain.setValueAtTime(0.7 / div, audioContext.currentTime);
            
        };

      });
    
  });

  return { activeNotes }
}

const createOscillator = (frequency: number, velocity: number, instrument: Instrument ): OscillatorNode => {
  if (!audioContext || !masterGain) throw new Error('Audio not initialized');

  const osc = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const wave = audioContext.createPeriodicWave(new Float32Array(instrument.real),new Float32Array(instrument.im) );
  osc.setPeriodicWave(wave);

  osc.frequency.setValueAtTime(frequency, audioContext.currentTime);

  const velocityGain = velocity / 127;
  gainNode.gain.setValueAtTime(velocityGain, audioContext.currentTime);

  osc.connect(gainNode);
  gainNode.connect(masterGain);

  return osc;
}

const initAudio = () => {
  audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  masterGain = audioContext.createGain();
  masterGain.gain.setValueAtTime(0.7, audioContext.currentTime);

  lpFilter = audioContext.createBiquadFilter();
  lpFilter.type = 'lowpass';
  lpFilter.frequency.setValueAtTime(5000, audioContext.currentTime);

  masterGain.connect(lpFilter);
  lpFilter.connect(audioContext.destination);
};


const playMidiNote = (note: number, velocity: number, instrument:Instrument) => {
  if (activeNotes.value.size >= MAX_POLYPHONY) return;

  const frequency = 440 * Math.pow(2, (note - 69) / 12);
  const osc = createOscillator(frequency, velocity, instrument)
  osc.start(audioContext?.currentTime)

  activeNotes.value.set(note, osc);
};

const stopNote = (note: number) => {
  const osc = activeNotes.value.get(note);
  if(!osc) return
  osc?.stop()
  osc?.disconnect()
  activeNotes.value.delete(note);

  // if (oscillators) {
  //   oscillators.forEach(osc => {
  //     osc.stop();
  //     osc.disconnect();
  //   });
  // }
};
