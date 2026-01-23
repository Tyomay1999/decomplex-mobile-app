import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Animated } from "react-native";
import type { TFunction } from "i18next";

import { FiltersSheet } from "../FiltersSheet";

const mockT: TFunction = ((key: string, opts?: { defaultValue?: unknown; count?: number }) => {
  if (opts?.defaultValue != null) return String(opts.defaultValue);
  return key;
}) as unknown as TFunction;

describe("FiltersSheet", () => {
  test("renders title and closes by overlay and close button", () => {
    const onClose = jest.fn();

    const ui = render(
      <FiltersSheet
        visible
        onClose={onClose}
        sheetAnim={new Animated.Value(1)}
        sheetHeight={400}
        t={mockT}
        title="Filters"
        jobTypeLabel="Job type"
        options={[{ key: "all", value: null, label: "All" }]}
        value={null}
        onChange={jest.fn()}
        salaryOnly={false}
        onToggleSalaryOnly={jest.fn()}
        newOnly={false}
        onToggleNewOnly={jest.fn()}
        resetLabel="Reset"
        applyLabel="Apply"
        onReset={jest.fn()}
        onApply={jest.fn()}
        theme={{
          surface: "#fff",
          border: "#eee",
          background: "#fafafa",
          primary: "#00f",
          textPrimary: "#111",
          textSecondary: "#555",
          textTertiary: "#999",
        }}
      />,
    );

    expect(ui.getByTestId("home.filters.title").props.children).toBe("Filters");

    fireEvent.press(ui.getByTestId("home.filters.close"));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.press(ui.getByTestId("home.filters.overlay"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  test("toggles salaryOnly and newOnly and selects jobType option", () => {
    const onChange = jest.fn();
    const onToggleSalaryOnly = jest.fn();
    const onToggleNewOnly = jest.fn();

    const ui = render(
      <FiltersSheet
        visible
        onClose={jest.fn()}
        sheetAnim={new Animated.Value(1)}
        sheetHeight={400}
        t={mockT}
        title="Filters"
        jobTypeLabel="Job type"
        options={[
          { key: "all", value: null, label: "All" },
          { key: "remote", value: "remote", label: "Remote" },
        ]}
        value={null}
        onChange={onChange}
        salaryOnly={false}
        onToggleSalaryOnly={onToggleSalaryOnly}
        newOnly={false}
        onToggleNewOnly={onToggleNewOnly}
        resetLabel="Reset"
        applyLabel="Apply"
        onReset={jest.fn()}
        onApply={jest.fn()}
        theme={{
          surface: "#fff",
          border: "#eee",
          background: "#fafafa",
          primary: "#00f",
          textPrimary: "#111",
          textSecondary: "#555",
          textTertiary: "#999",
        }}
      />,
    );

    fireEvent.press(ui.getByTestId("home.filters.jobType.remote"));
    expect(onChange).toHaveBeenCalledWith("remote");

    fireEvent.press(ui.getByTestId("home.filters.salaryOnly"));
    expect(onToggleSalaryOnly).toHaveBeenCalledTimes(1);

    fireEvent.press(ui.getByTestId("home.filters.newOnly"));
    expect(onToggleNewOnly).toHaveBeenCalledTimes(1);
  });

  test("apply button respects applyDisabled", () => {
    const onApply = jest.fn();

    const ui = render(
      <FiltersSheet
        visible
        onClose={jest.fn()}
        sheetAnim={new Animated.Value(1)}
        sheetHeight={400}
        t={mockT}
        title="Filters"
        jobTypeLabel="Job type"
        options={[{ key: "all", value: null, label: "All" }]}
        value={null}
        onChange={jest.fn()}
        salaryOnly={false}
        onToggleSalaryOnly={jest.fn()}
        newOnly={false}
        onToggleNewOnly={jest.fn()}
        resetLabel="Reset"
        applyLabel="Apply"
        onReset={jest.fn()}
        onApply={onApply}
        applyDisabled
        theme={{
          surface: "#fff",
          border: "#eee",
          background: "#fafafa",
          primary: "#00f",
          textPrimary: "#111",
          textSecondary: "#555",
          textTertiary: "#999",
        }}
      />,
    );

    expect(ui.getByTestId("home.filters.apply").props.accessibilityState?.disabled).toBe(true);

    fireEvent.press(ui.getByTestId("home.filters.apply"));
    expect(onApply).toHaveBeenCalledTimes(0);
  });
});
