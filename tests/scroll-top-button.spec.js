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

test("hero uses layered care images and fades the entry text without lead copy", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await expect
    .poll(() =>
      page.evaluate(() => {
        const foreground = document.querySelector(".hero__foreground");

        return Boolean(foreground?.complete && foreground.naturalWidth > 0);
      }),
    )
    .toBe(true);

  const heroDetails = await page.evaluate(() => {
    const main = document.querySelector("main#top");
    const lead = document.querySelector(".hero__lead");
    const hero = document.querySelector(".hero");
    const background = document.querySelector(".hero__background");
    const foreground = document.querySelector(".hero__foreground");
    const eyebrow = document.querySelector(".hero .eyebrow");
    const title = document.querySelector(".hero h1");
    const actions = document.querySelector(".hero__actions");
    const content = document.querySelector(".hero__content");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = foreground.naturalWidth;
    canvas.height = foreground.naturalHeight;
    context.drawImage(foreground, 0, 0);
    const foregroundTransform = new DOMMatrixReadOnly(getComputedStyle(foreground).transform);

    return {
      actionsAnimation: getComputedStyle(actions).animationName,
      actionsDelay: getComputedStyle(actions).animationDelay,
      actionsDuration: getComputedStyle(actions).animationDuration,
      backgroundImage: getComputedStyle(background).backgroundImage,
      backgroundPositionX: getComputedStyle(hero).getPropertyValue("--hero-bg-position-x").trim(),
      backgroundScale: getComputedStyle(hero).getPropertyValue("--hero-bg-scale").trim(),
      contentMarginTop: getComputedStyle(content).marginTop,
      foregroundAlpha: context.getImageData(0, 0, 1, 1).data[3],
      foregroundFit: getComputedStyle(foreground).objectFit,
      foregroundPositionX: getComputedStyle(hero).getPropertyValue("--hero-fg-position-x").trim(),
      foregroundSrc: foreground.getAttribute("src"),
      foregroundTransformX: foregroundTransform.e,
      foregroundTransformY: foregroundTransform.f,
      hasLead: Boolean(lead),
      heroStyle: main.getAttribute("style"),
      eyebrowAnimation: getComputedStyle(eyebrow).animationName,
      overlayBackground: getComputedStyle(hero, "::after").backgroundColor,
      titleAnimation: getComputedStyle(title).animationName,
      titleDelay: getComputedStyle(title).animationDelay,
      titleDuration: getComputedStyle(title).animationDuration,
    };
  });

  expect(heroDetails.heroStyle).toContain("hero-room-background.jpg");
  expect(heroDetails.backgroundImage).toContain("hero-room-background.jpg");
  expect(heroDetails.foregroundSrc).toContain("hero-care-team.png");
  expect(heroDetails.foregroundAlpha).toBe(0);
  expect(heroDetails.foregroundFit).toBe("cover");
  expect(heroDetails.hasLead).toBe(false);
  expect(heroDetails.eyebrowAnimation).toBe("heroTextFadeIn");
  expect(heroDetails.titleAnimation).toBe("heroTextFadeIn");
  expect(heroDetails.actionsAnimation).toBe("heroTextFadeIn");
  expect(heroDetails.titleDuration).toContain("1.8s");
  expect(heroDetails.actionsDuration).toContain("1.8s");
  expect(heroDetails.titleDelay).toContain("0.36s");
  expect(heroDetails.actionsDelay).toContain("0.72s");
  expect(heroDetails.backgroundPositionX).toBe("42%");
  expect(heroDetails.foregroundPositionX).toBe("42%");
  expect(heroDetails.foregroundTransformX).toBeGreaterThan(10);
  expect(heroDetails.foregroundTransformY).toBeGreaterThan(10);
  expect(heroDetails.backgroundScale).toBe("1.08");
  expect(heroDetails.overlayBackground).toBe("rgba(4, 50, 75, 0.34)");
  expect(Number.parseFloat(heroDetails.contentMarginTop)).toBeGreaterThan(24);
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

    const wheelEvents = [160, 160, 160].map(
      (deltaY) =>
        new WheelEvent("wheel", {
          bubbles: true,
          cancelable: true,
          deltaY,
        }),
    );

    for (const wheelEvent of wheelEvents) {
      scrollRoot.dispatchEvent(wheelEvent);
    }

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
          defaultPrevented: wheelEvents.every((wheelEvent) => wheelEvent.defaultPrevented),
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

test("wheel snap waits for enough same-direction scroll before moving", async ({ page }) => {
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

    scrollRoot.scrollTo({ top: 0, behavior: "auto" });
    await new Promise((resolve) => requestAnimationFrame(resolve));

    sendWheel(720);
    await wait(360);
    const indexAfterSingleEvent = Math.round(scrollRoot.scrollTop / panelHeight);

    sendWheel(180);
    sendWheel(180);
    await wait(1140);

    return {
      finalIndex: Math.round(scrollRoot.scrollTop / panelHeight),
      indexAfterSingleEvent,
    };
  });

  expect(result.indexAfterSingleEvent).toBe(0);
  expect(result.finalIndex).toBe(1);
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

test("opposite wheel rebound after a downward snap does not return to the previous panel", async ({ page }) => {
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

    scrollRoot.scrollTo({ top: 0, behavior: "auto" });
    await new Promise((resolve) => requestAnimationFrame(resolve));

    for (const deltaY of [180, 180, 180]) {
      sendWheel(deltaY);
    }
    await wait(1040);

    for (const delay of [70, 70, 70, 70]) {
      sendWheel(-160);
      await wait(delay);
    }

    await wait(520);

    return {
      finalIndex: Math.round(scrollRoot.scrollTop / panelHeight),
      finalTop: Math.round(scrollRoot.scrollTop),
      panelHeight: Math.round(panelHeight),
    };
  });

  expect(result.finalIndex).toBe(1);
  expect(result.finalTop).toBe(result.panelHeight);
});

