# Intelligent Stack Selection: Research Analysis & Implementation Plan

> Analysis of LLM-based architectural consultation for project-kickoff CLI

## Executive Summary

This document synthesizes insights from deep research on automated project scaffolding and proposes actionable improvements for project-kickoff. The core insight: treat stack selection as **diagnostic reasoning**, not template matching.

---

## Part 1: Key Learnings from Research

### 1.1 The Complexity Crisis

Modern software projects face a "paradox of choice" - the unbundling of monolithic frameworks into specialized primitives creates cognitive overload during project initiation. Initial architectural decisions (edge runtime, database consistency, auth strategy) have compounding effects on project viability.

### 1.2 Tool-Specific Insights

| Tool | Key Insight | Selection Criteria |
|------|-------------|-------------------|
| **TanStack Start** | Client-first mental model, code-based routing with full type safety | Teams valuing explicit control over "magic", TypeScript-heavy projects |
| **Better-Auth** | Self-hosted, plugin architecture, free at scale | Bootstrap budget, data sovereignty requirements, long-term cost optimization |
| **Clerk** | Managed, polished UI, fast setup | Time-to-market priority, teams without auth expertise |
| **Turbopuffer** | Object-storage vectors, 10x cheaper, cold start latency | Documentation/RAG use cases where 500ms P90 is acceptable |
| **Cloudflare D1** | Edge SQL (SQLite), transaction limitations | Edge-first apps without complex financial logic |
| **Drizzle** | Lightweight, D1-compatible, dialect-aware | **Required** for D1 (Prisma has edge issues) |
| **Mastra** | TypeScript AI agents with memory/workflows | Multi-step reasoning, tool usage, persistent agent context |

### 1.3 Critical Compatibility Constraints

From the research, these are **hard rules** that must be enforced:

```
D1 → REQUIRES Drizzle (Prisma has edge compatibility issues)
Next.js 16 + Bun + Better-Auth → CONFLICTS (build failures)
Turbopuffer + <10ms latency requirement → CONFLICTS (cold start reality)
```

### 1.4 Theoretical Frameworks Applied

| Framework | Application to project-kickoff |
|-----------|-------------------------------|
| **Slot Filling** | Decompose stacks into slots (framework, db, orm, auth, ai) that can be filled independently |
| **Diagnostic Reasoning** | Don't just ask "what do you want" - diagnose latent constraints through targeted questions |
| **ReAct Pattern** | Observe → Reason about missing info → Act (ask or decide) |
| **Repair Mechanisms** | When requirements conflict, explicitly surface the trade-off |
| **Recipient Design** | Match language complexity to user expertise |

---

## Part 2: Proposed Ideas

### Idea 1: Compatibility Constraint Engine ⭐ HIGH PRIORITY

**What**: A declarative system that validates stack combinations before scaffolding.

**Why**: Prevents impossible/buggy stacks. The research explicitly calls out that recommending "Next.js 16 + Bun + Better-Auth" would be a system failure.

**How**:
```typescript
// src/knowledge/constraints.ts
interface Constraint {
  id: string;
  type: 'conflict' | 'requires' | 'warning';
  condition: StackCondition;
  message: string;
  docs?: string;
}

const constraints: Constraint[] = [
  {
    id: 'd1-requires-drizzle',
    type: 'requires',
    condition: { when: { database: 'cloudflare-d1' }, requires: { orm: 'drizzle' } },
    message: 'Cloudflare D1 requires Drizzle ORM (Prisma has edge compatibility issues)',
    docs: 'https://orm.drizzle.team/docs/connect-cloudflare-d1'
  },
  {
    id: 'turbopuffer-latency-warning',
    type: 'warning',
    condition: { when: { vectorDb: 'turbopuffer', latencyRequirement: 'realtime' } },
    message: 'Turbopuffer has ~500ms cold query latency. Ensure UI has loading states.'
  }
];
```

**Critical Review**:
- ✅ Prevents bad recommendations
- ✅ Declarative format is maintainable
- ✅ Can be community-contributed
- ⚠️ Requires ongoing maintenance as ecosystem evolves
- ⚠️ May miss undocumented edge cases

