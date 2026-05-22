import "./styles.css";

const hospital = {
  name: "24시수영동물의료센터",
  englishName: "SUYOUNG ANIMAL MEDICAL CENTER",
  phone: "051-000-0000",
  address: "부산 수영구 수영로 000, 1층",
};

const hospitalDisplayName = hospital.name.replace("동물", "<wbr />동물");
const receptionImageUrl = `${import.meta.env.BASE_URL}images/main-reception.jpg`;

document.querySelector("#app").innerHTML = `
  <header class="site-header" aria-label="상단 메뉴">
    <a class="brand" href="#top" aria-label="${hospital.name} 홈">
      <span class="brand-mark">SY</span>
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

  <main id="top" style="--reception-image: url('${receptionImageUrl}')">
    <div class="snap-chapter snap-chapter--home" data-snap-section>
      <section class="hero" aria-label="병원 메인 이미지">
        <div class="hero__content">
          <p class="eyebrow">NEWLY OPENED 24H ANIMAL MEDICAL CENTER</p>
          <h1>${hospitalDisplayName}</h1>
          <p class="hero__lead">
            차분한 공간, 정확한 진료, 다정한 설명으로 반려동물의 하루를 더 안정적으로 돌봅니다.
          </p>
          <div class="hero__actions" aria-label="주요 행동">
            <a class="button button--primary" href="#hours">진료시간 보기</a>
            <a class="button button--ghost" href="#doctors">의료진 소개</a>
          </div>
          <dl class="hero__facts" aria-label="병원 주요 정보">
            <div>
              <dt>운영</dt>
              <dd>24시간</dd>
            </div>
            <div>
              <dt>진료</dt>
              <dd>내과, 외과, 영상</dd>
            </div>
            <div>
              <dt>응급</dt>
              <dd>야간 내원 가능</dd>
            </div>
          </dl>
        </div>
      </section>

      <section class="notice-band" aria-label="빠른 안내">
        <div>
          <span>오늘도 24시간 진료</span>
          <strong>예약 진료와 응급 내원을 함께 운영합니다.</strong>
        </div>
        <a href="#contact">전화 문의 ${hospital.phone}</a>
      </section>
    </div>

    <section class="section intro snap-chapter" id="about" data-snap-section>
      <div class="section-kicker">ABOUT</div>
      <div class="split">
        <div>
          <h2>편안하게 머물 수 있는 공간에서, 필요한 진료를 정확하게.</h2>
        </div>
        <div class="copy-stack">
          <p>
            ${hospital.name}는 새롭게 문을 연 24시간 동물의료센터입니다. 보호자가 불안한 순간에도
            차분하게 이해할 수 있도록 검사와 치료 과정을 명확하게 설명합니다.
          </p>
          <p>
            진료실, 처치실, 입원 공간의 동선을 세심하게 구성해 반려동물의 스트레스를 줄이고
            의료진이 신속하게 대응할 수 있는 환경을 갖추었습니다.
          </p>
        </div>
      </div>
      <div class="feature-grid" aria-label="병원 특징">
        <article>
          <span>01</span>
          <h3>24시간 케어</h3>
          <p>낮과 밤의 경계 없이 필요한 순간에 진료를 받을 수 있도록 운영합니다.</p>
        </article>
        <article>
          <span>02</span>
          <h3>정밀한 설명</h3>
          <p>검사 결과와 치료 선택지를 보호자의 언어로 분명하게 안내합니다.</p>
        </article>
        <article>
          <span>03</span>
          <h3>안정적인 공간</h3>
          <p>어두운 베이지 톤의 조용한 인테리어로 대기부터 진료까지 편안함을 더했습니다.</p>
        </article>
      </div>
    </section>

    <section class="section section--dark snap-chapter" id="hours" data-snap-section>
      <div class="section-kicker">HOURS</div>
      <div class="split split--center">
        <div>
          <h2>응급 상황부터 정기 검진까지, 매일 같은 기준으로 봅니다.</h2>
          <p class="section-lead">
            일부 전문 진료와 수술 상담은 담당 의료진 일정에 따라 예약제로 운영됩니다.
          </p>
        </div>
        <div class="hours-panel">
          <dl>
            <div>
              <dt>일반 진료</dt>
              <dd>매일 09:00 - 21:00</dd>
            </div>
            <div>
              <dt>야간 응급</dt>
              <dd>매일 21:00 - 09:00</dd>
            </div>
            <div>
              <dt>입원 케어</dt>
              <dd>24시간 모니터링</dd>
            </div>
            <div>
              <dt>예약 문의</dt>
              <dd>${hospital.phone}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <section class="section doctors snap-chapter" id="doctors" data-snap-section data-free-scroll>
      <div class="section-kicker">DOCTORS</div>
      <div class="section-heading">
        <h2>두 명의 의료진이 진료의 처음부터 회복까지 함께 살핍니다.</h2>
        <p>각자의 전문성을 바탕으로 필요한 검사와 치료 방향을 차분하게 설명합니다.</p>
      </div>
      <div class="doctor-grid">
        <article class="doctor-card doctor-card--large">
          <div class="doctor-photo doctor-photo--chief" role="img" aria-label="대표원장 사진 영역">
            <span>대표원장</span>
          </div>
          <div class="doctor-profile">
            <p class="role">CHIEF VETERINARIAN</p>
            <h3>대표원장</h3>
            <p class="doctor-specialty">내과, 응급 진료, 노령동물 케어</p>
            <ul class="doctor-bio">
              <li>24시간 응급 환자 진료 및 입원 케어</li>
              <li>건강검진, 만성질환, 예방의학 상담</li>
              <li>보호자가 이해하기 쉬운 검사 결과 설명</li>
            </ul>
          </div>
        </article>
        <article class="doctor-card doctor-card--large">
          <div class="doctor-photo doctor-photo--surgery" role="img" aria-label="진료원장 사진 영역">
            <span>진료원장</span>
          </div>
          <div class="doctor-profile">
            <p class="role">VETERINARIAN</p>
            <h3>진료원장</h3>
            <p class="doctor-specialty">외과, 영상진단, 치과 진료</p>
            <ul class="doctor-bio">
              <li>초음파, 방사선 기반 정밀 진단</li>
              <li>외과 상담, 치과 처치, 마취 전 평가</li>
              <li>수술 후 회복 관리와 보호자 안내</li>
            </ul>
          </div>
        </article>
      </div>
    </section>

    <section class="section services snap-chapter" aria-label="진료 과목" data-snap-section>
      <div class="service-list">
        <article>
          <h3>예방의학</h3>
          <p>건강검진, 예방접종, 심장사상충, 연령별 관리 상담</p>
        </article>
        <article>
          <h3>내과진료</h3>
          <p>소화기, 피부, 호흡기, 노령동물 만성질환 관리</p>
        </article>
        <article>
          <h3>응급진료</h3>
          <p>야간 내원, 처치, 입원 모니터링, 보호자 안내</p>
        </article>
        <article>
          <h3>수술치료</h3>
          <p>외과 상담, 마취 평가, 치과 처치, 회복 관리</p>
        </article>
      </div>
    </section>

    <section class="section space snap-chapter" id="space" data-snap-section>
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

    <section class="contact snap-chapter" id="contact" aria-label="문의" data-snap-section>
      <div>
        <p class="eyebrow">CONTACT</p>
        <h2>진료가 필요한 순간, 편하게 문의하세요.</h2>
      </div>
      <address>
        <span>${hospital.address}</span>
        <a href="tel:${hospital.phone.replaceAll("-", "")}">${hospital.phone}</a>
      </address>
    </section>
  </main>

  <a class="scroll-top-button" href="#top" aria-label="맨 위로 이동">
    <span aria-hidden="true">↑</span>
  </a>

  <footer>
    <span>${hospital.name}</span>
    <span>© <span id="year"></span> ${hospital.englishName}</span>
  </footer>
`;

