import "../src/styles.css";
import "./reviews.css";
import "./admin/admin.css";

export const metadata = {
  title: "24시수영동물의료센터",
  description: "24시수영동물의료센터 공식 홈페이지",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
