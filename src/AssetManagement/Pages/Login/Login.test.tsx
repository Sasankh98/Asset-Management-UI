import { beforeEach, describe, test,  vi, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Login from "./Login";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

describe("Login Component", () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    render(<Login />);
  });

  test("renders Login component", () => {
    expect(screen.getByTestId("login-wrapper")).toBeInTheDocument();
  });

  
  });