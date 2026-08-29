import { ReviewFinding, TriageResult } from "../types";

/**
 * Triage Engine
 * Consolidates findings from all subagents, separates safe auto-fixable actions
 * from actions requiring human approval, determines PR merge verdict,
 * and generates GitHub markdown reports.
 */
export class TriageEngine {
  public triage(findings: ReviewFinding[]): TriageResult {
    // Deduplicate findings by ID/file/line
    const uniqueFindings = this.deduplicateFindings(findings);

    let mustFixCount = 0;
    let shouldFixCount = 0;
    let ignoreCount = 0;
    let autoFixableCount = 0;
    let humanApprovalRequiredCount = 0;

    const autoFixActions: TriageResult["autoFixActions"] = [];
    const humanReviewActions: TriageResult["humanReviewActions"] = [];

    for (const finding of uniqueFindings) {
      if (finding.severity === "must-fix") mustFixCount++;
      else if (finding.severity === "should-fix") shouldFixCount++;
      else if (finding.severity === "ignore") ignoreCount++;

      if (finding.autoFixable) {
        autoFixableCount++;
        autoFixActions.push({
          findingId: finding.id,
          description: `Auto-fix suggestion for '${finding.title}' in ${finding.file}`,
          actionType: finding.category === "maintainability" ? "mechanical-fix" : "format",
        });
      }

      if (finding.humanApprovalRequired) {
        humanApprovalRequiredCount++;
        humanReviewActions.push({
          findingId: finding.id,
          title: finding.title,
          severity: finding.severity,
          remediation: finding.suggestedRemediation,
        });
      }
    }

    // Determine PR verdict and GitHub labels
    let verdict: TriageResult["verdict"] = "APPROVE";
    const recommendedLabels: string[] = [];

    if (mustFixCount > 0) {
      verdict = "REQUEST_CHANGES";
      recommendedLabels.push("status:blocked", "review:must-fix-required");
      if (uniqueFindings.some((f) => f.category === "security")) {
        recommendedLabels.push("security-alert");
      }
      if (uniqueFindings.some((f) => f.category === "logic")) {
        recommendedLabels.push("financial-logic-risk");
      }
    } else if (shouldFixCount > 0) {
      verdict = "COMMENT";
      recommendedLabels.push("review:should-fix", "status:changes-recommended");
    } else {
      verdict = "APPROVE";
      recommendedLabels.push("review:approved", "status:ready-to-merge");
    }

    const markdownReport = this.generateMarkdownReport(
      uniqueFindings,
      verdict,
      mustFixCount,
      shouldFixCount,
      ignoreCount,
      autoFixActions,
      humanReviewActions
    );

    return {
      summary: {
        totalFindings: uniqueFindings.length,
        mustFixCount,
        shouldFixCount,
        ignoreCount,
        autoFixableCount,
        humanApprovalRequiredCount,
      },
      verdict,
      recommendedLabels,
      autoFixActions,
      humanReviewActions,
      markdownReport,
    };
  }

  private deduplicateFindings(findings: ReviewFinding[]): ReviewFinding[] {
    const seen = new Set<string>();
    const result: ReviewFinding[] = [];

    for (const finding of findings) {
      const key = `${finding.category}-${finding.file}-${finding.line || 0}-${finding.title}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(finding);
      }
    }

    return result;
  }

  private generateMarkdownReport(
    findings: ReviewFinding[],
    verdict: string,
    mustFix: number,
    shouldFix: number,
    ignore: number,
    autoFixActions: TriageResult["autoFixActions"],
    humanReviewActions: TriageResult["humanReviewActions"]
  ): string {
    const lines: string[] = [];

    lines.push("## 🤖 Automated PR Review Report");
    lines.push("");
    lines.push(`**Verdict**: \`${verdict}\` | **Must-Fix**: \`${mustFix}\` | **Should-Fix**: \`${shouldFix}\` | **Informational**: \`${ignore}\``);
    lines.push("");

    if (findings.length === 0) {
      lines.push("✅ **No issues detected!** All automated subagent review checks passed cleanly.");
      return lines.join("\n");
    }

    lines.push("### 📋 Review Findings");
    lines.push("");
    lines.push("| Severity | Category | File | Line | Issue | Remediation |");
    lines.push("|---|---|---|---|---|---|");

    for (const f of findings) {
      const sevBadge =
        f.severity === "must-fix"
          ? "🚨 **Must-Fix**"
          : f.severity === "should-fix"
          ? "⚠️ **Should-Fix**"
          : "ℹ️ Ignore";
      lines.push(
        `| ${sevBadge} | \`${f.category}\` | \`${f.file}\` | ${f.line ?? "Hunk"} | **${f.title}**<br>${f.explanation} | ${f.suggestedRemediation} |`
      );
    }

    lines.push("");
    lines.push("### 🛡️ Triage & Action Policy");
    lines.push("");
    lines.push(`- **Safe Auto-Fixable Items (${autoFixActions.length})**: Non-destructive formatting, mechanical cleanups.`);
    lines.push(`- **Human Approval Required (${humanReviewActions.length})**: Financial balance math, security secrets, missing test implementations.`);

    return lines.join("\n");
  }
}
