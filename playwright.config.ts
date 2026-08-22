import { defineConfig, devices } from "@playwright/test";

// E2Eスモークテスト。WordPress実データに依存しない静的ルートを対象にする(CI安定性優先)。
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  // テスト実行時に dev サーバを自動起動する(既に起動中なら再利用)。
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
