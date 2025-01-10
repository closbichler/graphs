<script setup>
import { ref } from 'vue';
import { Graph } from './utils/graph'

import DrawingBoard from './components/DrawingBoard.vue'
import Toolbar from './components/Toolbar.vue'
import LeftPanel from './components/PanelLeft.vue'
import RightPanel from './components/PanelRight.vue'

const graph = ref(new Graph([]))
graph.value.applySampleGraph(0)
</script>

<template>
  <main>
    <Toolbar v-model="graph" />

    <DrawingBoard v-model="graph" />

    <LeftPanel v-model="graph" />

    <RightPanel v-model="graph" />
  </main>
</template>
