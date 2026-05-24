import "./styles.css";

const hospital = {
  name: "24시수영동물의료센터",
  englishName: "SUYEONG ANIMAL MEDICAL CENTER",
  phone: "051-000-0000",
  address: "부산 수영구 수영로 000, 1층",
};

const hospitalDisplayName = hospital.name.replace("동물", "<wbr />동물");
const imageUrl = (filename) => `${import.meta.env.BASE_URL}images/${filename}`;
const receptionImageUrl = imageUrl("main-reception.jpg");
const logoImageUrl = imageUrl("hospital-symbol.jpeg");
const hongDoctorImageUrl = imageUrl("doctor-hong-card.png");
const kimDoctorImageUrl = imageUrl("doctor-kim-card.png");

document.querySelector("#app").innerHTML = `
  <header class="site-header" aria-label="상단 메뉴">
    <a class="brand" href="#top" aria-label="${hospital.name} 홈">
      <span class="brand-mark">
        <img src="${logoImageUrl}" alt="" />
      </span>
      <span>
        <strong>${hospital.name}</strong>
        <small>${hospital.englishName}</small>
      </span>
    </a>
    <nav class="nav-links" aria-label="주요 섹션">
      <a href="#about"><span>병원소개</span></a>
      <a href="#doctors"><span>의료진</span></a>
      <a href="#hours"><span>진료안내</span></a>
      <a href="#space"><span>공간</span></a>
    </nav>
    <a class="header-cta" href="#contact">문의</a>
  </header>

  <main id="top" class="snap-root" style="--reception-image: url('${receptionImageUrl}')">
    <section class="hero snap-panel reveal-section is-visible" aria-label="병원 메인 이미지" data-reveal-section>
      <div class="hero__content">
        <p class="eyebrow">24H ANIMAL MEDICAL CENTER</p>
        <h1>${hospitalDisplayName}</h1>
        <p class="hero__lead">
          차분한 공간, 정확한 진료, 다정한 설명으로 반려동물의 하루를 더 안정적으로 돌봅니다.
        </p>
        <div class="hero__actions" aria-label="주요 행동">
          <a class="button button--primary" href="#hours">진료시간 보기</a>
          <a class="button button--ghost" href="#doctors">원장 소개</a>
        </div>
      </div>
      <div class="hero__notice" aria-label="빠른 안내">
        <p>
          <span>응급 내원 전 전화 문의</span>
          <strong>오전 10:00 - 오후 10:00, 야간 10:00 - 오전 10:00</strong>
        </p>
        <a href="#contact">전화 문의 ${hospital.phone}</a>
      </div>
    </section>

    <section class="section intro snap-panel reveal-section" id="about" data-reveal-section>
      <div class="section-kicker">24H CARE STANDARD</div>
      <div class="split">
        <div>
          <h2>차분한 공간과 정확한 설명, 필요한 진료를 한 곳에서.</h2>
        </div>
        <div class="copy-stack">
          <p>
            ${hospital.name}는 밤과 휴일에도 진료가 이어지는 동물의료센터입니다. 보호자가 불안한 순간에도
            차분하게 이해할 수 있도록 검사와 치료 과정을 명확하게 설명합니다.
          </p>
          <p>
            진료실, 처치실, 입원 공간의 동선을 세심하게 구성해 반려동물의 스트레스를 줄이고
            수의사가 신속하게 대응할 수 있는 환경을 갖추었습니다.
          </p>
        </div>
      </div>
      <div class="feature-grid" aria-label="병원 특징">
        <article>
          <span>01</span>
          <h3>책임 진료</h3>
          <p>두 대표원장이 응급 상황부터 수술 상담까지 직접 살핍니다.</p>
        </article>
        <article>
          <span>02</span>
          <h3>정밀한 설명</h3>
          <p>검사 결과와 치료 선택지를 보호자의 언어로 분명하게 안내합니다.</p>
        </article>
        <article>
          <span>03</span>
          <h3>분야별 진료</h3>
          <p>외과, 재활, 내과, 응급 진료를 한 흐름으로 연결해 치료 방향을 세웁니다.</p>
        </article>
        <article>
          <span>04</span>
          <h3>안정적인 공간</h3>
          <p>화이트와 네이비 톤의 정돈된 공간으로 대기부터 진료까지 안정감을 더했습니다.</p>
        </article>
      </div>
    </section>

    <section class="section section--dark snap-panel reveal-section" id="hours" data-reveal-section>
      <div class="section-kicker">HOURS</div>
      <div class="split split--center">
        <div>
          <h2>새벽에도, 주말에도 우리 아이 곁을 지킵니다.</h2>
          <p class="section-lead">
            365일 연중무휴 24시간 진료 체계로 오전 진료와 야간 응급 진료를 이어갑니다.
            야간 진료는 전화 주시면 출입문을 열어드립니다.
          </p>
        </div>
        <div class="hours-column">
          <div class="hours-panel">
            <dl>
              <div>
                <dt>오전 진료</dt>
                <dd>AM 10:00 - PM 10:00</dd>
              </div>
              <div>
                <dt>야간 진료</dt>
                <dd>PM 10:00 - AM 10:00</dd>
              </div>
              <div>
                <dt>휴무</dt>
                <dd>365일 연중무휴</dd>
              </div>
              <div>
                <dt>예약 문의</dt>
                <dd>${hospital.phone}</dd>
              </div>
            </dl>
          </div>
          <div class="care-grid" aria-label="진료 안내">
            <article>
              <span>24H</span>
              <h3>야간 응급 진료</h3>
              <p>갑작스러운 증상과 사고에도 내원이 가능하도록 야간 응급 대응 체계를 갖추었습니다.</p>
            </article>
            <article>
              <span>365</span>
              <h3>휴일 진료</h3>
              <p>주말과 공휴일에도 같은 기준으로 진료하며, 야간에는 전화 후 내원하시면 문을 열어드립니다.</p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="section doctors snap-panel reveal-section" id="doctors" data-reveal-section>
      <div class="section-heading doctors-heading">
        <div>
          <div class="section-kicker">24H VETERINARY TEAM</div>
          <h2>대학병원 출신 대표원장이 밤낮으로 진료를 이어갑니다.</h2>
        </div>
        <p>두 대표원장이 응급 진료, 외과 수술, 내과 상담, 회복 관리까지 함께 살핍니다.</p>
      </div>
      <div class="doctor-showcase" aria-label="대표원장 소개">
        <article class="doctor-profile-card">
          <figure>
            <img src="${hongDoctorImageUrl}" alt="홍정호 대표원장" />
          </figure>
          <div>
            <p class="role">CHIEF VETERINARIAN</p>
            <h3>홍정호 대표원장</h3>
            <strong>대학병원 출신 수의사</strong>
            <p>
              응급 진료, 외과 수술, 내과 상담, 회복 관리까지 필요한 진료 전 과정을 차분하게 설명합니다.
              보호자가 이해할 수 있는 언어로 검사와 치료 선택지를 안내합니다.
            </p>
          </div>
        </article>
        <article class="doctor-profile-card">
          <figure>
            <img src="${kimDoctorImageUrl}" alt="김민연 대표원장" />
          </figure>
          <div>
            <p class="role">CHIEF VETERINARIAN</p>
            <h3>김민연 대표원장</h3>
            <strong>대학병원 출신 수의사</strong>
            <p>
              야간 응급 상황부터 수술 전 평가, 내과적 관리, 회복 계획까지 한 흐름으로 살핍니다.
              반려동물 상태와 보호자 상황에 맞춰 필요한 다음 단계를 명확하게 안내합니다.
            </p>
          </div>
        </article>
      </div>
    </section>

    <section class="section services snap-panel reveal-section" aria-label="진료 과목" data-reveal-section>
      <div class="section-kicker">24H MEDICAL SERVICE</div>
      <div class="section-heading">
        <h2>수술, 재활, 내과, 응급 진료까지 한 곳에서 이어집니다.</h2>
        <p>분야별 진료 경험을 바탕으로 필요한 치료와 회복 관리를 정확하게 연결합니다.</p>
      </div>
      <div class="specialty-grid">
        <article class="specialty-card">
          <span>01</span>
          <div>
            <h3>외과 수술 전문</h3>
            <p>슬개골 탈구, 십자인대, 디스크, 종양 수술 등 정밀한 외과 치료를 제공합니다.</p>
          </div>
        </article>
        <article class="specialty-card">
          <span>02</span>
          <div>
            <h3>재활 치료 전문</h3>
            <p>침 치료, 레이저 치료, 수중 재활로 수술 후 회복과 만성 통증 관리를 돕습니다.</p>
          </div>
        </article>
        <article class="specialty-card">
          <span>03</span>
          <div>
            <h3>내과 진료</h3>
            <p>심장, 신장, 간담도계 질환처럼 꾸준한 관리가 필요한 내과 질환을 세심하게 봅니다.</p>
          </div>
        </article>
        <article class="specialty-card">
          <span>04</span>
          <div>
            <h3>24시간 응급 진료</h3>
            <p>야간과 휴일에도 내원이 필요한 상황에 대응할 수 있도록 문을 열어둡니다.</p>
          </div>
        </article>
      </div>
    </section>

    <section class="section space snap-panel reveal-section" id="space" data-reveal-section>
      <div class="section-kicker">SPACE</div>
      <div class="space-layout">
        <div>
          <h2>첫 방문의 긴장을 덜어주는 따뜻한 리셉션.</h2>
          <p>
            은은한 조명과 부드러운 소재감의 대기 공간은 보호자와 반려동물이 차분하게 머무를 수 있도록
            설계되었습니다.
          </p>
        </div>
        <figure class="space-photo">
          <img src="${receptionImageUrl}" alt="24시수영동물의료센터 리셉션 전경" />
          <figcaption>${hospital.englishName}</figcaption>
        </figure>
      </div>
    </section>

    <section class="contact snap-panel reveal-section" id="contact" aria-label="문의" data-reveal-section>
      <div>
        <p class="eyebrow">CONTACT</p>
        <h2>진료가 필요한 순간, 편하게 문의하세요.</h2>
      </div>
      <address>
        <span>${hospital.address}</span>
        <a href="tel:${hospital.phone.replaceAll("-", "")}">${hospital.phone}</a>
      </address>
      <div class="contact__footer" aria-label="병원 정보">
        <span>${hospital.name}</span>
        <span>© <span id="year"></span> ${hospital.englishName}</span>
      </div>
    </section>
  </main>

  <a class="scroll-top-button" href="#top" aria-label="맨 위로 이동">
    <span aria-hidden="true">↑</span>
  </a>
`;