test("large delayed reverse rebound after a snap does not jump back", async ({ page }) => {
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

    scrollRoot.scrollTo({ top: 0, behavior: "auto" });
    await new Promise((resolve) => requestAnimationFrame(resolve));

    for (const deltaY of [180, 180, 180]) {
      sendWheel(deltaY);
    }
    await wait(1480);
    sendWheel(-720);
    await wait(760);

    return {
      finalIndex: Math.round(scrollRoot.scrollTop / panelHeight),
      finalTop: Math.round(scrollRoot.scrollTop),
      panelHeight: Math.round(panelHeight),
    };
  });

  expect(result.finalIndex).toBe(1);
  expect(result.finalTop).toBe(result.panelHeight);
});

test("leftover wheel delta after a snap does not continue to another section", async ({ page }) => {
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

    scrollRoot.scrollTo({ top: 0, behavior: "auto" });
    await new Promise((resolve) => requestAnimationFrame(resolve));

    for (const deltaY of [180, 180, 180]) {
      sendWheel(deltaY);
    }
    await wait(1260);
    const indexAfterSnap = Math.round(scrollRoot.scrollTop / panelHeight);

    sendWheel(720);
    await wait(420);

    return {
      finalIndex: Math.round(scrollRoot.scrollTop / panelHeight),
      indexAfterSnap,
    };
  });

  expect(result.indexAfterSnap).toBe(1);
  expect(result.finalIndex).toBe(1);
});

test("wheel snap still allows a deliberate reverse scroll after settling", async ({ page }) => {
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

    scrollRoot.scrollTo({ top: 0, behavior: "auto" });
    await new Promise((resolve) => requestAnimationFrame(resolve));

    for (const deltaY of [180, 180, 180]) {
      sendWheel(deltaY);
    }
    await wait(1960);
    const firstIndex = Math.round(scrollRoot.scrollTop / panelHeight);

    for (const deltaY of [-200, -200]) {
      sendWheel(deltaY);
    }
    await wait(1140);

    return {
      finalIndex: Math.round(scrollRoot.scrollTop / panelHeight),
      firstIndex,
    };
  });

  expect(result.firstIndex).toBe(1);
  expect(result.finalIndex).toBe(0);
});

test("wheel snap accepts another deliberate scroll shortly after settling", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  const result = await page.evaluate(async () => {
    const scrollRoot = document.querySelector("main#top");
    const panelHeight = scrollRoot.clientHeight;
    const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
    const sendWheel = (deltaY = 180) => {
      scrollRoot.dispatchEvent(
        new WheelEvent("wheel", {
          bubbles: true,
          cancelable: true,
          deltaY,
        }),
      );
    };

    scrollRoot.scrollTo({ top: 0, behavior: "auto" });
    await new Promise((resolve) => requestAnimationFrame(resolve));

    for (const deltaY of [180, 180, 180]) {
      sendWheel(deltaY);
    }
    await wait(1260);
    const firstIndex = Math.round(scrollRoot.scrollTop / panelHeight);

    for (const deltaY of [180, 180, 180]) {
      sendWheel(deltaY);
    }
    await wait(1140);

    return {
      finalIndex: Math.round(scrollRoot.scrollTop / panelHeight),
      firstIndex,
    };
  });

  expect(result.firstIndex).toBe(1);
  expect(result.finalIndex).toBe(2);
});

