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
      <summary role='button'>Find path</summary>
      <div class='function-input'>
        <div class='grid'>
          <div>
            <label></label>
            <input type='text' placeholder='origin node' id='in1'>
          </div>

          <div>
            <label></label>
            <input type='text' placeholder='destination node' id='in2'>
          </div>
        </div>
        <div class='grid'>
          <input type='submit' value='calculate' @click='funcFindPath'>
        </div>
        <div class='grid'>
          <span id='result'>{{ pathFindingResult }}</span>
        </div>
      </div>
    </details>
  </div>
</template>


<script setup>
import '@/assets/styles/panelright.css'

import { ref } from 'vue'
import { findPath } from '@/utils/pathfinder'

const graph = defineModel({ required: true })
const emit = defineEmits(['update:modelValue'])
const pathFindingResult = ref()

function sampleGraph(sampleNo) {
  graph.value.applySampleGraph(sampleNo)
}

function funcFindPath() {
  graph.value.dehighlightNodes()
  graph.value.dehighlightEdges()

  let originNodeIndex = graph.value.getNodeIndexByName(document.getElementById('in1').value)
  let destNodeIndex = graph.value.getNodeIndexByName(document.getElementById('in2').value)

  if (isNaN(originNodeIndex) || isNaN(destNodeIndex) ||
      originNodeIndex < 0 || originNodeIndex >= graph.value.nodes.length ||
      destNodeIndex < 0 || destNodeIndex >= graph.value.nodes.length) {
    pathFindingResult.value = "wrong input"
    return
  }

  let path = findPath(graph.value, originNodeIndex, destNodeIndex)
  if (path !== undefined) {
    pathFindingResult.value = path
    graph.value.highlightNodes(path)
    for (let i = 0; i < path.length - 1; i++) {
      graph.value.highlightEdges([[path[i], path[i + 1]]])
    }
  } else {
    pathFindingResult.value = "not reachable"
  }
}
</script>