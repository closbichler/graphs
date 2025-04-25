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

        <div class="slection-specific-input">
            <div>
                <span id="selection-info">{{ selectionInfo }}</span>&nbsp;
                <input type="text" id="selection-input" v-model="textInput" :placeholder="textInputPlaceholder"
                    @input="changeGraphValue" :disabled="!isSelectionSet">
            </div>

            <div class="selection-buttons">
                <input type="button" id="delete-selected-button" @click="deleteSelected" :disabled="!isSelectionSet">
                <input type="button" id="mark-selected-button" @click="markSelected" :disabled="!isSelectionSet">
            </div>
        </div>

        <div class="toolbar-right">
            <span>{{ graph.debugInfo }}</span>&nbsp;
            <input type="button" id="close-sidepanel-button" @click="hideRightPanel">
        </div>
    </div>
</template>

<script setup>
import '@/assets/styles/toolbar.css'

import { watch } from 'vue'

const graph = defineModel()

var inputMode
var isSelectionSet = false
var selectionInfo = ''
var textInput = ''
var textInputPlaceholder = ''

watch(graph, () => {
    updateToolbar()
}, { deep: true })

function updateToolbar() {
    let selectedNode = graph.value.selection.node
    let selectedEdge = graph.value.selection.edge

    if (selectedNode !== undefined) {
        setSelection(graph.value.nodes[selectedNode].name, 'node name')
    } else if (selectedEdge !== undefined) {
        let edgeWeight = graph.value.nodes[selectedEdge.from].edgesTo[selectedEdge.to].weight
        setSelection(edgeWeight, 'edge weight')
    } else {
        unsetSelection()
    }
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

function changeMode() {
    graph.value.inputMode = inputMode
}

function hideRightPanel() {
    let panel = document.getElementsByClassName("panel-right")[0]
    if (panel.classList.contains("collapsed"))
        panel.classList.remove("collapsed")
    else
        panel.classList.add("collapsed")
}

function changeGraphValue() {
    if (graph.value.selection.node !== undefined) {
        graph.value.nodes[graph.value.selection.node].name = textInput
    } else if (graph.value.selection.edge !== undefined) {
        let newWeight = Number(textInput)
        if (!isNaN(newWeight)) {
            graph.value.nodes[graph.value.selection.edge.from]
                .edgesTo[graph.value.selection.edge.to].weight = Number(textInput)
        }
    }
}

function deleteSelected() {
    if (graph.value.selection.node !== undefined) {
        graph.value.deleteNode(graph.value.selection.node)
    } else if (graph.value.selection.edge !== undefined) {
        graph.value.deleteEdge(graph.value.selection.edge.from, graph.value.selection.edge.to)
    }
    graph.value.deselect()
}

function markSelected() {
    if (graph.value.selection.node !== undefined) {
        let node = graph.value.selection.node
        let nodeStyle = graph.value.nodes[node].style
        nodeStyle.color = nodeStyle.color === undefined ? "green" : undefined
        graph.value.debugInfo = "marked node " + node
    } else if (graph.value.selection.edge !== undefined) {
        let from = graph.value.selection.edge.from
        let to = graph.value.selection.edge.to
        let edgeStyle = graph.value.nodes[from].edgesTo[to].style
        edgeStyle.color = edgeStyle.color === undefined ? "green" : undefined
        graph.value.debugInfo = "marked edge (" + from + "," + to + ")"
    }
    graph.value.deselect()
}
</script>