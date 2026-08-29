import { describe, expect, it } from "vitest";
import { TriageEngine } from "../triage/triage-engine";
import { ReviewFinding } from "../types";

describe("TriageEngine", () => {
  it("distinguishes safe automatic fixes from actions requiring human approval", () => {
    const findings: ReviewFinding[] = [
      {
        id: "MUST-FIX-LOGIC-1",
        category: "logic",
        severity: "must-fix",
        title: "Inverted Transfer Calculation",
        file: "src/lib/account-utils.ts",
        line: 26,
        explanation: "Adds amount to source balance instead of subtracting.",
        evidence: "return sum + amount;",
        suggestedRemediation: "Change to sum - amount;",
        autoFixable: false,
        humanApprovalRequired: true,
      },
      {
        id: "MAINT-COMMENTED-CODE-1",
        category: "maintainability",
        severity: "ignore",
        title: "Commented-Out Code",
        file: "src/lib/utils.ts",
        line: 12,
        explanation: "Old unused function commented out.",
        evidence: "// const oldHelper = () => {}",
        suggestedRemediation: "Delete commented-out lines.",
        autoFixable: true,
        humanApprovalRequired: false,
      },
    ];

    const engine = new TriageEngine();
    const result = engine.triage(findings);

    expect(result.verdict).toBe("REQUEST_CHANGES");
    expect(result.summary.mustFixCount).toBe(1);
    expect(result.summary.ignoreCount).toBe(1);
    expect(result.summary.autoFixableCount).toBe(1);
    expect(result.summary.humanApprovalRequiredCount).toBe(1);
    expect(result.autoFixActions).toHaveLength(1);
    expect(result.humanReviewActions).toHaveLength(1);
    expect(result.recommendedLabels).toContain("status:blocked");
  });
});
