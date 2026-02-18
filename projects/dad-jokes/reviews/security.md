# Security Specialist Review — Dad Jokes

**Reviewer:** Security Specialist
**Date:** 2026-02-18
**Project:** Dad Jokes (original tutorial code)

---

## Executive Summary

The attack surface of a static dad joke app is small. There's no authentication, no user data collection, no backend, no database. That's good — the best security is a small surface area. But the existing code has one confirmed vulnerability (XSS via innerHTML), one dependency risk (third-party API), and several hygiene issues that should be fixed as part of the refactor.

The v2 feature set (favourites in localStorage, client-side search) doesn't significantly expand the attack surface. The v3/v4 vision (accounts, moderation) would be a different story entirely, but that's not in scope here.

---

## Threat Model

### Assets (what are we protecting?)

| Asset | Sensitivity | Location |
|-------|------------|----------|
| User favourites | Low | localStorage (client-side) |
| User preferences | Low | localStorage (client-side) |
| Browsing behaviour | Low | Client-side only, no analytics |
| The app itself | Medium | Static files on CDN |

There's no PII, no credentials, no payment info, no user accounts. The most sensitive thing we store is a list of joke IDs someone liked. The threat landscape is proportionally small.

### Threat actors

| Actor | Motivation | Likelihood |
|-------|-----------|------------|
| Compromised API | Injecting malicious content via joke responses | Low but non-zero |
| Script kiddies | XSS, defacement | Low (small target) |
| Browser extensions | Data exfiltration from localStorage | Out of scope (browser-level) |
| Supply chain (npm packages) | Malicious dependency | Medium (if build tooling is added) |

### Attack vectors

```
1. API response injection → innerHTML renders malicious HTML/JS → XSS
2. Malicious npm package → compromised build → supply chain attack
3. CDN compromise → modified static files → serve malicious code
4. DNS hijacking → redirect API calls → phishing or data exfiltration
```

---

## Vulnerability Assessment

### VULN-001: XSS via innerHTML (Confirmed)

**Severity:** Medium
**Location:** `script.js` line 19 — `jokeEl.innerHTML = data.joke`
**Description:** The joke text from the API is rendered as HTML. If the API response contains HTML or script tags, they will be parsed and executed.
**Likelihood:** Low — the icanhazdadjoke API is a trusted source that returns plain text jokes. However, APIs can be compromised, responses can be intercepted (MITM on HTTP), and "trust but verify" is fundamental security practice.
**Fix:** Replace `innerHTML` with `textContent`. This is a one-line fix that eliminates the vector entirely.

```javascript
// Vulnerable
jokeEl.innerHTML = data.joke;

// Fixed
jokeEl.textContent = data.joke;
```

**Note:** If we ever need to render HTML (e.g., for formatting), use DOMPurify or a similar sanitiser. But for joke text, `textContent` is the correct choice.

### VULN-002: No Subresource Integrity (SRI) on external resources

**Severity:** Low
**Location:** `style.css` line 1 — `@import url('https://fonts.googleapis.com/...')`
**Description:** The Google Fonts CSS is loaded without SRI hashes. If Google's CDN were compromised, malicious CSS could be served. With the refactor moving to `<link>` tags, SRI can be added.
**Likelihood:** Very low — Google's infrastructure is heavily secured. But SRI is cheap insurance.
**Fix:** When moving to `<link>` tags, add `integrity` and `crossorigin` attributes. Alternatively, self-host the font to eliminate the external dependency entirely.

### VULN-003: No Content Security Policy (CSP)

**Severity:** Medium
**Location:** No CSP header or meta tag exists.
**Description:** Without CSP, there's no browser-enforced policy restricting what scripts can run, what domains can be connected to, or what resources can be loaded. If an XSS vector is exploited, there's no second layer of defence.
**Fix:** Add a CSP via `<meta>` tag or HTTP header (preferred, via hosting platform):

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' https://fonts.googleapis.com;
  font-src https://fonts.gstatic.com;
  connect-src https://icanhazdadjoke.com;
  img-src 'self';
  frame-src 'none';
  base-uri 'self';
  form-action 'none';