document.querySelector("#year").textContent = new Date().getFullYear();

const siteHeader = document.querySelector(".site-header");
const snapSections = Array.from(document.querySelectorAll("[data-snap-section]"));
const snapMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileSnapQuery = window.matchMedia("(max-width: 680px)");
const scrollTopButton = document.querySelector(".scroll-top-button");
let isChapterSnapping = false;
let chapterSnapTimer = 0;

const getHeaderHeight = () => siteHeader?.getBoundingClientRect().height ?? 0;

const getSectionTop = (section) =>
  Math.max(0, section.getBoundingClientRect().top + window.scrollY - getHeaderHeight());

const snapToSection = (section, behavior = "smooth") => {
  if (!section) {
    return;
  }

  isChapterSnapping = true;
  window.clearTimeout(chapterSnapTimer);
  window.scrollTo({ top: getSectionTop(section), behavior });
  chapterSnapTimer = window.setTimeout(() => {
    isChapterSnapping = false;
  }, behavior === "smooth" ? 820 : 0);
};

const getActiveSnapIndex = (direction = 1) => {
  const headerHeight = getHeaderHeight();
  const viewportTop = window.scrollY + headerHeight;
  const probeY =
    direction < 0
      ? viewportTop + 8
      : viewportTop + Math.min(window.innerHeight * 0.34, 260);
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  if (direction < 0) {
    for (const [index, section] of snapSections.entries()) {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;

      if (sectionTop <= probeY) {
        closestIndex = index;
      }
    }

    return closestIndex;
  }

  for (const [index, section] of snapSections.entries()) {
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (probeY >= sectionTop && probeY < sectionBottom) {
      return index;
    }

    const distance = Math.abs(sectionTop - probeY);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  }

  return closestIndex;
};

