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

  <main id="top" style="--reception-image: url('${receptionImageUrl}')">
    <div class="reveal-section reveal-section--home is-visible" data-reveal-section>
      <section class="hero" aria-label="병원 메인 이미지">
        <div class="hero__content">
          <p class="eyebrow">24H ANIMAL MEDICAL CENTER</p>
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
              <dd>365일 24시간</dd>
            </div>
            <div>
              <dt>의료진</dt>
              <dd>풀타임 전공의</dd>
            </div>
            <div>
              <dt>특화</dt>
              <dd>외과, 내과, 재활</dd>
            </div>
          </dl>
        </div>
      </section>

      <section class="notice-band" aria-label="빠른 안내">
        <div>
          <span>365일 연중무휴 24시간 진료</span>
          <strong>오전 10:00 - 오후 10:00, 야간 10:00 - 오전 10:00</strong>
        </div>
        <a href="#contact">전화 문의 ${hospital.phone}</a>
      </section>
    </div>

    <section class="section intro reveal-section" id="about" data-reveal-section>
      <div class="section-kicker">ABOUT</div>
      <div class="split">
        <div>
          <h2>편안하게 머물 수 있는 공간에서, 필요한 진료를 정확하게.</h2>
        </div>
        <div class="copy-stack">
          <p>
            ${hospital.name}는 365일 24시간 진료하는 동물의료센터입니다. 보호자가 불안한 순간에도
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

    <section class="section section--dark reveal-section" id="hours" data-reveal-section>
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
                <dt>운영</dt>
                <dd>365일 연중무휴</dd>
              </div>
              <div>
                <dt>예약 문의</dt>
                <dd>${hospital.phone}</dd>
              </div>
            </dl>
          </div>
          <div class="care-grid" aria-label="진료 운영 안내">
            <article>
              <span>24H</span>
              <h3>야간 응급 진료</h3>
              <p>갑작스러운 증상과 사고에도 내원이 가능하도록 24시간 응급 대응 체계를 운영합니다.</p>
            </article>
            <article>
              <span>365</span>
              <h3>연중무휴 운영</h3>
              <p>주말과 공휴일에도 같은 기준으로 진료하며, 야간에는 전화 후 내원하시면 문을 열어드립니다.</p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="section doctors reveal-section" id="doctors" data-reveal-section>
      <div class="section-kicker">DOCTORS</div>
      <div class="section-heading">
        <h2>대학병원 출신 풀타임 전공의가 24시간 상주합니다.</h2>
        <p>외과 전문 전공의 의료진이 응급 상황부터 수술, 회복 관리까지 직접 살핍니다.</p>
      </div>
      <div class="doctor-showcase" aria-label="대표원장 소개">
        <article class="doctor-profile-card">
          <figure>
            <img src="${hongDoctorImageUrl}" alt="홍정호 대표원장" />
          </figure>
          <div>
            <p class="role">CHIEF VETERINARIAN</p>
            <h3>홍정호 대표원장</h3>
            <strong>외과 전문 전공의</strong>
            <p>
              응급 진료와 외과 수술이 필요한 순간에 진단부터 치료 계획까지 차분하게 설명합니다.
              보호자가 이해할 수 있는 언어로 수술 전후 과정을 안내합니다.
            </p>
            <ul class="doctor-tags" aria-label="홍정호 대표원장 진료 소개">
              <li>외과 수술 상담</li>
              <li>응급 처치</li>
              <li>수술 전후 설명</li>
            </ul>
          </div>
        </article>
        <article class="doctor-profile-card">
          <figure>
            <img src="${kimDoctorImageUrl}" alt="김민연 대표원장" />
          </figure>
          <div>
            <p class="role">CHIEF VETERINARIAN</p>
            <h3>김민연 대표원장</h3>
            <strong>외과 전문 전공의</strong>
            <p>
              수술 전 평가와 회복 관리까지 이어지는 진료 흐름을 설계합니다.
              응급 상황에서도 필요한 처치와 다음 단계를 명확하게 안내합니다.
            </p>
            <ul class="doctor-tags" aria-label="김민연 대표원장 진료 소개">
              <li>수술 전 평가</li>
              <li>회복 관리</li>
              <li>응급 진료</li>
            </ul>
          </div>
        </article>
      </div>
    </section>

    <section class="section services reveal-section" aria-label="진료 과목" data-reveal-section>
      <div class="section-kicker">SPECIALTY</div>
      <div class="section-heading">
        <h2>수술, 재활, 내과까지 한 곳에서 이어지는 특화 진료.</h2>
        <p>대학병원급 전문 장비와 분야별 진료 경험을 바탕으로 필요한 치료를 정확하게 연결합니다.</p>
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
            <h3>내과 특화 진료</h3>
            <p>심장, 신장, 간담도계 질환처럼 꾸준한 관리가 필요한 내과 질환을 세심하게 봅니다.</p>
          </div>
        </article>
      </div>
    </section>

    <section class="section space reveal-section" id="space" data-reveal-section>
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

    <section class="contact reveal-section" id="contact" aria-label="문의" data-reveal-section>
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
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const scrollTopButton = document.querySelector(".scroll-top-button");
const revealSections = Array.from(document.querySelectorAll("[data-reveal-section]"));

const getHeaderHeight = () => siteHeader?.getBoundingClientRect().height ?? 0;

const getTargetTop = (target) => {
  if (!target || target === document.body) {
    return 0;
  }

  return Math.max(0, target.getBoundingClientRect().top + window.scrollY - getHeaderHeight());
};

const scrollToTarget = (target, behavior = "smooth") => {
  window.scrollTo({
    top: getTargetTop(target),
    behavior: reducedMotionQuery.matches ? "auto" : behavior,
  });
};

const updateScrollTopButton = () => {
  if (!scrollTopButton) {
    return;
  }

  scrollTopButton.classList.toggle("is-at-top", window.scrollY <= 8);
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
  scrollToTarget(document.body);
  window.setTimeout(updateScrollTopButton, reducedMotionQuery.matches ? 0 : 620);
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

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));

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
