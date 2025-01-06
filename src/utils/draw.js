import { Vector } from './vector.js'

const CONSTANTS = {
  nodeSize: 30,
  defaultColor: "#000",
  selectColor: "#f00",
  highlightColor: "#06d",
  gridSize: 30
}

function clearCanvas(canvas, ctx) {
  ctx.fillStyle = "#fff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function drawGrid(canvas, ctx) {
  ctx.lineWidth = 1
  ctx.strokeStyle = "#ddd"

  for (let i = 0; i < canvas.width; i += CONSTANTS.gridSize) {
    ctx.moveTo(i, 0)
    ctx.lineTo(i, canvas.height)
  }

  for (let j = 0; j < canvas.height; j += CONSTANTS.gridSize) {
    ctx.moveTo(0, j)
    ctx.lineTo(canvas.width, j)
  }

  ctx.stroke()
}

function drawNode(ctx, node) {
  ctx.lineWidth = 2
  ctx.fillStyle = "#fff"
  if (node.style.selected)
    ctx.strokeStyle = CONSTANTS.selectColor
  else if (node.style.highlighted)
    ctx.strokeStyle = CONSTANTS.highlightColor
  else
    ctx.strokeStyle = CONSTANTS.defaultColor

  ctx.beginPath()
  ctx.arc(node.pos.x, node.pos.y, CONSTANTS.nodeSize, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
  ctx.closePath()

  ctx.lineWidth = 0.8
  ctx.font = "14px sans-serif"
  ctx.textAlign = "center"
  ctx.strokeText(node.name, node.pos.x, node.pos.y + CONSTANTS.nodeSize / 5)
}

function drawArrow(ctx, node1, node2) {
  let edgeVector = Vector.getDistanceVector(node1.pos, node2.pos).getUnitVector()
  let arrowStart = node2.pos.sub(edgeVector.mult(CONSTANTS.nodeSize))
  let arrowEnd = arrowStart.sub(edgeVector.mult(12))
  let arrowRight = arrowEnd.add(edgeVector.perpendicularRight().mult(5))
  let arrowLeft = arrowEnd.add(edgeVector.perpendicularLeft().mult(5))

  ctx.moveTo(arrowStart.x, arrowStart.y)
  ctx.lineTo(arrowRight.x, arrowRight.y)
  ctx.moveTo(arrowStart.x, arrowStart.y)
  ctx.lineTo(arrowLeft.x, arrowLeft.y)
  ctx.stroke()
}

function drawEdge(ctx, node1, node2, edge, graphProperties) {
  ctx.lineWidth = 2
  if (edge.style.selected)
    ctx.strokeStyle = CONSTANTS.selectColor
  else if (edge.style.highlighted)
    ctx.strokeStyle = CONSTANTS.highlightColor
  else
    ctx.strokeStyle = CONSTANTS.defaultColor

  ctx.translate(edge.offset.x, edge.offset.y)

  // edge
  ctx.beginPath()
  ctx.moveTo(node1.pos.x, node1.pos.y)
  let anchor = Vector.getMidpoint(node1.pos, node2.pos).add(edge.tilt)
  ctx.quadraticCurveTo(anchor.x, anchor.y, node2.pos.x, node2.pos.y)
  ctx.closePath()
  ctx.stroke()

  // arrow
  if (graphProperties.directed) {
    drawArrow(ctx, node1, node2)
  }

  // weight text
  if (graphProperties.weighted) {
    ctx.font = "10pt sans-serif"
    ctx.fillStyle = "#000"
    let mid = Vector.getMidpoint(node1.pos, node2.pos)
    let perp = Vector.getDistanceVector(node1.pos, node2.pos).getUnitVector().perpendicularRight().mult(14)
    ctx.fillText(edge.weight, mid.x + perp.x, mid.y + perp.y)
  }

  ctx.translate(-edge.offset.x, -edge.offset.y)
}

function drawGraph(canvas, graph) {
  let ctx = canvas.getContext("2d")
  clearCanvas(canvas, ctx)
  drawGrid(canvas, ctx)

  ctx.translate(graph.offset.x, graph.offset.y)
  ctx.scale(graph.zoomFactor, graph.zoomFactor)

  for (let n = 0; n < graph.nodes.length; n++) {
    let node = graph.nodes[n]
    for (let i = 0; i < graph.nodes.length; i++) {
      let edge = node.edgesTo[i]
      let destNode = graph.nodes[i]

      if (edge === undefined)
        continue

      drawEdge(ctx, node, destNode, edge, graph.properties)
    }
  }

  for (let node of graph.nodes) {
    drawNode(ctx, node)
  }

  ctx.translate(-graph.offset.x, -graph.offset.y)
}

export { drawGraph, CONSTANTS }