document.querySelector("#year").textContent = new Date().getFullYear();

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const scrollRoot = document.querySelector(".snap-root");
const scrollTopButton = document.querySelector(".scroll-top-button");
const revealSections = Array.from(document.querySelectorAll("[data-reveal-section]"));
const snapPanels = Array.from(document.querySelectorAll(".snap-panel"));
const SNAP_SCROLL_DURATION = 940;
const WHEEL_DELTA_THRESHOLD = 44;
const TOUCH_DELTA_THRESHOLD = 48;

let scrollAnimationFrame = 0;
let wheelDeltaAccumulator = 0;
let lastWheelAt = 0;
let touchStartX = 0;
let touchStartY = 0;
let touchTracking = false;
let touchMovedVertically = false;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const easeInOutCubic = (progress) =>
  progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

const stopScrollAnimation = () => {
  if (scrollAnimationFrame) {
    window.cancelAnimationFrame(scrollAnimationFrame);
    scrollAnimationFrame = 0;
  }

  scrollRoot?.classList.remove("is-controlled-scroll");
};

const getTargetTop = (target) => {
  if (!scrollRoot || !target || target === document.body || target === scrollRoot) {
    return 0;
  }

  const snapPanelIndex = snapPanels.indexOf(target);

  if (snapPanelIndex >= 0) {
    return snapPanelIndex * scrollRoot.clientHeight;
  }

  const rootRect = scrollRoot.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  return Math.max(0, scrollRoot.scrollTop + targetRect.top - rootRect.top);
};

