import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAsyncItem, removeAsyncItem, setAsyncItem } from "../asyncStorage";

describe("asyncStorage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test("set/get/remove works", async () => {
    await setAsyncItem("k", "v");
    await expect(getAsyncItem("k")).resolves.toBe("v");

    await removeAsyncItem("k");
    await expect(getAsyncItem("k")).resolves.toBeNull();
  });
});
