import { ExploreSummary, ReviewPlan } from "../types";

/**
 * Plan Subagent
 * Consumes ONLY the ExploreSummary and formulates the review dispatch plan,
 * deciding which specialized subagents to invoke and targeting specific files.
 */
export class PlanSubagent {
  public createPlan(summary: ExploreSummary): ReviewPlan {
    const logicFiles = new Set<string>();
    const securityFiles = new Set<string>();
    const testCoverageFiles = new Set<string>();
    const maintainabilityFiles = new Set<string>();
    const reasoning: string[] = [];

    for (const file of summary.changedFiles) {
      const isTestOrFixture =
        file.filePath.includes(".test.") ||
        file.filePath.includes(".spec.") ||
        file.filePath.includes("__tests__") ||
        file.filePath.includes("__mocks__") ||
        file.filePath.includes("fixtures") ||
        file.filePath.includes("benchmark");

      // Financial math or crypto logic (production files only)
      if (
        !isTestOrFixture &&
        (file.riskAreas.includes("financial-logic") || file.riskAreas.includes("crypto-math"))
      ) {
        logicFiles.add(file.filePath);
        testCoverageFiles.add(file.filePath);
      }

      // Security / Auth / API / Environment
      if (file.riskAreas.includes("security-auth")) {
        securityFiles.add(file.filePath);
      }

      // Any production code change needs test coverage review
      if (!isTestOrFixture && (file.totalAddedLines > 0 || file.totalDeletedLines > 0)) {
        testCoverageFiles.add(file.filePath);
      }

      // Maintainability review on non-trivial diffs
      if (file.totalAddedLines + file.totalDeletedLines > 5) {
        maintainabilityFiles.add(file.filePath);
      }
    }

    if (logicFiles.size > 0) {
      reasoning.push(`Identified ${logicFiles.size} file(s) with financial or numerical logic changes.`);
    }
    if (securityFiles.size > 0) {
      reasoning.push(`Identified ${securityFiles.size} file(s) touching security, auth, or client/server boundaries.`);
    }
    if (testCoverageFiles.size > 0) {
      reasoning.push(`Identified ${testCoverageFiles.size} source file(s) requiring test coverage verification.`);
    }
    if (maintainabilityFiles.size > 0) {
      reasoning.push(`Identified ${maintainabilityFiles.size} file(s) with substantial code modifications.`);
    }

    return {
      runLogicReviewer: logicFiles.size > 0,
      runSecurityReviewer: securityFiles.size > 0,
      runTestCoverageReviewer: testCoverageFiles.size > 0,
      runMaintainabilityReviewer: maintainabilityFiles.size > 0,
      targetFilesPerReviewer: {
        logic: Array.from(logicFiles),
        security: Array.from(securityFiles),
        testCoverage: Array.from(testCoverageFiles),
        maintainability: Array.from(maintainabilityFiles),
      },
      reasoning,
    };
  }
}
