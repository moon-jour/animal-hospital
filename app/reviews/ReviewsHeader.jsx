import Link from "next/link";

const menuItems = [
  { label: "병원소개", href: "/#menu-about" },
  { label: "외과센터", href: "/#menu-surgery" },
  { label: "영상진단센터", href: "/#menu-imaging" },
  { label: "재활센터", href: "/#menu-rehab" },
  { label: "진료안내", href: "/#menu-guide" },
  { label: "커뮤니티", href: "/#menu-community" },
  { label: "수술후기", href: "/reviews", active: true },
];

export default function ReviewsHeader() {
  return (
    <header className="reviews-header" aria-label="상단 메뉴">
      <Link className="reviews-brand" href="/" aria-label="24시수영동물의료센터 홈">
        <span className="reviews-brand__mark">
          <img alt="" src="/images/hospital-symbol.jpeg" />
        </span>
        <span>
          <strong>24시수영동물의료센터</strong>
          <small>SUYEONG ANIMAL MEDICAL CENTER</small>
        </span>
      </Link>
      <nav className="reviews-nav" aria-label="주요 메뉴">
        <ul>
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link className={item.active ? "is-active" : undefined} href={item.href}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="reviews-header__actions">
        <a className="reviews-header__call" href="tel:0517106555" aria-label="전화 문의 051)710-6555">
          <span aria-hidden="true">☎</span>
          <strong>051)710-6555</strong>
        </a>
      </div>
    </header>
  );
}
