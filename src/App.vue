<script setup>
import { ref } from 'vue';
import { Graph } from './components/graph'

import Navbar from './components/Navbar.vue'
import DrawingBoard from './components/DrawingBoard.vue'
import LeftPanel from './components/LeftPanel.vue'
import RightPanel from './components/RightPanel.vue'

const defaultAdjMatrix = 
  [[0,1,0,0,0],
   [0,0,0,1,0],
   [0,0,0,0,0],
   [0,0,0,0,1],
   [0,0,0,0,0]];

const graph = ref(new Graph(defaultAdjMatrix));

</script>

<template>
  <!-- <header>
    <Navbar />
  </header> -->

  <main>
    <div class="drawing-board-wrapper container">
      <DrawingBoard v-model="graph" />
    </div>

    <LeftPanel v-model="graph" />
    
    <RightPanel v-model="graph" />
  </main>
</template>
