import { describe, it, expect } from "vitest";
import { render,screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

describe('ErrorBoundary', () => {
  it('catches errors and displays fallback', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something Went Wrong/)).toBeInTheDocument();
  });

//   it('resets when retry button clicked', () => {
//     const { rerender } = render(
//       <ErrorBoundary>
//         <div>Content</div>
//       </ErrorBoundary>
//     );

    // Trigger error...
    // Click retry button...
    // Verify content renders again...
//   });
});