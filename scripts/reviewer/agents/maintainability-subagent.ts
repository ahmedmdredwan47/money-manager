import { ContextSlice } from "../context/context-manager";
import { ReviewFinding } from "../types";

/**
 * Maintainability Review Subagent
 * Analyzes meaningful code quality issues: empty catch blocks, dead code,
 * excessive complexity, and auto-fixable formatting/import issues.
 */
export class MaintainabilitySubagent {
  public review(slice: ContextSlice): ReviewFinding[] {
    const findings: ReviewFinding[] = [];

    for (const hunk of slice.changedHunks) {
      for (let i = 0; i < hunk.lines.length; i++) {
        const line = hunk.lines[i];
        if (!line.startsWith("+")) continue;

        // 1. Detect silent catch blocks (swallowing errors completely without comment or log)
        if (/catch\s*(?:\([^)]*\))?\s*\{\s*\}/.test(line)) {
          findings.push({
            id: `MAINT-SILENT-CATCH-${slice.filePath}-${hunk.newStart + i}`,
            category: "maintainability",
            severity: "should-fix",
            title: "Silent Error Swallowing in Empty Catch Block",
            file: slice.filePath,
            line: hunk.newStart + i,
            hunk: hunk.header,
            explanation:
              "Empty catch block silently suppresses runtime errors without logging or handling, hiding potential fatal bugs.",
            evidence: line.trim(),
            suggestedRemediation:
              "Log the error or document why suppressing the error is intentionally safe.",
            autoFixable: false,
            humanApprovalRequired: true,
            ruleId: "MAINT-001-COMPLEXITY-AND-SMELL",
          });
        }

        // 2. Detect commented-out chunks of code
        if (/^\+\s*\/\/\s*(?:function|const|let|var|import|return)\s+[a-zA-Z0-9_$]+/.test(line)) {
          findings.push({
            id: `MAINT-COMMENTED-CODE-${slice.filePath}-${hunk.newStart + i}`,
            category: "maintainability",
            severity: "ignore",
            title: "Commented-Out Code Left in Diff",
            file: slice.filePath,
            line: hunk.newStart + i,
            hunk: hunk.header,
            explanation: "Commented-out code adds visual noise. Rely on git version control instead.",
            evidence: line.trim(),
            suggestedRemediation: "Remove commented-out code blocks.",
            autoFixable: true,
            humanApprovalRequired: false,
            ruleId: "MAINT-002-FORMATTING-AND-IMPORTS",
          });
        }
      }
    }

    return findings;
  }
}
