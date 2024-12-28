<template>
    <div class='panel left-panel grid'>
        <div calss='adj-matrix-div'>
            <span>Adjacency Matrix</span>
            <textarea id='adj-matrix' aria-describedby='adj-matrix-helper' @input='onChange()'
                v-model='adjMatrixInput'></textarea>
            <small id='adj-matrix-helper'></small>

            <div>
                <div>
                    <input type='checkbox' id='check-directed' v-model='options.directed' v-on:change='toggleCheckbox'>
                    <label for='check-directed'>directed</label>
                </div>

                <div>
                    <input type='checkbox' id='check-weighted' v-model='options.weighted' v-on:change='toggleCheckbox'>
                    <label for='check-weighted'>weighted</label>
                </div>

                <div>
                    <input type='checkbox' id='check-loops' v-model='options.loops' v-on:change='toggleCheckbox'>
                    <label for='check-loops'>loops allowed</label>
                </div>

                <div>
                    <input type='checkbox' id='check-simple' v-model='options.simple' v-on:change='toggleCheckbox'>
                    <label for='check-simple'>simple graph</label>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import '../assets/left-panel.css'

import { ref, watch } from 'vue'

const graph = defineModel({ required: true })
const emit = defineEmits(['update:modelValue'])
const adjMatrixInput = ref(adjMatrixToInput())

const options = {
    directed: graph.value.properties.directed,
    simple: graph.value.properties.simple,
    loops: graph.value.properties.loops,
    weighted: graph.value.properties.weighted
}

watch(graph, () => {
    adjMatrixInput.value = adjMatrixToInput()
}, { deep: true })

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

function onChange() {
    let textarea = document.getElementById('adj-matrix')
    let newAdjMatrix = inputToAdjMatrix()

    if (newAdjMatrix !== undefined) {
        graph.value.getNodesFromAdjMatrix(newAdjMatrix)
        emit('update:modelValue', graph)
        textarea.setAttribute('aria-invalid', 'false')
    } else {
        textarea.setAttribute('aria-invalid', 'true')
    }
}

function toggleCheckbox() {
    graph.value.properties.directed = options.directed
    graph.value.properties.loops = options.loops
    graph.value.properties.weighted = options.weighted
    graph.value.properties.simple = options.simple
    emit('update:modelValue', graph)
    onChange()
}
</script>