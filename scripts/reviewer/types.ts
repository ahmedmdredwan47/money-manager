export type FindingCategory = "logic" | "security" | "missing-tests" | "maintainability";

export type FindingSeverity = "must-fix" | "should-fix" | "ignore";

export interface ReviewFinding {
  id: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  file: string;
  line?: number;
  hunk?: string;
  explanation: string;
  evidence: string;
  suggestedRemediation: string;
  autoFixable: boolean;
  humanApprovalRequired: boolean;
  ruleId?: string;
}

export interface ChangedHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  header: string;
  lines: string[];
}

export interface ChangedFile {
  filePath: string;
  oldPath?: string;
  changeType: "added" | "modified" | "deleted" | "renamed";
  hunks: ChangedHunk[];
  rawPatch: string;
  addedLinesCount: number;
  deletedLinesCount: number;
}

export interface ExploreSummary {
  changedFiles: Array<{
    filePath: string;
    changeType: "added" | "modified" | "deleted" | "renamed";
    symbolsTouched: string[];
    riskAreas: Array<"financial-logic" | "security-auth" | "crypto-math" | "untested-surface" | "general">;
    totalAddedLines: number;
    totalDeletedLines: number;
  }>;
  totalFilesChanged: number;
  totalLinesAdded: number;
  totalLinesDeleted: number;
  highRiskFilesDetected: boolean;
}

export interface ReviewPlan {
  runLogicReviewer: boolean;
  runSecurityReviewer: boolean;
  runTestCoverageReviewer: boolean;
  runMaintainabilityReviewer: boolean;
  targetFilesPerReviewer: {
    logic: string[];
    security: string[];
    testCoverage: string[];
    maintainability: string[];
  };
  reasoning: string[];
}

export interface TriageResult {
  summary: {
    totalFindings: number;
    mustFixCount: number;
    shouldFixCount: number;
    ignoreCount: number;
    autoFixableCount: number;
    humanApprovalRequiredCount: number;
  };
  verdict: "APPROVE" | "REQUEST_CHANGES" | "COMMENT";
  recommendedLabels: string[];
  autoFixActions: Array<{
    findingId: string;
    description: string;
    actionType: "format" | "import-cleanup" | "mechanical-fix";
  }>;
  humanReviewActions: Array<{
    findingId: string;
    title: string;
    severity: FindingSeverity;
    remediation: string;
  }>;
  markdownReport: string;
}

export interface BenchmarkGroundTruthDefect {
  id: string;
  file: string;
  approxLine: number;
  category: FindingCategory;
  expectedSeverity: FindingSeverity;
  description: string;
  signatureSnippet: string;
}

export interface BenchmarkMetrics {
  totalSeeded: number;
  detectedCount: number;
  missedCount: number;
  falsePositivesCount: number;
  precision: number;
  recall: number;
  f1Score: number;
  detailedComparisons: Array<{
    defectId: string;
    expected: BenchmarkGroundTruthDefect;
    matchedFinding?: ReviewFinding;
    detected: boolean;
  }>;
  spuriousFindings: ReviewFinding[];
}