const getScrollDuration = (targetTop) => {
  if (!scrollRoot) {
    return SNAP_SCROLL_DURATION;
  }

  const panelDistance = Math.abs(targetTop - scrollRoot.scrollTop) / Math.max(1, scrollRoot.clientHeight);

  return Math.min(1280, SNAP_SCROLL_DURATION + Math.max(0, panelDistance - 1) * 120);
};

const scrollToTopPosition = (targetTop, behavior = "smooth") => {
  if (!scrollRoot) {
    return;
  }

  const maxScrollTop = Math.max(0, scrollRoot.scrollHeight - scrollRoot.clientHeight);
  const nextTop = clamp(targetTop, 0, maxScrollTop);

  stopScrollAnimation();

  if (reducedMotionQuery.matches || behavior === "auto") {
    scrollRoot.scrollTo({ top: nextTop, behavior: "auto" });
    updateScrollTopButton();
    return;
  }

  const startTop = scrollRoot.scrollTop;
  const distance = nextTop - startTop;

  if (Math.abs(distance) < 1) {
    scrollRoot.scrollTop = nextTop;
    updateScrollTopButton();
    return;
  }

  const duration = getScrollDuration(nextTop);
  const startAt = performance.now();

  scrollRoot.classList.add("is-controlled-scroll");

  const step = (now) => {
    const progress = clamp((now - startAt) / duration, 0, 1);

    scrollRoot.scrollTop = startTop + distance * easeInOutCubic(progress);

    if (progress < 1) {
      scrollAnimationFrame = window.requestAnimationFrame(step);
      return;
    }

    scrollRoot.scrollTop = nextTop;
    scrollRoot.classList.remove("is-controlled-scroll");
    scrollAnimationFrame = 0;
    updateScrollTopButton();
  };

  scrollAnimationFrame = window.requestAnimationFrame(step);
};

