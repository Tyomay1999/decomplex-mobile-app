import React from "react";
import { fireEvent } from "@testing-library/react-native";
import type { TFunction } from "i18next";

import { renderWithProviders } from "../../../../test/render";
import { ApplyModal } from "../ApplyModal";

import type { Theme } from "../../../../app/theme";

type PickedFile = { uri: string; name: string; type: string; size?: number };

const t: TFunction = ((key: string) => key) as unknown as TFunction;

function makeTheme(): Theme {
  return {
    name: "light",
    surface: "#ffffff",
    border: "rgba(0,0,0,0.12)",
    background: "#f5f5f5",
    primary: "#3b82f6",
    textPrimary: "#111111",
    textSecondary: "#666666",
    textTertiary: "#999999",
    divider: "#E5E5E5",
  };
}

function baseProps(overrides?: Partial<React.ComponentProps<typeof ApplyModal>>) {
  const theme = makeTheme();

  const props: React.ComponentProps<typeof ApplyModal> = {
    theme,
    t,
    visible: true,
    onClose: () => undefined,
    vacancyTitle: "Vacancy",

    coverLetter: "",
    onChangeCoverLetter: () => undefined,

    pickedFile: null,
    onPickResume: async () => undefined,
    onRemoveResume: () => undefined,

    error: null,

    onSubmit: async () => undefined,
    submitting: false,

    submitLabel: "Submit",
    cancelLabel: "Cancel",

    coverLabel: "Cover letter",
    coverPlaceholder: "Type...",
    coverHint: "Hint",

    resumeLabel: "Resume",
    uploadLabel: "Upload",
    uploadHint: "PDF only",
  };

  return { ...props, ...(overrides ?? {}) };
}

test("renders modal root when visible=true", () => {
  const { getByTestId } = renderWithProviders(<ApplyModal {...baseProps()} />);
  expect(getByTestId("applyModal.root")).toBeTruthy();
  expect(getByTestId("applyModal.card")).toBeTruthy();
});

test("pressing cancel calls onClose", () => {
  const onClose = jest.fn<void, []>();
  const { getByTestId } = renderWithProviders(<ApplyModal {...baseProps({ onClose })} />);
  fireEvent.press(getByTestId("applyModal.cancel"));
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("pressing submit calls onSubmit", async () => {
  const onSubmit = jest.fn<Promise<void>, []>(async () => undefined);
  const { getByTestId } = renderWithProviders(<ApplyModal {...baseProps({ onSubmit })} />);
  fireEvent.press(getByTestId("applyModal.submit"));
  expect(onSubmit).toHaveBeenCalledTimes(1);
});

test("when pickedFile=null shows pick button, pressing it calls onPickResume", () => {
  const onPickResume = jest.fn<Promise<void>, []>(async () => undefined);
  const { getByTestId } = renderWithProviders(
    <ApplyModal {...baseProps({ pickedFile: null, onPickResume })} />,
  );
  fireEvent.press(getByTestId("applyModal.pick"));
  expect(onPickResume).toHaveBeenCalledTimes(1);
});

test("when pickedFile exists shows remove button, pressing it calls onRemoveResume", () => {
  const onRemoveResume = jest.fn<void, []>();
  const file: PickedFile = { uri: "file://1", name: "cv.pdf", type: "application/pdf", size: 1234 };

  const { getByTestId } = renderWithProviders(
    <ApplyModal {...baseProps({ pickedFile: file, onRemoveResume })} />,
  );

  fireEvent.press(getByTestId("applyModal.removeFile"));
  expect(onRemoveResume).toHaveBeenCalledTimes(1);
});

test("when error is provided renders error box", () => {
  const { getByTestId } = renderWithProviders(<ApplyModal {...baseProps({ error: "Error" })} />);
  expect(getByTestId("applyModal.errorBox")).toBeTruthy();
});
