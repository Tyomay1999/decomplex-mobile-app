import { notificationsReducer, notificationsActions } from "../notificationSlice";
import type { NotificationItem } from "../types";

type State = { queue: NotificationItem[] };

describe("notificationsSlice", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-20T00:00:00.000Z"));
    jest.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("push adds item with defaults", () => {
    const s0: State = { queue: [] };
    const s1 = notificationsReducer(s0, notificationsActions.push({ kind: "info", message: "m" }));

    expect(s1.queue.length).toBe(1);
    expect(s1.queue[0]?.kind).toBe("info");
    expect(s1.queue[0]?.message).toBe("m");
    expect(typeof s1.queue[0]?.id).toBe("string");
    expect(s1.queue[0]?.createdAt).toBe(Date.now());
    expect(s1.queue[0]?.durationMs).toBe(2500);
  });

  test("remove deletes by id", () => {
    const s0: State = {
      queue: [
        { id: "a", kind: "info", message: "m1", durationMs: 10, createdAt: 1 },
        { id: "b", kind: "info", message: "m2", durationMs: 10, createdAt: 2 },
      ],
    };

    const s1 = notificationsReducer(s0, notificationsActions.remove("a"));
    expect(s1.queue.map((x) => x.id)).toEqual(["b"]);
  });

  test("clear empties queue", () => {
    const s0: State = {
      queue: [{ id: "a", kind: "info", message: "m", durationMs: 10, createdAt: 1 }],
    };

    const s1 = notificationsReducer(s0, notificationsActions.clear());
    expect(s1.queue).toEqual([]);
  });

  test("push keeps only last 5 items", () => {
    let state: State = { queue: [] };

    for (let i = 1; i <= 7; i += 1) {
      state = notificationsReducer(
        state,
        notificationsActions.push({ kind: "info", message: `m${i}`, durationMs: 10 }),
      );
    }

    expect(state.queue.length).toBe(5);
    expect(state.queue.map((x) => x.message)).toEqual(["m3", "m4", "m5", "m6", "m7"]);
  });
});
