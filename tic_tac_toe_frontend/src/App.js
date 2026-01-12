import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import Board from "./components/Board";
import { calculateWinner, isBoardFull } from "./utils/calculateWinner";

const INITIAL_SQUARES = Array(9).fill(null);

function getRoundResult(squares) {
  const { winner } = calculateWinner(squares);
  const isDraw = !winner && isBoardFull(squares);

  if (winner === "X") return "X";
  if (winner === "O") return "O";
  if (isDraw) return "D";
  return null;
}

// PUBLIC_INTERFACE
function App() {
  const [squares, setSquares] = useState(INITIAL_SQUARES);
  const [xIsNext, setXIsNext] = useState(true);

  // Simple in-memory scoreboard for the current session.
  const [score, setScore] = useState({ x: 0, o: 0, draws: 0 });

  // Used to move focus to a meaningful element when a round ends.
  const roundEndFocusRef = useRef(null);

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

  // Update the scoreboard exactly once per finished round.
  const prevRoundResultRef = useRef(null);
  useEffect(() => {
    const result = getRoundResult(squares);

    if (result && prevRoundResultRef.current !== result) {
      setScore((prev) => {
        if (result === "X") return { ...prev, x: prev.x + 1 };
        if (result === "O") return { ...prev, o: prev.o + 1 };
        return { ...prev, draws: prev.draws + 1 };
      });
      prevRoundResultRef.current = result;

      // Focus management: after game ends, move focus to "New Round" for quick restart.
      // This also helps screen reader users discover the next action.
      requestAnimationFrame(() => {
        roundEndFocusRef.current?.focus?.();
      });
    }
  }, [squares]);

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
  const newRound = () => {
    setSquares(INITIAL_SQUARES);
    setXIsNext(true);
    // Allow the next completed round to be recorded.
    prevRoundResultRef.current = null;
  };

  // PUBLIC_INTERFACE
  const resetAll = () => {
    setScore({ x: 0, o: 0, draws: 0 });
    newRound();
  };

  return (
    <div className="App">
      <header className="ttt-appHeader" aria-label="App header">
        <div className="ttt-appHeader__inner">
          <h1 className="ttt-appTitle">Tic Tac Toe</h1>
        </div>
      </header>

      <main className="ttt-page">
        <section className="ttt-card" aria-label="Tic Tac Toe game">
          <header className="ttt-header">
            <p className="ttt-subtitle">Local two-player • Ocean Professional</p>
          </header>

          <section className="ttt-scoreboard" aria-label="Scoreboard">
            <div className="ttt-scoreboard__item" aria-label="X wins">
              <div className="ttt-scoreboard__label">X</div>
              <div className="ttt-scoreboard__value">{score.x}</div>
            </div>

            <div className="ttt-scoreboard__item" aria-label="Draws">
              <div className="ttt-scoreboard__label">Draws</div>
              <div className="ttt-scoreboard__value">{score.draws}</div>
            </div>

            <div className="ttt-scoreboard__item" aria-label="O wins">
              <div className="ttt-scoreboard__label">O</div>
              <div className="ttt-scoreboard__value">{score.o}</div>
            </div>
          </section>

          <div
            className="ttt-status"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {statusText}
          </div>

          <div className="ttt-boardWrap" aria-label="Game board area">
            <Board
              squares={squares}
              onPlayAt={handlePlayAt}
              winningLine={winningLine}
            />
          </div>

          <div className="ttt-controls" aria-label="Game controls">
            <button
              type="button"
              className="ttt-button ttt-button--secondary"
              onClick={newRound}
              ref={roundEndFocusRef}
            >
              New Round
            </button>

            <button
              type="button"
              className="ttt-button ttt-button--danger"
              onClick={resetAll}
            >
              Reset All
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
