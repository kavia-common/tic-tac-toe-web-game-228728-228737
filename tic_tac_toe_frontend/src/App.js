import React, { useMemo, useState } from "react";
import "./App.css";
import Board from "./components/Board";
import { calculateWinner, isBoardFull } from "./utils/calculateWinner";

const INITIAL_SQUARES = Array(9).fill(null);

// PUBLIC_INTERFACE
function App() {
  const [squares, setSquares] = useState(INITIAL_SQUARES);
  const [xIsNext, setXIsNext] = useState(true);

  const { winner, line: winningLine } = useMemo(
    () => calculateWinner(squares),
    [squares]
  );

  const isDraw = !winner && isBoardFull(squares);
  const gameOver = Boolean(winner) || isDraw;

  const statusText = useMemo(() => {
    if (winner) return `Winner: ${winner}`;
    if (isDraw) return "Draw";
    return `Next: ${xIsNext ? "X" : "O"}`;
  }, [winner, isDraw, xIsNext]);

  // PUBLIC_INTERFACE
  const handlePlayAt = (index) => {
    // Ignore moves when game is over or square occupied.
    if (gameOver || squares[index]) return;

    setSquares((prev) => {
      const next = prev.slice();
      next[index] = xIsNext ? "X" : "O";
      return next;
    });
    setXIsNext((prev) => !prev);
  };

  // PUBLIC_INTERFACE
  const resetGame = () => {
    setSquares(INITIAL_SQUARES);
    setXIsNext(true);
  };

  return (
    <div className="App">
      <main className="ttt-page">
        <section className="ttt-card" aria-label="Tic Tac Toe game">
          <header className="ttt-header">
            <h1 className="ttt-title">Tic Tac Toe</h1>
            <p className="ttt-subtitle">Local two-player • Ocean Professional</p>
          </header>

          <div
            className="ttt-status"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {statusText}
          </div>

          <div className="ttt-boardWrap" aria-label="Game board area">
            <Board squares={squares} onPlayAt={handlePlayAt} winningLine={winningLine} />
          </div>

          <div className="ttt-controls" aria-label="Game controls">
            <button
              type="button"
              className="ttt-button ttt-button--secondary"
              onClick={resetGame}
            >
              Reset
            </button>

            <button
              type="button"
              className="ttt-button"
              onClick={resetGame}
              disabled={!gameOver}
              aria-disabled={!gameOver}
              title={!gameOver ? "Finish the game to play again" : "Start a new game"}
            >
              Play Again
            </button>
          </div>

          <footer className="ttt-footer">
            <span className="ttt-hint">
              Tip: Use Tab to focus a square, then press Enter/Space to play.
            </span>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