const scrollToTarget = (target, behavior = "smooth") => {
  scrollToTopPosition(getTargetTop(target), behavior);
};

const getNextSnapIndex = (direction) => {
  if (!scrollRoot || snapPanels.length === 0) {
    return 0;
  }

  const maxIndex = snapPanels.length - 1;
  const position = scrollRoot.scrollTop / Math.max(1, scrollRoot.clientHeight);

  if (direction > 0) {
    return clamp(Math.floor(position + 0.08) + 1, 0, maxIndex);
  }

  return clamp(Math.ceil(position - 0.08) - 1, 0, maxIndex);
};

const scrollToSnapByDirection = (direction) => {
  const panel = snapPanels[getNextSnapIndex(direction)];

  if (panel) {
    scrollToTarget(panel);
  }
};

const updateScrollTopButton = () => {
  if (!scrollTopButton) {
    return;
  }

  scrollTopButton.classList.toggle("is-at-top", (scrollRoot?.scrollTop ?? 0) <= 8);
};

scrollRoot?.addEventListener("scroll", updateScrollTopButton, { passive: true });
updateScrollTopButton();

scrollRoot?.addEventListener(
  "wheel",
  (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    event.preventDefault();

    if (scrollAnimationFrame) {
      return;
    }

    const now = performance.now();

    if (now - lastWheelAt > 220) {
      wheelDeltaAccumulator = 0;
    }

    lastWheelAt = now;
    wheelDeltaAccumulator += event.deltaY;

    if (Math.abs(wheelDeltaAccumulator) < WHEEL_DELTA_THRESHOLD) {
      return;
    }

    const direction = wheelDeltaAccumulator > 0 ? 1 : -1;
    wheelDeltaAccumulator = 0;
    scrollToSnapByDirection(direction);
  },
  { passive: false },
);

scrollRoot?.addEventListener(
  "touchstart",
  (event) => {
    if (event.touches.length !== 1) {
      touchTracking = false;
      return;
    }

    touchTracking = true;
    touchMovedVertically = false;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  },
  { passive: true },
);

scrollRoot?.addEventListener(
  "touchmove",
  (event) => {
    if (!touchTracking || event.touches.length !== 1) {
      return;
    }

    const deltaX = event.touches[0].clientX - touchStartX;
    const deltaY = event.touches[0].clientY - touchStartY;

    if (Math.abs(deltaY) > 6 && Math.abs(deltaY) > Math.abs(deltaX)) {
      touchMovedVertically = true;
      event.preventDefault();
    }
  },
  { passive: false },
);

