## Requirement

As a `Guest, Member, or Admin`, I need `screens that follow the eLibrary visual system` so that `library search, ebook review, member workflows, and admin work are clear and consistent`.

## Owner

- Domain: `design`
- Owning file: `DESIGN.md`
- Existing requirement/control/decision ID, if any: `none`

## Scope

In scope:

- Apply logo, color tokens, and visual tone from `DESIGN.md`.
- Implement both light and dark modes using the token values in `DESIGN.md`.
- Use the system UI font stack defined in `DESIGN.md`; do not add non-system brand font dependencies for MVP.
- Implement the Web App and Admin UI visual system using React.
- Implement layout patterns for header, main content, footer, and responsive behavior.
- Apply MVP breakpoints from `DESIGN.md`: mobile below 768 px, tablet 768 px and up, desktop 1024 px and up.
- Implement visual treatment for Home/Search, Search Results, Ebook Detail, Public Library Directory, Member Library Area, Notification Settings/In-app Notifications, and Admin UI.
- Make Search Results use card layout by default and provide a compact card/list view switcher.
- Implement title-based default ebook cover styling for search and detail views when no cover image exists.
- Use compact tables for scannable library/admin/holdings lists and status indicators with both color and text.
- Keep Admin UI on the same visual theme as public/member screens; distinguish admin functionality through navigation, permissions, and admin-specific controls, not a separate theme.
- In Admin UI, visually separate public directory fields, integration settings, and secret-entry controls for library service settings.

Out of scope:

- Inventing product behavior not present in `REQUIREMENTS.md`.
- Implementing security controls in design documents.

## Acceptance Criteria

- Given each MVP screen is viewed, when compared to `DESIGN.md`, then the layout and component principles are followed.
- Given each MVP screen is viewed in light and dark modes, when contrast and state indicators are inspected, then both modes satisfy `DESIGN.md` accessibility rules.
- Given UI code is inspected, when MVP screens are implemented, then React components are used for the Web App and Admin UI.
- Given typography is inspected, when MVP screens are implemented, then the system UI font stack is used without external or bundled brand font dependencies.
- Given a status is shown, when inspected, then text and color are both present.
- Given responsive layouts are inspected, when screen width crosses 768 px and 1024 px, then layouts follow the mobile, tablet, and desktop rules in `DESIGN.md`.
- Given notification settings are viewed, when compared to `DESIGN.md`, then email, Web Push, and in-app controls are visually clear account settings controls.
- Given Search Results are viewed, when no saved display preference exists, then the default visual layout is card-based and the card/list switcher is visible.
- Given an ebook has no cover image, when search or detail views are shown, then a legible title-based default ebook cover is used.
- Given Admin UI is viewed, when compared to public/member screens, then it uses the same visual theme while exposing admin-only navigation, permissions, and controls.
- Given admin screens are viewed, when tables and filters are inspected, then dense operator-focused layouts are used.
- Given library service settings are viewed by an Admin, when external API key controls are present, then public fields, integration settings, and secret-entry controls are visually separated.

## Verification

- Test or check: `manual visual review; deferred until implementation workflow exists`
- Evidence required: `Screenshots or UI review notes for public, member, and admin screens.`

## Dependencies

- `DESIGN.md`
- `github-issues/06-implement-public-library-directory.md`
- `github-issues/08-implement-ebook-search.md`
- `github-issues/09-implement-ebook-detail-holdings.md`
- `github-issues/22-implement-member-notifications-preferences.md`
