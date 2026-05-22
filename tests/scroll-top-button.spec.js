import { expect, test } from "@playwright/test";

async function verifyScrollTopButton(page, viewport) {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const scrollTopButton = page.getByRole("link", { name: "맨 위로 이동" });

  await expect(scrollTopButton).toBeVisible();
  await expect(scrollTopButton).toHaveAttribute("href", "#top");
  await expect(scrollTopButton).toHaveClass(/is-at-top/);

  await page.evaluate(() => {
    window.scrollTo({ top: window.innerHeight, behavior: "auto" });
  });

  await expect
    .poll(() => page.evaluate(() => Math.round(window.scrollY)))
    .toBeGreaterThan(300);
  await expect(scrollTopButton).not.toHaveClass(/is-at-top/);

  await scrollTopButton.click();

  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(0);
  await expect(scrollTopButton).toHaveClass(/is-at-top/);
}

test("floating top button is present and returns desktop users to the top", async ({ page }) => {
  await verifyScrollTopButton(page, { width: 1280, height: 900 });
});

test("floating top button is present and returns mobile users to the top", async ({ page }) => {
  await verifyScrollTopButton(page, { width: 390, height: 844 });
});
