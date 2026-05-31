import "./styles.css";

const hospital = {
  name: "24시수영동물의료센터",
  englishName: "SUYEONG ANIMAL MEDICAL CENTER",
  phone: "051)710-6555",
  address: "부산 수영구 수영로 000, 1층",
};

const hospitalDisplayName = hospital.name.replace("동물", "<wbr />동물");
const hospitalPhoneHref = hospital.phone.replace(/\D/g, "");
const imageUrl = (filename) => `${import.meta.env.BASE_URL}images/${filename}`;
const heroBackgroundImageUrl = imageUrl("hero-room-background.jpg");
const heroForegroundImageUrl = imageUrl("hero-care-team.png");
const logoImageUrl = imageUrl("hospital-symbol.jpeg");
const hongDoctorImageUrl = imageUrl("doctor-hong-card.png");
const kimDoctorImageUrl = imageUrl("doctor-kim-card.png");
const primaryMenuItems = [
  {
    label: "병원소개",
    href: "#menu-about",
    lead: "병원의 방향과 의료진, 공간 정보를 한 번에 확인할 수 있습니다.",
    subItems: [
      { label: "미션/비전", href: "#menu-about", description: "24시간 동물의료센터의 진료 철학과 운영 방향" },
      { label: "의료진소개", href: "#menu-about", description: "두 대표원장 중심의 책임 진료 체계" },
      { label: "병원둘러보기", href: "#menu-about", description: "진료실, 처치실, 수술실, 대기 공간 안내" },
      { label: "보유장비", href: "#menu-about", description: "검사와 수술을 위한 주요 의료 장비" },
      { label: "진료시간/오시는길", href: "#menu-about", description: "24시간 진료와 내원 정보" },
    ],
  },
  {
    label: "외과센터",
    href: "#menu-surgery",
    lead: "수술 상담부터 처치, 회복 계획까지 한 흐름으로 연결합니다.",
    subItems: [
      { label: "외과 수술", href: "#menu-surgery", description: "정밀한 술전 평가와 수술 계획" },
      { label: "슬개골탈구", href: "#menu-surgery", description: "보행 상태와 단계별 수술 상담" },
      { label: "십자인대", href: "#menu-surgery", description: "파열 진단과 안정적인 회복 관리" },
      { label: "골절", href: "#menu-surgery", description: "응급 처치부터 고정 수술까지" },
      { label: "종양 수술", href: "#menu-surgery", description: "검사 결과 기반의 수술 범위 상담" },
    ],
  },
  {
    label: "영상진단센터",
    href: "#menu-imaging",
    lead: "검사 장비와 판독 흐름을 정리해 진료 판단의 정확도를 높입니다.",
    subItems: [
      { label: "영상 장비", href: "#menu-imaging", description: "검사 목적에 맞춘 장비 운용" },
      { label: "CT", href: "#menu-imaging", description: "골격, 흉복부, 종양 평가를 위한 단층 영상" },
      { label: "초음파", href: "#menu-imaging", description: "복부 장기와 연부조직 실시간 평가" },
      { label: "방사선", href: "#menu-imaging", description: "기초 검사와 수술 전후 상태 확인" },
    ],
  },
  {
    label: "재활센터",
    href: "#menu-rehab",
    lead: "수술 후 회복과 만성 통증 관리를 위해 단계별 재활 계획을 세웁니다.",
    subItems: [
      { label: "재활 치료", href: "#menu-rehab", description: "상태별 운동 범위와 근력 회복 관리" },
      { label: "레이저치료", href: "#menu-rehab", description: "통증과 염증 완화를 위한 보조 치료" },
      { label: "체외충격파", href: "#menu-rehab", description: "조직 회복을 돕는 비침습 치료" },
      { label: "회복 관리", href: "#menu-rehab", description: "수술 후 생활 관리와 재진 계획" },
    ],
  },
  {
    label: "진료안내",
    href: "#menu-guide",
    lead: "진료 시간, 야간 내원, 응급 상황의 연락 방법을 안내합니다.",
    subItems: [
      { label: "24시간 진료", href: "#menu-guide", description: "연중무휴 24시간 진료 체계" },
      { label: "야간 응급", href: "#menu-guide", description: "야간 내원 전 전화 연결 안내" },
      { label: "내원 안내", href: "#menu-guide", description: "접수, 검사, 상담 흐름" },
      { label: "전화 문의", href: "#menu-guide", description: hospital.phone },
    ],
  },
  {
    label: "커뮤니티",
    href: "#menu-community",
    lead: "병원 소식과 보호자 문의를 모아 안내합니다.",
    subItems: [
      { label: "공지사항", href: "#menu-community", description: "병원 운영과 진료 관련 안내" },
      { label: "상담 문의", href: "#menu-community", description: "진료 전 확인이 필요한 내용 접수" },
      { label: "자주 묻는 질문", href: "#menu-community", description: "내원과 진료 준비에 대한 답변" },
    ],
  },
];
const menuDetailSectionMarkup = primaryMenuItems
  .map(
    ({ label, href, lead, subItems }, menuIndex) => `
      <section class="menu-detail-section" id="${href.slice(1)}" data-menu-detail-section>
        <div class="menu-detail-section__inner">
          <div class="menu-detail-section__heading">
            <span>${String(menuIndex + 1).padStart(2, "0")}</span>
            <p class="section-kicker">MENU</p>
            <h2>${label}</h2>
            <p>${lead}</p>
          </div>
          <div class="menu-detail-section__placeholder" aria-hidden="true">
            <span>${label}</span>
          </div>
          <div class="menu-detail-grid" aria-label="${label} 하위 메뉴">
            ${subItems
              .map(
                ({ label: subLabel, description }, index) => `
                  <article>
                    <span>${String(index + 1).padStart(2, "0")}</span>
                    <h3>${subLabel}</h3>
                    <p>${description}</p>
                  </article>
                `,
              )
              .join("")}
          </div>
        </div>
      </section>
    `,
  )
  .join("");
