import { Vector } from './vector.js'
import { CONSTANTS } from './draw.js'

class Interaction {
  eventCache = []
  debugInfo = "";
  state = {
    mode: 'select',
    selectedNode: undefined,
    selectedEdge: undefined,
    draggingNode: undefined,
    mousePressed: false,
    dragClickPos: undefined,
    zoomPreviousDiff: 0
  }

  constructor(graph) {
    this.graph = graph;
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
    for (let n=0; n<nodes.length; n++) {
      let d = mousePos.distanceTo(nodes[n].pos)
      if (d < nearestDistance) {
        nearestNode = n
        nearestDistance = d
      }
    }
    return nearestNode;
  }

  #edgeSelected(mousePos) {
    let bestEdge = undefined
    let bestDistance = 15

    for (let from = 0; from < this.graph.nodes.length; from++) {
      let nodeFrom = this.graph.nodes[from];

      for (let to = 0; to < nodeFrom.edgesTo.length; to++) {
        if (nodeFrom.edgesTo[to] === undefined)
          continue;

        mousePos = mousePos.sub(nodeFrom.edgesTo[to].offset)
        let nodeTo = this.graph.nodes[to]
        let a = nodeFrom.pos.distanceTo(nodeTo.pos)
        let b = nodeFrom.pos.distanceTo(mousePos)
        let c = nodeTo.pos.distanceTo(mousePos)
        let s = (a + b + c) / 2
        let h = 2 / a * Math.sqrt(s * (s - a) * (s - b) * (s - c))

        if (h < bestDistance) {
          bestEdge = { from: from, to: to };
          bestDistance = h
        }
      }
    }

    return bestEdge;
  }

  #selectNode(node) {
    this.graph.nodes[node].style.selected = true;
    this.state.selectedNode = node;
  }

  deselectNode() {
    if (this.state.selectedNode !== undefined && this.graph.nodes[this.state.selectedNode] !== undefined)
      this.graph.nodes[this.state.selectedNode].style.selected = false;
    this.state.selectedNode = undefined;
  }

  #selectEdge(edge) {
    this.state.selectedEdge = edge;
    this.graph.nodes[edge.from]
      .edgesTo[edge.to].style.selected = true;
  }

  deselectEdge() {
    if (this.state.selectedEdge === undefined)
      return;

    this.debugInfo = "edge (" + this.state.selectedEdge.from
      + "," + this.state.selectedEdge.to + ") deselected";
    this.graph.nodes[this.state.selectedEdge.from]
      .edgesTo[this.state.selectedEdge.to].style.selected = false;
    this.state.selectedEdge = undefined;
  }

  #tryPutNode(pos) {
    let name = this.graph.nodes.length.toString();
    this.graph.putNode(name, pos);
    this.debugInfo = "node " + name + " created";
  }

  #tryPutEdge(node) {
    if (this.state.selectedNode === undefined) {
      this.#selectNode(node);
      this.debugInfo = "node " + node + " selected";
    } else {
      if (node == this.state.selectedNode) {
        // alert for loop
        this.debugInfo = "ERR: loops not implemented";
        this.deselectNode();
      } else if (this.graph.nodes[this.state.selectedNode].edgesTo[node] != undefined) {
        // alert for multi edge
        this.debugInfo = "ERR: multigraph not implemented"
        this.deselectNode();
      } else {
        this.graph.insertEdge(this.state.selectedNode, node, 1)
        this.debugInfo = "edge (" + this.state.selectedNode + "," + node + ") created"
        this.deselectNode()
      }
    }
  }

  #trySelectNode(node) {
    if (this.state.selectedNode == node) {
      this.deselectNode();
      this.debugInfo = "node " + node + " deselected";
    } else {
      this.deselectNode();
      this.#selectNode(node);
      this.debugInfo = "node " + node + " selected";
    }
  }

  #trySelectEdge(edge) {
    if (this.state.selectedEdge === undefined) {
      this.deselectEdge();
      this.#selectEdge(edge);
      this.debugInfo = "edge (" + edge.from + "," + edge.to + ") selected";
    } else if (edge.to == this.state.selectedEdge.to
      && edge.from == this.state.selectedEdge.from) {
      this.deselectEdge();
    } else {
      this.deselectEdge();
      this.#selectEdge(edge);
      this.debugInfo = "edge (" + edge.from + "," + edge.to + ") selected";
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
    this.graph.offset = this.graph.offset.add(mousePos.sub(this.state.dragClickPos))
  }

  onPointerDown(event) {
    this.eventCache.push(event)
    let mousePos = this.#getPositionOnCanvas(event)
    let node = this.#nodeSelected(mousePos);
    let edge = this.#edgeSelected(mousePos);

    if (this.state.mode == 'put-node' && node === undefined) {
      this.#tryPutNode(mousePos);
    } else if (this.state.mode == 'select') {
      if (node !== undefined) {
        this.#trySelectNode(node);
        this.deselectEdge();
      } else if (edge !== undefined) {
        this.#trySelectEdge(edge);
        this.deselectNode();
      } else {
        this.deselectNode();
        this.deselectEdge();
      }
    } else if (this.state.mode == 'put-edge' && node !== undefined) {
      this.#tryPutEdge(node);
    }
  }

  onPointerUp(event) {
    // Remove this event from cache
    let index = this.eventCache.findIndex(
      (cachedEvent) => cachedEvent.pointerId === event.pointerId,
    );
    this.eventCache.splice(index, 1);

    if (this.eventCache.length < 2) {
      this.state.zoomPreviousDiff = -1;
    }

    // Draging things
    this.state.dragging = false
    this.state.draggingNode = undefined
    this.state.dragClickPos = undefined
  }

  onPointerMove(event) {
    // TODO: put into extra funcition
    let index = this.eventCache.findIndex(
      (cachedEvent) => cachedEvent.pointerId === event.pointerId,
    );
    this.eventCache[index] = event;

    let mousePressed = event.buttons >= 1

    if (this.state.mode !== "select" || !mousePressed)
      return

    let mousePos = this.#getPositionOnCanvas(event)
    let node = this.#nodeSelected(mousePos)
    let edge = this.#edgeSelected(mousePos)

    if (this.eventCache.length === 2) {
      this.#zoom()
    } else if (node === undefined && edge === undefined && !this.state.dragging) {
      this.#panCanvas(mousePos)
    } else if (node !== undefined || this.state.dragging) {
      // Drag node
      if (this.state.draggingNode === undefined) {
        this.state.draggingNode = node;
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
    let node = this.#nodeSelected(mousePos);
    let edge = this.#edgeSelected(mousePos);

    // TODO
  }
}


export { Interaction };