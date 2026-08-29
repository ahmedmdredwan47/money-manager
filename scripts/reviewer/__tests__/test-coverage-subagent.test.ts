import { describe, expect, it } from "vitest";
import { TestCoverageSubagent } from "../agents/test-coverage-subagent";
import { ContextSlice } from "../context/context-manager";

describe("TestCoverageSubagent", () => {
  it("catches intentionally uncovered new logic branch as a should-fix finding", () => {
    const slice: ContextSlice = {
      filePath: "src/lib/crypto-valuation.ts",
      startLine: 65,
      endLine: 85,
      content: `
75:   if (bonusMultiplier && Number(bonusMultiplier) > 1) {
76:     return multiplyDecimalStrings(quantity, multiplyDecimalStrings(bdtPrice, bonusMultiplier));
77:   }
      `,
      changedHunks: [
        {
          oldStart: 70,
          oldLines: 2,
          newStart: 70,
          newLines: 5,
          header: "@@ -70,2 +70,5 @@ export function calculateCryptoBdtValue",
          lines: [
            "+  if (bonusMultiplier && Number(bonusMultiplier) > 1) {",
            "+    return multiplyDecimalStrings(quantity, multiplyDecimalStrings(bdtPrice, bonusMultiplier));",
            "+  }",
          ],
        },
      ],
      relatedTestFiles: ["src/lib/crypto-valuation.test.ts"],
      approxTokens: 100,
    };

    const reviewer = new TestCoverageSubagent();
    const findings = reviewer.review(slice);

    expect(findings.length).toBeGreaterThanOrEqual(1);
    const finding = findings.find((f) => f.category === "missing-tests");
    expect(finding).toBeDefined();
    expect(finding?.severity).toBe("should-fix");
    expect(finding?.title).toContain("Untested Business Logic Branch");
    expect(finding?.humanApprovalRequired).toBe(true);
  });
});
