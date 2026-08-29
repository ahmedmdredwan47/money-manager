import { BenchmarkGroundTruthDefect } from "../types";

export const BENCHMARK_GROUND_TRUTH: BenchmarkGroundTruthDefect[] = [
  {
    id: "BENCHMARK-DEFECT-1-LOGIC",
    file: "src/lib/account-utils.ts",
    approxLine: 26,
    category: "logic",
    expectedSeverity: "must-fix",
    description: "Inverted transfer arithmetic in calculateAccountBalance: outgoing transfer adds amount instead of subtracting it from source balance.",
    signatureSnippet: "t.type === \"transfer\"",
  },
  {
    id: "BENCHMARK-DEFECT-2-UNTESTED",
    file: "src/lib/crypto-valuation.ts",
    approxLine: 76,
    category: "missing-tests",
    expectedSeverity: "should-fix",
    description: "Untested domain branch in calculateCryptoBdtValue handling fee discount/multiplier without unit tests in crypto-valuation.test.ts.",
    signatureSnippet: "bonusMultiplier",
  },
  {
    id: "BENCHMARK-DEFECT-3-SECURITY",
    file: "src/lib/supabase/client.ts",
    approxLine: 12,
    category: "security",
    expectedSeverity: "must-fix",
    description: "Hardcoded fake service-role secret in browser client initialization.",
    signatureSnippet: "TEST_ONLY_FAKE_SERVICE_ROLE_SECRET_",
  },
];
