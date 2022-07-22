import React, { Component } from "react";

import "./Node.css";

export default class Node extends Component {
  render() {
    const {
      row,
      col,
      isFinish,
      isStart,
      onMouseEnter,
      onMouseDown,
      onMouseUp,
      isWall,
    } = this.props;

    const extraClassName = isFinish
      ? "node-finish"
      : isStart
      ? "node-start"
      : isWall
      ? "node-wall"
      : "";
    return (
      <div
        id={`node-${row}-${col}`}
        className={`node ${extraClassName}`}
        onMouseEnter={() => onMouseEnter(row, col)}
        onMouseDown={() => onMouseDown(row, col)}
        onMouseUp={() => onMouseUp()}
      ></div>
    );
  }
}