test("fade carousels restart from the first slide when their snap panel is entered", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  const activeSlideIndex = (selector) =>
    page.evaluate((slideSelector) => {
      return Array.from(document.querySelectorAll(slideSelector)).findIndex((slide) =>
        slide.classList.contains("is-active"),
      );
    }, selector);

  const scrollRoot = page.locator("main#top");

  await page.evaluate(() => {
    document.querySelector('[data-about-slide-index="2"]').click();
  });
  await expect.poll(() => activeSlideIndex("[data-about-slide]")).toBe(2);

  await scrollRoot.evaluate((element) => {
    element.scrollTo({ top: element.clientHeight, behavior: "auto" });
  });
  await expect.poll(() => activeSlideIndex("[data-about-slide]")).toBe(0);

  await page.evaluate(() => {
    document.querySelector('[data-hours-slide-index="2"]').click();
  });
  await expect.poll(() => activeSlideIndex("[data-hours-slide]")).toBe(2);

  await scrollRoot.evaluate((element) => {
    element.scrollTo({ top: element.clientHeight * 3, behavior: "auto" });
  });
  await expect.poll(() => activeSlideIndex("[data-hours-slide]")).toBe(0);

  await page.evaluate(() => {
    document.querySelector('[data-facility-slide-index="4"]').click();
  });
  await expect.poll(() => activeSlideIndex("[data-facility-slide]")).toBe(4);

  await scrollRoot.evaluate((element) => {
    element.scrollTo({ top: element.clientHeight * 2, behavior: "auto" });
  });
  await expect.poll(() => activeSlideIndex("[data-facility-slide]")).toBe(0);
});

test("mobile horizontal swipes move carousel slides without changing snap panels", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const results = await page.evaluate(async () => {
    const scrollRoot = document.querySelector("main#top");
    const panelHeight = scrollRoot.clientHeight;
    const waitForFrames = () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });
    const activeSlideIndex = (selector) =>
      Array.from(document.querySelectorAll(selector)).findIndex((slide) =>
        slide.classList.contains("is-active"),
      );
    const dispatchTouch = (target, type, x, y) => {
      const touch = {
        clientX: x,
        clientY: y,
        force: 1,
        identifier: 1,
        pageX: x,
        pageY: y,
        radiusX: 1,
        radiusY: 1,
        rotationAngle: 0,
        screenX: x,
        screenY: y,
        target,
      };
      const event = new Event(type, { bubbles: true, cancelable: true });

      Object.defineProperty(event, "touches", {
        value: type === "touchend" || type === "touchcancel" ? [] : [touch],
      });
      Object.defineProperty(event, "changedTouches", { value: [touch] });
      target.dispatchEvent(event);

      return event.defaultPrevented;
    };
    const carouselTargets = [
      { section: "#about", slide: "[data-about-slide]", panelIndex: 1 },
      { section: "#space", slide: "[data-facility-slide]", panelIndex: 2 },
      { section: "#hours", slide: "[data-hours-slide]", panelIndex: 3 },
    ];
    const swipeReports = [];

    for (const target of carouselTargets) {
      const section = document.querySelector(target.section);
      const slideCount = document.querySelectorAll(target.slide).length;

      scrollRoot.scrollTo({ top: panelHeight * target.panelIndex, behavior: "auto" });
      await waitForFrames();

      const before = activeSlideIndex(target.slide);
      const topBefore = Math.round(scrollRoot.scrollTop);
      dispatchTouch(section, "touchstart", 330, 430);
      const leftMovePrevented = dispatchTouch(section, "touchmove", 170, 434);
      dispatchTouch(section, "touchend", 92, 438);
      await waitForFrames();

      const afterLeft = activeSlideIndex(target.slide);
      const panelAfterLeft = Math.round(scrollRoot.scrollTop / panelHeight);

      dispatchTouch(section, "touchstart", 82, 430);
      const rightMovePrevented = dispatchTouch(section, "touchmove", 250, 434);
      dispatchTouch(section, "touchend", 330, 438);
      await waitForFrames();

      swipeReports.push({
        afterLeft,
        afterRight: activeSlideIndex(target.slide),
        before,
        expectedLeft: (before + 1) % slideCount,
        expectedPanelIndex: Math.round(topBefore / panelHeight),
        leftMovePrevented,
        panelAfterLeft,
        panelAfterRight: Math.round(scrollRoot.scrollTop / panelHeight),
        rightMovePrevented,
      });
    }

    return swipeReports;
  });

  for (const result of results) {
    expect(result.leftMovePrevented).toBe(true);
    expect(result.rightMovePrevented).toBe(true);
    expect(result.afterLeft).toBe(result.expectedLeft);
    expect(result.afterRight).toBe(result.before);
    expect(result.panelAfterLeft).toBe(result.expectedPanelIndex);
    expect(result.panelAfterRight).toBe(result.expectedPanelIndex);
  }
});

