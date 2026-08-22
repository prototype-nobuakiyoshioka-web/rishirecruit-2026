import { expect, test } from "@playwright/test";

// WordPress実データに依存しない静的ルートのみを対象にしたスモークテスト。
test("robots.txt が sitemap を公開している", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.ok()).toBeTruthy();
  expect(await res.text()).toContain("Sitemap:");
});

test("sitemap.xml が返る", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.ok()).toBeTruthy();
  expect(await res.text()).toContain("<urlset");
});

test("プライバシーページがブランドtitleで描画される", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page).toHaveTitle(/Rishiri Recruit 2026/);
  await expect(
    page.getByRole("heading", { name: "プライバシーポリシー" }),
  ).toBeVisible();
});
