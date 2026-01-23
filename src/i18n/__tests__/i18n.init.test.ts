import type { Callback, InitOptions, TFunction } from "i18next";

import type { SupportedLocale } from "../resources";
import { initI18n, i18n } from "../i18n";

describe("i18n/initI18n", () => {
  const originalIsInitialized = Object.getOwnPropertyDescriptor(i18n, "isInitialized");
  const originalLanguage = Object.getOwnPropertyDescriptor(i18n, "language");

  let lastInitOptions: InitOptions<unknown> | undefined;

  const mockT: TFunction = ((key: string) => key) as TFunction;

  beforeEach(() => {
    jest.restoreAllMocks();
    lastInitOptions = undefined;

    Object.defineProperty(i18n, "isInitialized", {
      value: false,
      configurable: true,
      writable: true,
    });

    Object.defineProperty(i18n, "language", {
      value: "en",
      configurable: true,
      writable: true,
    });

    jest.spyOn(i18n, "use").mockReturnValue(i18n);

    jest
      .spyOn(i18n, "init")
      .mockImplementation((opts?: InitOptions<unknown>, callback?: Callback) => {
        lastInitOptions = opts;

        const lng = typeof opts?.lng === "string" ? opts.lng : "en";

        Object.defineProperty(i18n, "language", {
          value: lng,
          configurable: true,
          writable: true,
        });

        Object.defineProperty(i18n, "isInitialized", {
          value: true,
          configurable: true,
          writable: true,
        });

        if (typeof callback === "function") {
          callback(null, mockT);
        }

        return Promise.resolve(mockT) as ReturnType<typeof i18n.init>;
      });
  });

  afterAll(() => {
    if (originalIsInitialized) {
      Object.defineProperty(i18n, "isInitialized", originalIsInitialized);
    }
    if (originalLanguage) {
      Object.defineProperty(i18n, "language", originalLanguage);
    }
  });

  it("initializes i18n only once (idempotent)", () => {
    const initSpy = jest.spyOn(i18n, "init");

    initI18n("en");
    initI18n("ru");

    expect(i18n.isInitialized).toBe(true);
    expect(initSpy).toHaveBeenCalledTimes(1);
  });

  it("sets initial language correctly", () => {
    initI18n("ru");

    expect(i18n.isInitialized).toBe(true);
    expect(i18n.language).toBe("ru");
  });

  it("keeps expected configuration (fallback, null/empty handling)", () => {
    initI18n("hy");

    expect(lastInitOptions?.fallbackLng).toBe("en");
    expect(lastInitOptions?.defaultNS).toBe("translation");
    expect(lastInitOptions?.interpolation?.escapeValue).toBe(false);
    expect(lastInitOptions?.returnNull).toBe(false);
    expect(lastInitOptions?.returnEmptyString).toBe(false);
    expect(lastInitOptions?.compatibilityJSON).toBe("v4");
  });

  it("supports all declared locales", () => {
    const locales: SupportedLocale[] = ["en", "ru", "hy"];

    for (const lng of locales) {
      Object.defineProperty(i18n, "isInitialized", {
        value: false,
        configurable: true,
        writable: true,
      });

      Object.defineProperty(i18n, "language", {
        value: "en",
        configurable: true,
        writable: true,
      });

      initI18n(lng);

      expect(i18n.language).toBe(lng);
    }
  });
});