test("about carousel advances, loops, jumps, and pauses inside the second snap panel", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  const scrollRoot = page.locator("main#top");
  const activeAboutSlideIndex = () =>
    page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-about-slide]")).findIndex((slide) =>
        slide.classList.contains("is-active"),
      ),
    );

  await scrollRoot.evaluate((element) => {
    element.scrollTo({ top: element.clientHeight, behavior: "auto" });
  });
  await expect.poll(activeAboutSlideIndex).toBe(0);

  const controlStyles = await page.evaluate(() => {
    const controls = document.querySelector(".about-slide-controls");
    const toggle = document.querySelector(".about-slide-toggle");
    const activeDot = document.querySelector(".about-slide-dot.is-active");
    const activeContent = document.querySelector(".about-slide.is-active .about-slide__content");
    const activeVisual = document.querySelector(".about-slide.is-active .about-slide__visual");

    return {
      activeDotBackground: getComputedStyle(activeDot).backgroundColor,
      activeDotBorder: getComputedStyle(activeDot).borderTopColor,
      controlsBorderWidth: getComputedStyle(controls).borderTopWidth,
      controlsBackground: getComputedStyle(controls).backgroundColor,
      contentTransitionDelay: getComputedStyle(activeContent).transitionDelay,
      toggleBackground: getComputedStyle(toggle).backgroundColor,
      toggleBorder: getComputedStyle(toggle).borderTopColor,
      visualBackground: getComputedStyle(activeVisual).backgroundColor,
      visualTransitionDelay: getComputedStyle(activeVisual).transitionDelay,
    };
  });

  expect(controlStyles.controlsBackground).toBe("rgba(0, 0, 0, 0)");
  expect(controlStyles.controlsBorderWidth).toBe("0px");
  expect(controlStyles.activeDotBackground).toBe("rgb(1, 62, 106)");
  expect(controlStyles.activeDotBorder).toBe("rgb(1, 62, 106)");
  expect(controlStyles.toggleBackground).toBe("rgb(1, 62, 106)");
  expect(controlStyles.toggleBorder).toBe("rgb(1, 62, 106)");
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

test("hours carousel fades, jumps, and pauses inside the fourth snap panel", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  const scrollRoot = page.locator("main#top");
  const activeHoursSlideIndex = () =>
    page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-hours-slide]")).findIndex((slide) =>
        slide.classList.contains("is-active"),
      ),
    );

  await scrollRoot.evaluate((element) => {
    element.scrollTo({ top: element.clientHeight * 3, behavior: "auto" });
  });
  await expect.poll(activeHoursSlideIndex).toBe(0);

  const controlStyles = await page.evaluate(() => {
    const controls = document.querySelector(".hours-slide-controls");
    const toggle = document.querySelector(".hours-slide-toggle");
    const activeDot = document.querySelector(".hours-slide-dot.is-active");
    const activeContent = document.querySelector(".hours-slide.is-active .hours-slide__content");
    const activeVisual = document.querySelector(".hours-slide.is-active .hours-slide__visual");
    const visualText = Array.from(document.querySelectorAll(".hours-slide__visual")).map((visual) =>
      visual.textContent.trim(),
    );

    return {
      activeDotBackground: getComputedStyle(activeDot).backgroundColor,
      activeDotBorder: getComputedStyle(activeDot).borderTopColor,
      controlsBorderWidth: getComputedStyle(controls).borderTopWidth,
      controlsBackground: getComputedStyle(controls).backgroundColor,
      contentTransitionDelay: getComputedStyle(activeContent).transitionDelay,
      toggleBackground: getComputedStyle(toggle).backgroundColor,
      toggleBorder: getComputedStyle(toggle).borderTopColor,
      visualBackground: getComputedStyle(activeVisual).backgroundColor,
      visualText,
      visualTransitionDelay: getComputedStyle(activeVisual).transitionDelay,
    };
  });

  expect(controlStyles.controlsBackground).toBe("rgba(0, 0, 0, 0)");
  expect(controlStyles.controlsBorderWidth).toBe("0px");
  expect(controlStyles.activeDotBackground).toBe("rgb(255, 255, 255)");
  expect(controlStyles.activeDotBorder).toBe("rgb(255, 255, 255)");
  expect(controlStyles.toggleBackground).toBe("rgb(255, 255, 255)");
  expect(controlStyles.toggleBorder).toBe("rgb(255, 255, 255)");
  expect(controlStyles.contentTransitionDelay).toContain("0.26s");
  expect(controlStyles.visualBackground).toBe("rgba(255, 255, 255, 0.1)");
  expect(controlStyles.visualText).toEqual(["", "", ""]);
  expect(controlStyles.visualTransitionDelay).toContain("0.08s");

  await expect.poll(activeHoursSlideIndex).toBe(0);
  await expect.poll(activeHoursSlideIndex, { timeout: 5200 }).toBe(1);

  await page.getByRole("button", { name: "3번째 진료안내 화면으로 이동" }).click();
  await expect.poll(activeHoursSlideIndex).toBe(2);

  const pauseButton = page.getByRole("button", { name: "진료안내 슬라이드 일시정지" });
  await pauseButton.click();
  await expect(page.getByRole("button", { name: "진료안내 슬라이드 재생" })).toBeVisible();

  await page.waitForTimeout(4300);
  await expect.poll(activeHoursSlideIndex).toBe(2);
});