**Improvement**: Add constraint versioning, allow `--force` override with warning for power users.

---

### Idea 2: Trade-off Transparency / Differential Diagnosis ⭐ MEDIUM PRIORITY

**What**: Document WHY each tool was selected and what alternatives were ruled out.

**Why**: Builds trust, educates users, creates institutional knowledge in the scaffolded project.

**How**:
```bash
kickoff create my-app --preset ai-agent --explain
# Creates my-app/ARCHITECTURE.md with selection rationale
```

Example output:
```markdown
## Stack Rationale

### Vector Database: Turbopuffer
**Selected because:** User profile indicated "documentation search" use case with "low cost" priority. Turbopuffer uses object storage architecture for 10x cost reduction.

**Alternatives considered:**
- Pinecone: Higher performance but significantly more expensive at scale
- Chroma: Local-only, incompatible with serverless deployment target

**Trade-offs accepted:**
- Cold queries have ~500ms P90 latency (acceptable for doc search)
- Requires UI loading states for search operations

### Auth: Better-Auth
**Selected because:** Preset "ai-agent" optimizes for indie hackers. Better-Auth is free/self-hosted, avoiding per-MAU costs at scale.
```

**Critical Review**:
- ✅ Educational for users
- ✅ Documents decisions for future maintainers
- ✅ Low implementation effort
- ⚠️ Verbose output may overwhelm some users
- ⚠️ Requires maintaining rationale text

**Improvement**: Make opt-in via `--explain` flag. Default is concise output.

---

### Idea 3: Conflict Detection & Resolution ⭐ MEDIUM PRIORITY

**What**: Detect when user requirements conflict and surface the trade-off for explicit decision.

**Why**: Prevents impossible expectations. Users often request "cheapest AND fastest" without realizing the trade-off.

**How**:
```typescript
// src/knowledge/tensions.ts
interface Tension {
  id: string;
  requirements: [string, string];
  question: string;
  options: TensionOption[];
}

const tensions: Tension[] = [
  {
    id: 'cost-vs-latency',
    requirements: ['cost:minimal', 'latency:realtime'],
    question: 'Real-time latency typically requires provisioned infrastructure (not serverless). Which is your priority?',
    options: [
      { label: 'Minimize cost (accept cold starts)', effect: { acceptColdStarts: true } },
      { label: 'Minimize latency (accept higher cost)', effect: { useProvisionedDb: true } }
    ]
  }
];
```

**Critical Review**:
- ✅ Prevents impossible expectations
- ✅ User maintains agency in decisions
- ✅ Educational about real trade-offs
- ⚠️ Adds friction to flow
- ⚠️ Requires judgment on what constitutes "tension"

**Improvement**: Only trigger for custom flows, not presets (presets already encode these decisions).

---

### Idea 4: Slot-Based Stack Composition ⭐ LOW PRIORITY (Future)

**What**: Decompose presets into "slots" that can be independently overridden.

**Why**: Maximum flexibility while maintaining sensible defaults. Aligns with research's slot-filling concept.

**How**:
```bash
# Use preset but override specific slot
kickoff create my-app --preset indie-edge --auth clerk

# Internal representation
archetype: indie-edge
slots:
  framework: tanstack-start  # from preset
  database: cloudflare-d1    # from preset
  orm: drizzle               # from preset
  auth: clerk                # OVERRIDDEN
```

**Critical Review**:
- ✅ Maximum flexibility
- ✅ Backward compatible with current preset names
- ✅ Enables fine-grained customization
- ⚠️ More complex mental model
- ⚠️ Requires significant refactor
- ⚠️ May be over-engineering for current needs

**Improvement**: Defer to Phase 4. Current preset system works well. Add this only if users request slot-level customization.

---

### Idea 5: Expertise-Adaptive Questioning ❌ DEPRIORITIZED

**What**: Detect user expertise and adapt question complexity.

**Why**: Better UX for beginners and experts.

**Critical Review**:
- ⚠️ Current `--yes` flag already handles expert mode
- ⚠️ Misclassification risk is high
- ⚠️ Adds significant complexity for marginal value
- ⚠️ CLI is already reasonably concise

