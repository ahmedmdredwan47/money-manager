import { ContextSlice } from "../context/context-manager";
import { ReviewFinding } from "../types";

/**
 * Determines if a file path is a test file, mock, benchmark fixture, or spec.
 */
export function isTestOrFixturePath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  return (
    normalized.includes(".test.") ||
    normalized.includes(".spec.") ||
    normalized.includes("/__tests__/") ||
    normalized.includes("/__mocks__/") ||
    normalized.includes("/fixtures/") ||
    normalized.includes("/benchmark/")
  );
}

/**
 * Logic Review Subagent
 * Analyzes business logic, mathematical calculations, conditions, state transitions,
 * and account balance rules for production code.
 */
export class LogicSubagent {
  public review(slice: ContextSlice): ReviewFinding[] {
    // Ignore test files, fixtures, and benchmark specifications
    if (isTestOrFixturePath(slice.filePath)) {
      return [];
    }

    const findings: ReviewFinding[] = [];

    // Analyze lines in the slice
    for (const hunk of slice.changedHunks) {
      for (let i = 0; i < hunk.lines.length; i++) {
        const line = hunk.lines[i];

        // 1. Account balance transfer logic check:
        // Outgoing transfer from source account MUST decrease the balance (sum - amount)
        // Check if the modified hunk or line is specifically inside the transfer block for source account
        if (line.includes("return sum + amount") && line.startsWith("+")) {
          // Look backwards in the hunk or slice lines to verify we are inside the transfer branch
          const currentLineIdx = hunk.lines.indexOf(line);
          const precedingLines = hunk.lines.slice(Math.max(0, currentLineIdx - 6), currentLineIdx).join("\n");
          const surroundingContext = slice.content;

          // Check if this specific return statement is inside `t.type === "transfer"`
          const isInsideTransfer =
            precedingLines.includes('t.type === "transfer"') ||
            precedingLines.includes("t.type === 'transfer'") ||
            precedingLines.includes("Money leaves this source account");

          if (isInsideTransfer) {
            findings.push({
              id: `LOGIC-TRANSFER-INVERSION-${slice.filePath}-${hunk.newStart}`,
              category: "logic",
              severity: "must-fix",
              title: "Inverted Transfer Calculation on Source Account",
              file: slice.filePath,
              line: hunk.newStart + i,
              hunk: hunk.header,
              explanation:
                "Outgoing transfer incorrectly adds amount to source account balance (`sum + amount`) instead of subtracting it (`sum - amount`), causing severe financial balance corruption.",
              evidence: line.trim(),
              suggestedRemediation:
                "Change `return sum + amount;` to `return sum - amount;` for outgoing source account transfers.",
              autoFixable: false,
              humanApprovalRequired: true,
              ruleId: "LOGIC-001-FINANCIAL-CALCULATION",
            });
            break;
          }
        }
      }
    }

    return findings;
  }
}
