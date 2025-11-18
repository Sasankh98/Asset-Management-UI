import '@testing-library/jest-dom/vitest';
import { vi } from "vitest";

// simple fetch mock used by your httpService (returns a JSON payload shape compatible with your types)
const defaultJsonResponse = { status: "success", data: [] };

globalThis.fetch = vi.fn(async () => {
  return {
    ok: true,
    status: 200,
    json: async () => defaultJsonResponse,
    text: async () => JSON.stringify(defaultJsonResponse),
  } as unknown as Response;
});

// prevent tests from throwing when calling alert()
globalThis.alert = vi.fn();

// Provide lightweight mocks for react-query hooks so tests that don't wrap with QueryClientProvider won't throw.
// This keeps behavior stable across tests — adjust if specific tests need real QueryClient behavior.
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    // mock useQuery to return a resolved payload matching GoalsResponseDTO shape used by your components
    useQuery: () => {
      return {
        data: { status: "success", data: [] },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      };
    },
    useMutation: () => {
      return {
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
      };
    },
    useQueryClient: () => {
      // minimal stub that provides common methods used in components if any
      return {
        invalidateQueries: vi.fn(),
        getQueryData: vi.fn(),
        setQueryData: vi.fn(),
      };
    },
  };
});