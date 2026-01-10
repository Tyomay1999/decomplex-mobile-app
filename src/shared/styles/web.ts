import { Platform } from "react-native";
import type { TextStyle } from "react-native";

export const webNoOutline: TextStyle | undefined =
  Platform.OS === "web"
    ? ({
        outlineWidth: 0,
        outlineColor: "transparent",
      } as TextStyle)
    : undefined;
