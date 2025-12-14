import AsyncStorage from "@react-native-async-storage/async-storage";

export async function setAsyncItem(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

export async function getAsyncItem(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

export async function removeAsyncItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
