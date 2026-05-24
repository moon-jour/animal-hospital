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

test("trackpad inertia does not skip past the next snap panel", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  const result = await page.evaluate(async () => {
    const scrollRoot = document.querySelector("main#top");
    const panelHeight = scrollRoot.clientHeight;
    const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
    const sendWheel = (deltaY) => {
      scrollRoot.dispatchEvent(
        new WheelEvent("wheel", {
          bubbles: true,
          cancelable: true,
          deltaY,
        }),
      );
    };
    const checkFromPanel = async (startIndex) => {
      scrollRoot.scrollTo({ top: startIndex * panelHeight, behavior: "auto" });
      await new Promise((resolve) => requestAnimationFrame(resolve));

      sendWheel(640);

      for (const delay of [170, 170, 170, 170, 170, 170]) {
        await wait(delay);
        sendWheel(120);
      }

      await wait(760);

      return {
        finalIndex: Math.round(scrollRoot.scrollTop / panelHeight),
        finalTop: Math.round(scrollRoot.scrollTop),
        startIndex,
      };
    };

    return {
      panelHeight: Math.round(panelHeight),
      results: [
        await checkFromPanel(0),
        await checkFromPanel(3),
        await checkFromPanel(4),
      ],
    };
  });

  for (const snapResult of result.results) {
    expect(snapResult.finalIndex).toBe(snapResult.startIndex + 1);
    expect(snapResult.finalTop).toBe((snapResult.startIndex + 1) * result.panelHeight);
  }
});

test("wheel snap accepts another deliberate scroll shortly after settling", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  const result = await page.evaluate(async () => {
    const scrollRoot = document.querySelector("main#top");
    const panelHeight = scrollRoot.clientHeight;
    const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
    const sendWheel = () => {
      scrollRoot.dispatchEvent(
        new WheelEvent("wheel", {
          bubbles: true,
          cancelable: true,
          deltaY: 640,
        }),
      );
    };

    scrollRoot.scrollTo({ top: 0, behavior: "auto" });
    await new Promise((resolve) => requestAnimationFrame(resolve));

    sendWheel();
    await wait(1140);
    const firstIndex = Math.round(scrollRoot.scrollTop / panelHeight);

    sendWheel();
    await wait(1140);

    return {
      finalIndex: Math.round(scrollRoot.scrollTop / panelHeight),
      firstIndex,
    };
  });

  expect(result.firstIndex).toBe(1);
  expect(result.finalIndex).toBe(2);
});

test("about carousel advances, loops, jumps, and pauses inside the second snap panel", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  const activeAboutSlideIndex = () =>
    page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-about-slide]")).findIndex((slide) =>
        slide.classList.contains("is-active"),
      ),
    );
  const controlStyles = await page.evaluate(() => {
    const controls = document.querySelector(".about-slide-controls");
    const toggle = document.querySelector(".about-slide-toggle");
    const activeDot = document.querySelector(".about-slide-dot.is-active");
    const activeContent = document.querySelector(".about-slide.is-active .about-slide__content");
    const activeVisual = document.querySelector(".about-slide.is-active .about-slide__visual");

    return {
      activeDotBackground: getComputedStyle(activeDot).backgroundColor,
      activeDotBorder: getComputedStyle(activeDot).borderTopColor,
      controlsBackground: getComputedStyle(controls).backgroundColor,
      contentTransitionDelay: getComputedStyle(activeContent).transitionDelay,
      toggleBorder: getComputedStyle(toggle).borderTopColor,
      visualBackground: getComputedStyle(activeVisual).backgroundColor,
      visualTransitionDelay: getComputedStyle(activeVisual).transitionDelay,
    };
  });

  expect(controlStyles.controlsBackground).toBe("rgb(1, 62, 106)");
  expect(controlStyles.activeDotBackground).toBe("rgb(1, 62, 106)");
  expect(controlStyles.activeDotBorder).toBe("rgb(255, 255, 255)");
  expect(controlStyles.toggleBorder).toBe("rgb(255, 255, 255)");
  expect(controlStyles.contentTransitionDelay).toContain("0.26s");
  expect(controlStyles.visualBackground).toBe("rgba(1, 62, 106, 0.08)");
  expect(controlStyles.visualTransitionDelay).toContain("0.08s");

  await expect.poll(activeAboutSlideIndex).toBe(0);
  await expect.poll(activeAboutSlideIndex, { timeout: 5200 }).toBe(1);
  await expect.poll(activeAboutSlideIndex, { timeout: 5200 }).toBe(2);
  await expect.poll(activeAboutSlideIndex, { timeout: 5200 }).toBe(0);

  await page.getByRole("button", { name: "3번째 병원 소개 화면으로 이동" }).click();
  await expect.poll(activeAboutSlideIndex).toBe(2);

  const compactContentPlacement = await page.evaluate(() => {
    const activeSlide = document.querySelector(".about-slide.is-active");
    const compactContent = activeSlide?.querySelector(".about-slide__content--compact");
    const slideRect = activeSlide.getBoundingClientRect();
    const contentRect = compactContent.getBoundingClientRect();

    return (contentRect.left + contentRect.width / 2 - slideRect.left) / slideRect.width;
  });

  expect(compactContentPlacement).toBeGreaterThan(0.36);
  expect(compactContentPlacement).toBeLessThan(0.42);

  const pauseButton = page.getByRole("button", { name: "병원 소개 슬라이드 일시정지" });
  await pauseButton.click();
  await expect(page.getByRole("button", { name: "병원 소개 슬라이드 재생" })).toBeVisible();

  await page.waitForTimeout(4300);
  await expect.poll(activeAboutSlideIndex).toBe(2);
});
