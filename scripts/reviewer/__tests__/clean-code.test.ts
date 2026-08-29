import { describe, expect, it } from "vitest";
import { LogicSubagent } from "../agents/logic-subagent";
import { SecuritySubagent } from "../agents/security-subagent";
import { TestCoverageSubagent } from "../agents/test-coverage-subagent";
import { ContextSlice } from "../context/context-manager";

describe("Clean Code False Alarm Prevention", () => {
  it("does not report defects or false alarms on valid, clean code", () => {
    const cleanSlice: ContextSlice = {
      filePath: "src/lib/account-utils.ts",
      startLine: 18,
      endLine: 35,
      content: `
18:     if (t.account_id === account.id) {
19:       if (t.type === "income") {
20:         return sum + amount;
21:       }
22:       if (t.type === "expense") {
23:         return sum - amount;
24:       }
25:       if (t.type === "transfer") {
26:         return sum - amount; // Money leaves this source account
27:       }
28:     }
      `,
      changedHunks: [
        {
          oldStart: 20,
          oldLines: 3,
          newStart: 20,
          newLines: 3,
          header: "@@ -20,3 +20,3 @@ calculateAccountBalance",
          lines: [
            "       if (t.type === \"income\") {",
            "+        return sum + amount;",
            "       }",
          ],
        },
      ],
      relatedTestFiles: ["src/lib/account-utils.test.ts"],
      approxTokens: 90,
    };

    const logic = new LogicSubagent();
    const security = new SecuritySubagent();
    const coverage = new TestCoverageSubagent();

    const logicFindings = logic.review(cleanSlice);
    const secFindings = security.review(cleanSlice);
    const covFindings = coverage.review(cleanSlice);

    expect(logicFindings).toHaveLength(0);
    expect(secFindings).toHaveLength(0);
    expect(covFindings).toHaveLength(0);
  });
});