const sectionMenuItems = [
  { label: "병원소개", href: "#about" },
  { label: "시설소개", href: "#space" },
  { label: "진료안내", href: "#hours" },
  { label: "의료진", href: "#doctors" },
  { label: "진료과목", href: "#services" },
];
const menuSubItemMarkup = (items) =>
  items.map(({ label, href }) => `<li><a href="${href}">${label}</a></li>`).join("");
const primaryMenuMarkup = primaryMenuItems
  .map(
    ({ label, href, subItems }) => `
      <li>
        <a href="${href}"><span>${label}</span></a>
        <ul class="sub-menu">
          ${menuSubItemMarkup(subItems)}
        </ul>
      </li>
    `,
  )
  .join("");
const globalMenuMarkup = primaryMenuItems
  .map(
    ({ label, href, subItems }) => `
      <li>
        <a class="global-menu__title" href="${href}">${label}</a>
        <ul>
          ${menuSubItemMarkup(subItems)}
        </ul>
      </li>
    `,
  )
  .join("");
const sectionMenuMarkup = sectionMenuItems
  .map(
    ({ label, href }) => `
      <li>
        <a href="${href}" data-section-menu-link>
          <span>${label}</span>
        </a>
      </li>
    `,
  )
  .join("");
const facilitySlides = [
  {
    filename: "facility-01.jpg",
    title: "수술실",
    description: "정밀한 수술과 마취 모니터링을 위한 장비를 갖춘 수술 공간입니다.",
  },
  {
    filename: "facility-02.jpg",
    title: "수술 및 영상 장비",
    description: "검사와 처치, 수술 동선이 이어질 수 있도록 장비를 정돈했습니다.",
  },
  {
    filename: "facility-03.jpg",
    title: "처치실",
    description: "세척과 처치, 회복 관찰이 효율적으로 이어지는 위생적인 공간입니다.",
  },
  {
    filename: "facility-04.jpg",
    title: "재활 치료실",
    description: "운동 기능 회복과 통증 관리를 위한 재활 장비를 준비했습니다.",
  },
  {
    filename: "facility-05.jpg",
    title: "의료 동선",
    description: "수술실과 처치실을 분리된 동선으로 연결해 안정적인 진료 흐름을 만듭니다.",
  },
  {
    filename: "facility-06.jpg",
    title: "병원 입구",
    description: "보호자와 반려동물이 처음 마주하는 입구부터 명확하고 차분하게 안내합니다.",
  },
  {
    filename: "facility-07.jpg",
    title: "대기 공간",
    description: "진료 전 대기 시간을 편안하게 보낼 수 있는 밝고 정돈된 공간입니다.",
  },
  {
    filename: "facility-08.jpg",
    title: "대기 복도",
    description: "넓은 창과 벤치가 있는 동선으로 보호자의 대기 부담을 줄였습니다.",
  },
  {
    filename: "facility-09.jpg",
    title: "보호자 상담 공간",
    description: "상담과 안내, 처방 사료 확인까지 한 흐름으로 이어지는 공간입니다.",
  },
  {
    filename: "facility-10.jpg",
    title: "리셉션",
    description: "접수와 상담이 자연스럽게 이어지는 밝은 리셉션 공간입니다.",
  },
];
const facilitySlideMarkup = facilitySlides
  .map(
    ({ filename, title, description }, index) => `
      <article class="facility-slide ${index === 0 ? "is-active" : ""}" data-facility-slide aria-hidden="${index === 0 ? "false" : "true"}">
        <figure class="facility-photo">
          <img src="${imageUrl(filename)}" alt="${hospital.name} ${title}" loading="${index === 0 ? "eager" : "lazy"}" />
        </figure>
        <div class="facility-caption">
          <div class="section-kicker">FACILITY</div>
          <h2>${title}</h2>
          <p>${description}</p>
          <span>${String(index + 1).padStart(2, "0")} / ${String(facilitySlides.length).padStart(2, "0")}</span>
        </div>
      </article>
    `,
  )
  .join("");

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
    <nav class="nav-links" aria-label="주요 메뉴">
      <ul>
        ${primaryMenuMarkup}
      </ul>
    </nav>
    <div class="header-actions">
      <a class="header-call" href="tel:${hospitalPhoneHref}" aria-label="전화 문의 ${hospital.phone}">
        <span aria-hidden="true">☎</span>
        <strong>${hospital.phone}</strong>
      </a>
      <button class="menu-button" type="button" aria-label="전체 메뉴 열기" aria-expanded="false" aria-controls="global-menu">
        <span></span>
        <span></span>
      </button>
    </div>
  </header>

  <aside class="section-menu is-hidden" aria-label="메인 섹션 목차">
    <ul>
      ${sectionMenuMarkup}
    </ul>
  </aside>

  <div class="global-menu" id="global-menu" aria-hidden="true">
    <div class="global-menu__header">
      <a class="global-menu__call" href="tel:${hospitalPhoneHref}">
        <span aria-hidden="true">☎</span>
        <strong>${hospital.phone}</strong>
      </a>
      <a class="global-menu__brand" href="#top" aria-label="${hospital.name} 홈">
        <span class="brand-mark">
          <img src="${logoImageUrl}" alt="" />
        </span>
        <strong>${hospital.name}</strong>
      </a>
      <button class="global-menu__close" type="button" aria-label="전체 메뉴 닫기"></button>
    </div>
    <nav class="global-menu__nav" aria-label="전체 메뉴">
      <ul>
        ${globalMenuMarkup}
      </ul>
    </nav>
  </div>

  <main id="top" class="snap-root" style="--hero-background-image: url('${heroBackgroundImageUrl}')">
    <section class="hero snap-panel reveal-section is-visible" aria-label="병원 메인 이미지" data-reveal-section>
      <div class="hero__media" aria-hidden="true">
        <div class="hero__background"></div>
        <img class="hero__foreground" src="${heroForegroundImageUrl}" alt="" />
      </div>
      <div class="hero__content">
        <p class="eyebrow">24H ANIMAL MEDICAL CENTER</p>
        <h1>${hospitalDisplayName}</h1>
      </div>
    </section>

    <section class="intro snap-panel reveal-section" id="about" data-reveal-section>
      <div class="about-carousel" aria-live="polite">
        <article class="about-slide about-slide--care is-active" data-about-slide>
          <div class="about-slide__visual" aria-hidden="true"></div>
          <div class="about-slide__content">
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
          </div>
        </article>
        <article class="about-slide about-slide--explain" data-about-slide aria-hidden="true">
          <div class="about-slide__visual" aria-hidden="true"></div>
          <div class="about-slide__content about-slide__content--compact">
            <div class="section-kicker">CLEAR COMMUNICATION</div>
            <h2>보호자가 이해할 수 있는 언어로 진료 과정을 설명합니다.</h2>
            <p>
              검사 결과, 치료 선택지, 회복 계획을 차분하게 나누어 안내합니다.
              필요한 진료를 놓치지 않되 과한 불안을 만들지 않는 설명을 중요하게 생각합니다.
            </p>
          </div>
        </article>
        <article class="about-slide about-slide--space" data-about-slide aria-hidden="true">
          <div class="about-slide__visual" aria-hidden="true"></div>
          <div class="about-slide__content about-slide__content--compact">
            <div class="section-kicker">CALM MEDICAL SPACE</div>
            <h2>대기부터 진료까지 안정감을 주는 동선을 준비했습니다.</h2>
            <p>
              은은한 조명, 분리된 진료 동선, 정돈된 처치 공간으로 반려동물이 머무는 시간을
              더 조용하고 안정적으로 만듭니다.
            </p>
          </div>
        </article>
      </div>
      <div class="about-slide-controls slide-controls" aria-label="병원 소개 슬라이드 제어">
        <button class="about-slide-toggle slide-toggle" type="button" aria-pressed="false" data-about-slide-toggle>
          <span aria-hidden="true">||</span>
        </button>
        <div class="about-slide-dots slide-dots" aria-label="병원 소개 화면 단계 이동" data-about-slide-dots></div>
      </div>
    </section>

    <section class="facility-section snap-panel reveal-section" id="space" data-reveal-section>
      <div class="facility-carousel" aria-live="polite">
        ${facilitySlideMarkup}
      </div>
      <div class="facility-slide-controls slide-controls" aria-label="시설소개 슬라이드 제어">
        <button class="facility-slide-toggle slide-toggle" type="button" aria-pressed="false" data-facility-slide-toggle>
          <span aria-hidden="true">||</span>
        </button>
        <div class="facility-slide-dots slide-dots" aria-label="시설소개 화면 단계 이동" data-facility-slide-dots></div>
      </div>
    </section>

    <section class="hours-section snap-panel reveal-section" id="hours" data-reveal-section>
      <div class="hours-carousel" aria-live="polite">
        <article class="hours-slide hours-slide--schedule is-active" data-hours-slide>
          <div class="hours-slide__visual" aria-hidden="true"></div>
          <div class="hours-slide__content">
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
              </div>
            </div>
          </div>
        </article>
        <article class="hours-slide hours-slide--night" data-hours-slide aria-hidden="true">
          <div class="hours-slide__visual" aria-hidden="true"></div>
          <div class="hours-slide__content hours-slide__content--compact">
            <div class="section-kicker">NIGHT CARE</div>
            <h2>갑작스러운 증상에도 문을 열어두겠습니다.</h2>
            <p>
              구토, 호흡 이상, 보행 이상, 외상처럼 빠른 판단이 필요한 상황에서도 야간 응급 진료가
              이어질 수 있도록 준비합니다.
            </p>
            <div class="care-grid" aria-label="야간 진료 안내">
              <article>
                <span>01</span>
                <h3>응급 내원 대응</h3>
                <p>상태를 먼저 확인하고 필요한 검사와 처치를 순서대로 안내합니다.</p>
              </article>
              <article>
                <span>02</span>
                <h3>입원 관찰</h3>
                <p>회복 경과를 차분하게 확인하며 보호자에게 다음 단계를 설명합니다.</p>
              </article>
            </div>
          </div>
        </article>
        <article class="hours-slide hours-slide--visit" data-hours-slide aria-hidden="true">
          <div class="hours-slide__visual" aria-hidden="true"></div>
          <div class="hours-slide__content hours-slide__content--compact">
            <div class="section-kicker">VISIT GUIDE</div>
            <h2>내원 전 문의부터 진료 후 안내까지 한 흐름으로 돕습니다.</h2>
            <p>
              전화로 증상과 내원 가능 시간을 확인한 뒤, 필요한 준비 사항과 진료 후 관찰 포인트를
              보호자가 이해하기 쉽게 정리해드립니다.
            </p>
            <div class="hours-contact-card">
              <span>예약 및 야간 문의</span>
              <a href="tel:${hospitalPhoneHref}">${hospital.phone}</a>
            </div>
          </div>
        </article>
      </div>
      <div class="hours-slide-controls slide-controls" aria-label="진료안내 슬라이드 제어">
        <button class="hours-slide-toggle slide-toggle" type="button" aria-pressed="false" data-hours-slide-toggle>
          <span aria-hidden="true">||</span>
        </button>
        <div class="hours-slide-dots slide-dots" aria-label="진료안내 화면 단계 이동" data-hours-slide-dots></div>
      </div>
    </section>

    <section class="section doctors snap-panel reveal-section" id="doctors" data-reveal-section>
      <div class="section-heading doctors-heading">
        <div>
          <div class="section-kicker">24H VETERINARY TEAM</div>
          <h2>두 대표원장이 책임 진료합니다.</h2>
        </div>
      </div>
      <div class="doctor-showcase" aria-label="대표원장 소개">
        <article class="doctor-profile-card">
          <figure>
            <img src="${kimDoctorImageUrl}" alt="김민연 대표원장" />
          </figure>
          <div>
            <p class="role">대표원장</p>
            <h3>김민연 대표원장</h3>
          </div>
        </article>
        <article class="doctor-profile-card">
          <figure>
            <img src="${hongDoctorImageUrl}" alt="홍정호 대표원장" />
          </figure>
          <div>
            <p class="role">대표원장</p>
            <h3>홍정호 대표원장</h3>
          </div>
        </article>
      </div>
    </section>

    <section class="section services snap-panel reveal-section" id="services" aria-label="진료 과목" data-reveal-section>
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

  </main>

  <div class="menu-page-root" aria-hidden="true">
    ${menuDetailSectionMarkup}
  </div>

  <a class="scroll-top-button" href="#top" aria-label="맨 위로 이동">
    <span aria-hidden="true">↑</span>
  </a>
