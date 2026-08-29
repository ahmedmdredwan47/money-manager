/** Exact decimal helpers for crypto quantities and BDT prices. */
function expandScientificNotation(value: string): string {
  const match = value.match(/^([+-]?)(\d+)(?:\.(\d*))?[eE]([+-]?\d+)$/);
  if (!match) return value;

  const [, sign, integer, fraction = "", exponentRaw] = match;
  const exponent = Number(exponentRaw);
  const digits = `${integer}${fraction}`;
  const decimalIndex = integer.length + exponent;

  if (decimalIndex <= 0) return `${sign}0.${"0".repeat(-decimalIndex)}${digits}`;
  if (decimalIndex >= digits.length) return `${sign}${digits}${"0".repeat(decimalIndex - digits.length)}`;
  return `${sign}${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`;
}

function parseDecimal(value: string): { sign: 1 | -1; coefficient: bigint; scale: number } {
  const normalized = expandScientificNotation(value.trim());
  const match = normalized.match(/^([+-]?)(\d+)(?:\.(\d*))?$/);
  if (!match) throw new Error(`Invalid decimal value: ${value}`);

  const [, signToken, integer, fraction = ""] = match;
  const coefficient = BigInt(`${integer}${fraction}`);
  return { sign: signToken === "-" ? -1 : 1, coefficient, scale: fraction.length };
}

function formatDecimal(coefficient: bigint, scale: number, sign: 1 | -1): string {
  if (coefficient === BigInt(0)) return "0";
  const digits = coefficient.toString().padStart(scale + 1, "0");
  const integer = scale === 0 ? digits : digits.slice(0, -scale);
  const fraction = scale === 0 ? "" : digits.slice(-scale).replace(/0+$/, "");
  return `${sign === -1 ? "-" : ""}${integer}${fraction ? `.${fraction}` : ""}`;
}

/**
 * Multiplies decimal strings exactly using BigInt coefficients. Inputs and
 * outputs intentionally remain strings so crypto quantities never traverse a
 * JavaScript floating-point value.
 */
export function multiplyDecimalStrings(left: string, right: string): string {
  const a = parseDecimal(left);
  const b = parseDecimal(right);
  return formatDecimal(a.coefficient * b.coefficient, a.scale + b.scale, a.sign === b.sign ? 1 : -1);
}

/** Adds or subtracts positive decimal strings exactly, without floating point. */
export function addDecimalStrings(left: string, right: string): string {
  const a = parseDecimal(left);
  const b = parseDecimal(right);
  const scale = Math.max(a.scale, b.scale);
  const aValue = a.coefficient * BigInt(a.sign) * BigInt(10) ** BigInt(scale - a.scale);
  const bValue = b.coefficient * BigInt(b.sign) * BigInt(10) ** BigInt(scale - b.scale);
  const sum = aValue + bValue;
  return formatDecimal(sum < 0 ? -sum : sum, scale, sum < 0 ? -1 : 1);
}

export function subtractDecimalStrings(left: string, right: string): string {
  return addDecimalStrings(left, `-${right}`);
}

export function compareDecimalStrings(left: string, right: string): number {
  const difference = addDecimalStrings(left, `-${right}`);
  return difference === "0" ? 0 : difference.startsWith("-") ? -1 : 1;
}

/** Calculates the live BDT value from an unchanged native crypto quantity. */
export function calculateCryptoBdtValue(
  quantity: string,
  bdtPrice: string,
  bonusMultiplier?: string
): string {
  const quantityValue = parseDecimal(quantity);
  const priceValue = parseDecimal(bdtPrice);
  if (quantityValue.sign === -1 || quantityValue.coefficient === BigInt(0)) {
    throw new Error("Crypto quantity must be greater than zero");
  }
  if (priceValue.sign === -1 || priceValue.coefficient === BigInt(0)) {
    throw new Error("Crypto BDT price must be greater than zero");
  }
  if (bonusMultiplier && Number(bonusMultiplier) > 1) {
    return multiplyDecimalStrings(quantity, multiplyDecimalStrings(bdtPrice, bonusMultiplier));
  }
  return multiplyDecimalStrings(quantity, bdtPrice);
}

/** Converts a JSON numeric price to a plain decimal string without rounding it. */
export function marketPriceToDecimalString(price: unknown): string {
  if (typeof price !== "number" && typeof price !== "string") {
    throw new Error("Market price is not numeric");
  }
  const value = String(price);
  const parsed = parseDecimal(value);
  if (parsed.sign === -1 || parsed.coefficient === BigInt(0)) throw new Error("Market price must be greater than zero");
  return formatDecimal(parsed.coefficient, parsed.scale, parsed.sign);
}
