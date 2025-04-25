import { Vector } from "./vector.js"
import { CONSTANTS } from "./draw.js"

class Interaction {
  eventCache = []
  state = {
    draggingNode: undefined,
    dragClickPos: undefined,
    zoomPreviousDiff: 0,
  }

  constructor(graph) {
    this.graph = graph
  }

  #getPositionOnCanvas(event) {
    let x = (event.offsetX - this.graph.offset.x) / this.graph.zoomFactor
    let y = (event.offsetY - this.graph.offset.y) / this.graph.zoomFactor
    return new Vector(x, y)
  }

  #nodeSelected(mousePos) {
    let nodes = this.graph.nodes
    let nearestNode = undefined
    let nearestDistance = CONSTANTS.nodeSize
    for (let n = 0; n < nodes.length; n++) {
      let d = mousePos.distanceTo(nodes[n].pos)
      if (d < nearestDistance) {
        nearestNode = n
        nearestDistance = d
      }
    }
    return nearestNode
  }

  #edgeSelected(mousePos) {
    let bestEdge = undefined
    let bestDistance = 15

    for (let from = 0; from < this.graph.nodes.length; from++) {
      let nodeFrom = this.graph.nodes[from]

      for (let to = 0; to < nodeFrom.edgesTo.length; to++) {
        if (nodeFrom.edgesTo[to] === undefined) continue

        mousePos = mousePos.sub(nodeFrom.edgesTo[to].offset)
        let nodeTo = this.graph.nodes[to]
        let a = nodeFrom.pos.distanceTo(nodeTo.pos)
        let b = nodeFrom.pos.distanceTo(mousePos)
        let c = nodeTo.pos.distanceTo(mousePos)
        let s = (a + b + c) / 2
        let h = (2 / a) * Math.sqrt(s * (s - a) * (s - b) * (s - c))

        if (h < bestDistance) {
          bestEdge = { from: from, to: to }
          bestDistance = h
        }
      }
    }

    return bestEdge
  }

  #selectNode(node) {
    this.graph.nodes[node].style.selected = true
    this.graph.selection.node = node
  }

  deselectNode() {
    if (this.graph.selection.node === undefined) return

    this.graph.debugInfo = "node " + this.graph.selection.node + " deselected"
    this.graph.nodes[this.graph.selection.node].style.selected = false
    this.graph.selection.node = undefined
  }

  #selectEdge(edge) {
    this.graph.selection.edge = edge
    this.graph.nodes[edge.from].edgesTo[edge.to].style.selected = true
  }

  deselectEdge() {
    if (this.graph.selection.edge === undefined) return

    this.graph.debugInfo =
      "edge (" +
      this.graph.selection.edge.from +
      "," +
      this.graph.selection.edge.to +
      ") deselected"
    this.graph.nodes[this.graph.selection.edge.from].edgesTo[
      this.graph.selection.edge.to
    ].style.selected = false
    this.graph.selection.edge = undefined
  }

  #tryPutNode(pos) {
    let name = this.graph.nodes.length.toString()
    this.graph.putNode(name, pos)
    this.graph.debugInfo = "node " + name + " created"
  }

  #tryPutEdge(node) {
    if (this.graph.selection.node === undefined) {
      this.#selectNode(node)
      this.graph.debugInfo = "node " + node + " selected"
    } else {
      if (node == this.graph.selection.node) {
        // alert for loop
        this.graph.debugInfo = "ERR: loops not implemented"
        this.deselectNode()
      } else if (
        this.graph.nodes[this.graph.selection.node].edgesTo[node] != undefined
      ) {
        // alert for multi edge
        this.graph.debugInfo = "ERR: multigraph not implemented"
        this.deselectNode()
      } else {
        this.graph.insertEdge(this.graph.selection.node, node, 1)
        this.graph.debugInfo =
          "edge (" + this.graph.selection.node + "," + node + ") created"
        this.deselectNode()
      }
    }
  }

  #trySelectNode(node) {
    if (this.graph.selection.node == node) {
      this.deselectNode()
      this.graph.debugInfo = "node " + node + " deselected"
    } else {
      this.deselectNode()
      this.#selectNode(node)
      this.graph.debugInfo = "node " + node + " selected"
    }
  }

  #trySelectEdge(edge) {
    if (this.graph.selection.edge === undefined) {
      this.deselectEdge()
      this.#selectEdge(edge)
      this.graph.debugInfo = "edge (" + edge.from + "," + edge.to + ") selected"
    } else if (
      edge.to == this.graph.selection.edge.to &&
      edge.from == this.graph.selection.edge.from
    ) {
      this.deselectEdge()
    } else {
      this.deselectEdge()
      this.#selectEdge(edge)
      this.graph.debugInfo = "edge (" + edge.from + "," + edge.to + ") selected"
    }
  }

  #zoom() {
    // TODO: repress default zoom event
    let cursor1Pos = this.#getPositionOnCanvas(eventCache[0])
    let cursor2Pos = this.#getPositionOnCanvas(eventCache[1])
    let diff = cursor1Pos.distanceTo(cursor2Pos)

    if (this.state.zoomPreviousDiff > 0) {
      let zoom = (diff - this.state.zoomPreviousDiff) / 100
      this.graph.zoomFactor *= zoom
    }

    this.state.zoomPreviousDiff = diff
  }

  #panCanvas(mousePos) {
    if (this.state.dragClickPos === undefined)
      this.state.dragClickPos = mousePos.clone()
    this.graph.offset = this.graph.offset.add(
      mousePos.sub(this.state.dragClickPos)
    )
  }

  onPointerDown(event) {
    this.eventCache.push(event)
    let mousePos = this.#getPositionOnCanvas(event)
    let node = this.#nodeSelected(mousePos)
    let edge = this.#edgeSelected(mousePos)

    if (this.graph.inputMode == "put-node" && node === undefined) {
      this.#tryPutNode(mousePos)
    } else if (this.graph.inputMode == "put-edge" && node !== undefined) {
      this.#tryPutEdge(node)
    } else if (this.graph.inputMode == "select") {
      if (node !== undefined) {
        this.deselectEdge()
        this.#trySelectNode(node)
      } else if (edge !== undefined) {
        this.deselectNode()
        this.#trySelectEdge(edge)
      } else {
        this.deselectNode()
        this.deselectEdge()
        this.graph.dehighlightNodes()
        this.graph.dehighlightEdges()
      }
    }
  }

  onPointerUp(event) {
    // Remove this event from cache
    let index = this.eventCache.findIndex(
      (cachedEvent) => cachedEvent.pointerId === event.pointerId
    )
    this.eventCache.splice(index, 1)

    if (this.eventCache.length < 2) {
      this.state.zoomPreviousDiff = -1
    }

    // Draging things
    this.state.dragging = false
    this.state.draggingNode = undefined
    this.state.dragClickPos = undefined
  }

  onPointerMove(event) {
    // TODO: put into extra funcition
    let index = this.eventCache.findIndex(
      (cachedEvent) => cachedEvent.pointerId === event.pointerId
    )
    this.eventCache[index] = event

    let mousePressed = event.buttons >= 1

    if (this.graph.inputMode !== "select" || !mousePressed) return

    let mousePos = this.#getPositionOnCanvas(event)
    let node = this.#nodeSelected(mousePos)
    let edge = this.#edgeSelected(mousePos)

    if (this.eventCache.length === 2) {
      this.#zoom()
    } else if (
      node === undefined &&
      edge === undefined &&
      !this.state.dragging
    ) {
      this.#panCanvas(mousePos)
    } else if (node !== undefined || this.state.dragging) {
      // Drag node
      if (this.state.draggingNode === undefined) {
        this.state.draggingNode = node
        this.state.dragging = true
      } else {
        this.graph.nodes[this.state.draggingNode].pos = mousePos.clone()
        this.state.dragging = true
        this.graph.calculateEdgeOffset()
      }
    } else if (edge !== undefined) {
      // TODO: Drag edge
    }
  }

  onContextMenu(event) {
    let mousePos = this.#getPositionOnCanvas(event)
    let node = this.#nodeSelected(mousePos)
    let edge = this.#edgeSelected(mousePos)

    // TODO
  }
}

export { Interaction }
