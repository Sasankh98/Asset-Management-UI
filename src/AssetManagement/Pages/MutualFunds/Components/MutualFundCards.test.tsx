import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import MutualFundCard from "./MutualFundCards";

describe("MutualFundCard", () => {
  afterEach(() => cleanup());

  it("renders header and value", () => {
    render(<MutualFundCard header="Total Value" value="₹1,00,000" content="As of today" icon="symbol" />);
    expect(screen.getByText("Total Value")).toBeInTheDocument();
    expect(screen.getByText("₹1,00,000")).toBeInTheDocument();
    expect(screen.getByText("As of today")).toBeInTheDocument();
  });

  it("renders CurrencyRupeeIcon when icon is symbol", () => {
    const { container } = render(
      <MutualFundCard header="Invested" value="₹50,000" content="invested" icon="symbol" />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders ShowChartIcon when icon is chart", () => {
    const { container } = render(
      <MutualFundCard header="Returns" value="12%" content="annualised" icon="chart" />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders TrackChangesIcon when icon is tracking", () => {
    const { container } = render(
      <MutualFundCard header="Target" value="80%" content="progress" icon="tracking" />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders no icon for unknown icon value", () => {
    render(<MutualFundCard header="Test" value="val" content="content" icon="unknown" />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("renders positive value in success color when isColoured=true", () => {
    render(<MutualFundCard header="Gain" value="+5,000" content="profit" icon="chart" isColoured />);
    expect(screen.getByText("+5,000")).toBeInTheDocument();
  });

  it("renders negative value in error color when isColoured=true and value contains -", () => {
    render(<MutualFundCard header="Loss" value="-2,000" content="loss" icon="chart" isColoured />);
    expect(screen.getByText("-2,000")).toBeInTheDocument();
  });

  it("renders non-coloured content by default", () => {
    render(<MutualFundCard header="NAV" value="45.23" content="per unit" icon="symbol" />);
    expect(screen.getByText("per unit")).toBeInTheDocument();
  });

  it("renders numeric content", () => {
    render(<MutualFundCard header="Units" value="500" content={220} icon="tracking" />);
    expect(screen.getByText("220")).toBeInTheDocument();
  });
});