`;

const yearElement = document.querySelector("#year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const scrollRoot = document.querySelector(".snap-root");
const scrollTopButton = document.querySelector(".scroll-top-button");
const revealSections = Array.from(document.querySelectorAll("[data-reveal-section]"));
const snapPanels = Array.from(scrollRoot?.querySelectorAll(".snap-panel") ?? []);
const siteHeader = document.querySelector(".site-header");
const navMenuItems = Array.from(document.querySelectorAll(".nav-links > ul > li"));
const sectionMenu = document.querySelector(".section-menu");
const sectionMenuLinks = Array.from(document.querySelectorAll("[data-section-menu-link]"));
const menuButton = document.querySelector(".menu-button");
const globalMenu = document.querySelector(".global-menu");
const globalMenuCloseButton = document.querySelector(".global-menu__close");
const menuPageRoot = document.querySelector(".menu-page-root");
const menuDetailSections = Array.from(document.querySelectorAll("[data-menu-detail-section]"));
const SNAP_SCROLL_DURATION = 940;
const SNAP_SETTLE_LOCK_MS = 220;
const WHEEL_DELTA_THRESHOLD = 360;
const WHEEL_GESTURE_MIN_EVENTS = 2;
const TOUCH_DELTA_THRESHOLD = 48;
const WHEEL_EVENT_GAP_MS = 220;
const REVEAL_SHOW_RATIO = 0.32;
const REVEAL_HIDE_RATIO = 0.08;

let scrollAnimationFrame = 0;
let wheelDeltaAccumulator = 0;
let wheelGestureDirection = 0;
let wheelGestureEventCount = 0;
let lastWheelAt = 0;
let scrollInputLockedUntil = 0;
let touchStartX = 0;
let touchStartY = 0;
let touchTracking = false;
let touchMovedVertically = false;
let prepareCarouselForTargetTop = () => {};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const easeInOutCubic = (progress) =>
  progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

const resetScrollGestureState = ({ resetTouch = false } = {}) => {
  wheelDeltaAccumulator = 0;
  wheelGestureDirection = 0;
  wheelGestureEventCount = 0;
  lastWheelAt = 0;

  if (resetTouch) {
    touchStartX = 0;
    touchStartY = 0;
    touchTracking = false;
    touchMovedVertically = false;
  }
};

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

  prepareCarouselForTargetTop(nextTop);
  stopScrollAnimation();

  if (reducedMotionQuery.matches || behavior === "auto") {
    scrollRoot.scrollTo({ top: nextTop, behavior: "auto" });
    resetScrollGestureState({ resetTouch: true });
    updateScrollState();
    return;
  }

  const startTop = scrollRoot.scrollTop;
  const distance = nextTop - startTop;

  if (Math.abs(distance) < 1) {
    scrollRoot.scrollTop = nextTop;
    resetScrollGestureState({ resetTouch: true });
    updateScrollState();
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
    resetScrollGestureState({ resetTouch: true });
    scrollInputLockedUntil = performance.now() + SNAP_SETTLE_LOCK_MS;
    updateScrollState();
  };

  scrollAnimationFrame = window.requestAnimationFrame(step);
};

const scrollToTarget = (target, behavior = "smooth") => {
  scrollToTopPosition(getTargetTop(target), behavior);
};

const scrollToPanelIndex = (index, behavior = "smooth") => {
  const panel = snapPanels[clamp(index, 0, snapPanels.length - 1)];

  if (panel) {
    scrollToTarget(panel, behavior);
  }
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
  scrollToPanelIndex(getNextSnapIndex(direction));
};

const updateScrollTopButton = () => {
  if (!scrollTopButton) {
    return;
  }

  scrollTopButton.classList.toggle("is-at-top", (scrollRoot?.scrollTop ?? 0) <= 8);
};

const getActivePanelIndex = () => {
  if (!scrollRoot || snapPanels.length === 0) {
    return 0;
  }

  return clamp(
    Math.round(scrollRoot.scrollTop / Math.max(1, scrollRoot.clientHeight)),
    0,
    snapPanels.length - 1,
  );
};

const updateSectionNavigation = () => {
  const activeIndex = getActivePanelIndex();
  const activePanel = snapPanels[activeIndex];
  const activePanelId = activePanel?.id ? `#${activePanel.id}` : "";
  const shouldHideSectionMenu = activeIndex === 0 || !sectionMenuLinks.some((link) => link.hash === activePanelId);
  const shouldUseDarkHeader = Boolean(activePanel?.matches(".intro, .services"));

  sectionMenu?.classList.toggle("is-hidden", shouldHideSectionMenu);
  sectionMenu?.classList.toggle("is-on-light", shouldUseDarkHeader);
  siteHeader?.classList.toggle("is-dark", shouldUseDarkHeader);

  for (const link of sectionMenuLinks) {
    const isActive = link.hash === activePanelId;

    link.parentElement?.classList.toggle("is-active", isActive);
    link.toggleAttribute("aria-current", isActive);
  }
};

