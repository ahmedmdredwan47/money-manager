import { describe, expect, it } from "vitest";
import { BenchmarkRunner } from "../benchmark/benchmark-runner";
import { ReviewFinding } from "../types";

describe("Benchmark Evaluator", () => {
  it("correctly calculates TP, FP, FN, Precision, and Recall against ground truth", () => {
    const findings: ReviewFinding[] = [
      {
        id: "FINDING-1",
        category: "logic",
        severity: "must-fix",
        title: "Inverted Transfer Calculation on Source Account",
        file: "src/lib/account-utils.ts",
        line: 26,
        explanation: "logic error in balance calculation",
        evidence: 't.type === "transfer"',
        suggestedRemediation: "Fix sign",
        autoFixable: false,
        humanApprovalRequired: true,
      },
      {
        id: "FINDING-2",
        category: "missing-tests",
        severity: "should-fix",
        title: "Untested Business Logic Branch: bonusMultiplier",
        file: "src/lib/crypto-valuation.ts",
        line: 76,
        explanation: "missing-tests in crypto-valuation",
        evidence: "bonusMultiplier",
        suggestedRemediation: "Add test",
        autoFixable: false,
        humanApprovalRequired: true,
      },
      {
        id: "FINDING-3",
        category: "security",
        severity: "must-fix",
        title: "Hardcoded Secret / Service Role Key Detected",
        file: "src/lib/supabase/client.ts",
        line: 12,
        explanation: "security secret leakage",
        evidence: "TEST_ONLY_FAKE_SERVICE_ROLE_SECRET_xyz",
        suggestedRemediation: "Remove hardcoded secret",
        autoFixable: false,
        humanApprovalRequired: true,
      },
    ];

    const runner = new BenchmarkRunner();
    const metrics = runner.evaluate(findings);

    expect(metrics.totalSeeded).toBe(3);
    expect(metrics.detectedCount).toBe(3);
    expect(metrics.missedCount).toBe(0);
    expect(metrics.falsePositivesCount).toBe(0);
    expect(metrics.precision).toBe(1.0);
    expect(metrics.recall).toBe(1.0);
    expect(metrics.f1Score).toBe(1.0);
  });
});
