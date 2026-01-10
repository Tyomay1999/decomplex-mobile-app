export {};

declare global {
  type ReactNativeFormDataFile = {
    uri: string;
    name: string;
    type: string;
  };

  interface FormData {
    append(name: string, value: string | Blob | File | ReactNativeFormDataFile): void;
    append(
      name: string,
      value: string | Blob | File | ReactNativeFormDataFile,
      fileName?: string,
    ): void;
  }
}