```

This is a restrictive policy that only allows:
- Scripts from our own origin
- Styles from our origin + Google Fonts
- Fonts from Google's font CDN
- API connections to icanhazdadjoke.com only
- No frames, no form submissions

### VULN-004: No HTTPS enforcement

**Severity:** Low (for current local-only usage), Medium (once deployed)
**Location:** N/A (not deployed)
**Description:** The API call uses HTTPS, which is good. But when deployed, the app itself should enforce HTTPS via redirect and HSTS header.
**Fix:** Hosting platforms (Netlify, Vercel) provide automatic HTTPS and HSTS. Ensure it's enabled. Add `Strict-Transport-Security: max-age=31536000; includeSubDomains` header.

---

## Supply Chain Considerations

### Current: Zero dependencies
The original code has no npm packages, no build step, no node_modules. This is the most secure state possible for a web app. Zero dependencies = zero supply chain risk.

### After Vite migration
Adding Vite and Vitest introduces npm dependencies. This is necessary for the refactor but comes with risk:

**Mitigations:**
1. **Lock file:** Use `package-lock.json` (or `pnpm-lock.yaml`). Commit it. Always install from the lock file in CI.
2. **Minimal dependencies:** Only add what you actually need. Vite, Vitest, and maybe MSW for testing. No utility libraries for things the language can do natively.
3. **Audit regularly:** Run `npm audit` in CI. Address critical/high vulnerabilities.
4. **Pin major versions:** Don't use `^` ranges for direct dependencies if you want predictable builds.
5. **Review before adding:** Before adding any new package, check: download count, maintenance status, open issues, security history. A package with 10 downloads/week is a red flag.

---

## localStorage Security

localStorage is inherently insecure — any JavaScript running on the same origin can read/write it. For our use case (joke favourites and preferences), this is acceptable. But worth documenting what NOT to store:

**Never put in localStorage:**
- Auth tokens
- Session identifiers
- PII (names, emails, etc.)
- API keys

**What we're storing (acceptable):**
- Joke IDs and text (public data from a public API)
- UI preferences (theme, etc.)

**Risks with localStorage:**
- **XSS can read it:** If an XSS vulnerability exists, an attacker can exfiltrate all localStorage data. For joke favourites, the impact is negligible. This is another reason to fix the innerHTML issue.
- **No encryption:** Data is stored in plain text. Fine for our data. Would not be fine for anything sensitive.
- **Shared across tabs:** Multiple tabs on the same origin share localStorage. The `storage` event can be used to sync state, but race conditions are possible.

---

## API Communication Security

### Current state
- HTTPS is used for API calls (good)
- No request validation or response sanitisation (bad)
- No timeout on requests (a very slow or hung response would block indefinitely)

### Recommendations
1. **Validate API responses** — Check that the response has the expected shape before using it. Don't trust that `data.joke` exists.
2. **Set request timeouts** — Use `AbortController` with a timeout (e.g., 10 seconds). A hung request is a denial of service to the user.
3. **Sanitise output** — Use `textContent` instead of `innerHTML`. Even if we validate the response, defence in depth means treating all external data as untrusted at the render layer.

---

## Privacy Assessment

### Data collection: None
The current app collects no user data. No analytics, no cookies, no tracking. This is a strong privacy position and should be preserved where possible.

### v2 privacy considerations
- **localStorage data:** Stays on the user's device. We don't transmit it anywhere. Good.
- **API requests:** Each request to icanhazdadjoke.com reveals the user's IP address to that service. This is inherent to any API call. We don't control their privacy policy. Worth noting in a privacy page if we deploy publicly.
- **Analytics (if added):** Use a privacy-respecting analytics tool like Plausible (no cookies, GDPR-compliant by default) rather than Google Analytics.

### GDPR / privacy compliance
For v2 (no accounts, no data collection), GDPR compliance is straightforward:
- No cookie banner needed (no cookies set by us)
- No privacy policy legally required (but good practice to have one stating "we don't collect data")
- localStorage is device-only, not transmitted, so it's not "processing personal data" under GDPR

If accounts are added (v3+), full GDPR compliance becomes necessary: consent, data portability, right to deletion, privacy policy, etc.

---

## Security Headers Checklist

When deployed, add these via hosting platform configuration:

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | (see above) | Restrict resource loading |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME type sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disable unused browser features |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Enforce HTTPS |

---

## Top 3 Priorities

1. **Replace innerHTML with textContent** — This is the only confirmed vulnerability. It's a one-line fix. Do it first.
2. **Add a Content Security Policy** — CSP is the single most effective security header for preventing XSS and injection attacks. Establish it early so it doesn't become a painful retrofit.
3. **Validate and sanitise all API responses** — Treat the third-party API as untrusted input. Validate response shape, use textContent for rendering, set request timeouts. Defence in depth.
