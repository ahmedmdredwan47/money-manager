import { FindingCategory, FindingSeverity } from "./types";

export interface RubricRule {
  id: string;
  category: FindingCategory;
  defaultSeverity: FindingSeverity;
  name: string;
  description: string;
  examples: string[];
  isAutoFixable: boolean;
  requiresHumanApproval: boolean;
}

export const RUBRIC_RULES: Record<string, RubricRule> = {
  // --- MUST-FIX RULES ---
  "SEC-001-HARDCODED-SECRET": {
    id: "SEC-001-HARDCODED-SECRET",
    category: "security",
    defaultSeverity: "must-fix",
    name: "Hardcoded API Key, Token, or Secret",
    description: "Hardcoded credentials or API keys must never be committed to source code or browser bundles.",
    examples: [
      "Hardcoding SUPABASE_SERVICE_ROLE_KEY or any secret key in client or server files",
      "Using fallback string literals for private tokens in default initializers",
    ],
    isAutoFixable: false,
    requiresHumanApproval: true,
  },
  "SEC-002-CLIENT-EXPOSURE": {
    id: "SEC-002-CLIENT-EXPOSURE",
    category: "security",
    defaultSeverity: "must-fix",
    name: "Server-Only Secret Exposed to Browser Client",
    description: "Privileged server keys or service credentials must not be imported or referenced in Client Components.",
    examples: [
      "Importing service role keys in components marked 'use client' or browser client instantiators",
    ],
    isAutoFixable: false,
    requiresHumanApproval: true,
  },
  "LOGIC-001-FINANCIAL-CALCULATION": {
    id: "LOGIC-001-FINANCIAL-CALCULATION",
    category: "logic",
    defaultSeverity: "must-fix",
    name: "Financial Calculation / Balance Arithmetic Error",
    description: "Arithmetic operations affecting account balances, transfers, or monetary conversions must be mathematically sound.",
    examples: [
      "Adding amount instead of subtracting for outgoing transfers",
      "Inverted currency conversion rate or sign error",
    ],
    isAutoFixable: false,
    requiresHumanApproval: true,
  },
  "LOGIC-002-STATE-CORRUPTION": {
    id: "LOGIC-002-STATE-CORRUPTION",
    category: "logic",
    defaultSeverity: "must-fix",
    name: "State Corruption or Inverted Invariant",
    description: "Logic that violates core application invariants or corrupts domain state.",
    examples: [
      "Inverted boolean condition in critical transaction updates",
      "Unchecked null access leading to unhandled state rejection",
    ],
    isAutoFixable: false,
    requiresHumanApproval: true,
  },

  // --- SHOULD-FIX RULES ---
  "TEST-001-MISSING-BRANCH-COVERAGE": {
    id: "TEST-001-MISSING-BRANCH-COVERAGE",
    category: "missing-tests",
    defaultSeverity: "should-fix",
    name: "Meaningful New Branch or Feature Path Untested",
    description: "New business logic paths, edge-case handlers, or calculation branches must have corresponding unit test assertions.",
    examples: [
      "Adding discount multiplier or zero-fee branch in math library without test assertions",
      "Adding export format without testing conversion logic",
    ],
    isAutoFixable: false,
    requiresHumanApproval: true,
  },
  "MAINT-001-COMPLEXITY-AND-SMELL": {
    id: "MAINT-001-COMPLEXITY-AND-SMELL",
    category: "maintainability",
    defaultSeverity: "should-fix",
    name: "Excessive Complexity or Code Smell",
    description: "Duplicated logic, deeply nested conditionals, or non-idiomatic workarounds that hurt long-term maintainability.",
    examples: [
      "Copy-pasting 30 lines of parsing logic instead of using existing helper",
      "Swallowing fatal errors without logging or user feedback",
    ],
    isAutoFixable: false,
    requiresHumanApproval: true,
  },

  // --- IGNORE / AUTO-FIXABLE RULES ---
  "MAINT-002-FORMATTING-AND-IMPORTS": {
    id: "MAINT-002-FORMATTING-AND-IMPORTS",
    category: "maintainability",
    defaultSeverity: "ignore",
    name: "Formatting or Unused Import (Auto-fixable)",
    description: "Minor whitespace discrepancies, import order, or harmless formatting that can be mechanically resolved.",
    examples: ["Extra blank lines", "Unused local import statement"],
    isAutoFixable: true,
    requiresHumanApproval: false,
  },
};
