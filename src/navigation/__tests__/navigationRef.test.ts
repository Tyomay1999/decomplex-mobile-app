type ResetArg = { index: number; routes: Array<{ name: string }> };

const mockIsReady = jest.fn<boolean, []>();
const mockReset = jest.fn<void, [ResetArg]>();

function loadModule() {
  jest.resetModules();

  jest.doMock("@react-navigation/native", () => ({
    createNavigationContainerRef: () => ({
      isReady: mockIsReady,
      reset: mockReset,
    }),
  }));

  return require("../navigationRef") as {
    resetToLogin: () => void;
  };
}

describe("navigation/navigationRef", () => {
  beforeEach(() => {
    mockIsReady.mockReset();
    mockReset.mockReset();
  });

  it("resetToLogin does nothing if navigation is not ready", () => {
    const { resetToLogin } = loadModule();

    mockIsReady.mockReturnValue(false);

    resetToLogin();

    expect(mockReset).not.toHaveBeenCalled();
  });

  it("resetToLogin resets navigation to Login if ready", () => {
    const { resetToLogin } = loadModule();

    mockIsReady.mockReturnValue(true);

    resetToLogin();

    expect(mockReset).toHaveBeenCalledTimes(1);
    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: "Login" }],
    });
  });
});
