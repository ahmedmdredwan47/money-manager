import { BenchmarkGroundTruthDefect, BenchmarkMetrics, ReviewFinding } from "../types";
import { BENCHMARK_GROUND_TRUTH } from "./ground-truth";

/**
 * Benchmark Runner & Evaluator
 * Objectively scores reviewer accuracy by comparing actual findings against
 * ground-truth seeded defects, calculating True Positives, False Positives,
 * Precision, Recall, and F1 Score.
 */
export class BenchmarkRunner {
  private groundTruth: BenchmarkGroundTruthDefect[];

  constructor(groundTruth: BenchmarkGroundTruthDefect[] = BENCHMARK_GROUND_TRUTH) {
    this.groundTruth = groundTruth;
  }

  public evaluate(findings: ReviewFinding[]): BenchmarkMetrics {
    const totalSeeded = this.groundTruth.length;
    const detailedComparisons: BenchmarkMetrics["detailedComparisons"] = [];
    const matchedFindingIds = new Set<string>();

    let detectedCount = 0;

    for (const defect of this.groundTruth) {
      // Find matching finding by file and category/snippet
      const matched = findings.find((f) => {
        const fileMatch = f.file.replace(/\\/g, "/").includes(defect.file.replace(/\\/g, "/"));
        const categoryMatch = f.category === defect.category;
        const snippetMatch =
          f.evidence.toLowerCase().includes(defect.signatureSnippet.toLowerCase()) ||
          f.title.toLowerCase().includes(defect.signatureSnippet.toLowerCase()) ||
          f.explanation.toLowerCase().includes(defect.signatureSnippet.toLowerCase());
        const lineMatch = f.line ? Math.abs(f.line - defect.approxLine) <= 15 : true;
        return fileMatch && categoryMatch && (snippetMatch || lineMatch);
      });

      if (matched) {
        detectedCount++;
        matchedFindingIds.add(matched.id);
        detailedComparisons.push({
          defectId: defect.id,
          expected: defect,
          matchedFinding: matched,
          detected: true,
        });
      } else {
        detailedComparisons.push({
          defectId: defect.id,
          expected: defect,
          detected: false,
        });
      }
    }

    // False positives are non-ignored findings that do not match any seeded defect
    const spuriousFindings = findings.filter(
      (f) => f.severity !== "ignore" && !matchedFindingIds.has(f.id)
    );

    const falsePositivesCount = spuriousFindings.length;
    const missedCount = totalSeeded - detectedCount;

    const precision =
      detectedCount + falsePositivesCount > 0
        ? Number((detectedCount / (detectedCount + falsePositivesCount)).toFixed(4))
        : 0;

    const recall = totalSeeded > 0 ? Number((detectedCount / totalSeeded).toFixed(4)) : 0;

    const f1Score =
      precision + recall > 0
        ? Number(((2 * precision * recall) / (precision + recall)).toFixed(4))
        : 0;

    return {
      totalSeeded,
      detectedCount,
      missedCount,
      falsePositivesCount,
      precision,
      recall,
      f1Score,
      detailedComparisons,
      spuriousFindings,
    };
  }

  public formatReport(metrics: BenchmarkMetrics): string {
    const lines: string[] = [];
    lines.push("==================================================");
    lines.push("🎯 BENCHMARK REVIEWER ACCURACY REPORT");
    lines.push("==================================================");
    lines.push(`Seeded defects:   ${metrics.totalSeeded}`);
    lines.push(`Detected:         ${metrics.detectedCount}/${metrics.totalSeeded}`);
    lines.push(`Missed:           ${metrics.missedCount}`);
    lines.push(`False positives:  ${metrics.falsePositivesCount}`);
    lines.push(`Precision:        ${(metrics.precision * 100).toFixed(1)}%`);
    lines.push(`Recall:           ${(metrics.recall * 100).toFixed(1)}%`);
    lines.push(`F1-Score:         ${(metrics.f1Score * 100).toFixed(1)}%`);
    lines.push("--------------------------------------------------");
    lines.push("Detailed Defect Breakdown:");
    for (const item of metrics.detailedComparisons) {
      const status = item.detected ? "✅ DETECTED" : "❌ MISSED";
      lines.push(` [${status}] ${item.expected.id} (${item.expected.category})`);
      lines.push(`   File: ${item.expected.file}`);
      lines.push(`   Expected: ${item.expected.description}`);
      if (item.matchedFinding) {
        lines.push(`   Matched Finding: [${item.matchedFinding.severity}] ${item.matchedFinding.title}`);
      }
    }
    if (metrics.spuriousFindings.length > 0) {
      lines.push("--------------------------------------------------");
      lines.push("⚠️ False Positives / Spurious Findings:");
      for (const f of metrics.spuriousFindings) {
        lines.push(` - [${f.severity}] ${f.file}: ${f.title}`);
      }
    }
    lines.push("==================================================");
    return lines.join("\n");
  }
}