const canScrollInsideSection = (section, direction) => {
  if (!section) {
    return false;
  }

  if (mobileSnapQuery.matches && !section.hasAttribute("data-free-scroll")) {
    return false;
  }

  const headerHeight = getHeaderHeight();
  const sectionTop = section.getBoundingClientRect().top + window.scrollY;
  const sectionBottom = sectionTop + section.offsetHeight;
  const viewportTop = window.scrollY + headerHeight;
  const viewportBottom = window.scrollY + window.innerHeight;
  const readableViewport = window.innerHeight - headerHeight;
  const hasLongContent = section.offsetHeight > readableViewport + 180;

  if (!hasLongContent) {
    return false;
  }

  if (direction > 0) {
    return sectionBottom > viewportBottom + 42;
  }

  return sectionTop < viewportTop - 42;
};

const snapToAdjacentSection = (direction) => {
  const activeIndex = getActiveSnapIndex(direction);
  const activeSection = snapSections[activeIndex];

  if (canScrollInsideSection(activeSection, direction)) {
    return false;
  }

  const nextIndex = Math.min(Math.max(activeIndex + direction, 0), snapSections.length - 1);

  if (nextIndex === activeIndex) {
    return false;
  }

  snapToSection(snapSections[nextIndex]);
  return true;
};

const isChapterSnapEnabled = () => snapSections.length > 1 && !snapMotionQuery.matches;

const updateScrollTopButton = () => {
  if (!scrollTopButton) {
    return;
  }

  scrollTopButton.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.45);
};

window.addEventListener("scroll", updateScrollTopButton, { passive: true });
updateScrollTopButton();

let lastTopRequest = 0;

const goToPageTop = () => {
  const now = Date.now();

  if (now - lastTopRequest < 180) {
    return;
  }

  lastTopRequest = now;
  isChapterSnapping = true;
  window.clearTimeout(chapterSnapTimer);
  window.scrollTo({
    top: 0,
    behavior: snapMotionQuery.matches ? "auto" : "smooth",
  });
  chapterSnapTimer = window.setTimeout(() => {
    isChapterSnapping = false;
    updateScrollTopButton();
  }, snapMotionQuery.matches ? 0 : 820);
};

scrollTopButton?.addEventListener("pointerup", (event) => {
  event.preventDefault();
  goToPageTop();
});

scrollTopButton?.addEventListener("click", goToPageTop);

scrollTopButton?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  goToPageTop();
});

let wheelDelta = 0;
let wheelResetTimer = 0;

window.addEventListener(
  "wheel",
  (event) => {
    if (
      !isChapterSnapEnabled() ||
      event.ctrlKey ||
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
    ) {
      return;
    }

    const delta = event.deltaY * (event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? window.innerHeight : 1);
    const direction = Math.sign(delta);

    if (!direction) {
      return;
    }

    if (isChapterSnapping) {
      event.preventDefault();
      return;
    }

    const activeSection = snapSections[getActiveSnapIndex(direction)];
    if (canScrollInsideSection(activeSection, direction)) {
      wheelDelta = 0;
      return;
    }

    event.preventDefault();
    wheelDelta += delta;
    window.clearTimeout(wheelResetTimer);
    wheelResetTimer = window.setTimeout(() => {
      wheelDelta = 0;
    }, 160);

    if (Math.abs(wheelDelta) >= 70) {
      snapToAdjacentSection(direction);
      wheelDelta = 0;
    }
  },
  { passive: false },
);

let touchStartX = 0;
let touchStartY = 0;

window.addEventListener(
  "touchstart",
  (event) => {
    if (!isChapterSnapEnabled() || event.touches.length !== 1) {
      return;
    }

    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  },
  { passive: true },
);

window.addEventListener(
  "touchmove",
  (event) => {
    if (!isChapterSnapEnabled() || isChapterSnapping || event.touches.length !== 1) {
      return;
    }

    const deltaX = touchStartX - event.touches[0].clientX;
    const deltaY = touchStartY - event.touches[0].clientY;
    const direction = Math.sign(deltaY);

    if (!direction || Math.abs(deltaY) < 10 || Math.abs(deltaX) > Math.abs(deltaY)) {
      return;
    }

    const activeSection = snapSections[getActiveSnapIndex(direction)];
    if (!canScrollInsideSection(activeSection, direction) && event.cancelable) {
      event.preventDefault();
    }
  },
  { passive: false },
);

window.addEventListener("touchend", (event) => {
  if (!isChapterSnapEnabled() || isChapterSnapping || !event.changedTouches.length) {
    return;
  }

  const deltaX = touchStartX - event.changedTouches[0].clientX;
  const deltaY = touchStartY - event.changedTouches[0].clientY;
  const direction = Math.sign(deltaY);

  if (!direction || Math.abs(deltaY) < 58 || Math.abs(deltaX) > Math.abs(deltaY)) {
    return;
  }

  snapToAdjacentSection(direction);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));

    if (!target) {
      return;
    }

    event.preventDefault();
    snapToSection(target);
  });
});

const hero = document.querySelector(".hero");
const canAnimateHero =
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
