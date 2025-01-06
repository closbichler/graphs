import { Vector } from './vector.js'

class Node {
    static NODE_COUNT = 0

    id = -1
    name = ""
    pos = new Vector(0, 0)
    edgesTo = []

    style = {
        selected: false,
        highlighted: false
    }

    constructor(name) {
        this.id = Node.NODE_COUNT++
        this.name = name
    }

    clone() {
        let clone = new Node(this.name)
        clone.pos = this.pos.clone()
        clone.edgesTo = structuredClone(this.edgesTo)
        clone.style = structuredClone(this.style)
        return clone
    }
}

class Edge {
    weight = 1
    tilt = new Vector(0, 0)
    offset = new Vector(0, 0)

    style = {
        selected: false,
        highlighted: false
    }

    constructor(weight) {
        this.weight = weight
    }

    calculateOffset(pos1, pos2) {
        this.offset = Vector.getDistanceVector(pos1, pos2).getPerpendicularRight().mult(5)
    }

    clone() {
        let clone = new Edge(this.weight)
        clone.tilt = this.tilt.clone()
        clone.style = structuredClone(this.style)
        return clone
    }
}

class Graph {
    nodes = []
    properties = {
        directed: true,
        simple: true,
        loops: true,
        weighted: true
    }
    offset = new Vector(0, 0)
    zoomFactor = 1

    constructor(adjMatrix) {
        this.getNodesFromAdjMatrix(adjMatrix)
    }

    reposition() {
        // positions nodes in a circle
        let l = this.nodes.length, d = 20 * l
        this.offset = new Vector(window.innerWidth / 2, window.innerHeight / 2)

        for (let i = 0; i < l; i++) {
            let pos = new Vector(
                Math.sin((i / l) * (Math.PI * 2)) * d,
                Math.cos((i / l) * (Math.PI * 2)) * d)
            this.nodes[i].pos = pos
            this.offset = this.offset.add(pos)
        }
    }

