import { scryRenderedComponentsWithType } from "react-dom/cjs/react-dom-test-utils.production.min";

export function dijkstra(grid, startNode, finishNode) {
  //Set startNode distance to 0
  startNode.distance = 0;
  //Creat vertex set queue
  const unvisitedNodes = allNodes(grid);
  const visitedNodeInOrder = [];
  //while(!Q is not empty)
  while (!!unvisitedNodes.length) {
    //sort Q by dist,get min dist node in Q
    sortNodes(unvisitedNodes);
    const currentNode = unvisitedNodes.shift();
    //check (isWall,isFinishNode,infinity)
    if (currentNode.isWall) continue;
    if (currentNode === finishNode) return visitedNodeInOrder;
    if (currentNode.distance === Infinity) return visitedNodeInOrder;
    //mark min dist node to be visited;
    currentNode.isVisited = true;
    visitedNodeInOrder.push(currentNode);
    //update neighbourList
    updateUnvisitedNeighbors(currentNode, grid);
  }

  return visitedNodeInOrder;
}

export function AStrat(grid, startNode, finishNode) {
  //Set s distance and heuristic to 0.
  startNode.distance = 0;
  startNode.heuristics = 0;
  const unvisitedNodes = allNodes(grid);
  const visitedNodeInOrder = [];
  while (!!unvisitedNodes.length) {
    //sort node by dis+heu
    sortNodeAStart(unvisitedNodes);
    const currentNode = unvisitedNodes.shift();
    if (currentNode.isWall) continue;
    if (currentNode === finishNode) return visitedNodeInOrder;
    if (currentNode.distance + currentNode.heuristics === Infinity)
      return visitedNodeInOrder;
    currentNode.isVisited = true;
    visitedNodeInOrder.push(currentNode);
    updateUnvisitedNeighborsAStart(currentNode, grid, finishNode);
  }
  return visitedNodeInOrder;
}

export function BFS(grid, startNode, finishNode) {
  //Let Q be a queue(remove from start to end)
  let unvisitedNodes = [];
  const visitedNodeInOrder = [];
  unvisitedNodes.push(startNode);
  //console.log(unvisitedNodes);
  while (!!unvisitedNodes.length) {
    const currentNode = unvisitedNodes.shift();
    //console.log(currentNode);

    if (currentNode.isWall) continue;
    if (currentNode === finishNode) return visitedNodeInOrder;
    currentNode.isVisited = true;
    visitedNodeInOrder.push(currentNode);
    unvisitedNodes = unvisitedNodes.concat(
      getUnvisitedNeighbors(currentNode, grid)
    );

    //console.log(unvisitedNodes);
  }
  //console.log(visitedNodeInOrder);
  return visitedNodeInOrder;
}

export function DFS(grid, startNode, finishNode) {
  //iterative implementation
  // Let S be a stack(First in last out)
  let unvisitedNodes = [];
  const visitedNodeInOrder = [];
  unvisitedNodes.push(startNode);
  while (!!unvisitedNodes.length) {
    const currentNode = unvisitedNodes.pop();
    if (currentNode.isWall) continue;
    if (currentNode === finishNode) return visitedNodeInOrder;
    currentNode.isVisited = true;
    visitedNodeInOrder.push(currentNode);
    unvisitedNodes = unvisitedNodes.concat(
      getUnvisitedNeighbors(currentNode, grid)
    );
  }
  return visitedNodeInOrder;
}

function allNodes(grid) {
  const nodes = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}

//Recursive maze generation
//recursively select random nodes to be walls
//return walls
let walls;
export function generateMaze(grid, startNode, finishNode) {
  if (!startNode || !finishNode || startNode === finishNode) return false;
  let width = range(grid[0].length);
  let height = range(grid.length);
  walls = [];
  getRecursiveWalls(width, height, grid, startNode, finishNode);

  return walls;
}

function range(len) {
  let result = [];
  for (let i = 0; i < len; i++) {
    result.push(i);
  }
  return result;
}

