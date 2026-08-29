import fs from "fs";
import path from "path";
import { ContextSlice } from "../context/context-manager";
import { ReviewFinding } from "../types";

/**
 * Test Coverage Review Subagent
 * Analyzes whether newly added functions, branches, and edge-case handlers
 * have corresponding test coverage in the associated test suite.
 */
export class TestCoverageSubagent {
  public review(slice: ContextSlice): ReviewFinding[] {
    const findings: ReviewFinding[] = [];

    // Skip reviewing test files themselves for test coverage
    if (slice.filePath.includes(".test.") || slice.filePath.includes(".spec.")) {
      return findings;
    }

    // Load related test file contents if available
    let testSuiteContent = "";
    for (const testPath of slice.relatedTestFiles) {
      if (fs.existsSync(testPath)) {
        try {
          testSuiteContent += "\n" + fs.readFileSync(testPath, "utf-8");
        } catch {
          // ignore read error
        }
      }
    }

    for (const hunk of slice.changedHunks) {
      for (let i = 0; i < hunk.lines.length; i++) {
        const line = hunk.lines[i];
        if (!line.startsWith("+")) continue;

        // 1. Detect newly introduced functions/exports
        const fnMatch = line.match(/export\s+(?:function|const)\s+([a-zA-Z0-9_$]+)/);
        if (fnMatch) {
          const fnName = fnMatch[1];
          if (testSuiteContent && !testSuiteContent.includes(fnName)) {
            findings.push({
              id: `TEST-UNTESTED-FN-${slice.filePath}-${fnName}`,
              category: "missing-tests",
              severity: "should-fix",
              title: `Exported Function '${fnName}' Lacks Unit Test Coverage`,
              file: slice.filePath,
              line: hunk.newStart + i,
              hunk: hunk.header,
              explanation: `The newly added or exported function '${fnName}' is not referenced or asserted in related test file(s): ${slice.relatedTestFiles.join(", ") || "None found"}.`,
              evidence: line.trim(),
              suggestedRemediation: `Add unit test cases in ${slice.relatedTestFiles[0] || slice.filePath.replace(/\.tsx?$/, ".test.ts")} covering standard and edge-case behavior of '${fnName}'.`,
              autoFixable: false,
              humanApprovalRequired: true,
              ruleId: "TEST-001-MISSING-BRANCH-COVERAGE",
            });
          }
        }

        // 2. Detect newly added conditional branches (if statements / ternary / switch cases)
        const branchMatch = line.match(/\bif\s*\(([^)]+)\)/);
        if (branchMatch) {
          const condition = branchMatch[1].trim();
          // Check for meaningful domain conditions (multiplier, discount, fee, zero, null, rate)
          const conditionTokens = condition.split(/[\s!=<>+*&|()]+/).filter((t) => t.length > 2);
          const isDomainCondition = conditionTokens.some((token) =>
            /bonus|multiplier|discount|fee|override|tier|special|rate|cutoff/i.test(token)
          );

          if (isDomainCondition) {
            // Check if test suite mentions any of these special tokens
            const hasTestToken = conditionTokens.some((token) => testSuiteContent.includes(token));
            if (!hasTestToken) {
              findings.push({
                id: `TEST-UNTESTED-BRANCH-${slice.filePath}-${hunk.newStart + i}`,
                category: "missing-tests",
                severity: "should-fix",
                title: `Untested Business Logic Branch: if (${condition})`,
                file: slice.filePath,
                line: hunk.newStart + i,
                hunk: hunk.header,
                explanation: `New conditional branch 'if (${condition})' introduces distinct domain behavior that has no corresponding test scenario in the test suite.`,
                evidence: line.trim(),
                suggestedRemediation: `Add a unit test in ${slice.relatedTestFiles[0] || "the test suite"} specifically exercising the '${condition}' condition.`,
                autoFixable: false,
                humanApprovalRequired: true,
                ruleId: "TEST-001-MISSING-BRANCH-COVERAGE",
              });
            }
          }
        }
      }
    }

    return findings;
  }
}
