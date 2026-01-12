import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

/**
 * Helper: click a square by its 1-based index using the component's aria-label.
 */
async function clickSquare(user, oneBasedIndex) {
  await user.click(
    screen.getByRole("button", { name: new RegExp(`square ${oneBasedIndex},`, "i") })
  );
}

describe("Tic Tac Toe App - gameplay", () => {
  test("initial render: status shows Next: X and board is empty", () => {
    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("Next: X");

    // Ensure all 9 squares render and are empty (aria-label ends with 'empty')
    const squares = screen.getAllByRole("button", { name: /square \d+, (empty|x|o)/i });
    expect(squares).toHaveLength(9);

    for (let i = 1; i <= 9; i += 1) {
      expect(
        screen.getByRole("button", { name: new RegExp(`square ${i}, empty`, "i") })
      ).toBeInTheDocument();
    }

    // Play Again should be disabled until game ends; Reset is always available.
    expect(screen.getByRole("button", { name: /^play again$/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^reset$/i })).toBeEnabled();
  });

  test("clicking a square marks it and toggles status to the next player", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("Next: X");

    await clickSquare(user, 1);

    // Square 1 now contains X
    expect(screen.getByRole("button", { name: /square 1, x/i })).toBeInTheDocument();
    // Next player toggles to O
    expect(screen.getByRole("status")).toHaveTextContent("Next: O");
  });

  test("disallows clicking an already-filled square", async () => {
    const user = userEvent.setup();
    render(<App />);

    await clickSquare(user, 1);
    expect(screen.getByRole("button", { name: /square 1, x/i })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Next: O");

    // Try to click the same square again; should be ignored (still X, still Next: O).
    await clickSquare(user, 1);
    expect(screen.getByRole("button", { name: /square 1, x/i })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Next: O");
  });

  test("detects a winner and prevents further moves; winning squares are highlighted", async () => {
    const user = userEvent.setup();
    render(<App />);

    // X: 1, O: 4, X: 2, O: 5, X: 3 => X wins on top row [0,1,2]
    await clickSquare(user, 1); // X
    await clickSquare(user, 4); // O
    await clickSquare(user, 2); // X
    await clickSquare(user, 5); // O
    await clickSquare(user, 3); // X -> win

    expect(screen.getByRole("status")).toHaveTextContent("Winner: X");

    // Winning squares should have winning class
    expect(screen.getByRole("button", { name: /square 1, x/i })).toHaveClass(
      "ttt-square--winning"
    );
    expect(screen.getByRole("button", { name: /square 2, x/i })).toHaveClass(
      "ttt-square--winning"
    );
    expect(screen.getByRole("button", { name: /square 3, x/i })).toHaveClass(
      "ttt-square--winning"
    );

    // Attempt further move after win should be ignored (square remains empty)
    await clickSquare(user, 9);
    expect(screen.getByRole("button", { name: /square 9, empty/i })).toBeInTheDocument();

    // Play Again becomes enabled when game is over
    expect(screen.getByRole("button", { name: /^play again$/i })).toBeEnabled();
  });

  test("detects a draw (full board without winner) and shows Draw status", async () => {
    const user = userEvent.setup();
    render(<App />);

    // This move order leads to a draw (no winning line):
    // X:1 O:2 X:3 O:5 X:4 O:6 X:8 O:7 X:9
    const moves = [1, 2, 3, 5, 4, 6, 8, 7, 9];
    for (const move of moves) {
      await clickSquare(user, move);
    }

    expect(screen.getByRole("status")).toHaveTextContent(/^draw$/i);
    expect(screen.getByRole("button", { name: /^play again$/i })).toBeEnabled();

    // No winning classes should be applied on draw
    const allSquares = screen.getAllByRole("button", { name: /square \d+, (x|o)/i });
    for (const sq of allSquares) {
      expect(sq).not.toHaveClass("ttt-square--winning");
    }
  });

  test("reset button restores initial state (empty board, Next: X, Play Again disabled)", async () => {
    const user = userEvent.setup();
    render(<App />);

    await clickSquare(user, 1);
    await clickSquare(user, 2);

    expect(screen.getByRole("status")).toHaveTextContent("Next: X");
    expect(screen.getByRole("button", { name: /square 1, x/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /square 2, o/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^reset$/i }));

    expect(screen.getByRole("status")).toHaveTextContent("Next: X");
    for (let i = 1; i <= 9; i += 1) {
      expect(
        screen.getByRole("button", { name: new RegExp(`square ${i}, empty`, "i") })
      ).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: /^play again$/i })).toBeDisabled();
  });

  test("Play Again button resets the game after game over", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Force a win quickly
    await clickSquare(user, 1); // X
    await clickSquare(user, 4); // O
    await clickSquare(user, 2); // X
    await clickSquare(user, 5); // O
    await clickSquare(user, 3); // X wins

    expect(screen.getByRole("status")).toHaveTextContent("Winner: X");

    await user.click(screen.getByRole("button", { name: /^play again$/i }));

    expect(screen.getByRole("status")).toHaveTextContent("Next: X");
    for (let i = 1; i <= 9; i += 1) {
      expect(
        screen.getByRole("button", { name: new RegExp(`square ${i}, empty`, "i") })
      ).toBeInTheDocument();
    }
  });
});

describe("Tic Tac Toe App - accessibility", () => {
  test("squares are keyboard-activatable (Enter/Space) and focus is reachable", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Tab to first square and press Enter
    await user.tab();
    const square1 = screen.getByRole("button", { name: /square 1, empty/i });
    expect(square1).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: /square 1, x/i })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Next: O");

    // Tab to second square and press Space
    await user.tab();
    const square2 = screen.getByRole("button", { name: /square 2, empty/i });
    expect(square2).toHaveFocus();

    // user-event uses " " for spacebar when typing characters; use keyboard with explicit Space.
    await user.keyboard(" ");
    expect(screen.getByRole("button", { name: /square 2, o/i })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Next: X");
  });
});
