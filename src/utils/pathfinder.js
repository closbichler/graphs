function findPath(graph, originNode, destNode) {
  let visited = [graph.nodes.length]
  for (let i = 0; i < graph.nodes.length; i++) {
    visited[i] = {
      predecessor: undefined,
      cost: Infinity
    }
  }

  visited = getCostOfNeighbors(graph, visited, originNode, 0, destNode)

  console.log(visited)

  if (visited[destNode].cost == Infinity) {
    return undefined
  }

  let path = [destNode]
  let currentNode = destNode
  while (currentNode != originNode) {
    currentNode = visited[currentNode].predecessor
    path.push(currentNode)
  }

  return path.reverse()
}

function getCostOfNeighbors(graph, visited, currentNode, currentCost, destNode) {
  if (currentNode === destNode)
    return visited

  let visitedThisTime = []
  for (let i = 0; i < graph.nodes.length; i++) {
    let edge = getEdge(graph, currentNode, i)
    if (edge === undefined) continue

    let costToVisit = currentCost + edge.weight
    if (costToVisit < visited[i].cost) {
      visited[i].cost = costToVisit
      visited[i].predecessor = currentNode
      visitedThisTime.push(i)
    }
  }

  visitedThisTime.sort((a, b) => visited[a].cost < visited[b].cost)
  for (let n of visitedThisTime) {
    visited = getCostOfNeighbors(graph, visited, n, visited[n].cost, destNode)
  }

  return visited
}

// Hack, because undirected graphs have directed edges
function getEdge(graph, from, to) {
  let edgeTo = graph.nodes[from].edgesTo[to]
  if (edgeTo !== undefined)
    return edgeTo
  
  let edgeFrom = graph.nodes[to].edgesTo[from]
  if (edgeFrom !== undefined && !graph.properties.directed)
    return edgeFrom
}

export { findPath }