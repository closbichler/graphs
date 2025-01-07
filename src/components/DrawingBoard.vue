<template>
  <div class="toolbar">
    <div class="select-mode svg-buttons">
      <fieldset>
        <label htmlFor="input-mode-1">
          <input type="radio" id="input-mode-1" value="select" name="input-mode" v-model="inputMode"
            @change="changeMode">
          <span></span>
        </label>

        <label htmlFor="input-mode-2">
          <input type="radio" id="input-mode-2" value="put-node" name="input-mode" v-model="inputMode"
            @change="changeMode">
          <span></span>
        </label>

        <label htmlFor="input-mode-3">
          <input type="radio" id="input-mode-3" value="put-edge" name="input-mode" v-model="inputMode"
            @change="changeMode">
          <span></span>
        </label>
      </fieldset>
    </div>

    <div class="slection-specific-input">
      <span id="selection-info">{{ selectionInfo }}</span>:
      <input type="text" id="selection-input" v-model="textInput" :placeholder="textInputPlaceholder"
        :disabled="textInputDisabled" @input="changeGraphValue">

      <div class="selection-buttons svg-buttons">
        <label htmlFor="delete-selected">
          <input type="button" id="delete-selected" @click="deleteSelected" disabled>
          <span></span>
        </label>
      </div>
    </div>

    <div class="toolbar-right">
      <span>{{ debugInfo }}</span>&nbsp;
      <label htmlFor="close-sidepanel-button" id="close-sidepanel">
        <input type="button" id="close-sidepanel-button" @click="hideRightPanel">
        <span></span>
      </label>
    </div>
  </div>

  <div class="drawing-board">
    <canvas id="drawing-board" ref="canvas" @contextmenu.prevent.stop="onContextMenu" @mousemove="onMouseDown"
      @click="onMouseClick">
      Your browser does not support the canvas element.
    </canvas>
    <ul id="drawing-board-context-menu">
      <li>Edit</li>
      <li>Remove</li>
    </ul>
    <div class="zoom-group">
      <input type="button" value="+" @onclick="zoomIn()">
      <input type="button" value="-" @onclick="zoomOut()">
    </div>
  </div>
</template>

<script setup>
import '@/assets/styles/toolbar.css'
import '@/assets/styles/drawingboard.css'

import { ref, watch, onMounted } from 'vue'
import { drawGraph } from '@/utils/draw.js'
import { Interaction } from '@/utils/interaction.js'

const graph = defineModel({ required: true })
const canvas = ref()
const debugInfo = ref()

const interaction = new Interaction(graph.value)
var inputMode = 'select'
var selectionInfo = ''
var textInput = ''
var textInputPlaceholder = ''
var textInputDisabled = true

window.addEventListener('resize', resizeCanvas, false)

watch(graph, () => {
  drawCanvas()
}, { deep: true })

onMounted(() => {
  resizeCanvas()
})

function resizeCanvas() {
  if (canvas.value !== undefined) {
    canvas.value.width = window.innerWidth
    canvas.value.height = window.innerHeight
    debugInfo.value = "resize canvas"
    drawCanvas()
  }
}

function drawCanvas() {
  drawGraph(canvas.value, graph.value)
}

function onMouseClick(event) {
  interaction.onCanvasClick(event)

  if (interaction.state.selectedNode !== undefined) {
    enableInputText(graph.value.nodes[interaction.state.selectedNode].name, 'node name')
  } else if (interaction.state.selectedEdge !== undefined) {
    let edgeWeight = graph.value.nodes[interaction.state.selectedEdge.from]
      .edgesTo[interaction.state.selectedEdge.to].weight
    enableInputText(edgeWeight, 'edge weight')
  } else {
    disableInputText()
  }

  drawCanvas()
  debugInfo.value = interaction.debugInfo ? interaction.debugInfo : debugInfo.value
}

function onMouseDown(event) {
  if (!interaction.onCanvasDrag(event))
    return

  drawCanvas()
  debugInfo.value = interaction.debugInfo
}

function onContextMenu(event) {
  if (!interaction.onContextMenu(event))
    return

  drawCanvas()
  debugInfo.value = interaction.debugInfo
}

function enableInputText(text, placeholder) {
  selectionInfo = placeholder
  textInputDisabled = false
  textInputPlaceholder = placeholder
  textInput = text
}

function disableInputText() {
  selectionInfo = ''
  textInputDisabled = true
  textInputPlaceholder = ''
  textInput = ''
}

function changeMode() {
  interaction.state.mode = inputMode
  interaction.deselectNode()
  drawCanvas()
  debugInfo.value = "changed input mode to " + inputMode
}

function zoomIn() {
  if (graph.value.zoomFactor < 2)
    graph.value.zoomFactor += 1.2
  else
    graph.value.zoomFactor += 1.6
}

function zoomOut() {
  if (graph.value.zoomFactor < 2)
    graph.value.zoomFactor -= 1.2
  else
    graph.value.zoomFactor -= 1.6
}

function hideRightPanel() {
  let panel = document.getElementsByClassName("panel-right")[0]
  if (panel.classList.contains("collapsed"))
    panel.classList.remove("collapsed")
  else
    panel.classList.add("collapsed")
}

function changeGraphValue() {
  if (interaction.state.selectedNode !== undefined) {
    graph.value.nodes[interaction.state.selectedNode].name = textInput
    textInputPlaceholder = "changed node name"
  } else if (interaction.state.selectedEdge !== undefined) {
    let newWeight = Number(textInput)
    if (!isNaN(newWeight)) {
      graph.value.nodes[interaction.state.selectedEdge.from]
        .edgesTo[interaction.state.selectedEdge.to].weight = Number(textInput)
      debugInfo.value = "changed edge weight"
    }
  }
}
</script>