const updateScrollState = () => {
  updateScrollTopButton();
  updateSectionNavigation();
};

const showMenuPage = (target, { updateHash = true } = {}) => {
  if (!target || !menuPageRoot) {
    return;
  }

  stopScrollAnimation();
  resetScrollGestureState({ resetTouch: true });
  document.body.classList.add("is-menu-page-active");
  menuPageRoot.classList.add("is-active");
  menuPageRoot.setAttribute("aria-hidden", "false");
  scrollRoot?.setAttribute("aria-hidden", "true");

  for (const section of menuDetailSections) {
    const isActive = section === target;

    section.classList.toggle("is-active", isActive);
    section.setAttribute("aria-hidden", String(!isActive));
  }

  menuPageRoot.scrollTo({ top: 0, behavior: "auto" });
  sectionMenu?.classList.add("is-hidden");
  scrollTopButton?.classList.remove("is-at-top");

  if (updateHash && window.location.hash !== `#${target.id}`) {
    window.history.pushState(null, "", `#${target.id}`);
  }
};

const hideMenuPage = () => {
  document.body.classList.remove("is-menu-page-active");
  menuPageRoot?.classList.remove("is-active");
  menuPageRoot?.setAttribute("aria-hidden", "true");
  scrollRoot?.removeAttribute("aria-hidden");

  for (const section of menuDetailSections) {
    section.classList.remove("is-active");
    section.setAttribute("aria-hidden", "true");
  }
};

