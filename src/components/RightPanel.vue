<template>
    <div class='panel right-panel'>
        <details>
            <summary role='button'>Find path</summary>
            <div class='function-input'>
                <div class='grid'>
                    <div>
                        <label>from</label>
                        <input type='text' placeholder='node' id='in1'>
                    </div>

                    <div>
                        <label>to</label>
                        <input type='text' placeholder='node' id='in2'>
                    </div>
                </div>

                <input type='submit' value='calculate' @click='funcFindPath'>
                <span id='result'>{{ path }}</span>
            </div>
        </details>
    </div>
</template>


<script setup>
import '../assets/right-panel.css'

import { ref, watch } from 'vue'
import { findPath } from './functions/pathfinder'

const graph = defineModel({ required: true })
const emit = defineEmits(['update:modelValue'])
const path = ref();

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
    for (let i=0; i<result.visitedNodes.length-1; i++) {
        graph.value.highlightEdges([[result.visitedNodes[i], result.visitedNodes[i+1]]])
    }

    emit('update:modelValue', graph)
    path.value = result.visitedNodes;
}
</script>