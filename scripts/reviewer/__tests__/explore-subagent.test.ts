import { describe, expect, it } from "vitest";
import { ExploreSubagent } from "../agents/explore-subagent";
import { parseUnifiedDiff } from "../context/diff-parser";

describe("ExploreSubagent", () => {
  it("produces a bounded useful summary identifying risk areas without dumping full files", () => {
    const rawDiff = `
diff --git a/src/lib/account-utils.ts b/src/lib/account-utils.ts
index abc..def 100644
--- a/src/lib/account-utils.ts
+++ b/src/lib/account-utils.ts
@@ -25,3 +25,3 @@ export function calculateAccountBalance(account: Account, transactions: Transact
-        return sum - amount;
+        return sum + amount;
     }
`;

    const changedFiles = parseUnifiedDiff(rawDiff);
    const explore = new ExploreSubagent();
    const summary = explore.summarizeDiff(changedFiles);

    expect(summary.totalFilesChanged).toBe(1);
    expect(summary.changedFiles[0].filePath).toBe("src/lib/account-utils.ts");
    expect(summary.changedFiles[0].riskAreas).toContain("financial-logic");
    expect(summary.highRiskFilesDetected).toBe(true);
    expect(summary.totalLinesAdded).toBe(1);
    expect(summary.totalLinesDeleted).toBe(1);
  });
});
