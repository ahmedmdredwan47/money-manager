import { describe, expect, it } from "vitest";
import { LogicSubagent } from "../agents/logic-subagent";
import { ContextSlice } from "../context/context-manager";

describe("LogicSubagent", () => {
  it("catches the seeded outgoing transfer addition bug as a must-fix logic error", () => {
    const slice: ContextSlice = {
      filePath: "src/lib/account-utils.ts",
      startLine: 15,
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
26:         return sum + amount; // Money leaves this source account
27:       }
28:     }
      `,
      changedHunks: [
        {
          oldStart: 25,
          oldLines: 3,
          newStart: 25,
          newLines: 3,
          header: "@@ -25,3 +25,3 @@ export function calculateAccountBalance",
          lines: [
            "-        return sum - amount; // Money leaves this source account",
            "+        return sum + amount; // Money leaves this source account",
          ],
        },
      ],
      relatedTestFiles: [],
      approxTokens: 100,
    };

    const reviewer = new LogicSubagent();
    const findings = reviewer.review(slice);

    expect(findings).toHaveLength(1);
    expect(findings[0].category).toBe("logic");
    expect(findings[0].severity).toBe("must-fix");
    expect(findings[0].title).toContain("Inverted Transfer Calculation");
    expect(findings[0].humanApprovalRequired).toBe(true);
    expect(findings[0].autoFixable).toBe(false);
  });
});