**Verdict**: Skip. Existing `--preset` and `--yes` flags cover the use case.

---

## Part 3: Implementation Plan

### Phase 1: Constraint Engine (Foundation)

**Goal**: Prevent invalid stack combinations from being scaffolded.

**Files to create/modify**:
```
src/knowledge/constraints.ts    # Constraint definitions
src/core/validator.ts           # Validation logic
src/lib/scaffolder.ts           # Integration point
```

**Implementation steps**:
1. Define `Constraint` interface with `conflict`, `requires`, `warning` types
2. Create constraint database from research (D1+Drizzle, Bun+Next+BetterAuth, etc.)
3. Add `validateStack(config: ProjectConfig): ValidationResult` function
4. Call validation after preset selection, before scaffolding
5. Block on hard conflicts, warn on soft conflicts

**Acceptance criteria**:
- [ ] `kickoff create x --preset` with D1 but Prisma is blocked
- [ ] User sees clear error message with remediation
- [ ] Warnings are surfaced but don't block

**Estimated effort**: 2-3 files, ~200 lines

---

### Phase 2: Trade-off Transparency

**Goal**: Generate ARCHITECTURE.md explaining stack decisions.

**Files to create/modify**:
```
src/templates/shared/ARCHITECTURE.md.ejs  # Template
src/generator/merger.ts                    # Generation logic
src/cli.ts                                 # --explain flag
```

**Implementation steps**:
1. Add `--explain` flag to CLI
2. Create rationale database mapping selections → explanations
3. Generate ARCHITECTURE.md when flag is used
4. Include: selection, alternatives, trade-offs, limitations

**Acceptance criteria**:
- [ ] `kickoff create x --preset ai-agent --explain` creates ARCHITECTURE.md
- [ ] Document explains why each major tool was chosen
- [ ] Known limitations are documented

**Estimated effort**: 2 files, ~150 lines

---

### Phase 3: Conflict Detection

**Goal**: Surface requirement tensions for user decision.

**Files to create/modify**:
```
src/knowledge/tensions.ts       # Tension definitions
src/lib/prompter.ts             # Integration with questionnaire
```

**Implementation steps**:
1. Define `Tension` interface with requirement pairs
2. Create tension database (cost vs latency, speed vs control, etc.)
3. Add tension detection to custom questionnaire flow
4. Present choice when tension detected
5. Skip for preset users (presets already resolve tensions)

**Acceptance criteria**:
- [ ] Custom flow detects conflicting requirements
- [ ] User is presented with clear trade-off choice
- [ ] Decision is recorded in config

**Estimated effort**: 2 files, ~100 lines

---

### Phase 4: Slot-Based Architecture (Future)

**Goal**: Enable per-slot customization of presets.

**Deferred until**: User feedback indicates need for finer-grained control.

**Prerequisites**:
- Phases 1-3 complete
- User feedback requesting slot overrides
- Constraint engine proven stable

---

## Part 4: Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Constraint staleness | High | Medium | Version constraints, quarterly review, community PRs |
| Over-engineering | Medium | High | Ship Phase 1 first, validate before Phase 2+ |
| User friction | Medium | Medium | Presets bypass complexity, custom flow is opt-in |
| Ecosystem changes | High | Low | Declarative constraints easy to update |

---

## Part 5: Success Metrics

1. **Zero invalid stacks**: No combination that violates hard constraints can be scaffolded
2. **User understanding**: Users with `--explain` can articulate why their stack was chosen
3. **No regression**: Preset users see no additional prompts or friction
4. **Maintainability**: Adding a new constraint takes <5 minutes

---

## Appendix: Research Sources

Key concepts derived from:
- Diagnostic reasoning in clinical LLM applications
- Slot-filling NLU for task-oriented dialogue
- ReAct (Reasoning + Acting) prompting patterns
- Conversational analysis repair mechanisms
- TanStack, Better-Auth, Turbopuffer, Drizzle documentation analysis

---

*Generated: 2025-12-18*
*For: project-kickoff v3.x*
