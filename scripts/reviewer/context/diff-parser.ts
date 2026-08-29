import { ChangedFile, ChangedHunk } from "../types";

/**
 * Parses raw unified git diff text into structured file and hunk representations.
 */
export function parseUnifiedDiff(rawDiff: string): ChangedFile[] {
  if (!rawDiff || rawDiff.trim() === "") {
    return [];
  }

  const trimmed = rawDiff.trim();
  const files: ChangedFile[] = [];
  const fileChunks = trimmed.split(/(?=^diff --git )/m).filter(Boolean);

  for (const chunk of fileChunks) {
    const lines = chunk.trim().split(/\r?\n/);
    if (lines.length === 0) continue;

    // Header line: a/path b/path
    const firstLine = lines[0];
    const pathMatch = firstLine.match(/a\/(.*?)\s+b\/(.*)/);
    const oldPath = pathMatch ? pathMatch[1] : undefined;
    const newPath = pathMatch ? pathMatch[2] : lines[0].split(" ")[0];
    const filePath = (newPath || oldPath || "unknown").replace(/^b\//, "").replace(/^a\//, "");

    let changeType: "added" | "modified" | "deleted" | "renamed" = "modified";
    if (chunk.includes("new file mode")) {
      changeType = "added";
    } else if (chunk.includes("deleted file mode")) {
      changeType = "deleted";
    } else if (chunk.includes("rename from")) {
      changeType = "renamed";
    }

    const hunks: ChangedHunk[] = [];
    let currentHunk: ChangedHunk | null = null;
    let addedCount = 0;
    let deletedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const hunkHeaderMatch = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)/);

      if (hunkHeaderMatch) {
        if (currentHunk) {
          hunks.push(currentHunk);
        }
        currentHunk = {
          oldStart: parseInt(hunkHeaderMatch[1], 10),
          oldLines: hunkHeaderMatch[2] ? parseInt(hunkHeaderMatch[2], 10) : 1,
          newStart: parseInt(hunkHeaderMatch[3], 10),
          newLines: hunkHeaderMatch[4] ? parseInt(hunkHeaderMatch[4], 10) : 1,
          header: line,
          lines: [],
        };
      } else if (currentHunk) {
        if (line.startsWith("+") && !line.startsWith("+++")) {
          addedCount++;
          currentHunk.lines.push(line);
        } else if (line.startsWith("-") && !line.startsWith("---")) {
          deletedCount++;
          currentHunk.lines.push(line);
        } else if (line.startsWith(" ") || line === "") {
          currentHunk.lines.push(line);
        }
      }
    }

    if (currentHunk) {
      hunks.push(currentHunk);
    }

    files.push({
      filePath,
      oldPath,
      changeType,
      hunks,
      rawPatch: chunk,
      addedLinesCount: addedCount,
      deletedLinesCount: deletedCount,
    });
  }

  return files;
}
