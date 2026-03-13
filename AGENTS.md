You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Language

- **Always use English** for all generated content: code comments, variable names, commit messages, PR descriptions, UI text, docs, and any other project artifacts. Do not use Polish or other languages.

## Imports

- Use path aliases: `@app/*` for app-wide, `@core/*` for core (models, services, stores). Examples:
  - `import { Order } from '@core/models/order.model'`
  - `import { ThemeToggleComponent } from '@core/theme/theme-toggle.component'`
  - `import { appConfig } from '@app/app.config'`
- Do not use relative imports like `../` when crossing feature/core boundaries; prefer aliases instead

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
- Prefer descriptive variable names over abbreviations. Avoid single-letter names (e.g. `s`, `q`) except for short loop indices (`i`, `j`) in narrow scope. When handling external API wire formats with minified keys (e.g. `p`, `d`, `s`, `b`), map them to descriptive names at the boundary via destructuring aliases or adapter functions so application code stays readable

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.
  - Small SVG icons loaded via `SvgIconComponent` use a plain `<img>` (intentional exception).

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## Styling / Tailwind CSS

- **Use Tailwind CSS** for all styling. Prefer utility classes over custom CSS.
- Use `class` bindings with Tailwind classes (e.g. `class="p-4 flex gap-2"`).
- For project palette colors, use arbitrary values: `text-[var(--color-text)]`, `bg-[var(--color-row-bg)]`, `hover:bg-[var(--color-row-bg-hover)]`.
- Avoid component `styles` blocks; use Tailwind in the template. For one-off overrides, use arbitrary values `[property:value]`.
- Keep `--color-*` CSS variables in `src/styles.css`; reference them via Tailwind arbitrary values.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Color Palette

Use these CSS variables only. Do not hardcode colors.

| Variable | Light | Dark |
|----------|-------|------|
| `--color-bg-main` | rgb(233, 237, 241) | rgb(42, 56, 71) |
| `--color-text` | rgb(14, 15, 26) | rgb(198, 210, 219) |
| `--color-row-bg` | rgb(220, 225, 229) | rgba(14, 15, 26, 0.25) |
| `--color-row-bg-hover` | rgb(249, 250, 251) | rgba(55, 65, 81, 0.5) |
| `--color-row-detail` | rgba(249, 250, 251, 0.5) | rgba(17, 24, 39, 0.5) |
| `--color-row-detail-hover` | rgb(243, 244, 246) | rgb(17, 24, 39) |
| `--color-border` | rgb(229, 231, 235) | rgb(55, 65, 81) |
| `--color-profit-positive` | rgb(60, 193, 149) | same |
| `--color-profit-negative` | rgb(249, 76, 76) | same |

Profit: use `--color-profit-positive` when value > 0, `--color-profit-negative` when &lt; 0. Example: `[style.color]="profit >= 0 ? 'var(--color-profit-positive)' : 'var(--color-profit-negative)'"`

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Pull Requests

- **NEVER close a PR.** To change the target branch, use `gh pr edit <PR> --base main`. Closing is irreversible and loses history.
