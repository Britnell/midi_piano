
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
const activeNotes = ref(new Map<number, OscillatorNode[]>());

export const getMidiKey = (note:number)=>{
  const names = 'C,C#,D,D#,E,F,F#,G,G#,A,A#,B'.split(',')
  let pitch = note % 12
  const oct = Math.floor(note / 12) - 1
  return `${names[pitch]}${oct}`
}

// note 36 = C2
export const createKeyboard = ()=> new Array(12 * 4).fill(1).map((v,i)=>( 36 + i)).map(getMidiKey)


export function useMIDINote(selectedDevice: Ref<string> ) {
  
  watch(selectedDevice, (newDevice) => {    
    if (newDevice) {
      if (!audioContext) initAudio();
      // setupMIDIAccess(newDevice);
      navigator.requestMIDIAccess().then(midiAccess => {
        const input = midiAccess.inputs.get(newDevice);
        if (!input) return
        input.onmidimessage = (event: MIDIMessageEvent) => {
          const [status, note, velocity] = event.data;
          const command = status >> 4;

          if (command === 8 || (command === 9 && velocity === 0)){
            stopNote(note);
          }
          else if (command === 9) {
            playMidiNote(note, velocity);
          }
          
          
          const div = activeNotes.value.size >0 ? Math.sqrt(activeNotes.value.size) : 1;
            if(!masterGain || !audioContext) return
            masterGain.gain.setValueAtTime(0.7 / div, audioContext.currentTime);
            
          };

      });
    }
  });

  return { activeNotes }
}

const createOscillator = (frequency: number, velocity: number, type: 'sine' | 'triangle' ): OscillatorNode => {
  if (!audioContext || !masterGain) throw new Error('Audio not initialized');

  const osc = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  osc.type = type;
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

const handleMIDIMessage = (event: MIDIMessageEvent) => {
const [status, note, velocity] = event.data;
const command = status >> 4;

if (command === 8 || (command === 9 && velocity === 0))
  stopNote(note);
else if (command === 9) 
  playMidiNote(note, velocity);


const div = activeNotes.value.size >0 ? Math.sqrt(activeNotes.value.size) : 1;
  if(!masterGain || !audioContext) return
  masterGain.gain.setValueAtTime(0.7 / div, audioContext.currentTime);
  
};


const playMidiNote = (note: number, velocity: number) => {
  if (activeNotes.value.size >= MAX_POLYPHONY) return;

  const frequency = 440 * Math.pow(2, (note - 69) / 12);
  const osc = createOscillator(frequency, velocity, 'sine')
  const harmonic = createOscillator(frequency *2, velocity /2, 'sine')

  osc.start(audioContext?.currentTime);
  harmonic.start(audioContext?.currentTime);

  activeNotes.value.set(note, [osc, harmonic]);
};

const stopNote = (note: number) => {
  const oscillators = activeNotes.value.get(note);
  if (oscillators) {
    oscillators.forEach(osc => {
      osc.stop();
      osc.disconnect();
    });
    activeNotes.value.delete(note);
  }
};
