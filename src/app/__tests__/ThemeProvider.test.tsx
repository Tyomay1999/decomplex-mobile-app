import React from "react";
import { Text, Pressable } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";

import { ThemeProvider, ThemeContext } from "../ThemeProvider";

function Probe() {
  const ctx = React.useContext(ThemeContext);

  if (!ctx) return null;

  return (
    <>
      <Text>{ctx.themeName}</Text>
      <Pressable onPress={ctx.toggleTheme}>
        <Text>toggle</Text>
      </Pressable>
    </>
  );
}

describe("ThemeProvider", () => {
  test("toggleTheme switches light <-> dark", () => {
    const r = render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(r.getByText("light")).toBeTruthy();

    fireEvent.press(r.getByText("toggle"));
    expect(r.getByText("dark")).toBeTruthy();

    fireEvent.press(r.getByText("toggle"));
    expect(r.getByText("light")).toBeTruthy();
  });
});
