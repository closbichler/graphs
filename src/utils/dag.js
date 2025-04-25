function isDAG(graph) {
  let matrix = graph.getAdjMatrix()
  let removedNodes = 0

  while (matrix.length != removedNodes) {
    let spring = -1
    for (let i = 0; i < matrix.length; i++) {
      if (!nodeHasPredecessor(matrix, i)) {
        spring = i
        break
      }
    }
    if (spring == -1) return false
    removedNodes++
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (i == spring || j == spring) matrix[i][j] = 0
      }
    }
  }
  return true
}

function nodeHasPredecessor(matrix, nodeIndex) {
  for (let i = 0; i < matrix.length; i++) {
    if (matrix[i][nodeIndex] != 0) return true
  }
  return false
}

export { isDAG }
