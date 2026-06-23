# eLibrary Design

This file owns UI styling and visual design. Product behavior belongs in [REQUIREMENTS.md](./REQUIREMENTS.md). Architecture belongs in [ARCHITECTURE.md](./ARCHITECTURE.md). Security controls belong in [SECURITY.md](./SECURITY.md).

## Required Design Inputs

- `Brand personality: trustworthy public-library service with lightweight digital access`
- `Primary audience: Guests, Members, and Admins using public ebook search, member library management, and admin operations`
- `Platform targets (web / mobile / both): responsive web application`
- `Light / dark mode: light and dark modes are included in MVP; light mode is the baseline`
- `Existing brand assets: logo.svg and assets/logo.png`

## Brand and Logo

- Primary logo asset: [logo.svg](./logo.svg)
- Existing raster asset: [assets/logo.png](./assets/logo.png)
- Logo concept: an open book connected to small nodes, representing ebook discovery, library holdings, and external borrowing paths.
- Visual tone: calm, clear, information-dense, and service-oriented.
- Safe usage: keep clear space around the mark at least equal to the height of one logo node; minimum rendered size is 24 px for icon-only use and 120 px for header use.
- Do not distort, recolor outside the approved palette, place on low-contrast backgrounds, add shadows, or combine with unrelated marks.

## Color Palette

| Token | Value | Use |
| --- | --- | --- |
| Primary | `#00505A` | navigation, primary buttons, links, key headings, logo book |
| Secondary | `#159A9C` | logo nodes, filters, non-text accents, large-text highlights |
| Success | `#61B547` | available or healthy-state accents with text label |
| Accent | `#F5B31A` | featured but non-critical accents with text label |
| Error | `#B3261E` | destructive actions, error text, critical status |
| Text | `#182A2D` | primary body text |
| Muted Text | `#4E6B70` | secondary body text |
| Background | `#F7FAF9` | page background |
| Surface | `#FFFFFF` | panels, repeated result cards, table surfaces |
| Border | `#D8E5E3` | dividers, table borders, input outlines |

Logo colors are Primary, Secondary, and Surface. Body text on Background or Surface MUST use Text, Muted Text, Primary, or Error. Secondary, Success, and Accent MUST NOT be the only indicator for small text because they do not meet WCAG 2.2 AA body-text contrast on Surface.

Dark mode uses the same token names with these values:

| Token | Value | Use |
| --- | --- | --- |
| Primary | `#6FD4D7` | navigation, primary buttons, links, key headings |
| Secondary | `#48B7B9` | filters, non-text accents, large-text highlights |
| Success | `#8BCF6A` | available or healthy-state accents with text label |
| Accent | `#FFD166` | featured but non-critical accents with text label |
| Error | `#FFB4AB` | destructive actions, error text, critical status |
| Text | `#EAF4F2` | primary body text |
| Muted Text | `#B8C9C7` | secondary body text |
| Background | `#0F1E21` | page background |
| Surface | `#142A2F` | panels, repeated result cards, table surfaces |
| Border | `#557C83` | dividers, table borders, input outlines |

Light and dark modes MUST both satisfy the accessibility contrast rules below. Do not rely on color alone in either mode.

## Typography

- Font family: system UI stack (`system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, sans-serif) for MVP.
- Rationale: system fonts are fast, legible, broadly available, and avoid extra font licensing or loading risk.
- Weights: 400 for body, 500 for labels and table headers, 600 for headings and primary actions.
- Type scale:
  - Page title: 32 px, 40 px line height
  - Section title: 24 px, 32 px line height
  - Subsection title: 18 px, 28 px line height
  - Body: 16 px, 24 px line height
  - Supporting text: 14 px, 20 px line height
  - Table/meta text: 13 px, 18 px line height

## Layout and Spacing

- Spacing scale: 4, 8, 12, 16, 24, 32, 48 px.
- Breakpoints: mobile below 768 px, tablet 768 px and up, desktop 1024 px and up.
- Header: logo, global search, public library directory link, member library area, sign-in/account action.
- Main content: one primary task per screen, with filters and secondary actions close to the relevant list.
- Footer: service information, privacy link, and contact/help link.
- Responsive behavior: mobile keeps search first, then filters, then results; desktop can show filters beside results.

## Components

- Use compact tables for scannable library, holdings, member activity, and admin lists.
- Use cards only for repeated result items or clearly grouped detail panels.
- Buttons: primary buttons use Primary background with Surface text; unavailable actions remain visible only when useful and must explain their disabled state through adjacent text or tooltip.
- Inputs: labels are always visible; validation messages appear near the field; search inputs support clear and submit actions.
- Links: external links must be visually distinguishable from internal navigation and follow SECURITY.md safe-link requirements.
- Status indicators: use both text and color; color is never the only signal.
- Focus states: all interactive controls show a visible focus outline using Primary or Error as appropriate.
- Admin views: share the public/member visual theme while using dense tables, filters, timestamps, status labels, and explicit review actions for admin-only functionality.

## Accessibility

- Target WCAG 2.2 AA.
- Body text/background contrast MUST be at least 4.5:1; large text and non-text UI indicators MUST be at least 3:1.
- Keyboard navigation MUST reach all interactive controls in a predictable order.
- Focus indicators MUST be visible without relying on color alone.
- Motion and loading indicators SHOULD respect reduced-motion preferences.
- Status, availability, and error states MUST be announced with text, not color alone.

## Screens

### Home and Search

- The global ebook search is the first visual focus.
- Popular ebook and recent discovery modules appear below the primary search area in compact, scannable sections.
- Member-only personalization controls appear after sign-in without hiding the guest search path.

### Search Results

- Results visually arrange the fields required by `FR-2.3`, with cover and title receiving strongest emphasis.
- Missing covers use a default ebook-cover image that includes the ebook title, uses approved palette tokens, and keeps title text legible at card and list sizes.
- Search results default to card layout and include a compact card/list view switcher near the result count or sorting controls.
- Filter controls mirror `FR-2.4` and are grouped near the result list.
- Sorting controls mirror `FR-2.5` and are placed near the result count.

### Ebook Detail

- Top area arranges the bibliographic fields required by `FR-3.1`.
- Missing detail covers use the same title-based default ebook-cover style as search results, scaled for the detail layout.
- Middle area supports description and subject/category content when present.
- Holdings area presents the state and freshness information required by `FR-3.3` and `FR-3.4`.
- Member-registered libraries are visually prioritized according to `FR-3.5` without hiding other libraries.

### Public Library Directory

- Directory view supports compact scanning of the library fields required by `FR-1.2`.
- Search and filter controls mirror `FR-1.3`.
- Member registration action is placed near library identity and eligibility information.

### Member Library Area

- Registered library rows present the controls required by `FR-4.2`, `FR-4.3`, and `FR-4.4`.
- Account activity views keep registered libraries, saved books, recent searches, loan attempts, notification preferences, and in-app notifications visually separated.
- Account settings present email, Web Push, and in-app notification controls as clear toggles with channel status feedback.

### Admin UI

- Admin screens use the same visual theme, logo, color tokens, typography, and component style as public/member screens.
- Admin-only functionality appears through admin navigation, permissions, dense tables, clear filters, timestamps, status labels, and explicit review actions.
- Library service settings visually separate public directory fields, integration settings, and secret-entry controls; secret handling follows SECURITY.md.
- Integration failures, duplicate metadata review, and audit/integration events use sortable tabular layouts.

## Open Questions

- None.
