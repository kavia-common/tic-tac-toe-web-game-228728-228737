import {
  calculateWinner,
  getWinningLines,
  isBoardFull,
} from "../utils/calculateWinner";

describe("calculateWinner utility", () => {
  test("getWinningLines returns 8 lines of 3 indices each", () => {
    const lines = getWinningLines();
    expect(lines).toHaveLength(8);
    for (const line of lines) {
      expect(line).toHaveLength(3);
      for (const i of line) {
        expect(i).toBeGreaterThanOrEqual(0);
        expect(i).toBeLessThanOrEqual(8);
      }
    }
  });

  test("returns no winner for empty board", () => {
    const squares = Array(9).fill(null);
    expect(calculateWinner(squares)).toEqual({ winner: null, line: null });
  });

  test("returns no winner for board with no winning line", () => {
    // A partial board with no 3-in-a-row
    const squares = ["X", "O", null, null, "X", null, null, null, "O"];
    expect(calculateWinner(squares)).toEqual({ winner: null, line: null });
  });

  test("detects winner for all possible winning lines", () => {
    const lines = getWinningLines();

    for (const line of lines) {
      const squares = Array(9).fill(null);
      squares[line[0]] = "X";
      squares[line[1]] = "X";
      squares[line[2]] = "X";

      const result = calculateWinner(squares);
      expect(result).toEqual({ winner: "X", line });
    }
  });

  test("early-stop: if multiple winning lines exist, returns the first line in getWinningLines order", () => {
    // Create a board where X wins on row [0,1,2] and also col [0,3,6].
    // calculateWinner should return the first matching line in getWinningLines() order:
    // Rows first -> [0,1,2] should win.
    const squares = Array(9).fill(null);
    // Row win [0,1,2]
    squares[0] = "X";
    squares[1] = "X";
    squares[2] = "X";
    // Column win [0,3,6]
    squares[3] = "X";
    squares[6] = "X";

    const result = calculateWinner(squares);
    expect(result.winner).toBe("X");
    expect(result.line).toEqual([0, 1, 2]);
  });
});

describe("isBoardFull utility", () => {
  test("returns false when any square is null", () => {
    expect(isBoardFull([null, ...Array(8).fill("X")])).toBe(false);
  });

  test("returns true when all squares are filled", () => {
    expect(isBoardFull(Array(9).fill("X"))).toBe(true);
  });
});