    putNode(name, x, y) {
        let id = this.nodes.length
        let newNode = new Node(name)
        newNode.pos.x = x
        newNode.pos.y = y
        this.nodes.push(newNode)

        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].edgesTo[id] = undefined
            newNode.edgesTo[i] = undefined
        }
    }

    insertEdge(nodeFrom, nodeTo, weight) {
        let edge = new Edge(weight);
        this.nodes[nodeFrom].edgesTo[nodeTo] = edge;
        
        if (!this.properties.directed) {
            this.nodes[nodeTo].edgesTo[nodeFrom] = edge;
        }
        
        this.calculateEdgeOffset()
    }

    getNodesFromAdjMatrix(adjMatrix) {
        let nNodes = adjMatrix.length

        let diff = this.nodes.length - nNodes
        if (diff > 0) {
            this.nodes.splice(nNodes - 1, diff)
        } else if (diff < 0) {
            for (let i = this.nodes.length; i < nNodes; i++)
                this.nodes.push(new Node(i.toString()))
        }

        this.nodes.forEach((node, index) => {
            node.edgesTo = [];
            for (let i = 0; i < nNodes; i++) {
                let edgeTo = undefined;
                if (adjMatrix[index][i] != 0)
                    edgeTo = this.properties.weighted ? new Edge(adjMatrix[index][i]) : new Edge(1);
                node.edgesTo.push(edgeTo);
            }
        })

        this.calculateEdgeOffset()
    }

    getAdjMatrix() {
        let matrix = [];
        for (let i = 0; i < this.nodes.length; i++) {
            matrix.push([]);
            for (let j = 0; j < this.nodes.length; j++) {
                if (this.nodes[i].edgesTo[j] != undefined) {
                    matrix[i].push(this.nodes[i].edgesTo[j].weight);
                } else {
                    matrix[i].push(0);
                }
            }
        }
        return matrix;
    }

    calculateEdgeOffset() {
        for (let n=0; n<this.nodes.length; n++) {
            for (let e=n+1; e<this.nodes.length; e++) {
                if (this.nodes[n].edgesTo[e] === undefined || this.nodes[e].edgesTo[n] === undefined)
                    continue

                this.nodes[e].edgesTo[n].calculateOffset(this.nodes[e].pos, this.nodes[n].pos)
                this.nodes[n].edgesTo[e].calculateOffset(this.nodes[n].pos, this.nodes[e].pos)
            }
        }
    }

    applySampleGraph(sampleNo) {
        let sampleGraph = SAMPLE_GRAPHS[sampleNo]
        this.properties = structuredClone(sampleGraph.properties)
        this.offset = sampleGraph.offset.clone()

        this.nodes = []
        Node.NODE_COUNT = 0
        this.getNodesFromAdjMatrix(sampleGraph.getAdjMatrix())
        
        for (let n=0; n<sampleGraph.nodes.length; n++) {
            this.nodes[n].pos = sampleGraph.nodes[n].pos.clone()
        }

        this.calculateEdgeOffset()
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

const SAMPLE_GRAPHS = [
    new Graph(
        [[0, 1, 0, 0, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 1],
        [0, 0, 0, 0, 0]]),
    new Graph(
        [[0, 1, 0, 0, 1],
        [1, 0, 1, 0, 0],
        [0, 1, 0, 1, 0],
        [0, 0, 1, 0, 1],
        [1, 0, 0, 1, 0]]),
    new Graph(
        [[0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0]]),
    new Graph(
        [[0, 1, 0, 0, 1, 0],
        [0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 1],
        [0, 0, 1, 0, 0, 0],
        [0, 1, 1, 0, 0, 1],
        [0, 1, 0, 1, 0, 0]])
]

SAMPLE_GRAPHS[0].properties = {
    simple: true,
    directed: true,
    weighted: false,
    loops: false
}
SAMPLE_GRAPHS[1].properties = {
    simple: true,
    directed: true,
    weighted: false,
    loops: false
}
SAMPLE_GRAPHS[2].properties = {
    simple: true,
    directed: true,
    weighted: false,
    loops: false
}
SAMPLE_GRAPHS[3].properties = {
    simple: true,
    directed: false,
    weighted: false,
    loops: false
}

SAMPLE_GRAPHS[0].reposition()
SAMPLE_GRAPHS[1].reposition()
let d = 70
SAMPLE_GRAPHS[2].nodes[0].pos = new Vector(3 * d, 0)
SAMPLE_GRAPHS[2].nodes[1].pos = new Vector(d, d)
SAMPLE_GRAPHS[2].nodes[2].pos = new Vector(5 * d, d)
SAMPLE_GRAPHS[2].nodes[3].pos = new Vector(0, 2 * d)
SAMPLE_GRAPHS[2].nodes[4].pos = new Vector(2 * d, 2 * d)
SAMPLE_GRAPHS[2].nodes[5].pos = new Vector(4 * d, 2 * d)
SAMPLE_GRAPHS[2].nodes[6].pos = new Vector(6 * d, 2 * d)
SAMPLE_GRAPHS[2].offset = new Vector(window.innerWidth / 2 - 3 * d, window.innerHeight / 2 - d)
d = 90
SAMPLE_GRAPHS[3].nodes[0].pos = new Vector(0, d)
SAMPLE_GRAPHS[3].nodes[1].pos = new Vector(d, 0)
SAMPLE_GRAPHS[3].nodes[2].pos = new Vector(2 * d, 0)
SAMPLE_GRAPHS[3].nodes[3].pos = new Vector(3 * d, d)
SAMPLE_GRAPHS[3].nodes[4].pos = new Vector(d, 2 * d)
SAMPLE_GRAPHS[3].nodes[5].pos = new Vector(2 * d, 2 * d)
SAMPLE_GRAPHS[3].offset = new Vector(window.innerWidth / 2 - 2 * d, window.innerHeight / 2 - d)

export { Node, Edge, Graph, SAMPLE_GRAPHS }