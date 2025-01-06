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
          <span id='result'>{{ path }}</span>
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
const path = ref();

function sampleGraph(sampleNo) {
  graph.value.applySampleGraph(sampleNo)
}

function funcFindPath() {
  graph.value.dehighlightNodes()
  graph.value.dehighlightEdges()

  let n1 = Number(document.getElementById('in1').value)
  let n2 = Number(document.getElementById('in2').value)

  if (!(n1 < graph.value.nodes.length && n2 < graph.value.nodes.length)) {
    path.value = "wrong input";
    return;
  }

  let result = findPath(graph.value, n1, n2)

  if (result === undefined) {
    path.value = "undefined";
    return;
  }

  graph.value.highlightNodes(result.visitedNodes)
  for (let i = 0; i < result.visitedNodes.length - 1; i++) {
    graph.value.highlightEdges([[result.visitedNodes[i], result.visitedNodes[i + 1]]])
  }

  path.value = result.visitedNodes;
}
</script>