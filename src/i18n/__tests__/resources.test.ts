import { resources } from "../resources";

type AnyObject = Record<string, unknown>;

function isPlainObject(v: unknown): v is AnyObject {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function collectKeyPaths(obj: unknown, prefix = ""): string[] {
  if (!isPlainObject(obj)) return [];

  const out: string[] = [];

  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;

    if (isPlainObject(v)) {
      out.push(...collectKeyPaths(v, next));
    } else {
      out.push(next);
    }
  }

  return out;
}

function getByPath(obj: AnyObject, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!isPlainObject(acc)) return undefined;
    return acc[key];
  }, obj);
}

function validateLeafValues(obj: unknown, prefix = ""): string[] {
  if (!isPlainObject(obj)) return [];

  const issues: string[] = [];

  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;

    if (isPlainObject(v)) {
      issues.push(...validateLeafValues(v, next));
      continue;
    }

    if (v === null || v === undefined) {
      issues.push(`${next}: is null/undefined`);
      continue;
    }

    if (typeof v !== "string") {
      issues.push(`${next}: is not string`);
      continue;
    }

    if (v.trim().length === 0) {
      issues.push(`${next}: is empty string`);
    }
  }

  return issues;
}

describe("i18n/resources", () => {
  it("has expected locales", () => {
    expect(Object.keys(resources).sort()).toEqual(["en", "hy", "ru"]);
  });

  it("has translation namespace for each locale", () => {
    expect(resources.en.translation).toBeDefined();
    expect(resources.ru.translation).toBeDefined();
    expect(resources.hy.translation).toBeDefined();
  });

  it("ru and hy contain all keys from en (parity check)", () => {
    const en = resources.en.translation as AnyObject;
    const ru = resources.ru.translation as AnyObject;
    const hy = resources.hy.translation as AnyObject;

    const enKeys = collectKeyPaths(en);

    const missingRu = enKeys.filter((p) => getByPath(ru, p) === undefined);
    const missingHy = enKeys.filter((p) => getByPath(hy, p) === undefined);

    expect(missingRu).toEqual([]);
    expect(missingHy).toEqual([]);
  });

  it("all leaf values are non-empty strings (no null/empty)", () => {
    const locales = [
      { name: "en", data: resources.en.translation },
      { name: "ru", data: resources.ru.translation },
      { name: "hy", data: resources.hy.translation },
    ] as const;

    const issues = locales.flatMap((l) => validateLeafValues(l.data).map((x) => `${l.name}.${x}`));

    expect(issues).toEqual([]);
  });
});
