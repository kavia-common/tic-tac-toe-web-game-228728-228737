import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

test("allows a move and updates status from Next: X to Next: O", async () => {
  const user = userEvent.setup();
  render(<App />);

  // Initial status
  expect(screen.getByRole("status")).toHaveTextContent("Next: X");

  // Click the first square (Square 1)
  await user.click(screen.getByRole("button", { name: /square 1, empty/i }));

  // Status should update
  expect(screen.getByRole("status")).toHaveTextContent("Next: O");
});
