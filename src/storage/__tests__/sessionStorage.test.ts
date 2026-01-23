import * as secure from "../secureStorage";
import * as asyncS from "../asyncStorage";
import { clearSession, loadSession, persistSession } from "../sessionStorage";

beforeEach(() => {
  jest.spyOn(secure, "getSecureItem").mockResolvedValue(null);
  jest.spyOn(asyncS, "getAsyncItem").mockResolvedValue(null);
  jest.spyOn(secure, "setSecureItem").mockResolvedValue(undefined);
  jest.spyOn(secure, "removeSecureItem").mockResolvedValue(undefined);
  jest.spyOn(asyncS, "setAsyncItem").mockResolvedValue(undefined);
  jest.spyOn(asyncS, "removeAsyncItem").mockResolvedValue(undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("sessionStorage", () => {
  test("loadSession returns defaults when storage is empty", async () => {
    const s = await loadSession();

    expect(s).toEqual({
      accessToken: null,
      refreshToken: null,
      fingerprintHash: null,
      language: "en",
    });
  });

  test("persistSession with language does not touch secure storage", async () => {
    await persistSession({ language: "en" });

    expect(secure.setSecureItem).not.toHaveBeenCalled();
    expect(secure.removeSecureItem).not.toHaveBeenCalled();
    expect(asyncS.setAsyncItem).toHaveBeenCalledTimes(1);
  });

  test("clearSession removes everything", async () => {
    await clearSession();

    expect(secure.removeSecureItem).toHaveBeenCalledTimes(3);
    expect(asyncS.removeAsyncItem).toHaveBeenCalledTimes(1);
  });
});
