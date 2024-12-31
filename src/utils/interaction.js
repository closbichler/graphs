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
        for (let ni=0; ni<this.graph.nodes.length; ni++) {
            let node = this.graph.nodes[ni];

            for (let ei=0; ei<node.edgesTo.length; ei++) {
                let edge = node.edgesTo[ei];

                if (edge === undefined)
                    continue;

                let x1 = node.pos.x, y1 = node.pos.y,
                    x2 = this.graph.nodes[ei].pos.x, y2 = this.graph.nodes[ei].pos.y;
                
                let h1 = (y2-y1)*x - (x2-x1)*y +x2*y1 - y2*x1;
                let num = Math.abs(h1);
                let h2 = Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2);
                let denom = Math.sqrt(h2);
                let d = num / denom;

                if (d < 10) {
                    let edge = { from: ni, to: ei };
                    return edge;
                }
            }
        }

        return undefined;
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
                let newEdge = new Edge(1);
                this.graph.nodes[this.state.selectedNode].edgesTo[node] = newEdge;

                if (!this.graph.properties.directed) {
                    newEdge.directed = false;
                    if (this.graph.nodes[node].edgesFrom[this.state.selectedNode] == undefined) {
                        this.graph.nodes[node].edgesFrom[this.state.selectedNode] = newEdge;
                    }
                }

                this.debugInfo = "edge (" + this.state.selectedNode + "," + node + ") created";
                this.deselectNode();
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

        
    }
}


export { Interaction };