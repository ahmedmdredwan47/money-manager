import { execSync } from "child_process";
import fs from "fs";
import { ContextManager } from "./context/context-manager";
import { parseUnifiedDiff } from "./context/diff-parser";
import { ExploreSubagent } from "./agents/explore-subagent";
import { PlanSubagent } from "./agents/plan-subagent";
import { LogicSubagent } from "./agents/logic-subagent";
import { SecuritySubagent } from "./agents/security-subagent";
import { TestCoverageSubagent } from "./agents/test-coverage-subagent";
import { MaintainabilitySubagent } from "./agents/maintainability-subagent";
import { TriageEngine } from "./triage/triage-engine";
import { BenchmarkRunner } from "./benchmark/benchmark-runner";
import { ReviewFinding } from "./types";

export interface ReviewerOptions {
  diffString?: string;
  isCI?: boolean;
  isBenchmark?: boolean;
  workspaceRoot?: string;
}

function getGitDiff(workspaceRoot: string): string {
  const diffStrategies = [
    "git diff origin/master...HEAD",
    "git diff master...HEAD",
    "git diff origin/main...HEAD",
    "git diff main...HEAD",
    "git diff HEAD~1",
    "git diff HEAD",
  ];

  for (const cmd of diffStrategies) {
    try {
      const output = execSync(cmd, { cwd: workspaceRoot, encoding: "utf-8" });
      if (output && output.trim().length > 0) {
        try {
          const workingDiff = execSync("git diff HEAD", { cwd: workspaceRoot, encoding: "utf-8" });
          if (workingDiff && workingDiff.trim().length > 0) {
            return output + "\n" + workingDiff;
          }
        } catch (_workingErr) {
          // Working tree diff is optional
        }
        return output;
      }
    } catch (_cmdErr) {
      // Continue to next diff strategy
    }
  }

  try {
    return execSync("git diff HEAD", { cwd: workspaceRoot, encoding: "utf-8" });
  } catch (_headErr) {
    return "";
  }
}

export async function runReviewPipeline(options: ReviewerOptions = {}) {
  const workspaceRoot = options.workspaceRoot ?? process.cwd();
  let rawDiff = options.diffString;

  if (!rawDiff) {
    rawDiff = getGitDiff(workspaceRoot);
  }

  // 1. Parse Diff
  const changedFiles = parseUnifiedDiff(rawDiff);

  // 2. Explore Subagent
  const exploreSubagent = new ExploreSubagent();
  const exploreSummary = exploreSubagent.summarizeDiff(changedFiles);

  // 3. Plan Subagent
  const planSubagent = new PlanSubagent();
  const plan = planSubagent.createPlan(exploreSummary);

  // 4. Context Management & Subagent Review Execution
  const contextManager = new ContextManager(workspaceRoot);
  const logicSubagent = new LogicSubagent();
  const securitySubagent = new SecuritySubagent();
  const testCoverageSubagent = new TestCoverageSubagent();
  const maintainabilitySubagent = new MaintainabilitySubagent();

  const allFindings: ReviewFinding[] = [];

  for (const file of changedFiles) {
    const slice = contextManager.extractBoundedSlice(file);

    if (plan.runLogicReviewer && plan.targetFilesPerReviewer.logic.includes(file.filePath)) {
      allFindings.push(...logicSubagent.review(slice));
    }

    if (plan.runSecurityReviewer && plan.targetFilesPerReviewer.security.includes(file.filePath)) {
      allFindings.push(...securitySubagent.review(slice));
    }

    if (plan.runTestCoverageReviewer && plan.targetFilesPerReviewer.testCoverage.includes(file.filePath)) {
      allFindings.push(...testCoverageSubagent.review(slice));
    }

    if (plan.runMaintainabilityReviewer && plan.targetFilesPerReviewer.maintainability.includes(file.filePath)) {
      allFindings.push(...maintainabilitySubagent.review(slice));
    }
  }

  // 5. Triage
  const triageEngine = new TriageEngine();
  const triageResult = triageEngine.triage(allFindings);

  // 6. Benchmark Evaluation (if requested)
  let benchmarkMetrics = undefined;
  if (options.isBenchmark) {
    const runner = new BenchmarkRunner();
    benchmarkMetrics = runner.evaluate(allFindings);
  }

  return {
    exploreSummary,
    plan,
    findings: allFindings,
    triageResult,
    benchmarkMetrics,
  };
}

// CLI Execution
if (require.main === module || process.argv[1]?.includes("scripts/reviewer/index")) {
  const args = process.argv.slice(2);
  const isBenchmark = args.includes("--benchmark");
  const isCI = args.includes("--ci");

  runReviewPipeline({ isBenchmark, isCI })
    .then((result) => {
      if (isBenchmark && result.benchmarkMetrics) {
        const runner = new BenchmarkRunner();
        console.log(runner.formatReport(result.benchmarkMetrics));
      } else {
        console.log(result.triageResult.markdownReport);
      }

      if (isCI && result.triageResult.summary.mustFixCount > 0) {
        process.exitCode = 1;
      }
    })
    .catch((err) => {
      console.error("[Reviewer CLI Error]:", err);
      process.exitCode = 1;
    });
}
