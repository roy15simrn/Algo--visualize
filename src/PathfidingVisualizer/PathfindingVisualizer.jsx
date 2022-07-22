import React, { Component } from "react";
import Node from "./Node/Node";

import {
  dijkstra,
  AStrat,
  BFS,
  DFS,
  generateMaze,
  getShortestPath,
} from "../Algorithm/Algorithm";

import "./PathfindingVisualizer.css";
import { isLabelWithInternallyDisabledControl } from "@testing-library/user-event/dist/utils";
import { toHaveDescription } from "@testing-library/jest-dom/dist/matchers";
import { Navbar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import bootstrap from "bootstrap";

export default class PathfindingVisualizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      grid: [],
      numRow: 17,
      numCol: 43,
      sr: 8,
      sc: 6,
      fr: 8,
      fc: 34,
      isWall: false,
      mouseIsPressed: false,
      changingStart: false,
      changingFinish: false,
      rendering: false,
      visualized: false,
      mazeGenerating: false,
      currentAlgorithm: -1,
      algorithms: ["Dijkstra", "A Srar", "BFS", "DFS"],
      pathfindingAlgorithms: [dijkstra, AStrat, BFS, DFS],
      currentSpeed: "median",
      speeds: { fast: 10, median: 15, slow: 20 },
      mazeSpeed: 18,
    };
    this.newGridToggled = this.newGridToggled.bind(this);
    this.visualizeAlgorithm = this.visualizeAlgorithm.bind(this);
    this.clearVisulaizer = this.clearVisulaizer.bind(this);
    this.visualizeMaze = this.visualizeMaze.bind(this);
    this.setAlgorithm = this.setAlgorithm.bind(this.setAlgorithm);
  }

  componentDidMount() {
    const grid = this.initializeGrid(false);
    this.setState({ grid: grid });
  }

  handleShow() {
    const modal = document.getElementById("myModal");
    modal.style.display = "none";
  }

  setAlgorithm = (algoI) => {
    this.setState({ currentAlgorithm: algoI });
    console.log(algoI);
  };

  setSpeed(speed) {
    this.setState({ currentSpeed: speed });
  }

  initializeGrid(clearWall) {
    const grid = [];
    for (let row = 0; row < this.state.numRow; row++) {
      const currentRow = [];
      for (let col = 0; col < this.state.numCol; col++) {
        const element = document.getElementById(`node-${row}-${col}`);
        let isW = false;
        if (
          element &&
          (element.className === "node node-path" ||
            element.className === "node node-visited")
        ) {
          element.className = "node";
        }
        if (!clearWall && element && element.className === "node node-wall") {
          isW = true;
        }
        currentRow.push(this.setNode(row, col, isW));
      }
      grid.push(currentRow);
    }
    // console.log(grid);
    return grid;
  }
  setNode(row, col, isW) {
    return {
      row,
      col,
      isStart: row === this.state.sr && col === this.state.sc,
      isFinish: row === this.state.fr && col === this.state.fc,
      distance: Infinity,
      isVisited: false,
      isWall: isW,
      previousNode: null,
      heuristics: Infinity,
    };
  }

  handleMouseDown(row, col) {
    if (row === this.state.sr && col === this.state.sc) {
      this.setState({ changingStart: true });
    } else if (row === this.state.fr && col === this.state.fc) {
      this.setState({ changingFinish: true });
    } else if (!this.state.rendering) {
      this.newGridToggled(this.state.grid, row, col);
      this.setState({ mouseIsPressed: true });
      this.clearVisitedAndPath(false);
    }
  }

  handleMouseEnter(row, col) {
    if (this.state.mouseIsPressed) {
      this.newGridToggled(this.state.grid, row, col);
      this.setState({ mouseIsPressed: true });
    } else if (this.state.changingStart) {
      let start = document.getElementById(
        `node-${this.state.sr}-${this.state.sc}`
      );

      let newStart = document.getElementById(`node-${row}-${col}`);

      if (start !== newStart) {
        start.isStart = false;
        this.state.grid[this.state.sr][this.state.sc].isStart = false;
        newStart.isStart = true;
        this.state.grid[row][col].isStart = true;
      }
      start = newStart;
      this.setState({ sr: row, sc: col });
      this.clearVisitedAndPath(false);
    }

    if (this.state.changingFinish) {
      let finish = document.getElementById(
        `node-${this.state.fr}-${this.state.fc}`
      );
      let newFinish = document.getElementById(`node-${row}-${col}`);
      if (finish !== newFinish) {
        finish.isFinish = false;
        this.state.grid[this.state.fr][this.state.fc].isFinish = false;
        newFinish.isFinish = true;
        this.state.grid[row][col].isFinish = true;
      }
      finish = newFinish;
      this.setState({ fr: row, fc: col });
      this.clearVisitedAndPath(false);
    }
  }

  handleMouseUp() {
    this.setState({
      changingStart: false,
      changingFinish: false,
      mouseIsPressed: false,
    });
  }
  newGridToggled(grid, row, col) {
    const node = grid[row][col];
    let newNode = {
      ...node,
      isWall: !node.isWall,
    };
    grid[row][col] = newNode;
  }

  animateAlgorithm(visitedNodeInOrder, shortestPath) {
    for (let i = 0; i < visitedNodeInOrder.length; i++) {
      if (i === visitedNodeInOrder.length - 1) {
        setTimeout(() => {
          this.setState({ rendering: false });
          this.animateShortestPath(shortestPath);
        }, this.state.speeds[this.state.currentSpeed] * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodeInOrder[i];
        if (!node.isStart && !node.isFinish)
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-visited";
      }, this.state.speeds[this.state.currentSpeed] * i);
    }
  }

  animateShortestPath(shortestPath) {
    for (let i = 0; i < shortestPath.length; i++) {
      setTimeout(() => {
        const node = shortestPath[i];
        if (!node.isStart && !node.isFinish)
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-path";
      }, this.state.speeds[this.state.currentSpeed] * i);
    }
    // console.log(shortestPath);
  }

  visualizeAlgorithm() {
    if (this.state.rendering) return;
    this.setState({ visualized: true, rendering: true });
    this.setState({ grid: this.initializeGrid(false) });
    const grid = this.state.grid;
    const startNode = grid[this.state.sr][this.state.sc];
    const finishNode = grid[this.state.fr][this.state.fc];
    const visitedNodeInOrder = this.state.pathfindingAlgorithms[
      this.state.currentAlgorithm
    ](grid, startNode, finishNode);
    const shortestPath = getShortestPath(finishNode);
    this.animateAlgorithm(visitedNodeInOrder, shortestPath);
  }
  visualizeMaze() {
    if (this.state.mazeGenerating) return;
    this.setState({ grid: this.initializeGrid(false), mazeGenerating: true });
    const grid = this.state.grid;
    const startNode = grid[this.state.sr][this.state.sc];
    const finishNode = grid[this.state.fr][this.state.fc];
    const walls = generateMaze(grid, startNode, finishNode);
    for (let i = 0; i <= walls.length; i++) {
      if (i === walls.length) {
        setTimeout(() => {
          let gridM = this.getNewGridWithMaze(this.state.grid, walls);
          this.setState({ grid: gridM });
        }, this.state.mazeSpeed * i);
      }
    }
    walls.forEach((wall, i) => {
      setTimeout(() => {
        const [row, col] = wall;
        document.getElementById(`node-${row}-${col}`).className =
          "node node-wall";
      }, this.state.mazeSpeed * i);
    });
  }

  getNewGridWithMaze(grid, walls) {
    let gridM = grid.slice();
    walls.forEach((wall) => {
      const node = grid[wall[0]][wall[1]];
      let newNode = {
        ...node,
        isWall: true,
      };
      gridM[wall[0]][wall[1]] = newNode;
    });
    return gridM;
  }

  clearVisulaizer() {
    if (!this.state.rendering)
      this.setState({
        grid: this.initializeGrid(true),
        visualized: false,
        mazeGenerating: false,
        currentAlgorithm: -1,
      });

    //console.log(this.state.grid);
  }

  clearVisitedAndPath(clearWall) {
    for (let row = 0; row < this.state.numRow; row++) {
      for (let col = 0; col < this.state.numCol; col++) {
        const node = document.getElementById(`node-${row}-${col}`);
        //console.log(node);
        if (
          node &&
          (node.className === "node node-visited" ||
            node.className === "node node-path")
        ) {
          node.className = "node";
        }
        if (clearWall && node.className === "node node-wall") {
          node.className = "node";
        }
      }
    }
  }
  render() {
    const { grid } = this.state;
    return (
      <>
        <nav className='navbar navbar-customclass navbar-expand' id='navbar'>
          <div className='container-fluid' id='container'>
            <a className='navbar-brand h1' id='navbar-brand'>
              Pathfinding Visualizer
            </a>
            <div className='collapse navbar-collapse' id='navbarNavDropdown'>
              <ul className='navbar-nav me-auto mb-2 mb-1g-0'>
                <li className='nav-item dropdown'>
                  <a
                    className='nav-link dropdown-toggle'
                    href='#'
                    id='navbarDropdown'
                    role='button'
                    data-bs-toggle='dropdown'
                    aria-expanded='false'
                  >
                    {this.state.currentAlgorithm === -1
                      ? "Algorithm"
                      : this.state.algorithms[this.state.currentAlgorithm]}
                  </a>

                  <ul class='dropdown-menu' aria-labelledby='navbarDropdown'>
                    <li>
                      <button
                        className='dropdown-item btn-light'
                        type='button'
                        onClick={() =>
                          this.setAlgorithm(
                            this.state.algorithms.indexOf("Dijkstra")
                          )
                        }
                      >
                        Dijkstra
                      </button>
                    </li>
                    <li>
                      <button
                        className='dropdown-item btn-ligth'
                        type='button'
                        onClick={() =>
                          this.setAlgorithm(
                            this.state.algorithms.indexOf("A Srar")
                          )
                        }
                      >
                        A Srar
                      </button>
                    </li>
                    <li>
                      <button
                        className='dropdown-item btn-ligth'
                        type='button'
                        onClick={() =>
                          this.setAlgorithm(
                            this.state.algorithms.indexOf("BFS")
                          )
                        }
                      >
                        BFS
                      </button>
                    </li>
                    <li>
                      <button
                        className='dropdown-item btn-ligth'
                        type='button'
                        onClick={() =>
                          this.setAlgorithm(
                            this.state.algorithms.indexOf("DFS")
                          )
                        }
                      >
                        DFS
                      </button>
                    </li>
                  </ul>
                </li>
                <li>
                  <a
                    type='button'
                    className='btn btn-maze'
                    onClick={() => this.visualizeMaze()}
                  >
                    Generate Maze
                  </a>
                </li>
                <li>
                  <a
                    type='button'
                    className='btn btn-visualize'
                    onClick={() => this.visualizeAlgorithm()}
                  >
                    Visualize
                  </a>
                </li>
                <li>
                  <a
                    type='button'
                    className='btn btn-visualize'
                    onClick={() => this.clearVisulaizer()}
                  >
                    Reset
                  </a>
                </li>
                <li className='nav-item dropdown'>
                  <a
                    class='nav-link dropdown-toggle'
                    href='#'
                    id='navbarDropdown'
                    role='button'
                    data-bs-toggle='dropdown'
                    aria-expanded='false'
                  >
                    {`Speed:${this.state.currentSpeed}`}
                  </a>
                  <ul
                    className='dropdown-menu'
                    aria-labelledby='navbarDropdown'
                  >
                    <li>
                      <button
                        className='dropdown-item btn-light'
                        type='button'
                        onClick={() => this.setSpeed("fast")}
                      >
                        Fast
                      </button>
                    </li>
                    <li>
                      <button
                        className='dropdown-item btn-light'
                        type='button'
                        onClick={() => this.setSpeed("medium")}
                      >
                        Medium
                      </button>
                    </li>
                    <li>
                      <button
                        className='dropdown-item btn-light'
                        type='button'
                        onClick={() => this.setSpeed("slow")}
                      >
                        Slow
                      </button>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className='grid'>
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const { row, col, isFinish, isStart, isWall } = node;
                  return (
                    <Node
                      row={row}
                      col={col}
                      key={nodeIdx}
                      isStart={isStart}
                      isFinish={isFinish}
                      isWall={isWall}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      mouseIsPressed={this.state.mouseIsPressed}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseUp={() => this.handleMouseUp()}
                    ></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div id='myModal' class='modal' role='dialog'>
          <div class='modal-dialog' id='dialog' role='document'>
            <div class='modal-content intro' id='modal-content'>
              <div class='modal-header'>
                <h3 class='modal-title'>Hello Algorithm</h3>
                <span class='titleClose' onClick={this.handleShow}>
                  X
                </span>
              </div>
              <div class='modal-body intro'>
                <p>
                  Why Algorithm?
                  <br></br>
                  Algorithms are a very important topic in the Computer Science
                  today, not only because they are widely used in the computer
                  device, but also because they help software developers create
                  efficient and error free programs.
                </p>
                <p>
                  Why Algorithm Visualization?<br></br>
                  An algorithm must be seen to be believed (Donald Knuth).
                  <br></br>
                  Humans are highly visual creatures. Half of the human brain is
                  directly or indirectly devoted to processing visual
                  information. By visualizing how algorithms work in a graphical
                  way, we understand better about the algorithms.
                </p>
                <p></p>
                <p>
                  Project Simple Tutoria<br></br>
                  The paths pass from start to the target. <br></br>
                  You may drag the start and target icons to change their
                  positions, and click on the grid to add a wall.
                </p>
                <p>
                  Now please choose an pathfinding algorithm to play around.
                  <br></br>
                  Enjoy!
                </p>
              </div>
              <div class='modal-footer'>
                <button
                  type='button'
                  class='btn btn-default'
                  onClick={this.handleShow}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
