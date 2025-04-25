<template>
  <div class='panel panel-right'>
    <details>
      <summary role='button'>Example Graphs</summary>
      <div class='example-graphs'>
        <div class='grid'>
          <input type='button' value='1' @click='sampleGraph(1)'>
          <input type='button' value='2' @click='sampleGraph(2)'>
        </div>
        <div class='grid'>
          <input type='button' value='3' @click='sampleGraph(3)'>
        </div>
      </div>
    </details>
    <details>
      <summary role='button'>Dijkstra</summary>
      <div class='function-input'>
        <div class='grid'>
          <div>
            <label></label>
            <input type='text' placeholder='origin node' id='dijkstraIn1'>
          </div>

          <div>
            <label></label>
            <input type='text' placeholder='destination node' id='dijkstraIn2'>
          </div>
        </div>
        <div class='grid'>
          <input type='submit' value='calculate' @click='funcDijkstra'>
        </div>
        <div class='grid'>
          <span id='result'>{{ resultDijkstra }}</span>
        </div>
      </div>
    </details>
    <details style="display:none">
      <summary role='button'>BFS</summary>
      <div class='function-input'>
        <div class='grid'>
          <div>
            <label></label>
            <input type='text' placeholder='origin node' id='bfsIn1'>
          </div>
        </div>
        <div class='grid'>
          <input type='submit' value='execute' @click='funcBFS'>
        </div>
        <div class='grid'>
          <span id='result'>{{ bfsResult }}</span>
        </div>
      </div>
    </details>
  </div>
</template>


<script setup>
import '@/assets/styles/panelright.css'

import { ref } from 'vue'
import { findPath } from '@/utils/dijkstra'

const graph = defineModel({ required: true })
const emit = defineEmits(['update:modelValue'])
const resultDijkstra = ref()
const resultBFS = ref()

function sampleGraph(sampleNo) {
  graph.value.applySampleGraph(sampleNo)
}

function funcDijkstra() {
  graph.value.dehighlightNodes()
  graph.value.dehighlightEdges()

  let originNodeIndex = graph.value.getNodeIndexByName(document.getElementById('dijkstraIn1').value)
  let destNodeIndex = graph.value.getNodeIndexByName(document.getElementById('dijkstraIn2').value)

  if (isNaN(originNodeIndex) || isNaN(destNodeIndex) ||
      originNodeIndex < 0 || originNodeIndex >= graph.value.nodes.length ||
      destNodeIndex < 0 || destNodeIndex >= graph.value.nodes.length) {
    resultDijkstra.value = "wrong input"
    return
  }

  let path = findPath(graph.value, originNodeIndex, destNodeIndex)
  if (path !== undefined) {
    resultDijkstra.value = path
    graph.value.highlightNodes(path)
    for (let i = 0; i < path.length - 1; i++) {
      graph.value.highlightEdges([[path[i], path[i + 1]]])
    }
  } else {
    resultDijkstra.value = "not reachable"
  }
}

function funcBFS() {
  graph.value.dehighlightNodes()
  graph.value.dehighlightEdges()

  let originNodeIndex = graph.value.getNodeIndexByName(document.getElementById('bfsIn1').value)

  if (isNaN(originNodeIndex) || isNaN(destNodeIndex) ||
      originNodeIndex < 0 || originNodeIndex >= graph.value.nodes.length ||
      destNodeIndex < 0 || destNodeIndex >= graph.value.nodes.length) {
    resultBFS.value = "wrong input"
    return
  }

  let path = bfs(graph.value, originNodeIndex)
  // TODO: highlight every step
  if (path !== undefined) {
    resultBFS.value = path
    graph.value.highlightNodes(path)
    for (let i = 0; i < path.length - 1; i++) {
      graph.value.highlightEdges([[path[i], path[i + 1]]])
    }
  } else {
    resultBFS.value = "not reachable"
  }
}
</script>