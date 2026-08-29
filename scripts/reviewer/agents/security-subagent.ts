import { ContextSlice } from "../context/context-manager";
import { ReviewFinding } from "../types";

/**
 * Security Review Subagent
 * Analyzes static security risks: hardcoded secrets, leaking service role keys
 * into client-side code, and unauthenticated/unprotected boundary access.
 */
export class SecuritySubagent {
  public review(slice: ContextSlice): ReviewFinding[] {
    const findings: ReviewFinding[] = [];
    const isClientFile =
      slice.filePath.includes("client.ts") ||
      slice.filePath.includes("/components/") ||
      slice.content.includes('"use client"') ||
      slice.content.includes("'use client'");

    for (const hunk of slice.changedHunks) {
      for (let i = 0; i < hunk.lines.length; i++) {
        const line = hunk.lines[i];
        if (!line.startsWith("+")) continue;

        let emittedFindingForLine = false;

        // 1. Detect hardcoded fake/real service role keys or secret tokens
        const secretPatterns = [
          /TEST_ONLY_FAKE_SERVICE_ROLE_SECRET_[a-zA-Z0-9_\-]+/i,
          /SUPABASE_SERVICE_ROLE_KEY\s*=\s*["'][^"']+["']/i,
          /service_role(?:_key)?\s*:\s*["'][^"']+["']/i,
          /(?:sk_live|secret_key|api_secret)\s*=\s*["'][^"']+["']/i,
          /eyJhbGciOi[a-zA-Z0-9_\-\.]{30,}/, // JWT token literal
          /["']CG-[a-zA-Z0-9]{20,}["']/, // CoinGecko API key literal outside test fixtures
        ];

        for (const pattern of secretPatterns) {
          if (pattern.test(line)) {
            // Ignore legitimate test mocks inside .test.ts or .spec.ts files if explicitly test-bound
            const isTestFile = slice.filePath.includes(".test.") || slice.filePath.includes(".spec.");
            if (isTestFile && !line.includes("TEST_ONLY_FAKE_SERVICE_ROLE_SECRET")) {
              continue;
            }

            findings.push({
              id: `SEC-HARDCODED-SECRET-${slice.filePath}-${hunk.newStart + i}`,
              category: "security",
              severity: "must-fix",
              title: "Hardcoded Secret / Service Role Key Detected",
              file: slice.filePath,
              line: hunk.newStart + i,
              hunk: hunk.header,
              explanation:
                "A hardcoded secret, token, or service-role credential was found in source code. Secrets must never be hardcoded and must only be read via secure environment variables.",
              evidence: line.trim(),
              suggestedRemediation:
                "Remove the hardcoded secret literal and reference process.env.<ENV_VAR_NAME> with appropriate server-side guardrails.",
              autoFixable: false,
              humanApprovalRequired: true,
              ruleId: "SEC-001-HARDCODED-SECRET",
            });
            emittedFindingForLine = true;
            break;
          }
        }

        // 2. Detect service-role or private token exposed in browser/client component
        if (
          !emittedFindingForLine &&
          isClientFile &&
          (line.includes("SERVICE_ROLE") ||
            line.includes("SUPABASE_SERVICE_ROLE_KEY") ||
            line.includes("serviceRoleKey"))
        ) {
          findings.push({
            id: `SEC-CLIENT-EXPOSURE-${slice.filePath}-${hunk.newStart + i}`,
            category: "security",
            severity: "must-fix",
            title: "Privileged Service-Role Key Referenced in Client Code",
            file: slice.filePath,
            line: hunk.newStart + i,
            hunk: hunk.header,
            explanation:
              "Referencing service-role keys or admin secrets in client-side bundles bypasses Row Level Security (RLS) and exposes full database admin privileges to browsers.",
            evidence: line.trim(),
            suggestedRemediation:
              "Never reference SUPABASE_SERVICE_ROLE_KEY in client files. Use NEXT_PUBLIC_SUPABASE_ANON_KEY for client queries.",
            autoFixable: false,
            humanApprovalRequired: true,
            ruleId: "SEC-002-CLIENT-EXPOSURE",
          });
        }
      }
    }

    return findings;
  }
}
