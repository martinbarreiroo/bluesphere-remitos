---
name: bluesphere-branding-skill
description: Bluesphere brand system for frontend UI. Use when designing, refactoring, or reviewing layouts, typography, colors, spacing, and component visuals to match Bluesphere branding.
metadata:
  short-description: Apply Bluesphere UI branding rules
  author: bluesphere
  version: "1.0.0"
---

# Bluesphere Design System Skill

Apply these rules to every Bluesphere screen and printable artifact.

## Font

Use **Satoshi only**. Load `https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&display=swap` and set `font-family: 'Satoshi', sans-serif`.

| Role | Size | Weight | Line-height | Letter-spacing |
|---|---:|---:|---:|---:|
| Section title | 32px | 700 | 1.2 | -0.5px |
| Card title | 20px | 700 | 1.3 | 0 |
| Subtitle | 16px | 500 | 1.6 | 0 |
| Body | 14px | 400 | 1.5 | 0 |
| Labels | 12px | 400–700 | 1.4 | 0 |
| Micro labels | 11px | 900 | — | 1.2px uppercase |

## Color system

Every CSS entry point starts with this exact block:

```css
:root {
    --brand-primary: #29409A;
    --brand-secondary: #1A2530;
    --brand-accent: #F0F4F8;
    --text-main: #1a1a1a;
    --text-light: #f5f5f5;
    --bg-white: #ffffff;
    --bg-gray: #f4f5f7;
    --brand-tint: #e8f0fe;
    --brand-warning: #d32f2f;
    --brand-warning-bg: #ffebee;
    --border-color: #e0e4e8;
}
```

- Primary buttons, icons, left borders and accent bars use `--brand-primary`.
- Dark headers use `--brand-secondary`.
- Card backgrounds use `--bg-gray`; borders use `--border-color`.
- Main text uses `--text-main`; secondary text uses `#555`; captions use `#888`.
- Use only the variables above. Do not use Tailwind, orange, off-brand grays, or arbitrary colors.

## Spacing and components

Use the 40px-based scale: `3, 5, 8, 12, 15, 20, 25, 30, 40, 60`.

- Card padding: 25px; main container: 40px; compact container: 30px 40px.
- Inputs: 10px 12px, 6px radius, 1px `--border-color` border.
- Primary button: 12px 24px, 6px radius, uppercase 12px/700 text, brand-blue background and `0 4px 6px rgba(41,64,154,0.2)` shadow.
- Cards: 12px radius, `border-left: 4px solid var(--brand-primary)` where an accent is appropriate.
- Informational panels: `--brand-tint`, 8px radius, 4px primary left border.
- Section labels are uppercase, 700–900 weight and 1–1.2px letter spacing.

## Forms

```css
input, select, textarea {
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Satoshi', sans-serif;
    color: var(--text-main);
    background: white;
}
input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 3px rgba(41,64,154,0.1);
}
label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
```

## Icons and print

Use Lucide icons; icon color is `var(--brand-primary)`. Do not use emoji or other icon libraries.

```css
* { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
@media print {
    body { margin: 0; padding: 0; }
    .no-print { display: none; }
}
```

For the remitos, set a custom `@page` size using the physical paper dimensions rather than assuming A4. The current provisional format is `170mm 200mm`, portrait, with zero print margins. The on-screen UI must never appear in the printed output.

## Do / don't

- Do use CSS variables, Satoshi, Lucide, gaps, `print-color-adjust: exact`, and `© 2026 Bluesphere` when a copyright footer is needed.
- Do not add another typeface, hardcode colors outside `:root`, use Tailwind, use arbitrary colored accents, or print browser headers and footers.
