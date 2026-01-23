import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Keyboard } from "react-native";

import { HomeSearchBar } from "../HomeSearchBar";

describe("HomeSearchBar", () => {
  const theme = {
    surface: "#fff",
    border: "#eee",
    background: "#fafafa",
    textPrimary: "#111",
    textSecondary: "#555",
    textTertiary: "#999",
  };

  test("renders search input with value and placeholder", () => {
    const ui = render(
      <HomeSearchBar
        value="dev"
        onChange={jest.fn()}
        placeholder="Search jobs"
        onOpenFilters={jest.fn()}
        theme={theme}
      />,
    );

    const input = ui.getByTestId("home.search.input");

    expect(input.props.value).toBe("dev");
    expect(input.props.placeholder).toBe("Search jobs");
  });

  test("calls onChange when typing", () => {
    const onChange = jest.fn();

    const ui = render(
      <HomeSearchBar
        value=""
        onChange={onChange}
        placeholder="Search"
        onOpenFilters={jest.fn()}
        theme={theme}
      />,
    );

    fireEvent.changeText(ui.getByTestId("home.search.input"), "react");

    expect(onChange).toHaveBeenCalledWith("react");
  });

  test("dismisses keyboard on submit editing", () => {
    const dismissSpy = jest.spyOn(Keyboard, "dismiss").mockImplementation(() => undefined);

    const ui = render(
      <HomeSearchBar
        value=""
        onChange={jest.fn()}
        placeholder="Search"
        onOpenFilters={jest.fn()}
        theme={theme}
      />,
    );

    fireEvent(ui.getByTestId("home.search.input"), "submitEditing");

    expect(dismissSpy).toHaveBeenCalledTimes(1);

    dismissSpy.mockRestore();
  });

  test("opens filters and dismisses keyboard", () => {
    const onOpenFilters = jest.fn();
    const dismissSpy = jest.spyOn(Keyboard, "dismiss").mockImplementation(() => undefined);

    const ui = render(
      <HomeSearchBar
        value=""
        onChange={jest.fn()}
        placeholder="Search"
        onOpenFilters={onOpenFilters}
        theme={theme}
      />,
    );

    fireEvent.press(ui.getByTestId("home.filters.open"));

    expect(dismissSpy).toHaveBeenCalledTimes(1);
    expect(onOpenFilters).toHaveBeenCalledTimes(1);

    dismissSpy.mockRestore();
  });
});
