import { ChangedFile, ExploreSummary } from "../types";

/**
 * Explore Subagent
 * Analyzes the diff structure, identifies touched symbols and risk surfaces,
 * and produces a compact structured summary without dumping entire files.
 */
export class ExploreSubagent {
  public summarizeDiff(changedFiles: ChangedFile[]): ExploreSummary {
    let totalAdded = 0;
    let totalDeleted = 0;
    let highRiskFiles = false;

    const fileSummaries = changedFiles.map((file) => {
      totalAdded += file.addedLinesCount;
      totalDeleted += file.deletedLinesCount;

      const symbolsTouched = this.extractTouchedSymbols(file);
      const riskAreas = this.identifyRiskAreas(file.filePath, symbolsTouched);

      if (riskAreas.some((r) => r !== "general")) {
        highRiskFiles = true;
      }

      return {
        filePath: file.filePath,
        changeType: file.changeType,
        symbolsTouched,
        riskAreas,
        totalAddedLines: file.addedLinesCount,
        totalDeletedLines: file.deletedLinesCount,
      };
    });

    return {
      changedFiles: fileSummaries,
      totalFilesChanged: changedFiles.length,
      totalLinesAdded: totalAdded,
      totalLinesDeleted: totalDeleted,
      highRiskFilesDetected: highRiskFiles,
    };
  }

  private extractTouchedSymbols(file: ChangedFile): string[] {
    const symbols = new Set<string>();

    for (const hunk of file.hunks) {
      // Check hunk header for function declaration context
      const headerMatch = hunk.header.match(/@@\s+([a-zA-Z0-9_$]+)/);
      if (headerMatch) {
        symbols.add(headerMatch[1]);
      }

      // Scan added/modified lines for function/class/export signatures
      for (const line of hunk.lines) {
        if (line.startsWith("+") || line.startsWith("-")) {
          const fnMatch = line.match(/(?:function|class|const|let|export\s+(?:async\s+)?function|export\s+const)\s+([a-zA-Z0-9_$]+)/);
          if (fnMatch) {
            symbols.add(fnMatch[1]);
          }
        }
      }
    }

    return Array.from(symbols);
  }

  private identifyRiskAreas(
    filePath: string,
    symbols: string[]
  ): Array<"financial-logic" | "security-auth" | "crypto-math" | "untested-surface" | "general"> {
    const risks = new Set<"financial-logic" | "security-auth" | "crypto-math" | "untested-surface" | "general">();
    const lowerPath = filePath.toLowerCase();

    // Security / Auth boundary
    if (
      lowerPath.includes("supabase") ||
      lowerPath.includes("auth") ||
      lowerPath.includes("middleware") ||
      lowerPath.includes("api/") ||
      lowerPath.includes("env")
    ) {
      risks.add("security-auth");
    }

    // Financial / Account logic
    if (
      lowerPath.includes("account") ||
      lowerPath.includes("transaction") ||
      lowerPath.includes("exchange-rate") ||
      lowerPath.includes("budget") ||
      symbols.some((s) => /balance|amount|calc|convert/i.test(s))
    ) {
      risks.add("financial-logic");
    }

    // Crypto Math / Decimal Precision
    if (
      lowerPath.includes("crypto") ||
      symbols.some((s) => /crypto|satoshi|bdt|price|decimal/i.test(s))
    ) {
      risks.add("crypto-math");
    }

    if (risks.size === 0) {
      risks.add("general");
    }

    return Array.from(risks);
  }
}
