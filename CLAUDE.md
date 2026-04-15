# my-portfolio-v2

Personal portfolio for Vishal Gupta. Built with React + Vite.

## Stack
- React (Vite) — frontend
- CSS-in-JS inline styles — no external CSS libraries
- GitHub Pages — deployment via dist/ folder

## Design
- Background: #0f0f0f
- Primary text: #e8e6e0
- Secondary text: #888888
- Section labels: #555555
- Card background: #161616
- Accent: #a78bfa
- Style goal: clean and minimal, like mhouge.dk

## Structure
src/components/ — one file per section (Nav, Hero, Projects, About, Contact)
App.jsx — imports and renders all components

## Rules
- Always set colors explicitly on every text element — no color inheritance
- No external CSS libraries
- Run npm run build before deploying to verify it compiles

---

## Communication Style
- Be concise and direct — lead with the answer, skip preamble
- Use markdown formatting for code and structure
- Avoid trailing summaries — I can read the diff
- Ask clarifying questions only when genuinely blocked, not as a reflex

## Coding Preferences
- Prefer clarity over cleverness
- Don't add comments unless logic is non-obvious
- Don't add error handling for scenarios that can't happen
- Don't create abstractions for single-use patterns
- Don't refactor beyond the scope of what was asked

## Workflow
- Read files before suggesting changes to them
- Prefer editing existing files over creating new ones
- Mark todos as complete immediately after finishing each step
- Run tests if available before declaring a task done

## Plan Mode
- Enter plan mode for any non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

## Subagent Strategy
- Use subagents liberally to keep the main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

## Self-Improvement Loop
- After ANY correction from the user: update memory with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review relevant memories at session start

## Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

## Elegance
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky, implement the elegant solution instead
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

## Autonomous Bug Fixing
- When given a bug report: just fix it — don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Core Principles
- **Simplicity First**: Make every change as simple as possible. Impact minimal code
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs

## Git & Version Control
- Write concise, meaningful commit messages
- Prefer creating new commits over amending existing ones
- Don't force-push without explicit confirmation
- Don't skip hooks (--no-verify) unless explicitly asked

## Security
- Never introduce command injection, XSS, SQL injection, or OWASP top 10 issues
- Validate only at system boundaries (user input, external APIs)
- Don't commit secrets or credentials

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"` to keep the graph current
