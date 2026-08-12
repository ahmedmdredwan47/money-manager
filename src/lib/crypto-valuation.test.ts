import { describe, expect, it } from "vitest";
import { addDecimalStrings, calculateCryptoBdtValue, compareDecimalStrings, subtractDecimalStrings } from "./crypto-valuation";

describe("calculateCryptoBdtValue", () => {
  it("values one satoshi at a BTC price of 15,000,000 BDT exactly", () => {
    expect(calculateCryptoBdtValue("0.00000001", "15000000")).toBe("0.15");
  });
});

describe("crypto quantity arithmetic", () => {
  it("adds and removes satoshis exactly without floating-point rounding", () => {
    expect(addDecimalStrings("0.00000001", "0.00000001")).toBe("0.00000002");
    expect(subtractDecimalStrings("0.00000001", "0.000000005")).toBe("0.000000005");
    expect(compareDecimalStrings("0.00000002", "0.00000001")).toBe(1);
  });

  it("changes valuation without changing the native quantity", () => {
    const quantity = "0.00000001";
    expect(calculateCryptoBdtValue(quantity, "15000000")).toBe("0.15");
    expect(calculateCryptoBdtValue(quantity, "20000000")).toBe("0.2");
    expect(quantity).toBe("0.00000001");
  });
});
