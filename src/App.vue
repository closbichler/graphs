<script setup>
import { ref } from 'vue';
import { Graph, SAMPLE_GRAPHS } from './utils/graph'

import DrawingBoard from './components/DrawingBoard.vue'
import LeftPanel from './components/PanelLeft.vue'
import RightPanel from './components/PanelRight.vue'

const graph = ref(new Graph([]))
graph.value.applySampleGraph(0)
</script>

<template>
  <main>
    <div class="drawing-board-wrapper container">
      <DrawingBoard v-model="graph" />
    </div>

    <LeftPanel v-model="graph" />
    
    <RightPanel v-model="graph" />
  </main>
</template>
