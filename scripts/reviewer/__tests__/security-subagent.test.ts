import { describe, expect, it } from "vitest";
import { SecuritySubagent } from "../agents/security-subagent";
import { ContextSlice } from "../context/context-manager";

describe("SecuritySubagent", () => {
  it("catches the fake hardcoded secret as a must-fix security finding", () => {
    const slice: ContextSlice = {
      filePath: "src/lib/supabase/client.ts",
      startLine: 1,
      endLine: 25,
      content: `
10:   const { url, anonKey, isConfigured } = getSupabaseEnv();
11:   const fallbackKey = "TEST_ONLY_FAKE_SERVICE_ROLE_SECRET_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
12:   return createBrowserClient<Database>(url, anonKey || fallbackKey);
      `,
      changedHunks: [
        {
          oldStart: 10,
          oldLines: 3,
          newStart: 10,
          newLines: 4,
          header: "@@ -10,3 +10,4 @@ export function createClient",
          lines: [
            "+   const fallbackKey = \"TEST_ONLY_FAKE_SERVICE_ROLE_SECRET_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\";",
            "+   return createBrowserClient<Database>(url, anonKey || fallbackKey);",
          ],
        },
      ],
      relatedTestFiles: [],
      approxTokens: 120,
    };

    const reviewer = new SecuritySubagent();
    const findings = reviewer.review(slice);

    expect(findings.length).toBeGreaterThanOrEqual(1);
    const secretFinding = findings.find((f) => f.category === "security");
    expect(secretFinding).toBeDefined();
    expect(secretFinding?.severity).toBe("must-fix");
    expect(secretFinding?.title).toContain("Hardcoded Secret");
    expect(secretFinding?.humanApprovalRequired).toBe(true);
  });
});
