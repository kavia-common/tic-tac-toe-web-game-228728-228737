import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Board from "../components/Board";
import Square from "../components/Square";

describe("Square component (smoke)", () => {
  test("renders with correct aria-label for empty and invokes onSelect on click", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(<Square value={null} onSelect={onSelect} isWinning={false} index={0} />);

    const btn = screen.getByRole("button", { name: /square 1, empty/i });
    expect(btn).toBeInTheDocument();

    await user.click(btn);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  test("renders winning state with highlight class", () => {
    render(<Square value="X" onSelect={() => {}} isWinning index={2} />);
    const btn = screen.getByRole("button", { name: /square 3, x/i });
    expect(btn).toHaveClass("ttt-square--winning");
  });

  test("supports keydown Enter/Space to activate", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(<Square value={null} onSelect={onSelect} isWinning={false} index={1} />);

    const btn = screen.getByRole("button", { name: /square 2, empty/i });
    btn.focus();
    expect(btn).toHaveFocus();

    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onSelect).toHaveBeenCalledTimes(2);
  });
});

describe("Board component (smoke)", () => {
  test("renders a 3x3 grid with 9 squares and wires onPlayAt(index)", async () => {
    const user = userEvent.setup();
    const onPlayAt = jest.fn();

    render(
      <Board
        squares={Array(9).fill(null)}
        onPlayAt={onPlayAt}
        winningLine={null}
      />
    );

    expect(screen.getByRole("grid", { name: /tic tac toe board/i })).toBeInTheDocument();

    const squares = screen.getAllByRole("button", { name: /square \d+, empty/i });
    expect(squares).toHaveLength(9);

    await user.click(screen.getByRole("button", { name: /square 5, empty/i }));
    expect(onPlayAt).toHaveBeenCalledTimes(1);
    expect(onPlayAt).toHaveBeenCalledWith(4);
  });

  test("applies winning highlight to indices in winningLine", () => {
    const squares = Array(9).fill(null);
    squares[0] = "X";
    squares[1] = "X";
    squares[2] = "X";

    render(<Board squares={squares} onPlayAt={() => {}} winningLine={[0, 1, 2]} />);

    expect(screen.getByRole("button", { name: /square 1, x/i })).toHaveClass(
      "ttt-square--winning"
    );
    expect(screen.getByRole("button", { name: /square 2, x/i })).toHaveClass(
      "ttt-square--winning"
    );
    expect(screen.getByRole("button", { name: /square 3, x/i })).toHaveClass(
      "ttt-square--winning"
    );

    // A non-winning square should not have the class
    expect(screen.getByRole("button", { name: /square 4, empty/i })).not.toHaveClass(
      "ttt-square--winning"
    );
  });
});
