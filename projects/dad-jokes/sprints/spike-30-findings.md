# Spike #30 — Web Share API + Clipboard API Findings

**Date:** 2026-02-19
**Ticket:** #30
**Informs:** #34 (Copy to clipboard), #35 (Web Share)

---

## 1. Web Share API

### Browser support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome (Android) | ✅ Full | Since Chrome 61 |
| Chrome (Desktop Mac/Win) | ✅ Full | Since Chrome 89 |
| Safari (iOS) | ✅ Full | Since iOS 12.2 |
| Safari (macOS) | ✅ Full | Since macOS Big Sur (Safari 14) |
| Firefox (Android) | ✅ Full | Since Firefox 71 |
| Firefox (Desktop) | ❌ Not supported | No plans to implement |
| Samsung Internet | ✅ Full | Since 8.2 |
| Edge | ✅ Full | Since Edge 79 (Chromium) |

**Overall:** ~85-90% global browser support. Firefox desktop is the main gap (~4% of global traffic). Desktop Chrome and Safari are supported, contrary to older assumptions.

### Key requirements

- **HTTPS required** in production (localhost is exempt for development)
- **User gesture required** — must be called from within a click handler. Cannot be called programmatically (will throw `NotAllowedError`).
- **`navigator.canShare(data)`** — call this before `navigator.share()` to verify the data is shareable. Some browsers support share but reject certain data types.

### What can be shared

```typescript
interface ShareData {
  title?: string;   // App/page title
  text?: string;    // The joke text
  url?: string;     // Optional URL
}
```

For a dad jokes app, share text only — no URL needed (the app URL doesn't add value per joke, it's always the same page).

### Handling AbortError

When the user dismisses the share sheet (taps outside/cancels), the browser throws `AbortError`. This is **not an error** — it's normal user behaviour. Must be caught and silently ignored.

### Detection pattern

```typescript
const canShare = typeof navigator.share === 'function';
// Also check canShare() for the specific data:
if (navigator.canShare && navigator.canShare({ text: 'test' })) { ... }
```

---

## 2. Clipboard API

### Browser support

| Browser | `navigator.clipboard.writeText()` |
|---------|----------------------------------|
| Chrome 66+ | ✅ |
| Firefox 63+ | ✅ |
| Safari 13.1+ | ✅ |
| Edge 79+ | ✅ |
| IE | ❌ |

**Overall:** ~96%+ global support. No meaningful fallback needed for modern browsers, but a `document.execCommand('copy')` fallback handles edge cases gracefully.

### Key requirements

- **HTTPS required** in production (localhost exempt)
- **User gesture required** — must be in a click handler
- **Permissions:** `navigator.clipboard.writeText()` does NOT require explicit permission prompt for writing text in most browsers (reading requires permission). Writing text is considered safe.

### Recommended implementation

```typescript
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback: create temp element, select, execCommand
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.focus();
      el.select();
      const success = document.execCommand('copy');
      document.body.removeChild(el);
      return success;
    } catch {
      return false;
    }
  }
}
```

---

## 3. UX Pattern Decision

### The question

On desktop where Web Share is available (Chrome, Edge, Safari): show separate **Share** and **Copy** buttons, or collapse to just one?

### Decision: Two separate buttons, both always visible

**Rationale:**
- Desktop users understand both actions — Copy (text to clipboard) and Share (opens OS share sheet or picker)
- On mobile: Share opens native share sheet (most useful path)
- On desktop: Share opens OS share picker (also useful — can share to apps, email, etc.)
- Copy is always useful as a direct, instant action even when Share is available
- Keep them both visible; don't try to be clever about hiding one based on feature detection

**UX for desktop without Web Share support (Firefox desktop):**
- Share button shows — but on click, falls back to copy behaviour
- Button could briefly show "Copied!" feedback to make the fallback visible
- OR: hide Share entirely on browsers without support using `navigator.share` check

**Recommended approach (simpler):** Progressive enhancement — show both buttons always. Share calls `navigator.share` if available, falls back to copy if not. User always gets the joke copied either way.

---

## 4. Share Text Format

**Decision:** Plain joke text only, no URL, no attribution.

```
Why don't scientists trust atoms? Because they make up everything.
```

**Rationale:**
- Adding a URL ("Dad Jokes — [url]") clutters iMessage/WhatsApp previews
- Attribution ("via dadjokes.app") feels spammy for a novelty app
- The joke stands alone — that's the point
- Keep it clean and shareable

---

## 5. Summary for #34 and #35

| Decision | Choice |
|----------|--------|
| Clipboard API | `navigator.clipboard.writeText()` + `execCommand` fallback |
| Share API detection | `typeof navigator.share === 'function'` |
| canShare check | Yes — call `navigator.canShare(data)` before `navigator.share(data)` |
| AbortError | Catch silently — user dismissed, not an error |
| Share text format | Joke text only, no URL |
| Button visibility | Both Copy and Share always visible |
| Desktop without Web Share | Share falls back to copy behaviour |
| User gesture | Both APIs require click handler — already the case |
