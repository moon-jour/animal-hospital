import { expect, test } from "@playwright/test";

async function verifyScrollTopButton(page, viewport) {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const scrollRoot = page.locator("main#top");
  const scrollTopButton = page.getByRole("link", { name: "맨 위로 이동" });

  await expect(scrollTopButton).toBeVisible();
  await expect(scrollTopButton).toHaveAttribute("href", "#top");
  await expect(scrollTopButton).toHaveClass(/is-at-top/);

  await scrollRoot.evaluate((element) => {
    element.scrollTo({ top: element.clientHeight, behavior: "auto" });
  });

  await expect
    .poll(() => scrollRoot.evaluate((element) => Math.round(element.scrollTop)))
    .toBeGreaterThan(300);
  await expect(scrollTopButton).not.toHaveClass(/is-at-top/);

  await scrollTopButton.click();

  await expect.poll(() => scrollRoot.evaluate((element) => Math.round(element.scrollTop))).toBe(0);
  await expect(scrollTopButton).toHaveClass(/is-at-top/);
}

test("floating top button is present and returns desktop users to the top", async ({ page }) => {
  await verifyScrollTopButton(page, { width: 1280, height: 900 });
});

test("floating top button is present and returns mobile users to the top", async ({ page }) => {
  await verifyScrollTopButton(page, { width: 390, height: 844 });
});

test("snap panels fill the visible area below the header", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  const measurements = await page.evaluate(() => {
    const header = document.querySelector(".site-header");
    const scrollRoot = document.querySelector("main#top");
    const panels = Array.from(document.querySelectorAll(".snap-panel"));

    return {
      headerHeight: Math.round(header.getBoundingClientRect().height),
      rootHeight: Math.round(scrollRoot.getBoundingClientRect().height),
      viewportHeight: window.innerHeight,
      panelHeights: panels.map((panel) => Math.round(panel.getBoundingClientRect().height)),
    };
  });

  expect(measurements.rootHeight).toBe(measurements.viewportHeight - measurements.headerHeight);
  expect(measurements.panelHeights.length).toBeGreaterThan(4);
  for (const panelHeight of measurements.panelHeights) {
    expect(panelHeight).toBe(measurements.rootHeight);
  }
});

async function verifySnapPanelFit(page, viewport) {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const overflowReport = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".snap-panel")).map((panel) => ({
      label: panel.id || panel.getAttribute("aria-label") || panel.className,
      overflow: Math.round(panel.scrollHeight - panel.clientHeight),
    }));
  });

  for (const panel of overflowReport) {
    expect(panel.overflow, `${panel.label} overflows its snap panel`).toBeLessThanOrEqual(2);
  }
}

test("snap panel content fits within one desktop viewport", async ({ page }) => {
  await verifySnapPanelFit(page, { width: 1280, height: 720 });
});

test("snap panel content fits within one mobile viewport", async ({ page }) => {
  await verifySnapPanelFit(page, { width: 390, height: 844 });
});

test("wheel snap scroll is controlled and does not overshoot the next panel", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  const result = await page.evaluate(async () => {
    const scrollRoot = document.querySelector("main#top");
    const panelHeight = scrollRoot.clientHeight;
    const samples = [];

    scrollRoot.scrollTo({ top: 0, behavior: "auto" });
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const wheelEvent = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaY: 640,
    });

    scrollRoot.dispatchEvent(wheelEvent);

    const startedAt = performance.now();

    return new Promise((resolve) => {
      const sample = () => {
        const elapsed = performance.now() - startedAt;
        samples.push({ elapsed, top: scrollRoot.scrollTop });

        if (elapsed < 1180) {
          requestAnimationFrame(sample);
          return;
        }

        const tops = samples.map((entry) => entry.top);
        const earlyTops = samples
          .filter((entry) => entry.elapsed <= 280)
          .map((entry) => entry.top);

        resolve({
          defaultPrevented: wheelEvent.defaultPrevented,
          earlyMax: Math.round(Math.max(0, ...earlyTops)),
          finalTop: Math.round(scrollRoot.scrollTop),
          maxTop: Math.round(Math.max(...tops)),
          panelHeight: Math.round(panelHeight),
        });
      };

      requestAnimationFrame(sample);
    });
  });

  expect(result.defaultPrevented).toBe(true);
  expect(result.earlyMax).toBeLessThan(result.panelHeight * 0.45);
  expect(result.maxTop).toBeLessThanOrEqual(result.panelHeight + 2);
  expect(result.finalTop).toBe(result.panelHeight);
});
