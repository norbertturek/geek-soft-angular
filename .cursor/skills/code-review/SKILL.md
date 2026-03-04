---
name: code-review
description: Review code for quality, security, and Angular best practices following project standards. Use when reviewing pull requests, examining code changes, or when the user asks for a code review.
---

# Code Review


## When to Use

- User asks for "code review", "review this", "check this code", or "PR review"
- Examining diffs, pull requests, or recent changes
- Before merging or committing significant changes

## Standards Reference

Apply the project's conventions from `AGENTS.md` / `.cursor/rules/cursor.mdc`: standalone components, signals, `input()`/`output()`, `OnPush`, native control flow, Reactive forms, accessibility (AXE, WCAG AA), etc.

## Review Checklist

- [ ] **Logic**: Correct behavior, edge cases, error handling
- [ ] **Security**: No SQL injection, XSS, unsafe bindings, or exposed secrets
- [ ] **Angular**: Standalone, signals, `inject()`, no NgModules legacy patterns
- [ ] **Accessibility**: Semantic HTML, ARIA where needed, focus management, contrast
- [ ] **Types**: No `any`; use proper typing or `unknown`
- [ ] **Templates**: `@if`/`@for`/`@switch`, async pipe, no globals (e.g. `new Date()`)
- [ ] **State**: Pure signal updates (`update`/`set`), no `mutate`
- [ ] **Tests**: Changes covered by tests where appropriate

## Feedback Format

- 🔴 **Critical**: Must fix before merge
- 🟡 **Suggestion**: Should improve
- 🟢 **Nice to have**: Optional enhancement

## Output

Group findings by severity. Quote relevant code snippets. Be concise; prefer actionable fixes over lengthy explanations.
