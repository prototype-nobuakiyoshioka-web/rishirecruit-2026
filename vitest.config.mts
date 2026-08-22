import { defineConfig } from "vitest/config";

// 純粋ロジックのユニットテスト。DOM不要のため node 環境で実行する。
// `@/` エイリアスは Vite ネイティブの tsconfigPaths 解決を使う。
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    globals: true,
  },
});
