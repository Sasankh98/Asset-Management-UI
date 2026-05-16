function createQueryKeys() {
  return {
    root: {},
    stocks: {
      all: () => ["stocks"] as const,
    },
    goals: {
      all: () => ["goals"] as const,
    },
    mutualFunds: {
      all: () => ["mutualFunds"] as const,
      dashboard: () => ["mutualFunds", "dashboard"] as const,
    },
    dashboard: {
      all: () => ["dashboard"] as const,
    },
    salary: {
      all: () => ["salary"] as const,
    },
    settings: {
      profile: () => ["settings", "profile"] as const,
    },
    lic: {
      all: () => ["lic"] as const,
    },
    loans: {
      all: () => ["loans"] as const,
    },
    emis: {
      all: () => ["emis"] as const,
    },
    providentFund: {
      config: (user: string) => ["providentFund", user] as const,
    },
    reports: {
      trend: (period: string) => ["reports", "trend", period] as const,
      allocation: () => ["reports", "allocation"] as const,
      statements: (limit: number) => ["reports", "statements", limit] as const,
    },
    stages: {
      defaults: () => ["stages", "defaults"] as const,
    },
  };
}

export const queryKeys = createQueryKeys();
export type QueryKeys = ReturnType<typeof createQueryKeys>;
