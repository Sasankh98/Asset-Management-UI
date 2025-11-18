function createQueryKeys() {
  return {
    root: {},
    stocks: {
      all: () => ["stocks"],
    },
    goals: {
      all: () => ["goals"],
    },
  };
}

export const queryKeys = createQueryKeys();
export type QueryKeys = ReturnType<typeof createQueryKeys>;