const openGlobalMenu = () => {
  globalMenu?.classList.add("is-active");
  globalMenu?.setAttribute("aria-hidden", "false");
  menuButton?.setAttribute("aria-expanded", "true");
};

const closeGlobalMenu = () => {
  globalMenu?.classList.remove("is-active");
  globalMenu?.setAttribute("aria-hidden", "true");
  menuButton?.setAttribute("aria-expanded", "false");
};

menuButton?.addEventListener("click", openGlobalMenu);
globalMenuCloseButton?.addEventListener("click", closeGlobalMenu);

for (const item of navMenuItems) {
  item.addEventListener("pointerleave", () => {
    item.classList.remove("is-click-closed");
  });

  item.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      item.classList.add("is-click-closed");
      link.blur();
    });
  });
}

globalMenu?.addEventListener("click", (event) => {
  if (event.target === globalMenu || event.target.closest('a[href^="#"]')) {
    closeGlobalMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && globalMenu?.classList.contains("is-active")) {
    closeGlobalMenu();
  }
});

scrollRoot?.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();

scrollRoot?.addEventListener(
  "wheel",
  (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    event.preventDefault();
    const now = performance.now();

    if (now < scrollInputLockedUntil) {
      resetScrollGestureState();
      return;
    }

    if (scrollAnimationFrame) {
      resetScrollGestureState();
      return;
    }

    const direction = event.deltaY > 0 ? 1 : -1;
    const startsNewGesture =
      now - lastWheelAt > WHEEL_EVENT_GAP_MS || wheelGestureDirection !== direction;

    if (startsNewGesture) {
      wheelDeltaAccumulator = 0;
      wheelGestureEventCount = 0;
      wheelGestureDirection = direction;
    }

    lastWheelAt = now;
    wheelGestureEventCount += 1;
    wheelDeltaAccumulator += event.deltaY;

    if (
      wheelGestureEventCount < WHEEL_GESTURE_MIN_EVENTS ||
      Math.abs(wheelDeltaAccumulator) < WHEEL_DELTA_THRESHOLD
    ) {
      return;
    }

    const snapDirection = wheelDeltaAccumulator > 0 ? 1 : -1;
    resetScrollGestureState();
    scrollToSnapByDirection(snapDirection);
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

  if (scrollAnimationFrame) {
    resetScrollGestureState({ resetTouch: true });
    return;
  }

  if (performance.now() < scrollInputLockedUntil) {
    resetScrollGestureState({ resetTouch: true });
    return;
  }

  resetScrollGestureState({ resetTouch: true });
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
    if (scrollAnimationFrame) {
      return;
    }

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
  hideMenuPage();
  if (window.location.hash) {
    window.history.pushState(null, "", "#top");
  }
  scrollToTarget(scrollRoot);
  window.setTimeout(updateScrollState, reducedMotionQuery.matches ? 0 : 620);
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

    if (target.matches("[data-menu-detail-section]")) {
      showMenuPage(target);
      return;
    }

    hideMenuPage();
    if (window.location.hash.startsWith("#menu-") || target === scrollRoot) {
      window.history.pushState(null, "", targetId);
    }
    scrollToTarget(target);
  });
});

