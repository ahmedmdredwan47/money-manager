---
name: pr-reviewer
description: Automated PR Review Subagent Architecture for Money Manager repository. Defines rubric, explore/plan delegation, focused reviewers, and CI execution.
---

# PR Reviewer Subagent Architecture

This skill defines the multi-agent PR review process running in the Money Manager codebase and CI pipelines.

## Subagent Workflow

1. **Explore Subagent** (`scripts/reviewer/agents/explore-subagent.ts`):
   - Ingests git diff stat and hunk boundaries.
   - Generates a compact structural summary of changed files, function signatures, and risk surfaces.
   - Strictly limits context to avoid token bloat.

2. **Plan Subagent** (`scripts/reviewer/agents/plan-subagent.ts`):
   - Consumes the Explore summary.
   - Evaluates risk vectors (financial math, auth boundaries, missing tests, complexity).
   - Selects which specialized reviewers to dispatch.

3. **Specialized Review Subagents**:
   - **Logic Subagent** (`logic-subagent.ts`): Financial math, account balances, state machines, arithmetic signs.
   - **Security Subagent** (`security-subagent.ts`): Secret leakage, client-side exposure of server env, auth/RLS violations.
   - **Test Coverage Subagent** (`test-coverage-subagent.ts`): New or modified branches lacking unit test assertions.
   - **Maintainability Subagent** (`maintainability-subagent.ts`): High cyclomatic complexity, dead code, architectural inconsistencies.

4. **Triage Engine** (`scripts/reviewer/triage/triage-engine.ts`):
   - Normalizes findings across subagents.
   - Distinguishes **Safe Automatic Actions** (e.g. formatting, mechanical refactoring) from **Human Approval Required Actions** (financial logic, security secrets, missing tests).
   - Generates PR summary reports and review status labels.

5. **Benchmark & Evaluation** (`scripts/reviewer/benchmark/`):
   - Evaluates reviewer accuracy on known ground-truth PR defects.
   - Computes True Positives (TP), False Positives (FP), Precision, and Recall.
