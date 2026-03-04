---
name: commit-changes
description: Generate conventional commit messages from git diffs. Use when the user asks to commit, write a commit message, stage and commit, or when reviewing staged changes for commit.
---

# Commit Changes

## When to Use

- User asks to "commit", "commit changes", or "write a commit message"
- User requests staging and committing after code changes
- User wants help describing what changed for version control

## Conventional Commits Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]
[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

**Scope:** Optional. Use for Angular: `auth`, `ui`, `core`, `api`, component/file name, or omit.

## Workflow

1. **Inspect changes**: `git status` and `git diff` (or `git diff --staged`) to understand what changed
2. **Propose message**: Generate a clear, imperative subject (e.g. "add" not "added")
3. **Confirm before committing**: Show the proposed message; only run `git add` / `git commit` if the user confirms

## Examples

| Change | Message |
|--------|---------|
| New login component | `feat(auth): add signin page with reactive form` |
| Fix date formatting bug | `fix(ui): correct date display in user profile` |
| Update deps | `chore(deps): bump Angular to 21.2` |
| Add unit tests | `test(core): add tests for auth service` |
| Refactor without behavior change | `refactor(ui): extract form controls into reusable component` |

## Rules

- Subject: 72 chars max, imperative mood, no period at end
- Body: Wrap at 72 chars; explain *why* when non-obvious
- Do not commit secrets, `.env`, or generated artifacts
