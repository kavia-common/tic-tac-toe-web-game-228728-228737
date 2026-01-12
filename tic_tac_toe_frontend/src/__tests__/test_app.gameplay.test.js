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

function getScoreItem(labelRegex) {
  // Scoreboard items are labeled via aria-label on the item container.
  return screen.getByLabelText(labelRegex);
}

describe("Tic Tac Toe App - gameplay", () => {
  test("initial render: status shows Next: X, board is empty, and scoreboard starts at 0", () => {
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

    expect(getScoreItem(/x wins/i)).toHaveTextContent("0");
    expect(getScoreItem(/o wins/i)).toHaveTextContent("0");
    expect(getScoreItem(/draws/i)).toHaveTextContent("0");

    // New Round + Reset All are always available.
    expect(screen.getByRole("button", { name: /^new round$/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /^reset all$/i })).toBeEnabled();
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

  test("a win increments the scoreboard and New Round resets the board but keeps the scoreboard", async () => {
    const user = userEvent.setup();
    render(<App />);

    // X: 1, O: 4, X: 2, O: 5, X: 3 => X wins
    await clickSquare(user, 1); // X
    await clickSquare(user, 4); // O
    await clickSquare(user, 2); // X
    await clickSquare(user, 5); // O
    await clickSquare(user, 3); // X -> win

    expect(screen.getByRole("status")).toHaveTextContent("Winner: X");

    // Scoreboard updated
    expect(getScoreItem(/x wins/i)).toHaveTextContent("1");
    expect(getScoreItem(/o wins/i)).toHaveTextContent("0");
    expect(getScoreItem(/draws/i)).toHaveTextContent("0");

    // Focus management: when round ends, focus should move to New Round.
    expect(screen.getByRole("button", { name: /^new round$/i })).toHaveFocus();

    // New Round clears the board but keeps scoreboard.
    await user.click(screen.getByRole("button", { name: /^new round$/i }));

    expect(screen.getByRole("status")).toHaveTextContent("Next: X");
    for (let i = 1; i <= 9; i += 1) {
      expect(
        screen.getByRole("button", { name: new RegExp(`square ${i}, empty`, "i") })
      ).toBeInTheDocument();
    }

    expect(getScoreItem(/x wins/i)).toHaveTextContent("1");
    expect(getScoreItem(/o wins/i)).toHaveTextContent("0");
    expect(getScoreItem(/draws/i)).toHaveTextContent("0");
  });

  test("a draw increments scoreboard; Reset All clears scoreboard and starts a new round", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Draw move order:
    // X:1 O:2 X:3 O:5 X:4 O:6 X:8 O:7 X:9
    const moves = [1, 2, 3, 5, 4, 6, 8, 7, 9];
    for (const move of moves) {
      await clickSquare(user, move);
    }

    expect(screen.getByRole("status")).toHaveTextContent(/^draw$/i);

    expect(getScoreItem(/x wins/i)).toHaveTextContent("0");
    expect(getScoreItem(/o wins/i)).toHaveTextContent("0");
    expect(getScoreItem(/draws/i)).toHaveTextContent("1");

    await user.click(screen.getByRole("button", { name: /^reset all$/i }));

    expect(getScoreItem(/x wins/i)).toHaveTextContent("0");
    expect(getScoreItem(/o wins/i)).toHaveTextContent("0");
    expect(getScoreItem(/draws/i)).toHaveTextContent("0");

    // Also resets the board
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
    // First tabbable element is New Round; tab again to the first square.
    await user.tab();

    const square1 = screen.getByRole("button", { name: /square 1, empty/i });
    expect(square1).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: /square 1, x/i })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Next: O");
  });
});
