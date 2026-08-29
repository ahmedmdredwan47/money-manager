import fs from "fs";
import path from "path";
import { ChangedFile, ChangedHunk } from "../types";

export interface ContextSlice {
  filePath: string;
  startLine: number;
  endLine: number;
  content: string;
  changedHunks: ChangedHunk[];
  relatedTestFiles: string[];
  approxTokens: number;
}

export interface ContextBudgetOptions {
  maxContextLinesPerHunk?: number;
  maxTotalTokensPerReviewer?: number;
}

/**
 * Manages bounded context extraction for subagents to prevent token bloat
 * and ensure focused review without dumping full repository files.
 */
export class ContextManager {
  private workspaceRoot: string;
  private maxContextLinesPerHunk: number;
  private maxTotalTokensPerReviewer: number;

  constructor(workspaceRoot: string = process.cwd(), options: ContextBudgetOptions = {}) {
    this.workspaceRoot = workspaceRoot;
    this.maxContextLinesPerHunk = options.maxContextLinesPerHunk ?? 15;
    this.maxTotalTokensPerReviewer = options.maxTotalTokensPerReviewer ?? 2000;
  }

  /**
   * Generates a bounded context slice for a changed file.
   * Extracts only the modified hunks with a limited surrounding window of context.
   */
  public extractBoundedSlice(file: ChangedFile): ContextSlice {
    const fullPath = path.resolve(this.workspaceRoot, file.filePath);
    let fullContent = "";
    if (fs.existsSync(fullPath)) {
      try {
        fullContent = fs.readFileSync(fullPath, "utf-8");
      } catch {
        fullContent = "";
      }
    }

    const lines = fullContent.split(/\r?\n/);
    const relatedTests = this.findRelatedTestFiles(file.filePath);

    if (file.hunks.length === 0 || lines.length === 0) {
      const fallbackContent = file.rawPatch.slice(0, 800);
      return {
        filePath: file.filePath,
        startLine: 1,
        endLine: Math.min(lines.length || 1, 50),
        content: fallbackContent,
        changedHunks: file.hunks,
        relatedTestFiles: relatedTests,
        approxTokens: Math.ceil(fallbackContent.length / 4),
      };
    }

    // Determine line boundaries covering changed hunks ± context window
    let minLine = Infinity;
    let maxLine = -Infinity;

    for (const hunk of file.hunks) {
      const hunkStart = Math.max(1, hunk.newStart - this.maxContextLinesPerHunk);
      const hunkEnd = Math.min(lines.length, hunk.newStart + hunk.newLines + this.maxContextLinesPerHunk);
      if (hunkStart < minLine) minLine = hunkStart;
      if (hunkEnd > maxLine) maxLine = hunkEnd;
    }

    if (!Number.isFinite(minLine) || !Number.isFinite(maxLine)) {
      minLine = 1;
      maxLine = Math.min(lines.length, 50);
    }

    // Extract bounded window
    const boundedLines = lines.slice(minLine - 1, maxLine);
    const sliceContent = boundedLines
      .map((line, idx) => `${minLine + idx}: ${line}`)
      .join("\n");

    const approxTokens = Math.ceil(sliceContent.length / 4);

    return {
      filePath: file.filePath,
      startLine: minLine,
      endLine: maxLine,
      content: sliceContent,
      changedHunks: file.hunks,
      relatedTestFiles: relatedTests,
      approxTokens,
    };
  }

  /**
   * Discovers corresponding test files for a source file.
   */
  public findRelatedTestFiles(sourceFilePath: string): string[] {
    const candidates: string[] = [];
    const parsed = path.parse(sourceFilePath);

    // E.g. src/lib/account-utils.ts -> src/lib/account-utils.test.ts
    const sameDirTest = path.join(parsed.dir, `${parsed.name}.test.ts`);
    const sameDirSpec = path.join(parsed.dir, `${parsed.name}.spec.ts`);

    if (fs.existsSync(path.resolve(this.workspaceRoot, sameDirTest))) {
      candidates.push(sameDirTest.replace(/\\/g, "/"));
    }
    if (fs.existsSync(path.resolve(this.workspaceRoot, sameDirSpec))) {
      candidates.push(sameDirSpec.replace(/\\/g, "/"));
    }

    // Check sibling test directory e.g. __tests__/
    const siblingTest = path.join(parsed.dir, "__tests__", `${parsed.name}.test.ts`);
    if (fs.existsSync(path.resolve(this.workspaceRoot, siblingTest))) {
      candidates.push(siblingTest.replace(/\\/g, "/"));
    }

    return candidates;
  }
}