test("facility carousel shows uploaded photos in the third snap panel with black contain background", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  const scrollRoot = page.locator("main#top");
  const activeFacilitySlideIndex = () =>
    page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-facility-slide]")).findIndex((slide) =>
        slide.classList.contains("is-active"),
      ),
    );

  await scrollRoot.evaluate((element) => {
    element.scrollTo({ top: element.clientHeight * 2, behavior: "auto" });
  });
  await expect.poll(activeFacilitySlideIndex).toBe(0);

  const facilityStyles = await page.evaluate(() => {
    const controls = document.querySelector(".facility-slide-controls");
    const section = document.querySelector("#space");
    const photo = document.querySelector(".facility-slide.is-active .facility-photo");
    const image = document.querySelector(".facility-slide.is-active .facility-photo img");
    const dots = Array.from(document.querySelectorAll(".facility-slide-dot"));
    const imageRect = image.getBoundingClientRect();
    const photoRect = photo.getBoundingClientRect();
    const sectionIndex = Array.from(document.querySelectorAll(".snap-panel")).indexOf(section);

    return {
      controlsBackground: getComputedStyle(controls).backgroundColor,
      dotCount: dots.length,
      imageHeight: imageRect.height,
      imageFit: getComputedStyle(image).objectFit,
      imageSrc: image.getAttribute("src"),
      imageWidth: imageRect.width,
      naturalHeight: image.naturalHeight,
      naturalWidth: image.naturalWidth,
      photoBackground: getComputedStyle(photo).backgroundColor,
      photoHeight: photoRect.height,
      photoWidth: photoRect.width,
      sectionIndex,
    };
  });

  expect(facilityStyles.controlsBackground).toBe("rgba(0, 0, 0, 0)");
  expect(facilityStyles.dotCount).toBe(10);
  expect(facilityStyles.imageFit).toBe("contain");
  expect(facilityStyles.imageSrc).toContain("facility-01.jpg");
  expect(facilityStyles.sectionIndex).toBe(2);
  expect(facilityStyles.photoBackground).toBe("rgb(0, 0, 0)");
  expect(facilityStyles.imageWidth / facilityStyles.imageHeight).toBeCloseTo(
    facilityStyles.naturalWidth / facilityStyles.naturalHeight,
    2,
  );
  expect(facilityStyles.imageWidth).toBeLessThanOrEqual(facilityStyles.naturalWidth + 1);
  expect(facilityStyles.imageHeight).toBeLessThanOrEqual(facilityStyles.naturalHeight + 1);
  expect(facilityStyles.imageWidth).toBeLessThanOrEqual(facilityStyles.photoWidth);
  expect(facilityStyles.imageHeight).toBeLessThanOrEqual(facilityStyles.photoHeight);

  await expect.poll(activeFacilitySlideIndex, { timeout: 5200 }).toBe(1);

  await page.getByRole("button", { name: "10번째 시설소개 화면으로 이동" }).click();
  await expect.poll(activeFacilitySlideIndex).toBe(9);

  const pauseButton = page.getByRole("button", { name: "시설소개 슬라이드 일시정지" });
  await pauseButton.click();
  await expect(page.getByRole("button", { name: "시설소개 슬라이드 재생" })).toBeVisible();

  await page.waitForTimeout(4300);
  await expect.poll(activeFacilitySlideIndex).toBe(9);
});
