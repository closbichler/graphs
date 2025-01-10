<template>
  <div class="drawing-board-wrapper container">
    <canvas id="drawing-board" ref="canvas" @contextmenu.prevent.stop="onContextMenu" v-on:touchstart.prevent=""
      v-on:pointercancel="onPointerUp" v-on:pointerleave="onPointerUp" v-on:pointerdown="onPointerDown"
      v-on:pointerup="onPointerUp" v-on:pointermove="onPointerMove">
      Your browser does not support the canvas element.
    </canvas>
    <ul id="drawing-board-context-menu">
      <li>Edit</li>
      <li>Remove</li>
    </ul>
    <div class="zoom-group">
      <input type="button" value="-" @click="zoomOut()">
      <input type="button" value="+" @click="zoomIn()">
    </div>
  </div>
</template>

<script setup>
import '@/assets/styles/drawingboard.css'

import { ref, watch, onMounted } from 'vue'
import { drawGraph } from '@/utils/draw.js'
import { Interaction } from '@/utils/interaction.js'

const graph = defineModel({ required: true })
const canvas = ref()

const interaction = new Interaction(graph.value)

window.addEventListener('resize', resizeCanvas, false)

watch(graph, () => {
  drawCanvas()
}, { deep: true })

onMounted(() => {
  resizeCanvas()
})

function resizeCanvas() {
  if (canvas.value !== undefined && canvas.value !== null) {
    canvas.value.width = window.innerWidth
    canvas.value.height = window.innerHeight
    graph.value.debugInfo = "resize canvas"
    drawCanvas()
  }
}

function drawCanvas() {
  drawGraph(canvas.value, graph.value)
}

function onPointerDown(event) {
  interaction.onPointerDown(event)
}

function onPointerUp(event) {
  interaction.onPointerUp(event)
}

function onPointerMove(event) {
  interaction.onPointerMove(event)
}

function onContextMenu(event) {
  interaction.onContextMenu(event)
}

function zoomIn() {
  if (graph.value.zoomFactor <= 2)
    graph.value.zoomFactor *= 1.2
}

function zoomOut() {
  if (graph.value.zoomFactor >= 0.7)
    graph.value.zoomFactor /= 1.2
}
</script>
