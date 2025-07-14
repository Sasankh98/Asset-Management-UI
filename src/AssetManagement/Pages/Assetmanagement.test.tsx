import { beforeEach, describe, test, vi, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AssetManagement from "./AssetManagement";
import { BrowserRouter } from "react-router-dom";
import type * as RouterTypes from 'react-router';
import { DisplayContentEnum } from "../../shared/Constants";
// Mock child components to isolate the test
vi.mock("./Dashboard/Dashboard", () => ({
  default: () => <div data-testid="mock-dashboard">Dashboard</div>
}));

vi.mock("../../components/Sidebar/Sidebar", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-sidebar">{children}</div>
  ),
}));

vi.mock("react-router", async (importOriginal) => {
  const original = await importOriginal<typeof RouterTypes>();
  return {
    ...original,
    useParams: () => ({ displayContent: DisplayContentEnum.calculator }),
  };
});

describe("AssetManagement Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(
      <BrowserRouter>
        <AssetManagement />
      </BrowserRouter>
    );
  });

  test("renders AssetManagement component", () => {
    expect(
      screen.getByTestId("asset-management-container")
    ).toBeInTheDocument();
  });
    test("renders Dashboard when displayContent is dashboard", () => {
    expect(screen.getAllByTestId("mock-dashboard")[0]).toBeInTheDocument();
    expect(screen.getAllByTestId("mock-sidebar")[0]).toBeInTheDocument();
  });
});