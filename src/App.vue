<script setup>
import { ref } from 'vue';
import { Graph } from './utils/graph'

import DrawingBoard from './components/DrawingBoard.vue'
import LeftPanel from './components/PanelLeft.vue'
import RightPanel from './components/PanelRight.vue'

const defaultAdjMatrix = 
  [[0,1,0,0,0],
   [0,0,0,1,0],
   [0,0,0,0,0],
   [0,0,0,0,1],
   [0,0,0,0,0]];

const graph = ref(new Graph(defaultAdjMatrix));
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
