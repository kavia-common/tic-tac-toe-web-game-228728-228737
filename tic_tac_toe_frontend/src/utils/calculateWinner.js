/**
 * Tic Tac Toe pure helpers.
 * Kept isolated for easy unit testing and to keep React components lean.
 */

/**
 * PUBLIC_INTERFACE
 * Determine winner and winning line indices for a given board state.
 * @param {Array<('X'|'O'|null)>} squares - 9-length board array.
 * @returns {{winner: ('X'|'O'|null), line: (number[]|null)}}
 */
export function calculateWinner(squares) {
  const lines = getWinningLines();

  for (const line of lines) {
    const [a, b, c] = line;
    const v = squares[a];
    if (v && v === squares[b] && v === squares[c]) {
      return { winner: v, line };
    }
  }
  return { winner: null, line: null };
}

/**
 * PUBLIC_INTERFACE
 * Whether the board is full with no remaining moves.
 * @param {Array<('X'|'O'|null)>} squares
 * @returns {boolean}
 */
export function isBoardFull(squares) {
  return squares.every((sq) => sq !== null);
}

/**
 * PUBLIC_INTERFACE
 * Get all winning lines (index triplets).
 * @returns {number[][]}
 */
export function getWinningLines() {
  return [
    // Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // Cols
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // Diagonals
    [0, 4, 8],
    [2, 4, 6],
  ];
}
