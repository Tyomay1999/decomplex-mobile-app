type AsyncStorageShape = {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
  clear?: () => Promise<void>;
};

type SecureStoreShape = {
  setItemAsync: (key: string, value: string, options?: unknown) => Promise<void>;
  getItemAsync: (key: string) => Promise<string | null>;
  deleteItemAsync: (key: string) => Promise<void>;
};

function pickDefault<T>(mod: unknown): T {
  if (mod && typeof mod === "object" && "default" in mod) {
    return (mod as { default: T }).default;
  }
  return mod as T;
}

describe("secureStorage web", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.doMock("react-native", () => ({
      Platform: { OS: "web" },
    }));
  });

  test("uses AsyncStorage", async () => {
    const asyncStorageRaw: unknown = require("@react-native-async-storage/async-storage");
    const AsyncStorage = pickDefault<AsyncStorageShape>(asyncStorageRaw);

    const mod: typeof import("../secureStorage") = require("../secureStorage");

    const setSpy = jest.spyOn(AsyncStorage, "setItem");
    const getSpy = jest.spyOn(AsyncStorage, "getItem");
    const removeSpy = jest.spyOn(AsyncStorage, "removeItem");

    await mod.setSecureItem("k", "v");
    await mod.getSecureItem("k");
    await mod.removeSecureItem("k");

    expect(setSpy).toHaveBeenCalled();
    expect(getSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
  });
});

describe("secureStorage native", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.doMock("react-native", () => ({
      Platform: { OS: "ios" },
    }));
  });

  test("uses SecureStore", async () => {
    const secureStoreRaw: unknown = require("expo-secure-store");
    const SecureStore = pickDefault<SecureStoreShape>(secureStoreRaw);

    const mod: typeof import("../secureStorage") = require("../secureStorage");

    const setSpy = jest.spyOn(SecureStore, "setItemAsync");
    const getSpy = jest.spyOn(SecureStore, "getItemAsync");
    const delSpy = jest.spyOn(SecureStore, "deleteItemAsync");

    await mod.setSecureItem("k", "v");
    await mod.getSecureItem("k");
    await mod.removeSecureItem("k");

    expect(setSpy).toHaveBeenCalled();
    expect(getSpy).toHaveBeenCalled();
    expect(delSpy).toHaveBeenCalled();
  });
});
