function findPath(graph, originNode, destNode) {
    console.log(graph.nodes[0].edgesFrom)

    let visited = [graph.nodes];
    for (let i=0; i<graph.nodes.length; i++) {
        visited[i] = {
            cost: Infinity,
            path: []
        };
    }

    visited = getCostOfNeighbors(graph, visited, originNode, 0, [originNode]);

    if (visited[destNode].cost == Infinity) {
        return undefined;
    } 

    return {
        visitedNodes: visited[destNode].path,
        visitedEdges: [ ]
    };
}

function getCostOfNeighbors(graph, visited, currentNode, currentCost, currentPath) {
    //console.log(currentPath);

    for (let i=0; i<graph.nodes.length; i++) {
        let edge = graph.nodes[currentNode].edgesTo[i];
        let edgeFrom = graph.nodes[i].edgesFrom[currentNode];

        //console.log(edgeFrom)
        
        if (edge === undefined && edgeFrom === undefined)
            continue;
        else if (edge === undefined && edgeFrom !== undefined)
            edge = edgeFrom;
        else if (!graph.properties.directed || !edgeFrom.directed) {
            if (edgeFrom.weight < edge.weight)
                edge = edgeFrom;
        }

        let costToVisit = currentCost + edge.weight;

        if (costToVisit < visited[i].cost) {
            let newPath = currentPath.concat(i);
            visited[i].cost = costToVisit;
            visited[i].path = newPath;
            visited = getCostOfNeighbors(graph, visited, i, costToVisit, newPath);
        }
    }

    return visited;
}

export { findPath };