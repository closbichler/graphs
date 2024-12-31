import { Vector } from './vector.js'

class Node {
    id = -1;
    name = "";
    pos = new Vector(0,0);
    edgesFrom = [];
    edgesTo = [];

    style = {
        selected: false,
        highlighted: false
    }

    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

class Edge {
    directed = true;
    weight = 1;
    tilt = new Vector(0,0);
    
    style = {
        selected: false,
        highlighted: false
    }

    constructor(weight) {
        this.weight = weight;
    }
}

class Graph {
    nodes = [];
    properties = {
        directed: true,
        simple: true,
        loops: true,
        weighted: false
    }

    offset = new Vector();
    zoomFactor = 1;

    constructor(adjMatrix) {
        this.getNodesFromAdjMatrix(adjMatrix);
        this.reposition();
        this.offset.x = window.innerWidth/5;
        this.offset.y = window.innerHeight/5;
    }

    reposition() {
        let cols = 3;
        let minD = 60;
  
        for (let node of this.nodes) {
          node.pos.x = 80 + (node.id%cols)*minD;
          node.pos.y = 80 + node.id*minD;
        }
    }

    putNode(name, x, y) {
        let id = this.nodes.length;
        let newNode = new Node(id, name);
        newNode.pos.x = x;
        newNode.pos.y = y;
        this.nodes.push(newNode);

        for (let i=0; i<this.nodes.length; i++) {
            this.nodes[i].edgesTo[id] = undefined;
            newNode.edgesTo[i] = undefined;
            newNode.edgesFrom[i] = undefined;
        }
    }

    getNodesFromAdjMatrix(adjMatrix) {
        let nNodes = adjMatrix.length;
  
        let diff = this.nodes.length - nNodes;     
        if (diff > 0) {
          this.nodes.splice(nNodes - 1, diff);
        } else if (diff < 0) {
            for (let i=this.nodes.length; i<nNodes; i++)
                this.nodes.push(new Node(i, i.toString()));
        }
  
        this.nodes.forEach((node, index) => {    
            node.edgesTo = [];
            for (let i=0; i<nNodes; i++) {
                let edgeTo = undefined;
                if (adjMatrix[index][i] != 0) {
                    if (this.properties.weighted)
                        edgeTo = new Edge(adjMatrix[index][i]);
                    else
                        edgeTo = new Edge(1);
                }
                node.edgesTo.push(edgeTo);
            } 
            node.edgesFrom = [];
  
            for (let i=0; i<nNodes; i++) {
                let edgeFrom = undefined;
                if (adjMatrix[i][index] != 0) {
                    edgeFrom = this.nodes[i].edgesTo[index];
                }
                node.edgesFrom.push(edgeFrom);
            }
        });
    }

    getAdjMatrix() {
        let matrix = [];
        for (let i=0; i<this.nodes.length; i++) {
            matrix.push([]);
            for (let j=0; j<this.nodes.length; j++) {
                if (this.nodes[i].edgesTo[j] != undefined) {
                    matrix[i].push(this.nodes[i].edgesTo[j].weight);  
                } else {
                    matrix[i].push(0);
                }
            }
        }
        return matrix;
    }

    // Styling
    highlightNodes(path) {
        for (let i of path) {
            if (i < this.nodes.length)
                this.nodes[i].style.highlighted = true;
        }
    }

    dehighlightNodes() {
        for (let node of this.nodes) {
            node.style.highlighted = false;
        }
    }

    highlightEdges(path) {
        let l = this.nodes.length;
        for (let edge of path) {
            if (edge[0] < l && this.nodes[edge[0]] !== undefined &&
                edge[1] < l && this.nodes[edge[0]].edgesTo[edge[1]] !== undefined)
            this.nodes[edge[0]].edgesTo[edge[1]].style.highlighted = true;        
        }
    }

    dehighlightEdges() {
        for (let node of this.nodes) {
            for (let edge of node.edgesTo) {
                if (edge !== undefined)
                    edge.style.highlighted = false;
            }
        }
    }
}

export { Node, Edge, Graph };