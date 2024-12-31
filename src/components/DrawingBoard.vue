<template>
  <div class="toolbar">
    <div class="select-mode">
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

    <div>
      <button @click="resetGraph" type="reset">Reposition</button>
    </div>
    <div>
      <button @click="deselectAll" type="reset">Deselect</button>
    </div>

    <div>
      <input type="text" v-model="textInput" :placeholder="textInputPlaceholder" :disabled="textInputPlaceholder == ''"
        @input="changeGraphValue">
    </div>

    <span>{{ debugInfo }}</span>

    <div class="toolbar-right">
      <input type="button" value="x" @click="hideRightPanel">
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
import '../assets/styles/toolbar.css'
import '../assets/styles/drawingboard.css'

import { ref, watch, onMounted } from 'vue';
import { drawGraph } from '../utils/draw.js';
import { Interaction } from '../utils/interaction.js';

const graph = defineModel({ required: true })
const canvas = ref();
const debugInfo = ref();
var textInput = "";
var textInputPlaceholder = "";
const emit = defineEmits(['update:modelValue'])

const interaction = new Interaction(graph.value);
var toggleAutoPosition = false;
var inputMode = "select";

watch(graph, () => {
  if (toggleAutoPosition)
    graph.value.reposition();

  drawCanvas();
}, { deep: true })

onMounted(() => {
  resizeCanvas();
})

window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
  if (canvas.value !== null) {
    canvas.value.width = window.innerWidth;
    canvas.value.height = window.innerHeight
    debugInfo.value = "resize canvas";
    drawCanvas();
  }
}

function drawCanvas() {
  drawGraph(canvas.value, graph.value);
}

function onMouseClick(event) {
  interaction.onCanvasClick(event);
  emit('update:modelValue', graph);
  drawCanvas();
  debugInfo.value = interaction.debugInfo ? interaction.debugInfo : debugInfo.value;

  if (interaction.state.selectedNode !== undefined) {
    textInput = graph.value.nodes[interaction.state.selectedNode].name;
    textInputPlaceholder = "node name";
  } else if (interaction.state.selectedEdge !== undefined) {
    textInput = graph.value.nodes[interaction.state.selectedEdge.from]
      .edgesTo[interaction.state.selectedEdge.to].weight;
    textInputPlaceholder = "edge weight";
  } else {
    textInput = "";
    textInputPlaceholder = undefined;
  }
}

function onMouseDown(event) {
  if (interaction.onCanvasDrag(event))
    drawCanvas();
  debugInfo.value = interaction.debugInfo ? interaction.debugInfo : debugInfo.value;
}

function onContextMenu(event) {
  if (interaction.onContextMenu(event))
    drawCanvas();
  debugInfo.value = interaction.debugInfo;
}

function changeMode() {
  interaction.state.mode = inputMode;
  interaction.deselectNode();
  drawCanvas();
  debugInfo.value = "changed input mode to " + inputMode;
}

function resetGraph() {
  graph.value.reposition();
  drawCanvas();
  debugInfo.value = "reset graph";
}

function deselectAll() {
  graph.value.dehighlightNodes();
  graph.value.dehighlightEdges();
  interaction.deselectNode();
  interaction.deselectEdge();
  drawCanvas();
  debugInfo.value = "deselected and dehighlighted";
}

function zoomIn() {
  if (graph.value.zoomFactor < 2)
    graph.value.zoomFactor += 1.2;
  else
    graph.value.zoomFactor += 1.6;
}

function zoomOut() {
  if (graph.value.zoomFactor < 2)
    graph.value.zoomFactor -= 1.2;
  else
    graph.value.zoomFactor -= 1.6;
}

function hideRightPanel() {
  let panel = document.getElementsByClassName("panel-right")[0];
  if (panel.classList.contains("collapsed"))
    panel.classList.remove("collapsed");
  else
    panel.classList.add("collapsed");
}

function changeGraphValue() {
  if (interaction.state.selectedNode !== undefined) {
    graph.value.nodes[interaction.state.selectedNode].name = textInput;
    textInputPlaceholder = "changed node name";
  } else if (interaction.state.selectedEdge !== undefined) {
    let newWeight = Number(textInput);
    if (!isNaN(newWeight)) {
      graph.value.nodes[interaction.state.selectedEdge.from]
        .edgesTo[interaction.state.selectedEdge.to].weight = Number(textInput);
      debugInfo.value = "changed edge weight";
    }
  }
}
</script>