function getRecursiveWalls(width, height, grid, startNode, finishNode) {
  if (height.length < 2 || width.length < 2) {
    return;
  }
  let dir;
  let num;
  if (width.length > height.length) {
    dir = 0;
    num = generateOddRandomNumber(width);
  }
  if (width.length <= height.length) {
    dir = 1;
    num = generateOddRandomNumber(height);
  }
  if (dir === 0) {
    addWall(dir, num, width, height, startNode, finishNode);
    getRecursiveWalls(
      width.slice(0, width.indexOf(num)),
      height,
      grid,
      startNode,
      finishNode
    );
    getRecursiveWalls(
      width.slice(width.indexOf(num) + 1),
      height,
      grid,
      startNode,
      finishNode
    );
  } else {
    addWall(dir, num, width, height, startNode, finishNode);
    getRecursiveWalls(
      width,
      height.slice(0, height.indexOf(num)),
      grid,
      startNode,
      finishNode
    );
    getRecursiveWalls(
      width,
      height.slice(height.indexOf(num) + 1),
      grid,
      startNode,
      finishNode
    );
  }
}

function generateOddRandomNumber(arr) {
  let max = arr.length - 1;
  let randomNum =
    Math.floor(Math.random() * (max / 2)) +
    Math.floor(Math.random() * (max / 2));
  if (randomNum % 2 === 0) {
    if (randomNum === max) {
      randomNum -= 1;
    } else {
      randomNum += 1;
    }
  }
  return arr[randomNum];
}

function addWall(dir, num, width, height, startNode, finishNode) {
  let isStart = false;
  let isFinish = false;
  let tempWalls = [];
  if (dir === 0) {
    if (height.length === 2) return;
    for (let temp of height) {
      if (
        (temp === startNode.row && num === startNode.col) ||
        (temp === finishNode.row && num === finishNode.col)
      ) {
        isStart = true;
        isFinish = true;
        continue;
      }
      tempWalls.push([temp, num]);
    }
  } else {
    if (width.length === 2) return;
    for (let temp of width) {
      if (
        (num === startNode.row && temp === startNode.col) ||
        (num === finishNode.row && temp === finishNode.col)
      ) {
        isStart = true;
        isFinish = true;
        continue;
      }
      tempWalls.push([num, temp]);
      //console.log(tempWalls);
    }
  }
  if (!isStart && !isFinish) {
    tempWalls.splice(generateRandomNumber(tempWalls.length), 1);
  }
  for (let wall of tempWalls) {
    walls.push(wall);
  }
}
function generateRandomNumber(max) {
  let randomNum =
    Math.floor(Math.random() * (max / 2)) +
    Math.floor(Math.random() * (max / 2));
  if (randomNum % 2 !== 0) {
    if (randomNum === max) {
      randomNum -= 1;
    } else {
      randomNum += 1;
    }
  }
  // console.log(randomNum);
  return randomNum;
}

function sortNodes(unvisitedNodes) {
  unvisitedNodes.sort((a, b) => a.distance - b.distance);
}

function sortNodeAStart(unvisitedNodes) {
  unvisitedNodes.sort(
    (a, b) => a.distance + a.heuristics - (b.distance + b.heuristics)
  );
}

function updateUnvisitedNeighbors(currentNode, grid) {
  const neighbors = [];
  const { row, col } = currentNode;
  //check conner
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  //if N is not visited
  //N =c.distance+1
  //update N
  neighbors.forEach((neighbor) => {
    if (!neighbor.isVisited) {
      neighbor.distance = currentNode.distance + 1;
      neighbor.previousNode = currentNode;
    }
    // console.log(neighbors);
  });
}

function updateUnvisitedNeighborsAStart(currentNode, grid, finishNode) {
  const neighbors = [];
  const { row, col } = currentNode;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  neighbors.forEach((neighbor) => {
    if (!neighbor.isVisited) {
      neighbor.distance = currentNode.distance + 1;
      neighbor.heuristics = heuristic(currentNode, finishNode);
      neighbor.previousNode = currentNode;
      //console.log(neighbor.heuristics);
      //console.log(neighbor.distance);
    }
  });
}

function getUnvisitedNeighbors(currentNode, grid) {
  const neighbors = [];
  const neighborsQueue = [];
  const { row, col } = currentNode;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  neighbors.forEach((neighbor) => {
    if (!neighbor.isVisited) {
      neighbor.isVisited = true;
      neighbor.previousNode = currentNode;
      neighborsQueue.push(neighbor);
    }
  });

  //console.log(neighborsQueue);
  return neighborsQueue;
}

function heuristic(currentNode, finishNode) {
  //Manhanttan distance
  const dx = Math.abs(currentNode.row - finishNode.row);
  const dy = Math.abs(currentNode.col - finishNode.col);
  return dx + dy;
}

export function getShortestPath(finishNode) {
  const shortestPath = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    shortestPath.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return shortestPath;
}
