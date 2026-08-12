import { describe, expect, it } from "vitest";
import { cryptoBdtValueAsNumber, formatCryptoQuantity } from "./utils";

describe("crypto holding presentation", () => {
  it("keeps a satoshi in fixed decimal notation and calculates its BDT value", () => {
    expect(formatCryptoQuantity("0.00000001")).toBe("0.00000001");
    expect(cryptoBdtValueAsNumber("0.00000001", "15000000")).toBe(0.15);
  });
});