if ("IntersectionObserver" in window && !reducedMotionQuery.matches) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= REVEAL_SHOW_RATIO) {
          entry.target.classList.add("is-visible");
          continue;
        }

        if (!entry.isIntersecting || entry.intersectionRatio <= REVEAL_HIDE_RATIO) {
          entry.target.classList.remove("is-visible");
        }
      }
    },
    {
      root: scrollRoot,
      rootMargin: "0px",
      threshold: [0, REVEAL_HIDE_RATIO, REVEAL_SHOW_RATIO, 0.72],
    },
  );

  for (const section of revealSections) {
    revealObserver.observe(section);
  }
} else {
  for (const section of revealSections) {
    section.classList.add("is-visible");
  }
}

const handleHashNavigation = (behavior = "smooth") => {
  const target = window.location.hash ? document.querySelector(window.location.hash) : null;

  if (!target) {
    hideMenuPage();
    return;
  }

  if (target.matches("[data-menu-detail-section]")) {
    showMenuPage(target, { updateHash: false });
    return;
  }

  hideMenuPage();

  scrollToTarget(target, behavior);
};

window.addEventListener("hashchange", () => handleHashNavigation());

if (window.location.hash) {
  window.requestAnimationFrame(() => handleHashNavigation("auto"));
}

const hero = document.querySelector(".hero");
const aboutSlides = Array.from(document.querySelectorAll("[data-about-slide]"));
const aboutSlideDots = document.querySelector("[data-about-slide-dots]");
const aboutSlideToggle = document.querySelector("[data-about-slide-toggle]");
const hoursSlides = Array.from(document.querySelectorAll("[data-hours-slide]"));
const hoursSlideDots = document.querySelector("[data-hours-slide-dots]");
const hoursSlideToggle = document.querySelector("[data-hours-slide-toggle]");
const facilitySlideElements = Array.from(document.querySelectorAll("[data-facility-slide]"));
const facilitySlideDots = document.querySelector("[data-facility-slide-dots]");
const facilitySlideToggle = document.querySelector("[data-facility-slide-toggle]");
const ABOUT_SLIDE_INTERVAL = 4000;
const CAROUSEL_SWIPE_THRESHOLD = 52;
const CAROUSEL_SWIPE_AXIS_RATIO = 1.2;
const activeCarousels = [];

