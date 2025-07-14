import { beforeEach, describe, test,  vi, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "./NotFound";

describe("NotFound Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<NotFound />);
  });

  test("renders NotFound component", () => {
    expect(screen.getByText("Ooops!!! Page Not Found")).toBeInTheDocument();
  });

});