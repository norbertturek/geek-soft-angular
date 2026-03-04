---
name: web-codegen-scorer
description: Evaluate AI-generated web code quality using Angular's Web Codegen Scorer. Use when the user wants to score, benchmark, or evaluate AI-generated code, compare models, or iterate on prompts for code generation.
---

# Web Codegen Scorer

## What It Is

[Web Codegen Scorer](https://github.com/angular/web-codegen-scorer) is an Angular-team tool that scores LLM-generated web code. It measures accessibility (Axe), security, best practices, build success, and runtime errors. Output: numeric score (0–100) + report.

## When to Use

- User wants to evaluate AI-generated code quality
- Comparing code from different models (Claude, GPT, Gemini)
- Iterating on system prompts / AGENTS.md / rules to improve generation
- Benchmarking before/after rule changes

## Setup

1. Set API key for the model you'll use:
   ```bash
   export GEMINI_API_KEY="..."   # Gemini
   export OPENAI_API_KEY="..."   # OpenAI
   export ANTHROPIC_API_KEY="..." # Claude
   export XAI_API_KEY="..."      # Grok
   ```

## Quick Run

```bash
# Use built-in Angular example
npm run codegen:eval

# Or with npx
npx web-codegen-scorer eval --env=angular-example

# Limit prompts for faster run
npx web-codegen-scorer eval --env=angular-example --limit=2

# Local mode: re-score without calling LLM (uses cached output)
npx web-codegen-scorer eval --env=angular-example --local
```

## Custom Eval for This Project

To score code generated *for this project* (your prompts, your rules):

```bash
npm run codegen:init
```

Follow the wizard to create an environment config. You can point it at your AGENTS.md or `.cursor/rules` as system instructions.

## Useful Flags

| Flag | Purpose |
|------|---------|
| `--env=` | Environment config path (required) |
| `--model=` | Model for code generation |
| `--limit=` | Number of prompts to run (default 5) |
| `--local` | Skip LLM call; reuse `.web-codegen-scorer/llm-output` |
| `--output-dir=` | Where generated code is written |
| `--mcp` | Enable MCP during eval |

## Output

Reports are written to a timestamped directory in `.web-codegen-scorer/reports/`. Run `web-codegen-scorer report` to view in browser.
