## 2026-02-04 - Static Site CSP Strategy
**Vulnerability:** Lack of defense-in-depth for client-side XSS in a static site.
**Learning:** Even without a backend, static sites using DOM manipulation libraries (jQuery) are susceptible to DOM XSS. Input validation relying on client-side JSON lookups is fragile.
**Prevention:** Implement a strict Content Security Policy (CSP) via <meta> tag. For this repo, script-src must whitelist the specific CDN and self. style-src requires unsafe-inline due to legacy inline styles.
