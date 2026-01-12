import React from "react";
import Square from "./Square";

/**
 * PUBLIC_INTERFACE
 * Renders a 3x3 tic tac toe grid.
 */
export default function Board({ squares, onPlayAt, winningLine }) {
  const isWinningIndex = (i) => Array.isArray(winningLine) && winningLine.includes(i);

  return (
    <div className="ttt-board" role="grid" aria-label="Tic Tac Toe board">
      {squares.map((value, i) => (
        <Square
          // Stable key in fixed-size board
          key={i}
          value={value}
          index={i}
          isWinning={isWinningIndex(i)}
          onSelect={() => onPlayAt(i)}
        />
      ))}
    </div>
  );
}
