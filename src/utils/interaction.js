import { Node, Edge, Graph } from './graph.js'
import { Vector } from './vector.js'
import { CONSTANTS } from './draw.js'

class Interaction {
    debugInfo = "";
    state = {
        mode: 'select',
        selectedNode: undefined,
        selectedEdge: undefined,
        draggingNode: undefined,
        mousePressed: false,
        dragClickPos: undefined
    }

    constructor(graph) {
        this.graph = graph;
    }

    #nodeClicked(x, y) {
        for (let node of this.graph.nodes) {
            let xDiff = Math.abs(x - node.pos.x),
                yDiff = Math.abs(y - node.pos.y);
            
            if (Math.pow(xDiff, 2) + Math.pow(yDiff, 2) < Math.pow(CONSTANTS.nodeSize + 15, 2)) {
                return node.id;
            }
        }

        return undefined;
    }

    #edgeClicked(x, y) {
        let bestEdge = undefined
        let bestDistance = 10000

        for (let from=0; from<this.graph.nodes.length; from++) {
            let nodeFrom = this.graph.nodes[from];

            for (let to=0; to<nodeFrom.edgesTo.length; to++) {
                if (nodeFrom.edgesTo[to] === undefined)
                    continue;
                
                let nodeTo = this.graph.nodes[to]
                let mousePos = new Vector(x, y).sub(nodeFrom.edgesTo[to].offset)
                let a = Vector.getDistanceVector(nodeFrom.pos, nodeTo.pos).getLength()
                let b = Vector.getDistanceVector(nodeFrom.pos, mousePos).getLength()
                let c = Vector.getDistanceVector(nodeTo.pos, mousePos).getLength()
                let s = (a + b + c) / 2
                let h = 2/a * Math.sqrt(s*(s-a)*(s-b)*(s-c))

                if (bestEdge === undefined && h < 10 || bestEdge !== undefined && h < bestDistance) {
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

    #tryPutNode(x, y) {
        let name = this.graph.nodes.length.toString();
        this.graph.putNode(name, x, y);
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
        }  else {
            this.deselectEdge();
            this.#selectEdge(edge);
            this.debugInfo = "edge (" + edge.from + "," + edge.to + ") selected";
        }
    }

    onCanvasClick(event) {
        let x = event.offsetX - this.graph.offset.x,
            y = event.offsetY - this.graph.offset.y;
        let node = this.#nodeClicked(x, y);
        let edge = this.#edgeClicked(x, y);

        if (this.state.mode == 'put-node' && node === undefined) {
            this.#tryPutNode(x, y);
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

    onCanvasDrag(event) {
        if (this.state.mode !== "select")
            return false;

        if (event.buttons != 0)
            this.state.mousePressed = true;
        else
            this.state.mousePressed = false;

        let x = event.offsetX - this.graph.offset.x,
            y = event.offsetY - this.graph.offset.y;
        let node = this.#nodeClicked(x, y);
    
        if (this.state.mousePressed) {
            if (node != undefined && this.state.dragging == false &&
                (this.state.draggingNode === undefined || this.graph.nodes[this.state.draggingNode] === undefined)) {
                this.state.draggingNode = node;
            }

            if (this.state.draggingNode !== undefined) {
                this.graph.nodes[this.state.draggingNode].pos.x = x;
                this.graph.nodes[this.state.draggingNode].pos.y = y;
                this.debugInfo = "drag " + this.state.draggingNode;
                this.state.dragging = true;
                this.graph.calculateEdgeOffset()
                return true;
            }

            if (node === undefined) {
                // translate graph
                if (this.state.dragClickPos === undefined) {
                    this.state.dragClickPos = new Vector(x, y);
                }

                this.graph.offset.x += x - this.state.dragClickPos.x;
                this.graph.offset.y += y - this.state.dragClickPos.y;
            }

            this.state.dragging = true;
        } else {
            this.state.dragging = false;

            this.state.draggingNode = undefined;
            this.state.dragClickPos = undefined;
        }

        return false;
    }

    onContextMenu(event) {
        let x = event.offsetX,
        y = event.offsetY;
        let node = this.#nodeClicked(x, y);
        let edge = this.#edgeClicked(x, y);

        // TODO
    }
}


export { Interaction };