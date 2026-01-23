import React from "react";
import { render, act } from "@testing-library/react-native";
import type { TFunction } from "i18next";

import { I18nBridge } from "../I18nBridge";
import { i18n } from "../i18n";
import type { SupportedLocale } from "../resources";

let mockLanguage: SupportedLocale = "en";

type AuthSlice = {
  auth: {
    language: SupportedLocale;
  };
};

jest.mock("../../store/hooks", () => ({
  useAppSelector: (selector: (s: AuthSlice) => unknown) =>
    selector({ auth: { language: mockLanguage } }),
}));

const mockT: TFunction = ((key: string, opts?: { defaultValue?: unknown }) => {
  if (opts?.defaultValue != null) return String(opts.defaultValue);
  return key;
}) as unknown as TFunction;

describe("i18n/I18nBridge", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    mockLanguage = "en";
  });

  it("does not call changeLanguage when i18n is not ready (isInitialized is falsy)", () => {
    const original = i18n.isInitialized;

    Object.defineProperty(i18n, "isInitialized", { value: false, configurable: true });

    const spy = jest.spyOn(i18n, "changeLanguage").mockResolvedValue(mockT);

    render(
      <I18nBridge>
        <></>
      </I18nBridge>,
    );

    expect(spy).not.toHaveBeenCalled();

    Object.defineProperty(i18n, "isInitialized", { value: original, configurable: true });
  });

  it("calls changeLanguage when store language differs from i18n.language", async () => {
    const original = i18n.isInitialized;

    Object.defineProperty(i18n, "isInitialized", { value: true, configurable: true });
    Object.defineProperty(i18n, "language", { value: "en", configurable: true });

    const spy = jest.spyOn(i18n, "changeLanguage").mockResolvedValue(mockT);

    const tree = render(
      <I18nBridge>
        <></>
      </I18nBridge>,
    );

    await act(async () => {
      mockLanguage = "ru";
      tree.rerender(
        <I18nBridge>
          <></>
        </I18nBridge>,
      );
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("ru");

    Object.defineProperty(i18n, "isInitialized", { value: original, configurable: true });
  });

  it("does not call changeLanguage when store language equals i18n.language", async () => {
    const original = i18n.isInitialized;

    Object.defineProperty(i18n, "isInitialized", { value: true, configurable: true });
    Object.defineProperty(i18n, "language", { value: "hy", configurable: true });
    mockLanguage = "hy";

    const spy = jest.spyOn(i18n, "changeLanguage").mockResolvedValue(mockT);

    const tree = render(
      <I18nBridge>
        <></>
      </I18nBridge>,
    );

    await act(async () => {
      tree.rerender(
        <I18nBridge>
          <></>
        </I18nBridge>,
      );
    });

    expect(spy).not.toHaveBeenCalled();

    Object.defineProperty(i18n, "isInitialized", { value: original, configurable: true });
  });
});
