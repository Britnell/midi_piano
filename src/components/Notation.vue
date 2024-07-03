<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps(['activeNotes'])
const activeKeys = computed(() => Array.from<number>(props.activeNotes.keys()) )
const canvasRef = ref<HTMLCanvasElement>(null);

onMounted(()=>{
    drawNotation(activeKeys.value)
})
watch(activeKeys,()=>{    
    drawNotation(activeKeys.value)   
},{ deep: true})


const STAFF_Y = 50;
const BASS_Y = 200;

const LINE_SPACING = 10;
// const STAFF_HEIGHT = 4 * LINE_SPACING;
const NOTE_RADIUS = 5;



const drawNote = (ctx:CanvasRenderingContext2D, x:number, y:number)=>{
    ctx.beginPath();
    ctx.arc(x, y, NOTE_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
}

const drawLine = ({ctx,x,y}: {x:number, y:number , ctx:CanvasRenderingContext2D })=>{
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.stroke();
}
function drawNotation(notes: number[]) {
        const canvas = canvasRef.value
        const ctx = canvas.getContext('2d');

        if(!ctx) return;

        drawBars(ctx,canvas)

        notes.forEach(note=>{
            drawTrebleNote(ctx,note)
            drawBassNote(ctx,note)
        })

}

const posMinusBlacks = (p:number)=>{
    return [0, 1,1, 2,2,2, 3,3,4,4,5,5 ][p]
}

const drawSharp = (ctx:CanvasRenderingContext2D, p:number, x:number, y:number)=>{
    const isBlack = [1,3,6,8,10]
    if(!isBlack.includes(p)) return

    ctx.font = '22px serif';
    ctx.fillText('♯', x -18, y+6);

}

const drawTrebleNote = (ctx : CanvasRenderingContext2D, note:number)=>{
    if(note < 53) return null
    const p = note % 12
    const oct = Math.floor(note/12) -1
    const blacks = posMinusBlacks(p)
    const pos = p - blacks
    const y = STAFF_Y + LINE_SPACING * 5 - LINE_SPACING/2 *  pos - (oct-4) * 7 * LINE_SPACING/2
    const x = 150 + 2.5 * LINE_SPACING * ( pos + (oct-4) * 7 )
    drawNote(ctx, x, y )
    drawSharp(ctx,p,x,y)
    
    // draw lines bot
    if(note<=61) drawLine({ctx, x, y: STAFF_Y + LINE_SPACING *5 })
    if(note<=58) drawLine({ctx, x, y: STAFF_Y + LINE_SPACING *6 })
    if(note<=54) drawLine({ctx, x, y: STAFF_Y + LINE_SPACING *7 })
    //
    if(note>=81) drawLine({ctx, x, y: STAFF_Y - LINE_SPACING *1 })
    if(note>=84) drawLine({ctx, x, y: STAFF_Y - LINE_SPACING *2 })
    if(note>=87) drawLine({ctx, x, y: STAFF_Y - LINE_SPACING *3 })
    if(note>=91) drawLine({ctx, x, y: STAFF_Y - LINE_SPACING *4 })
}

const drawBassNote = (ctx:CanvasRenderingContext2D, note:number)=>{
    if(note > 67) return null
    const p = note % 12
    const oct = Math.floor(note/12) -1
    const blacks = posMinusBlacks(p)
    const pos = p - blacks
    const y = BASS_Y + LINE_SPACING * 6 - pos * LINE_SPACING/2 - (oct-2) * 7 * LINE_SPACING/2 
    const x = 150 + 2.5 * LINE_SPACING * ( pos + (oct-2) * 7 )
    drawNote(ctx, x, y )
    drawSharp(ctx,p,x,y)
    
    // Lines
    if(note>=60) drawLine({ctx, x, y: BASS_Y - LINE_SPACING *1 })
    if(note>=64) drawLine({ctx, x, y: BASS_Y - LINE_SPACING *2 })
    if(note>=67) drawLine({ctx, x, y: BASS_Y - LINE_SPACING *3 })
    // 
    if(note<=40) drawLine({ctx, x, y: BASS_Y + LINE_SPACING *5 })
    if(note<=37) drawLine({ctx, x, y: BASS_Y + LINE_SPACING *6 })
    if(note<=34) drawLine({ctx, x, y: BASS_Y + LINE_SPACING *7 })

    
}

function drawBars(ctx : CanvasRenderingContext2D, canvas:HTMLCanvasElement){

    ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;

        // Draw treble staff
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(0, STAFF_Y + i * LINE_SPACING);
            ctx.lineTo(canvas.width, STAFF_Y + i * LINE_SPACING);
            ctx.stroke();
        }

        // Draw bass staff
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(0, BASS_Y + i * LINE_SPACING);
            ctx.lineTo(canvas.width, BASS_Y + i * LINE_SPACING);
            ctx.stroke();
        }

        // Draw treble clef (simplified)
        ctx.font = '40px serif';
        ctx.fillText('𝄞', 10, STAFF_Y + 4 * LINE_SPACING);

        // Draw bass clef (simplified)
        ctx.font = '40px serif';
        ctx.fillText('𝄢', 10, BASS_Y + 4 * LINE_SPACING);
}



</script>
<template>
    <section>

        <h2>Notation</h2>
        <canvas ref="canvasRef" width="800" height="400"></canvas>
    </section>

</template>
    <style scoped>
    section {
        max-width: 800px;
        padding: 1rem;
        margin: 0 auto;
    }
    </style>