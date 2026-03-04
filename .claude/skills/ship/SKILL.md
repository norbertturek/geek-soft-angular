---
name: ship
description: Commit, push, and create a PR. Use when the user says "ship", "ship it", or "/ship". Does not merge.
---

# Ship

## When to Use

- User says "ship", "ship it", "/ship", or "create a PR"
- After finishing implementation work that needs to go upstream

## Workflow

1. **Check state**: Run `git status` and `git diff` to see all changes
2. **Run tests**: Run `npm test` to make sure everything passes. If tests fail, stop and report.
3. **Stage files**: `git add` relevant files (never add `.env`, credentials, or IDE config like `.cursor/`)
4. **Commit**: Use Conventional Commits format (see commit-changes skill). Use a HEREDOC for the message. Do not add Co-Authored-By or AI attribution footers.
5. **Push**: `git push -u origin <branch>`
6. **Create PR**: Use `gh pr create` with title and body. If a PR already exists for the branch, skip this step and just push.

## PR Format

```bash
gh pr create --title "<type>(<scope>): <subject>" --body "$(cat <<'EOF'
## Summary
<1-3 bullet points>

## Test plan
- [x] All tests pass
- [ ] Manual verification items...
EOF
)"
```

## Rules

- **Never merge** — only commit, push, and open/update the PR
- **Never close a PR** — to change target branch use `gh pr edit <PR> --base main`
- If a PR already exists for the current branch, just push (the PR updates automatically)
- Confirm the commit message with the user before committing
- If tests fail, fix them or report — do not ship broken code
