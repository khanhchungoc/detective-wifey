# HTML Wireframe Guide

Use this reference for static browser-viewable wireframes.

## File Pattern

- File name: `<feature-name>-wireframe.html`
- Keep each artifact self-contained with embedded `<style>`.
- Use external assets only when the user provides them or asks for visual design.
- Add a small page title and optional screen labels inside the wireframe.

## Page Structure

Recommended structure:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Feature Wireframe</title>
  <style>
    :root {
      --bg: #f7f7f7;
      --panel: #ffffff;
      --muted: #e8e8e8;
      --line: #9a9a9a;
      --text: #222222;
      --accent: #2f6fdd;
      --space: 8px;
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, sans-serif; color: var(--text); background: var(--bg); }
  </style>
</head>
<body>
  <main class="wireframe">
    <!-- screens/components -->
  </main>
</body>
</html>
```

## Component Standards

- Navigation: header, sidebar, tabs, breadcrumbs.
- Forms: labels, placeholders, selects, checkboxes, radios, helper text, validation messages.
- Actions: primary/secondary buttons, links, disabled state.
- Feedback: empty, loading, success, error.
- Data display: lists, cards, tables, filters, pagination.
- Media: use bordered placeholder boxes with labels such as `Image Placeholder`.

## Layout Standards

- Use an 8px grid: 8, 16, 24, 32, 40.
- Use rectangular page/device frames; reserve rounded corners for controls or cards.
- Keep enough padding so children never touch container borders.
- Keep repeated components consistent in size and alignment.
- Use CSS Grid/Flexbox instead of absolute positioning unless mimicking a fixed device frame.
- For responsive wireframes, define at least one mobile breakpoint around `640px`.

## Fidelity Styling

- Lo-Fi: grayscale only, low detail, block placeholders.
- Mid-Fi: grayscale plus one accent, realistic content, component states.
- Hi-Fi: more refined spacing and typography, but avoid final brand polish unless requested.

## Micro-App Design SSOT Grounding

When generating wireframes for virtual apps in the *Jealous Wife Detective Game*, the layout, color palette, typography, and touch target standards MUST be grounded in the canonical `app-design.md` for that target app located in `.agent-artifacts/project-knowledge-base/solution-context/apps/`.

### Micro-App Canonical Mapping

| App ID | App Name | Canonical Design SSOT Path | Primary Brand Color |
|---|---|---|---|
| `poshee` / `ecommerce` | Shopoo (Shopee parody) | `.agent-artifacts/project-knowledge-base/solution-context/apps/ecommerce/app-design.md` | Coral Sunset `#FF5722` |
| `zola` / `internet-messaging` | Zola (Zalo parody) | `.agent-artifacts/project-knowledge-base/solution-context/apps/internet-messaging/app-design.md` | Deep Teal `#0E828A` |
| `vietpay` / `banking` | VietPay (Banking/MoMo parody) | `.agent-artifacts/project-knowledge-base/solution-context/apps/banking/app-design.md` | Deep Emerald `#006A4E` |
| `grap` / `ride-hailing` | Grap (Ride-hail parody) | `.agent-artifacts/project-knowledge-base/solution-context/apps/ride-hailing/app-design.md` | Forest Mint `#00B14F` |
| `netsurf` / `web-browser` | NetSurf (Browser parody) | `.agent-artifacts/project-knowledge-base/solution-context/apps/web-browser/app-design.md` | Royal Indigo `#3F51B5` / `#F2F2F7` |
| `geemail` / `email` | GeeMail (Gmail parody) | `.agent-artifacts/project-knowledge-base/solution-context/apps/email/app-design.md` | Crimson Red `#EA4335` |
| `inkedlin` / `professional-network` | InkedLin (LinkedIn parody) | `.agent-artifacts/project-knowledge-base/solution-context/apps/professional-network/app-design.md` | Professional Blue `#0A66C2` |
| `tim` / `team-collaboration` | Tim (Teams parody) | `.agent-artifacts/project-knowledge-base/solution-context/apps/team-collaboration/app-design.md` | Collaboration Violet `#5B5FC7` |
| `phone-os` | Virtual Phone OS Shell | `.agent-artifacts/project-knowledge-base/solution-context/apps/phone-os/app-design.md` | Titanium `#18181B` / `#3F3F46` |
| `comms` | Comms (Phone & SMS) | `.agent-artifacts/project-knowledge-base/solution-context/apps/phone-os/comms/app-design.md` | Royal Blue `#007AFF` / `#34C759` |
| `photos` | Photos (Gallery & Forensics) | `.agent-artifacts/project-knowledge-base/solution-context/apps/phone-os/photos/app-design.md` | Obsidian Black `#000000` / `#2979FF` |
| `husband-notes` / `personal-notes` | Husband's Notes & Calendar | `.agent-artifacts/project-knowledge-base/solution-context/apps/personal-notes/app-design.md` | Warm Parchment `#FFF9E6` / `#1A73E8` |
| `evidence-board` | Sổ Tay Bắt Ghen (Wife Hub) | `.agent-artifacts/project-knowledge-base/solution-context/apps/phone-os/evidence-board/app-design.md` | Fuchsia Rose `#D81B60` |

