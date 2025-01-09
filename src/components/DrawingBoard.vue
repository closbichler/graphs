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
        @input="changeGraphValue" :disabled="!isSelectionSet">

      <div class="selection-buttons">
        <input type="button" id="delete-selected-button" 
          @click="deleteSelected" :disabled="!isSelectionSet">
        <input type="button" id="mark-selected-button" 
          @click="markSelected" :disabled="!isSelectionSet">
      </div>
    </div>

    <div class="toolbar-right">
      <span>{{ graph.debugInfo }}</span>&nbsp;
      <input type="button" id="close-sidepanel-button" @click="hideRightPanel">
    </div>
  </div>

  <div class="drawing-board-area">
    <canvas id="drawing-board" ref="canvas" @contextmenu.prevent.stop="onContextMenu"
      v-on:touchstart.prevent="" v-on:pointercancel="onPointerUp" v-on:pointerleave="onPointerUp"
      v-on:pointerdown="onPointerDown" v-on:pointerup="onPointerUp"
      v-on:pointermove="onPointerMove">
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
import '@/assets/styles/toolbar.css'
import '@/assets/styles/drawingboard.css'

import { ref, watch, onMounted, computed } from 'vue'
import { drawGraph } from '@/utils/draw.js'
import { Interaction } from '@/utils/interaction.js'

const graph = defineModel({ required: true })
const canvas = ref()

const interaction = new Interaction(graph.value)
var inputMode = 'select'
var isSelectionSet = false
var selectionInfo = ''
var textInput = ''
var textInputPlaceholder = ''

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

  if (interaction.state.selectedNode !== undefined) {
    setSelection(graph.value.nodes[interaction.state.selectedNode].name, 'node name')
  } else if (interaction.state.selectedEdge !== undefined) {
    let edgeWeight = graph.value.nodes[interaction.state.selectedEdge.from]
      .edgesTo[interaction.state.selectedEdge.to].weight
    setSelection(edgeWeight, 'edge weight')
  } else {
    unsetSelection()
  }

  drawCanvas()
}

function onPointerUp(event) {
  interaction.onPointerUp(event)
  drawCanvas()
}

function onPointerMove(event) {
  interaction.onPointerMove(event)
  drawCanvas()
}

function onContextMenu(event) {
  interaction.onContextMenu(event)
  drawCanvas()
}

function changeMode() {
  interaction.state.mode = inputMode
  interaction.deselectNode()
  drawCanvas()
}

function setSelection(text, placeholder) {
  isSelectionSet = true
  selectionInfo = placeholder
  textInputPlaceholder = placeholder
  textInput = text
}

function unsetSelection() {
  isSelectionSet = false
  selectionInfo = ''
  textInputPlaceholder = ''
  textInput = ''
}

function zoomIn() {
  if (graph.value.zoomFactor <= 2)
  graph.value.zoomFactor *= 1.2
}

function zoomOut() {
  if (graph.value.zoomFactor >= 0.7)
    graph.value.zoomFactor /= 1.2
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
  } else if (interaction.state.selectedEdge !== undefined) {
    let newWeight = Number(textInput)
    if (!isNaN(newWeight)) {
      graph.value.nodes[interaction.state.selectedEdge.from]
        .edgesTo[interaction.state.selectedEdge.to].weight = Number(textInput)
    }
  }
}

function deleteSelected() {
  if (interaction.state.selectedNode !== undefined) {
    graph.value.deleteNode(interaction.state.selectedNode)
    interaction.state.selectedNode = undefined
    unsetSelection()
  } else if (interaction.state.selectedEdge !== undefined) {
    graph.value.deleteEdge(interaction.state.selectedEdge.from, interaction.state.selectedEdge.to)
    interaction.state.selectedEdge = undefined
    unsetSelection()
  }
}

function markSelected() {
  if (interaction.state.selectedNode !== undefined) {
    let node = interaction.state.selectedNode
    let nodeStyle = graph.value.nodes[node].style
    nodeStyle.color = nodeStyle.color === undefined ? "green": undefined
    interaction.deselectNode()
    graph.value.debugInfo = "marked node " + node
  } else if (interaction.state.selectedEdge !== undefined) {
    let from = interaction.state.selectedEdge.from
    let to = interaction.state.selectedEdge.to
    let edgeStyle = graph.value.nodes[from].edgesTo[to].style
    edgeStyle.color = edgeStyle.color === undefined ? "green" : undefined
    interaction.deselectEdge()
    graph.value.debugInfo = "marked edge (" + from + "," + to + ")"
  }
}
</script>
