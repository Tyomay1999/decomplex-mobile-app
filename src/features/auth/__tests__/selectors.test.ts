import type { RootState } from "../../../store/store";
import {
  selectAuth,
  selectBootstrapped,
  selectUser,
  selectIsGuest,
  selectIsAuthed,
} from "../selectors";

type AuthShape = RootState["auth"];
type NotificationsShape = RootState["notifications"];

function makeNotifications(overrides?: Partial<NotificationsShape>): NotificationsShape {
  const base: NotificationsShape = {
    queue: [],
    ...(overrides ?? {}),
  } as NotificationsShape;

  return base;
}

function makeState(auth: Partial<AuthShape>): RootState {
  const baseAuth: AuthShape = {
    accessToken: null,
    refreshToken: null,
    fingerprintHash: null,
    user: null,
    language: "en",
    bootstrapped: false,
    forcedLogout: false,
    ...auth,
  };

  return {
    auth: baseAuth,
    notifications: makeNotifications(),
    api: {} as RootState["api"],
  } as RootState;
}

describe("auth selectors", () => {
  it("selectAuth returns auth slice", () => {
    const s = makeState({ bootstrapped: true });
    expect(selectAuth(s)).toBe(s.auth);
  });

  it("selectBootstrapped returns flag", () => {
    const s1 = makeState({ bootstrapped: false });
    const s2 = makeState({ bootstrapped: true });
    expect(selectBootstrapped(s1)).toBe(false);
    expect(selectBootstrapped(s2)).toBe(true);
  });

  it("selectUser returns user", () => {
    const s = makeState({ user: { id: "1", email: "a@b.com" } });
    expect(selectUser(s)?.id).toBe("1");
  });

  it("selectIsGuest true when bootstrapped and no user", () => {
    const s = makeState({ bootstrapped: true, user: null });
    expect(selectIsGuest(s)).toBe(true);
    expect(selectIsAuthed(s)).toBe(false);
  });

  it("selectIsAuthed true when bootstrapped and has user", () => {
    const s = makeState({ bootstrapped: true, user: { id: "1", email: "a@b.com" } });
    expect(selectIsAuthed(s)).toBe(true);
    expect(selectIsGuest(s)).toBe(false);
  });

  it("both false when not bootstrapped", () => {
    const s = makeState({ bootstrapped: false, user: null });
    expect(selectIsGuest(s)).toBe(false);
    expect(selectIsAuthed(s)).toBe(false);
  });
});