const createFadeCarousel = ({
  slides,
  dotsContainer,
  toggleButton,
  dotClassName,
  dotDataAttribute,
  label,
  section,
}) => {
  let activeSlide = 0;
  let slideTimer = 0;
  let isPaused = reducedMotionQuery.matches;
  let swipeStartX = 0;
  let swipeStartY = 0;
  let swipeTracking = false;
  let swipeMovedHorizontally = false;

  if (dotsContainer) {
    dotsContainer.innerHTML = slides
      .map(
        (_slide, index) => `
          <button class="${dotClassName} slide-dot" type="button" aria-label="${index + 1}번째 ${label} 화면으로 이동" ${dotDataAttribute}="${index}"></button>
        `,
      )
      .join("");
  }

  const dotButtons = dotsContainer
    ? Array.from(dotsContainer.querySelectorAll(`[${dotDataAttribute}]`))
    : [];

  const render = () => {
    for (const [index, slide] of slides.entries()) {
      const isActive = index === activeSlide;

      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    }

    for (const button of dotButtons) {
      const isActive = Number(button.getAttribute(dotDataAttribute)) === activeSlide;

      button.classList.toggle("is-active", isActive);
      button.toggleAttribute("aria-current", isActive);
    }

    if (toggleButton) {
      toggleButton.setAttribute("aria-pressed", String(isPaused));
      toggleButton.setAttribute("aria-label", isPaused ? `${label} 슬라이드 재생` : `${label} 슬라이드 일시정지`);
      toggleButton.querySelector("span").textContent = isPaused ? ">" : "||";
    }
  };

  const show = (index) => {
    activeSlide = clamp(index, 0, slides.length - 1);
    render();
  };

  const showWrapped = (index) => {
    activeSlide = (index + slides.length) % slides.length;
    render();
  };

  const clearTimer = () => {
    window.clearTimeout(slideTimer);
    slideTimer = 0;
  };

  const schedule = () => {
    clearTimer();

    if (isPaused || slides.length < 2) {
      return;
    }

    slideTimer = window.setTimeout(() => {
      if (document.visibilityState === "visible") {
        show((activeSlide + 1) % slides.length);
      }

      schedule();
    }, ABOUT_SLIDE_INTERVAL);
  };

  const pause = () => {
    isPaused = true;
    clearTimer();
    render();
  };

  const resume = () => {
    isPaused = false;
    render();
    schedule();
  };

  const resetToFirst = () => {
    show(0);
    schedule();
  };

  const showNext = () => {
    showWrapped(activeSlide + 1);
    schedule();
  };

  const showPrevious = () => {
    showWrapped(activeSlide - 1);
    schedule();
  };

  for (const button of dotButtons) {
    button.addEventListener("click", () => {
      show(Number(button.getAttribute(dotDataAttribute)));
      schedule();
    });
  }

  toggleButton?.addEventListener("click", () => {
    if (isPaused) {
      resume();
      return;
    }

    pause();
  });

  section?.addEventListener(
    "touchstart",
    (event) => {
      if (slides.length < 2 || event.touches.length !== 1) {
        swipeTracking = false;
        return;
      }

      swipeTracking = true;
      swipeMovedHorizontally = false;
      swipeStartX = event.touches[0].clientX;
      swipeStartY = event.touches[0].clientY;
    },
    { passive: true },
  );

  section?.addEventListener(
    "touchmove",
    (event) => {
      if (!swipeTracking || event.touches.length !== 1) {
        return;
      }

      const deltaX = event.touches[0].clientX - swipeStartX;
      const deltaY = event.touches[0].clientY - swipeStartY;
      const absoluteX = Math.abs(deltaX);
      const absoluteY = Math.abs(deltaY);

      if (absoluteX > 8 && absoluteX > absoluteY * CAROUSEL_SWIPE_AXIS_RATIO) {
        swipeMovedHorizontally = true;
        event.preventDefault();
      }
    },
    { passive: false },
  );

  section?.addEventListener("touchend", (event) => {
    if (!swipeTracking) {
      return;
    }

    swipeTracking = false;

    if (!swipeMovedHorizontally || event.changedTouches.length === 0) {
      return;
    }

    const deltaX = event.changedTouches[0].clientX - swipeStartX;
    const deltaY = event.changedTouches[0].clientY - swipeStartY;
    const absoluteX = Math.abs(deltaX);
    const absoluteY = Math.abs(deltaY);

    if (
      absoluteX < CAROUSEL_SWIPE_THRESHOLD ||
      absoluteX <= absoluteY * CAROUSEL_SWIPE_AXIS_RATIO
    ) {
      return;
    }

    if (deltaX < 0) {
      showNext();
      return;
    }

    showPrevious();
  });

  section?.addEventListener("touchcancel", () => {
    swipeTracking = false;
    swipeMovedHorizontally = false;
  });

  render();
  schedule();

  return { clearTimer, resetToFirst, schedule, section };
};

