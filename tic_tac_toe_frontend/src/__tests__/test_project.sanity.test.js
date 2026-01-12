import { render, screen } from "@testing-library/react";
import App from "../App";

/**
 * Note: CRA tests run in Jest/JSDOM and don't easily introspect package.json at runtime
 * without custom Jest config. Instead, we assert runtime UI doesn't show CRA template text
 * and rely on CI invocation `CI=true npm test -- --watchAll=false` for non-interactive runs.
 */
describe("Project sanity checks", () => {
  test("App does not render CRA template remnants (e.g., 'Learn React')", () => {
    render(<App />);
    expect(screen.queryByText(/learn react/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/edit src\/app\.js/i)).not.toBeInTheDocument();
  });

  test("App renders expected title", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: /^tic tac toe$/i })
    ).toBeInTheDocument();
  });
});