### Emulated Smartphone Viewport & Container Framing
- **Viewport**: Virtual smartphone portrait ratio ($375\text{px}$–$430\text{px}$ base width, $812\text{px}$–$932\text{px}$ height) conforming to `phone-os/app-design.md`.
- **Bezel Container**: Wrap in `.wf-phone-container` with simulated status bar (cellular signal bars, wifi, and capsule battery pill rendered via vector SVG) and bottom home indicator.
- **Touch Target Ergonomics**: All interactive buttons, tabs, back button (`< Trang chủ`), and list row touch targets must meet minimum $\ge 44 \times 44\text{px}$ (search bars/text inputs $\ge 48\text{px}$).
- **Brand CSS Variables**: Override `:root` with the exact hex values extracted from Section 2 of the app's `app-design.md`.

### Canonical Icon Pack & Zero-Emoji Architecture
- **Strict Zero-Emoji Rule**: HTML wireframes MUST NOT use raw Unicode emojis (e.g. 🔋, 📶, 📱, 🔍, 💬, 🛍️, 🚗, 🌐, 🖼️, 💳, 📞, 📝, 🏠, 🎀, 🗂️, 🔄, 🔒, ⚠️, 🔴) for UI components, launcher tiles, buttons, or status bar indicators.
- **Canonical SVG Snippets (Ionicons / iOS SF-Style)**: Embed inline SVGs (`width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`):
  - *Cellular Signal*: `<svg class="wf-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="2" y="14" width="3" height="6" rx="1"/><rect x="7" y="10" width="3" height="10" rx="1"/><rect x="12" y="6" width="3" height="14" rx="1"/><rect x="17" y="2" width="3" height="18" rx="1"/></svg>`
  - *Wi-Fi*: `<svg class="wf-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`
  - *Capsule Battery*: `<svg class="wf-icon" viewBox="0 0 24 24" width="22" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="18" height="16" rx="4"/><rect x="3" y="6" width="10" height="12" rx="2" fill="currentColor"/><line x1="22" y1="10" x2="22" y2="14" stroke-linecap="round"/></svg>`
  - *Search*: `<svg class="wf-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`
  - *Back Chevron*: `<svg class="wf-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>`
  - *Lock*: `<svg class="wf-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`

## Validation Checklist

- HTML opens without build tooling.
- Micro-app wireframe correctly references and reflects tokens from its `app-design.md`.
- Strictly zero raw Unicode emojis used for UI components, buttons, or status bar indicators.
- All icons render as clean vector SVGs from the canonical icon pack (Ionicons).
- Touch targets meet minimum $\ge 44 \times 44\text{px}$ ergonomics.
- No horizontal overflow at mobile width.
- Buttons, labels, and long text fit their containers.
- Form controls have labels and useful placeholders.
- Tables/cards/lists have representative sample data.
- Responsive layout preserves hierarchy and primary actions.

