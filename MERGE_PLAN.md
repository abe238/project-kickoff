# Project Kickoff - Merge Plan v3.0

**Status:** Ready for Execution
**Created:** December 17, 2025
**Estimated Tasks:** 30
**Goal:** Single folder with minimal but essential files, fast/cool/easy CLI tool

---

## Executive Summary

Merge two versions of project-kickoff into one superior tool:
- **Main project** has the **right features** (2025 stacks, AI/ML, multi-language)
- **Subfolder** has the **right architecture** (modular, tested, extensible)

**Result:** A fast, modern CLI scaffolding tool with interactive documentation.

---

## Quick Start (Resume from any point)

```bash
# Check current progress
task-master list

# Get next task
task-master next

# Mark task complete
task-master set-status --id=<id> --status=done

# View specific task
task-master show <id>
```

---

## Files Summary

### Before Merge
| Location | Files | LOC |
|----------|-------|-----|
| Main (/project-kickoff/) | ~15 | ~2,500 |
| Subfolder (/project-kickoff/project-kickoff/) | ~85 | ~8,450 |
| **Total** | **~100** | **~11,000** |

### After Merge
| Location | Files | LOC (est) |
|----------|-------|-----------|
| Merged (/project-kickoff/) | ~35 | ~4,500 |
| **Reduction** | **65%** | **60%** |

---

## File-by-File Decision Matrix

### FROM MAIN - KEEP (Features)
| File | Action | Reason |
|------|--------|--------|
| `src/lib/types.ts` | KEEP | 2025 stack type definitions |
| `src/lib/prompter.ts` | REFACTOR | Extract presets, keep questions |
| `package.json` | MERGE | Combine dependencies |
| `README.md` | REWRITE | New documentation |
| `tsconfig.json` | KEEP | TypeScript config |

### FROM SUBFOLDER - PORT (Architecture)
| File | Action | Reason |
|------|--------|--------|
| `src/core/TemplateEngine.ts` | PORT | Handlebars + 40 helpers |
| `src/utils/Logger.ts` | PORT | Progress logging |
| `src/core/ConfigManager.ts` | PORT | Persistent config |
| `src/cli.ts` | PORT PATTERN | Commander.js structure |
| `__tests__/*.ts` | PORT PATTERN | Test structure |

### DELETE (Redundant)
| File/Folder | Reason |
|-------------|--------|
| `project-kickoff/project-kickoff/` | Entire subfolder after extraction |
| `docs/stacks.html` | Replaced by new STACKS.html |
| 53 of 65 template dirs | Redundant with type system |

---

## Final Directory Structure

```
project-kickoff/
├── src/
│   ├── cli.ts                     # Main entry point
│   ├── core/
│   │   ├── TemplateEngine.ts      # Handlebars processor
│   │   ├── ProjectScaffolder.ts   # File generation
│   │   └── ConfigManager.ts       # User preferences
│   ├── lib/
│   │   ├── types.ts               # Type definitions
│   │   ├── prompter.ts            # Interactive wizard
│   │   ├── presets.ts             # Preset configurations
│   │   └── context.ts             # Template context builder
│   └── utils/
│       ├── Logger.ts              # Colored output
│       └── helpers.ts             # String utilities
├── templates/
│   ├── shared/                    # Common files (gitignore, etc)
│   ├── nextjs/                    # Next.js 15 template
│   ├── hono-api/                  # Hono edge API
│   ├── vite-react/                # Vite + React SPA
│   ├── cli/                       # CLI tool template
│   ├── mcp-server/                # MCP server template
│   ├── library/                   # npm library template
│   ├── fastapi/                   # Python FastAPI
│   ├── gin-api/                   # Go Gin API
│   ├── axum-api/                  # Rust Axum API
│   ├── worker/                    # BullMQ worker
│   └── static/                    # Static site
├── docs/
│   ├── QUICK_START.html           # Getting started wizard
│   ├── STACKS.html                # Interactive stack explorer
│   ├── PRESETS.html               # Preset gallery
│   └── TROUBLESHOOTING.html       # Error reference
├── __tests__/
│   ├── TemplateEngine.test.ts
│   ├── ProjectScaffolder.test.ts
│   ├── prompter.test.ts
│   └── cli.test.ts
├── package.json                   # v3.0.0
├── tsconfig.json
├── jest.config.js
├── README.md
├── LICENSE
└── .gitignore
```

---

## Phase Breakdown

### Phase 1: Setup (Tasks 1-3)
- Initialize taskmaster
- Create backup
- Set up new directory structure

### Phase 2: Port Architecture (Tasks 4-8)
- Port TemplateEngine.ts with Handlebars
- Port Logger.ts with progress support
- Port ConfigManager.ts
- Create new cli.ts entry point
- Merge ProjectScaffolder

### Phase 3: Keep Features (Tasks 9-12)
- Integrate types.ts
- Extract presets from prompter.ts
- Update scaffolder to use TemplateEngine
- Add preset quick-start commands

### Phase 4: Consolidate (Tasks 13-16)
- Reduce templates from 65 to 12
- Update template metadata
- Delete subfolder
- Clean up main folder

### Phase 5: Enhance UX (Tasks 17-20)
- Add ora spinners
- Create ASCII banner
- Add progress bar
- Add completion suggestions

### Phase 6: Documentation (Tasks 21-24)
- Create QUICK_START.html
- Create STACKS.html
- Create PRESETS.html
- Add `kickoff docs` command

### Phase 7: Testing (Tasks 25-27)
- Port test patterns
- Write integration tests
- Achieve 80% coverage

### Phase 8: Finalize (Tasks 28-30)
- Update package.json to v3.0.0
- Write comprehensive README
- Final verification

---

## CLI Commands (Post-Merge)

```bash
# Interactive creation
kickoff create my-app

# Quick preset
kickoff create my-app --preset saas-starter

# List presets
kickoff list

# Open stack explorer
kickoff stacks

# Open documentation
kickoff docs

# Configure defaults
kickoff config
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking changes | Backup before starting |
| Lost functionality | Test each phase before proceeding |
| Incomplete merge | Keep subfolder until final verification |
| Session interruption | Taskmaster tracks all progress |

---

## Success Criteria

- [ ] All 14 presets work correctly
- [ ] Multi-language support (TS, Python, Go, Rust)
- [ ] Interactive HTML docs open correctly
- [ ] `npm test` passes with 80%+ coverage
- [ ] `npm run build` succeeds
- [ ] File count reduced by 60%+
- [ ] No TypeScript errors

---

## Commands Reference

```bash
# Taskmaster commands
task-master list                    # Show all tasks
task-master next                    # Get next available
task-master show <id>               # View task details
task-master set-status --id=X --status=in-progress
task-master set-status --id=X --status=done

# Development commands
npm run dev                         # Run in development
npm run build                       # Build for production
npm test                           # Run tests
npm run lint                       # Check linting

# Git commands
git add . && git commit -m "phase X: description"
```

---

## Notes

- **Do not delete subfolder** until Phase 4 Task 15 is complete
- **Test after each phase** before moving to next
- **Commit after each task** for easy rollback
- Use `--dry-run` flag when testing scaffolding

---

*This plan is designed for easy restart. Use `task-master list` to see current progress at any time.*
