import React from "react";

/**
 * PUBLIC_INTERFACE
 * A single square in the Tic Tac Toe board.
 * Implemented as a <button> for built-in accessibility and focus behavior.
 */
export default function Square({ value, onSelect, isWinning, index }) {
  const label =
    value === "X"
      ? `Square ${index + 1}, X`
      : value === "O"
        ? `Square ${index + 1}, O`
        : `Square ${index + 1}, empty`;

  const handleKeyDown = (e) => {
    // Buttons already fire click on Enter/Space in browsers,
    // but we explicitly handle to ensure consistent behavior in all environments.
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <button
      type="button"
      className={`ttt-square ${isWinning ? "ttt-square--winning" : ""}`}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      aria-label={label}
    >
      <span className="ttt-square__value" aria-hidden="true">
        {value}
      </span>
    </button>
  );
}
