import { storageKeys } from "../storageKeys";

function valuesOf(obj: Record<string, string>): string[] {
  return Object.keys(obj).map((k) => obj[k] as string);
}

describe("storageKeys", () => {
  test("all keys are non-empty strings", () => {
    const values = valuesOf(storageKeys);
    expect(values.length).toBeGreaterThan(0);
    for (const v of values) {
      expect(typeof v).toBe("string");
      expect(v.trim().length).toBeGreaterThan(0);
    }
  });

  test("all keys are unique", () => {
    const values = valuesOf(storageKeys);
    const set = new Set(values);
    expect(set.size).toBe(values.length);
  });

  test("keys use expected namespace prefix", () => {
    const values = valuesOf(storageKeys);
    for (const v of values) {
      expect(v.startsWith("decomplex.")).toBe(true);
    }
  });
});
