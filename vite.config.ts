// import { defineConfig } from 'vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

// import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { coverageConfigDefaults } from "vitest/config";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(({ command }) => ({
  plugins: [ cssInjectedByJsPlugin()],
  server: {
    port: 5173,
  },
  test: {
    environment: "happy-dom",
    globals: true,
    reporters: ["junit", "default"],
    outputFile: {
      junit: "./junit.xml",
    },
    setupFiles: "./test/vitest.setup.ts",
        watchExclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.git/**',
      '**/coverage/**',
      '**/junit.xml'
    ],
    coverage: {
      enabled: true,
      globals: true,
      exclude: [
        "/node_modules/",
        "/dist/",
        "/vitest.setup.ts",
        "/index.ts",
        "/coverage/",
        ...coverageConfigDefaults.exclude,
      ],
      reportOnFailure: true,
      reporter: [
        ["clover"],
        ["lcov"],
        ["json"],
        ["html", { subdir: "html" }],
        ["text-summary"],
      ],
      reportsDirectory: "./coverage",
    },
    passWithNoTests: true,
  },
}));