activeCarousels.push(
  createFadeCarousel({
    slides: aboutSlides,
    dotsContainer: aboutSlideDots,
    toggleButton: aboutSlideToggle,
    dotClassName: "about-slide-dot",
    dotDataAttribute: "data-about-slide-index",
    label: "병원 소개",
    section: document.querySelector("#about"),
  }),
);

activeCarousels.push(
  createFadeCarousel({
    slides: hoursSlides,
    dotsContainer: hoursSlideDots,
    toggleButton: hoursSlideToggle,
    dotClassName: "hours-slide-dot",
    dotDataAttribute: "data-hours-slide-index",
    label: "진료안내",
    section: document.querySelector("#hours"),
  }),
);

activeCarousels.push(
  createFadeCarousel({
    slides: facilitySlideElements,
    dotsContainer: facilitySlideDots,
    toggleButton: facilitySlideToggle,
    dotClassName: "facility-slide-dot",
    dotDataAttribute: "data-facility-slide-index",
    label: "시설소개",
    section: document.querySelector("#space"),
  }),
);

prepareCarouselForTargetTop = (targetTop) => {
  if (!scrollRoot || activeCarousels.length === 0 || snapPanels.length === 0) {
    return;
  }

  const panelIndex = clamp(
    Math.round(targetTop / Math.max(1, scrollRoot.clientHeight)),
    0,
    snapPanels.length - 1,
  );
  const targetPanel = snapPanels[panelIndex];
  const carousel = activeCarousels.find(({ section }) => section === targetPanel);

  carousel?.resetToFirst();
};

if ("IntersectionObserver" in window && scrollRoot) {
  const enteredCarouselSections = new Set();
  const carouselEntranceObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const carousel = activeCarousels.find(({ section }) => section === entry.target);

        if (!carousel) {
          continue;
        }

        if (entry.isIntersecting && entry.intersectionRatio >= 0.62) {
          if (!enteredCarouselSections.has(entry.target)) {
            enteredCarouselSections.add(entry.target);
            carousel.resetToFirst();
          }

          continue;
        }

        if (entry.intersectionRatio <= 0.25) {
          enteredCarouselSections.delete(entry.target);
        }
      }
    },
    {
      root: scrollRoot,
      threshold: [0, 0.25, 0.62, 0.95],
    },
  );

  for (const { section } of activeCarousels) {
    if (section) {
      carouselEntranceObserver.observe(section);
    }
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    for (const carousel of activeCarousels) {
      carousel.schedule();
    }
    return;
  }

  for (const carousel of activeCarousels) {
    carousel.clearTimer();
  }
});

const canAnimateHero =
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !reducedMotionQuery.matches;

if (hero && canAnimateHero) {
  let animationFrame = 0;
  let nextBgX = "0px";
  let nextBgY = "0px";
  let nextFgX = "0px";
  let nextFgY = "0px";

  const applyHeroShift = () => {
    hero.style.setProperty("--hero-bg-shift-x", nextBgX);
    hero.style.setProperty("--hero-bg-shift-y", nextBgY);
    hero.style.setProperty("--hero-fg-shift-x", nextFgX);
    hero.style.setProperty("--hero-fg-shift-y", nextFgY);
    animationFrame = 0;
  };

  const updateHeroShift = (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    nextBgX = `${(-x * 30).toFixed(2)}px`;
    nextBgY = `${(-y * 20).toFixed(2)}px`;
    nextFgX = `${(-x * 10).toFixed(2)}px`;
    nextFgY = `${(-y * 6).toFixed(2)}px`;

    if (!animationFrame) {
      animationFrame = requestAnimationFrame(applyHeroShift);
    }
  };

  hero.addEventListener("pointermove", updateHeroShift);
  hero.addEventListener("mousemove", updateHeroShift);

  hero.addEventListener("pointerleave", () => {
    nextBgX = "0px";
    nextBgY = "0px";
    nextFgX = "0px";
    nextFgY = "0px";

    if (!animationFrame) {
      animationFrame = requestAnimationFrame(applyHeroShift);
    }
  });
}
