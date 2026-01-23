import React, { JSX, useEffect } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import type { Theme } from "../../../app/theme";
import type { TFunction } from "i18next";
import { applyModalStyles as styles } from "./styles";
import { webNoOutline } from "../../../shared/styles/web";

type PickedFile = {
  uri: string;
  name: string;
  type: string;
  size?: number;
};

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Props = {
  theme: Theme;
  t: TFunction;
  visible: boolean;
  onClose: () => void;
  vacancyTitle: string;

  coverLetter: string;
  onChangeCoverLetter: (v: string) => void;

  pickedFile: PickedFile | null;
  onPickResume: () => Promise<void>;
  onRemoveResume: () => void;

  error: string | null;

  onSubmit: () => Promise<void>;
  submitting: boolean;

  submitLabel: string;
  cancelLabel: string;

  coverLabel: string;
  coverPlaceholder: string;
  coverHint: string;

  resumeLabel: string;
  uploadLabel: string;
  uploadHint: string;
};

export function ApplyModal(props: Props): JSX.Element {
  const {
    theme,
    t,
    visible,
    onClose,
    vacancyTitle,
    coverLetter,
    onChangeCoverLetter,
    pickedFile,
    onPickResume,
    onRemoveResume,
    error,
    onSubmit,
    submitting,
    submitLabel,
    cancelLabel,
    coverLabel,
    coverPlaceholder,
    coverHint,
    resumeLabel,
    uploadLabel,
    uploadHint,
  } = props;

  useEffect(() => {
    if (visible) Keyboard.dismiss();
  }, [visible]);

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleOverlayPress = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    await onSubmit();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable testID="applyModal.root" style={styles.overlay} onPress={handleOverlayPress}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: "100%" }}
        >
          <Pressable
            testID="applyModal.card"
            onPress={(e) => e.stopPropagation()}
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                {t("vacancy.applyTitle")}
              </Text>

              <Pressable
                testID="applyModal.close"
                onPress={handleClose}
                disabled={submitting}
                style={({ pressed }) => [
                  styles.close,
                  { backgroundColor: pressed ? theme.background : "transparent" },
                ]}
              >
                <Text style={{ fontSize: 20, color: theme.textSecondary }}>✕</Text>
              </Pressable>
            </View>

            <Text style={{ color: theme.textSecondary, marginBottom: 10 }}>{vacancyTitle}</Text>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
              contentContainerStyle={{ paddingBottom: 6 }}
              style={{ maxHeight: 520 }}
            >
              <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>{coverLabel}</Text>

              <TextInput
                testID="applyModal.cover"
                value={coverLetter}
                onChangeText={onChangeCoverLetter}
                placeholder={coverPlaceholder}
                placeholderTextColor={theme.textTertiary}
                multiline
                textAlignVertical="top"
                style={[
                  styles.textArea,
                  {
                    borderColor: theme.border,
                    color: theme.textPrimary,
                    backgroundColor: theme.background,
                  },
                  webNoOutline,
                ]}
                autoCorrect={false}
                autoCapitalize="sentences"
                blurOnSubmit={false}
              />

              <Text style={{ color: theme.textSecondary, marginTop: 8, fontSize: 12 }}>
                {coverHint}
              </Text>

              <View style={{ height: 18 }} />

              <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>{resumeLabel}</Text>

              {!pickedFile ? (
                <Pressable
                  testID="applyModal.pick"
                  onPress={() => void onPickResume()}
                  style={({ pressed }) => [
                    styles.uploadBox,
                    {
                      borderColor: theme.border,
                      backgroundColor: pressed ? theme.background : "transparent",
                    },
                  ]}
                >
                  <Text style={{ fontSize: 26, opacity: 0.7 }}>📎</Text>
                  <Text style={{ color: theme.textSecondary, fontWeight: "700", marginTop: 6 }}>
                    {uploadLabel}
                  </Text>
                  <Text style={{ color: theme.textTertiary, marginTop: 4, fontSize: 12 }}>
                    {uploadHint}
                  </Text>
                </Pressable>
              ) : (
                <View
                  style={[
                    styles.fileRow,
                    { borderColor: theme.border, backgroundColor: theme.background },
                  ]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                    <Text style={{ fontSize: 26 }}>📄</Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{ color: theme.textPrimary, fontWeight: "800" }}
                        numberOfLines={1}
                      >
                        {pickedFile.name}
                      </Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                        {formatFileSize(pickedFile.size)}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    testID="applyModal.removeFile"
                    onPress={() => {
                      Keyboard.dismiss();
                      onRemoveResume();
                    }}
                    style={({ pressed }) => [
                      styles.removeBtn,
                      { backgroundColor: pressed ? theme.surface : "transparent" },
                    ]}
                  >
                    <Text style={{ fontSize: 18, color: theme.textSecondary }}>✕</Text>
                  </Pressable>
                </View>
              )}

              {error ? (
                <View
                  testID="applyModal.errorBox"
                  style={[
                    styles.errorBox,
                    { borderColor: theme.border, backgroundColor: theme.background },
                  ]}
                >
                  <Text style={{ color: theme.textPrimary, fontWeight: "700" }}>{error}</Text>
                </View>
              ) : null}

              <View style={{ height: 18 }} />

              <Pressable
                testID="applyModal.submit"
                onPress={() => void handleSubmit()}
                disabled={submitting}
                style={({ pressed }) => [
                  styles.submitBtn,
                  { backgroundColor: theme.primary, opacity: submitting ? 0.6 : pressed ? 0.9 : 1 },
                ]}
              >
                {submitting ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={[styles.submitText, { color: theme.surface }]}>{submitLabel}</Text>
                )}
              </Pressable>

              <Pressable
                testID="applyModal.cancel"
                onPress={handleClose}
                disabled={submitting}
                style={({ pressed }) => [
                  styles.cancelBtn,
                  {
                    borderColor: theme.border,
                    backgroundColor: pressed ? theme.background : "transparent",
                  },
                ]}
              >
                <Text style={{ color: theme.textPrimary, fontWeight: "800" }}>{cancelLabel}</Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
