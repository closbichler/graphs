<template>
  <div class='panel panel-left'>
    <div calss='adj-matrix-div'>
      <span>Adjacency Matrix</span>
      <textarea id='adj-matrix' aria-describedby='adj-matrix-helper' @input='onEditTextarea()'
        v-model='adjMatrixInput'></textarea>
      <small id='adj-matrix-helper'></small>
    </div>

    <div>
      <div>
        <input type='checkbox' id='check-directed' v-model='options.directed' v-on:change='toggleCheckboxes'>
        <label for='check-directed'>directed</label>
      </div>

      <div>
        <input type='checkbox' id='check-weighted' v-model='options.weighted' v-on:change='toggleCheckboxes'>
        <label for='check-weighted'>weighted</label>
      </div>

      <div style="display:none">
        <input type='checkbox' id='check-loops' v-model='options.loops' v-on:change='toggleCheckboxes'>
        <label for='check-loops'>loops allowed</label>
      </div>

      <div style="display:none">
        <input type='checkbox' id='check-simple' v-model='options.simple' v-on:change='toggleCheckboxes'>
        <label for='check-simple'>simple graph</label>
      </div>
    </div>

    <div>
      <button @click="repositionGraph" type="reset">Reposition</button>
      <button @click="deselectAll" type="reset" style='display:none'>Deselect</button>
    </div>

  </div>
</template>

<script setup>
import '@/assets/styles/panelleft.css'

import { ref, watch, onMounted } from 'vue'

const graph = defineModel({ required: true })
const adjMatrixInput = ref(adjMatrixToInput())
var textarea = undefined

const options = {
  directed: graph.value.properties.directed,
  weighted: graph.value.properties.weighted,
  simple: graph.value.properties.simple,
  loops: graph.value.properties.loops,
}

watch(graph, () => {
  adjMatrixInput.value = adjMatrixToInput()
  updateCheckboxes()
}, { deep: true })

onMounted(() => {
  textarea = document.getElementById('adj-matrix')
})

function adjMatrixToInput() {
  let adjString = ''
  let adjMatrix = graph.value.getAdjMatrix()
  let size = adjMatrix.length

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      adjString += adjMatrix[row][col]
      if (col != size - 1) adjString += ','
    }
    if (row != size - 1) adjString += '\n'
  }

  return adjString
}

function inputToAdjMatrix() {
  let lines = adjMatrixInput.value.split('\n')
  let size = lines.length
  let newAdjMatrix = [size]

  for (let i = 0; i < size; i++) {
    let elements = lines[i].split(',')

    if (elements.length != size)
      return undefined

    newAdjMatrix[i] = [size]

    for (let j = 0; j < size; j++) {
      if (graph.value.properties.weighted) {
        let weight = Number(elements[j])

        if (!elements[j] || isNaN(weight) || weight == undefined ||
          elements[j][0] == '.' || elements[j][elements[j].length - 1] == '.') {
          return undefined
        } else {
          newAdjMatrix[i][j] = weight
        }
      } else {
        if (elements[j] === '1')
          newAdjMatrix[i][j] = 1
        else if (elements[j] === '0')
          newAdjMatrix[i][j] = 0
        else
          return undefined
      }
    }
  }

  return newAdjMatrix
}

function onEditTextarea() {
  if (textarea === undefined)
    return

  let newAdjMatrix = inputToAdjMatrix()

  if (newAdjMatrix !== undefined) {
    graph.value.getNodesFromAdjMatrix(newAdjMatrix)
    textarea.setAttribute('aria-invalid', 'false')
  } else {
    textarea.setAttribute('aria-invalid', 'true')
  }
}

function toggleCheckboxes() {
  graph.value.properties.directed = options.directed
  graph.value.properties.loops = options.loops
  graph.value.properties.weighted = options.weighted
  graph.value.properties.simple = options.simple
  // TODO: validate adj-matrix and convert weights/directions
}

function updateCheckboxes() {
  options.directed = graph.value.properties.directed
  options.loops = graph.value.properties.loops
  options.weighted = graph.value.properties.weighted
  options.simple = graph.value.properties.simple
}

function repositionGraph() {
  graph.value.reposition()
}

function deselectAll() {
  // TODO
  return
  graph.value.dehighlightNodes()
  graph.value.dehighlightEdges()
  interaction.deselectNode()
  interaction.deselectEdge()
  disableInputText()
  drawCanvas()
  debugInfo.value = "deselected and dehighlighted"
}
</script>