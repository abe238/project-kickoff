# Product Requirements Document: Project Kickoff v3.0

## Overview
Merge two project-kickoff implementations into a single, superior CLI tool for scaffolding modern software projects.

## Goals
1. Combine modern 2025 stacks from main project with modular architecture from subfolder
2. Reduce file count by 60% while maintaining all functionality
3. Create interactive HTML documentation for non-CLI users
4. Make the tool fast, visually appealing, and easy to use

## Target Users
- Developers starting new projects
- Non-CLI users who need visual guidance
- Teams standardizing project structure

## Features

### Core Features (Must Have)
1. Interactive CLI wizard for project creation
2. 14 preset configurations for quick starts
3. Support for 28+ project types across 6 languages
4. Modern 2025 database options (Supabase, Neon, Turso, Convex)
5. AI/ML stack options (Vector DBs, Embeddings, Local AI)
6. Template engine with 40+ Handlebars helpers
7. Persistent user configuration
8. Comprehensive test coverage (80%+)

### UX Features (Should Have)
1. Animated spinners during operations
2. ASCII art banner
3. Progress bar during scaffolding
4. Colored output with chalk
5. "What's next" suggestions after completion

### Documentation Features (Should Have)
1. QUICK_START.html - Interactive getting started guide
2. STACKS.html - Visual stack explorer with filters
3. PRESETS.html - Preset gallery with examples
4. TROUBLESHOOTING.html - Error reference with fixes

### CLI Commands
```
kickoff create <name>           # Interactive wizard
kickoff create <name> --preset  # Quick preset start
kickoff list                    # Show all presets
kickoff stacks                  # Open stack explorer
kickoff docs                    # Open documentation
kickoff config                  # Configure defaults
```

## Technical Requirements

### Architecture
- Entry point: src/cli.ts (Commander.js)
- Core modules in src/core/
- Type definitions in src/lib/types.ts
- Utilities in src/utils/
- Templates in templates/ (12 essential)
- Tests in __tests__/

### Dependencies
- commander: CLI framework
- inquirer: Interactive prompts
- handlebars: Template engine
- chalk: Colored output
- ora: Spinners
- fs-extra: File operations

### File Structure
```
project-kickoff/
├── src/
│   ├── cli.ts
│   ├── core/
│   │   ├── TemplateEngine.ts
│   │   ├── ProjectScaffolder.ts
│   │   └── ConfigManager.ts
│   ├── lib/
│   │   ├── types.ts
│   │   ├── prompter.ts
│   │   ├── presets.ts
│   │   └── context.ts
│   └── utils/
│       ├── Logger.ts
│       └── helpers.ts
├── templates/ (12 directories)
├── docs/ (4 HTML files)
├── __tests__/ (4 test files)
└── [config files]
```

## Tasks

### Phase 1: Setup
- Task 1: Create backup of both projects
- Task 2: Initialize new directory structure
- Task 3: Set up package.json with merged dependencies

### Phase 2: Port Architecture
- Task 4: Port TemplateEngine.ts from subfolder (adapt for main's types)
- Task 5: Port Logger.ts from subfolder (add ora spinner support)
- Task 6: Port ConfigManager.ts from subfolder
- Task 7: Create new cli.ts with Commander pattern
- Task 8: Create ProjectScaffolder.ts (merge subfolder structure with main's buildContext)

### Phase 3: Keep Features
- Task 9: Integrate types.ts from main (verify all 2025 types)
- Task 10: Refactor prompter.ts (extract presets to presets.ts)
- Task 11: Create context.ts (template context builder from main's scaffolder)
- Task 12: Add preset quick-start commands to CLI

### Phase 4: Consolidate
- Task 13: Consolidate templates from 65 to 12 essential directories
- Task 14: Create template.json metadata for each template
- Task 15: Delete subfolder project-kickoff/project-kickoff/
- Task 16: Delete redundant files from main (stacks.html, test file)

### Phase 5: Enhance UX
- Task 17: Add ora spinners for all async operations
- Task 18: Create ASCII art banner for CLI
- Task 19: Add progress bar during file scaffolding
- Task 20: Add "What's next" suggestions after completion

### Phase 6: Documentation
- Task 21: Create QUICK_START.html (interactive wizard guide)
- Task 22: Create STACKS.html (visual stack explorer with filters)
- Task 23: Create PRESETS.html (preset gallery with examples)
- Task 24: Add `kickoff docs` and `kickoff stacks` commands

### Phase 7: Testing
- Task 25: Create test structure in __tests__/
- Task 26: Write tests for TemplateEngine, ProjectScaffolder, prompter
- Task 27: Achieve 80% test coverage

### Phase 8: Finalize
- Task 28: Update package.json to version 3.0.0
- Task 29: Write comprehensive README.md
- Task 30: Final verification and cleanup

## Success Metrics
- All 14 presets create working projects
- All 6 languages (TS, Python, Go, Rust, Deno, Bun) work
- File count reduced from ~100 to ~35
- Test coverage at 80%+
- npm run build succeeds without errors
- Interactive HTML docs work offline

## Timeline
This project should be completed in 8 phases. Each phase can be paused and resumed using taskmaster.

## Notes
- Keep subfolder until Phase 4 Task 15 is verified
- Test after each phase before proceeding
- Commit after each task for easy rollback