scrollRoot?.addEventListener("touchend", (event) => {
  if (!touchTracking) {
    return;
  }

  touchTracking = false;

  if (!touchMovedVertically || event.changedTouches.length === 0) {
    return;
  }

  const deltaX = event.changedTouches[0].clientX - touchStartX;
  const deltaY = touchStartY - event.changedTouches[0].clientY;

  if (Math.abs(deltaY) < TOUCH_DELTA_THRESHOLD || Math.abs(deltaY) <= Math.abs(deltaX)) {
    return;
  }

  scrollToSnapByDirection(deltaY > 0 ? 1 : -1);
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isEditable =
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target?.isContentEditable;

  if (isEditable || event.altKey || event.ctrlKey || event.metaKey) {
    return;
  }

  const goesDown =
    event.key === "ArrowDown" ||
    event.key === "PageDown" ||
    (event.key === " " && !event.shiftKey);
  const goesUp =
    event.key === "ArrowUp" ||
    event.key === "PageUp" ||
    (event.key === " " && event.shiftKey);

  if (goesDown || goesUp) {
    event.preventDefault();
    scrollToSnapByDirection(goesDown ? 1 : -1);
    return;
  }

  if (event.key === "Home") {
    event.preventDefault();
    scrollToTarget(scrollRoot);
    return;
  }

  if (event.key === "End" && snapPanels.length > 0) {
    event.preventDefault();
    scrollToTarget(snapPanels[snapPanels.length - 1]);
  }
});

let lastTopRequest = 0;

const goToPageTop = () => {
  const now = Date.now();

  if (now - lastTopRequest < 180) {
    return;
  }

  lastTopRequest = now;
  scrollToTarget(scrollRoot);
  window.setTimeout(updateScrollTopButton, reducedMotionQuery.matches ? 0 : 620);
};

const handleTopButtonRequest = (event) => {
  event.preventDefault();
  goToPageTop();
};

scrollTopButton?.addEventListener("pointerup", handleTopButtonRequest);
scrollTopButton?.addEventListener("click", handleTopButtonRequest);

scrollTopButton?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  goToPageTop();
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();
    scrollToTarget(target);
  });
});

if ("IntersectionObserver" in window && !reducedMotionQuery.matches) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      }
    },
    {
      root: scrollRoot,
      rootMargin: "0px 0px -16% 0px",
      threshold: 0.12,
    },
  );

  for (const section of revealSections) {
    if (!section.classList.contains("is-visible")) {
      revealObserver.observe(section);
    }
  }
} else {
  for (const section of revealSections) {
    section.classList.add("is-visible");
  }
}

const initialTarget = window.location.hash
  ? document.querySelector(window.location.hash)
  : null;

if (initialTarget && initialTarget !== scrollRoot) {
  window.requestAnimationFrame(() => scrollToTarget(initialTarget, "auto"));
}

const hero = document.querySelector(".hero");
const canAnimateHero =
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !reducedMotionQuery.matches;

if (hero && canAnimateHero) {
  let animationFrame = 0;
  let nextX = "0px";
  let nextY = "0px";

  const applyHeroShift = () => {
    hero.style.setProperty("--hero-shift-x", nextX);
    hero.style.setProperty("--hero-shift-y", nextY);
    animationFrame = 0;
  };

  const updateHeroShift = (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    nextX = `${(-x * 18).toFixed(2)}px`;
    nextY = `${(-y * 12).toFixed(2)}px`;

    if (!animationFrame) {
      animationFrame = requestAnimationFrame(applyHeroShift);
    }
  };

  hero.addEventListener("pointermove", updateHeroShift);
  hero.addEventListener("mousemove", updateHeroShift);

  hero.addEventListener("pointerleave", () => {
    nextX = "0px";
    nextY = "0px";

    if (!animationFrame) {
      animationFrame = requestAnimationFrame(applyHeroShift);
    }
  });
}
