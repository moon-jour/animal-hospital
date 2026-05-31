import Script from "next/script";

import { renderSiteMarkup } from "../src/main.js";

export default function HomePage() {
  return (
    <>
      <div id="app" dangerouslySetInnerHTML={{ __html: renderSiteMarkup() }} suppressHydrationWarning />
      <Script src="/site/main.js" strategy="afterInteractive" type="module" />
    </>
  );
}
