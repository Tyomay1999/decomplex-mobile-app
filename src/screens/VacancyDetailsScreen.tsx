import React, { useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as DocumentPicker from "expo-document-picker";
import { useTranslation } from "react-i18next";

import { ThemeContext } from "../app/ThemeProvider";
import type { RootStackParamList } from "../navigation/RootNavigator";
import {
  useApplyToVacancyMutation,
  useGetVacancyByIdQuery,
} from "../features/vacancies/vacanciesApi";

type VacancyDetailsRoute = RouteProp<RootStackParamList, "VacancyDetails">;

function shortId(id: string, take = 6) {
  if (!id) return "";
  return `${id.slice(0, take)}…`;
}

function safeText(v: unknown, fallback = "—"): string {
  if (typeof v === "string" && v.trim().length > 0) return v;
  return fallback;
}

function formatPosted(createdAt?: string | null): string {
  if (!createdAt) return "—";
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

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

type BackendErrorResponse = {
  error?: {
    message?: string;
  };
};

function getBackendErrorMessage(err: unknown): string | null {
  if (typeof err !== "object" || err === null) return null;

  if ("data" in err) {
    const data = (err as { data?: BackendErrorResponse }).data;
    if (typeof data?.error?.message === "string") return data.error.message;
  }

  return null;
}

async function buildApplyFormData(params: {
  coverLetter?: string;
  file: { uri: string; name: string; type: string };
}): Promise<FormData> {
  const form = new FormData();

  if (typeof params.coverLetter === "string" && params.coverLetter.trim().length > 0) {
    form.append("coverLetter", params.coverLetter.trim());
  }

  if (Platform.OS === "web") {
    const resp = await fetch(params.file.uri);
    const blob = await resp.blob();

    const webFile = new File([blob], params.file.name, {
      type: params.file.type || blob.type || "application/octet-stream",
    });

    form.append("file", webFile);
  } else {
    form.append("file", {
      uri: params.file.uri,
      name: params.file.name,
      type: params.file.type || "application/octet-stream",
    });
  }

  return form;
}

export function VacancyDetailsScreen(): React.JSX.Element {
  const { t } = useTranslation();

  const themeCtx = useContext(ThemeContext);
  const theme = themeCtx?.theme;

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<VacancyDetailsRoute>();
  const { vacancyId } = route.params;

  const { data, isLoading, isError, refetch, isFetching } = useGetVacancyByIdQuery(vacancyId);

  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [applyToVacancy, applyState] = useApplyToVacancyMutation();

  const salaryLabel = useMemo(() => {
    const from = data?.salaryFrom ?? null;
    const to = data?.salaryTo ?? null;

    if (from == null && to == null) return t("vacancy.salaryNotSpecified");
    if (from != null && to != null) return t("vacancy.salaryRange", { from, to });
    if (from != null) return t("vacancy.salaryFrom", { from });
    return t("vacancy.salaryTo", { to });
  }, [data?.salaryFrom, data?.salaryTo, t]);

  const jobTypeLabel = useMemo(() => {
    const jt = data?.jobType ?? null;
    if (!jt) return t("vacancy.jobTypeNotSpecified");
    return t(`vacancy.jobType_${jt}`, jt);
  }, [data?.jobType, t]);

  const locationLabel = useMemo(() => {
    return data?.location?.trim() ? data.location : t("vacancy.locationNotSpecified");
  }, [data?.location, t]);

  const postedLabel = useMemo(() => {
    const date = formatPosted(data?.createdAt ?? null);
    if (date === "—") return date;
    return t("vacancy.postedDate", { date });
  }, [data?.createdAt, t]);

  const tags = useMemo(() => {
    const items: { key: string; label: string }[] = [];
    items.push({ key: "loc", label: `📍 ${locationLabel}` });
    items.push({ key: "type", label: `💼 ${jobTypeLabel}` });
    items.push({ key: "salary", label: `💰 ${salaryLabel}` });
    if (postedLabel !== "—") items.push({ key: "posted", label: `🕒 ${postedLabel}` });
    return items;
  }, [locationLabel, jobTypeLabel, salaryLabel, postedLabel]);

  const openApply = () => {
    setCoverLetter("");
    setPickedFile(null);
    setFormError(null);
    setApplyOpen(true);
  };

  const closeApply = () => {
    setApplyOpen(false);
    setFormError(null);
    Keyboard.dismiss();
  };

  const pickResume = async () => {
    setFormError(null);
    Keyboard.dismiss();

    const res = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (res.canceled) return;

    const asset = res.assets?.[0];
    if (!asset?.uri) return;

    const name = asset.name || "resume";
    const mimeType = asset.mimeType || "application/octet-stream";

    const maxBytes = 5 * 1024 * 1024;
    const size = typeof asset.size === "number" ? asset.size : undefined;

    if (typeof size === "number" && size > maxBytes) {
      setFormError(t("vacancy.fileTooLarge"));
      return;
    }

    setPickedFile({
      uri: asset.uri,
      name,
      type: mimeType,
      size,
    });
  };

  const removeResume = () => {
    setPickedFile(null);
    setFormError(null);
  };

  const submitApply = async () => {
    setFormError(null);

    if (!pickedFile) {
      setFormError(t("vacancy.cvRequired"));
      return;
    }

    try {
      const formData = await buildApplyFormData({
        coverLetter: coverLetter.trim() || undefined,
        file: pickedFile,
      });

      await applyToVacancy({ vacancyId, formData }).unwrap();

      closeApply();
      setCoverLetter("");
      setPickedFile(null);
      refetch();
    } catch (e: unknown) {
      const backendMsg = getBackendErrorMessage(e);
      setFormError(backendMsg ?? t("vacancy.submitFailed"));
    }
  };

  if (!theme) return <View style={{ flex: 1 }} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.statusBar, { backgroundColor: theme.surface }]} />

      <View
        style={[styles.topBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: pressed ? theme.background : "transparent" },
          ]}
        >
          <Text style={{ fontSize: 22, color: theme.textPrimary }}>‹</Text>
        </Pressable>

        <Text style={[styles.topTitle, { color: theme.textPrimary }]}>
          {t("vacancy.actionsDetails")}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.textSecondary }}>{t("common.loading")}</Text>
        </View>
      ) : isError ? (
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.textSecondary }}>{t("common.error")}</Text>
          <Pressable onPress={refetch} style={{ marginTop: 10 }}>
            <Text style={{ color: theme.textPrimary, fontWeight: "700" }}>{t("common.retry")}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
            <View
              style={[
                styles.detailHeader,
                { backgroundColor: theme.surface, borderBottomColor: theme.border },
              ]}
            >
              <Text style={[styles.detailTitle, { color: theme.textPrimary }]} numberOfLines={3}>
                {safeText(data?.title, "Untitled vacancy")}
              </Text>

              <Text style={[styles.detailCompany, { color: theme.textSecondary }]}>
                {data?.companyId
                  ? `${t("vacancy.companyLabel")}: ${shortId(data.companyId)}`
                  : t("vacancy.companyNotSpecified")}
              </Text>

              <View style={styles.tagsWrap}>
                {tags.map((x) => (
                  <View
                    key={x.key}
                    style={[
                      styles.tag,
                      { borderColor: theme.border, backgroundColor: theme.background },
                    ]}
                  >
                    <Text style={{ color: theme.textSecondary, fontWeight: "600", fontSize: 12 }}>
                      {x.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.section, { borderBottomColor: theme.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>
                {t("vacancy.descriptionTitle")}
              </Text>
              <Text style={[styles.sectionText, { color: theme.textPrimary }]}>
                {safeText(data?.description, t("vacancy.descriptionNotProvided"))}
              </Text>
            </View>

            <View style={[styles.section, { borderBottomColor: theme.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>
                {t("vacancy.detailsTitle")}
              </Text>

              <Text style={[styles.sectionText, { color: theme.textPrimary }]}>
                {t("vacancy.statusLabel")}: {safeText(data?.status, "—")}
                {"\n"}
                {t("vacancy.postedLabel")}: {formatPosted(data?.createdAt ?? null)}
                {"\n"}
                {t("vacancy.updatedLabel")}: {data?.updatedAt ? formatPosted(data.updatedAt) : "—"}
              </Text>
            </View>

            {isFetching ? (
              <View style={{ padding: 16 }}>
                <Text style={{ color: theme.textSecondary }}>{t("common.updating")}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View
            style={[
              styles.sticky,
              { borderTopColor: theme.border, backgroundColor: theme.surface },
            ]}
          >
            <Pressable
              onPress={openApply}
              style={({ pressed }) => [
                styles.applyBtn,
                { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Text style={[styles.applyBtnText, { color: theme.surface }]}>
                {t("vacancy.applyNow")}
              </Text>
            </Pressable>
          </View>
        </>
      )}

      <Modal visible={applyOpen} transparent animationType="fade" onRequestClose={closeApply}>
        <Pressable style={styles.modalOverlay} onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ width: "100%" }}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={[
                styles.modalCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  {t("vacancy.applyTitle")}
                </Text>

                <Pressable
                  onPress={closeApply}
                  style={({ pressed }) => [
                    styles.modalClose,
                    { backgroundColor: pressed ? theme.background : "transparent" },
                  ]}
                >
                  <Text style={{ fontSize: 20, color: theme.textSecondary }}>✕</Text>
                </Pressable>
              </View>

              <Text style={{ color: theme.textSecondary, marginBottom: 10 }}>
                {safeText(data?.title, "Vacancy")}
              </Text>

              <ScrollView
                keyboardShouldPersistTaps="always"
                keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
                contentContainerStyle={{ paddingBottom: 6 }}
                style={{ maxHeight: 520 }}
              >
                <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>
                  {t("vacancy.coverLetter")}
                </Text>

                <TextInput
                  value={coverLetter}
                  onChangeText={setCoverLetter}
                  placeholder={t("vacancy.coverLetterPlaceholder")}
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
                  ]}
                />

                <Text style={{ color: theme.textSecondary, marginTop: 8, fontSize: 12 }}>
                  {t("vacancy.coverLetterHint")}
                </Text>

                <View style={{ height: 18 }} />

                <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>
                  {t("vacancy.resumeCv")}
                </Text>

                {!pickedFile ? (
                  <Pressable
                    onPress={() => void pickResume()}
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
                      {t("vacancy.uploadResume")}
                    </Text>
                    <Text style={{ color: theme.textTertiary, marginTop: 4, fontSize: 12 }}>
                      {t("vacancy.uploadHint")}
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
                      onPress={removeResume}
                      style={({ pressed }) => [
                        styles.removeBtn,
                        { backgroundColor: pressed ? theme.surface : "transparent" },
                      ]}
                    >
                      <Text style={{ fontSize: 18, color: theme.textSecondary }}>✕</Text>
                    </Pressable>
                  </View>
                )}

                {formError ? (
                  <View
                    style={[
                      styles.errorBox,
                      { borderColor: theme.border, backgroundColor: theme.background },
                    ]}
                  >
                    <Text style={{ color: theme.textPrimary, fontWeight: "700" }}>{formError}</Text>
                  </View>
                ) : null}

                <View style={{ height: 18 }} />

                <Pressable
                  onPress={() => void submitApply()}
                  disabled={applyState.isLoading}
                  style={({ pressed }) => [
                    styles.submitBtn,
                    {
                      backgroundColor: theme.primary,
                      opacity: applyState.isLoading ? 0.6 : pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  {applyState.isLoading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={[styles.submitText, { color: theme.surface }]}>
                      {t("vacancy.submitApplication")}
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={closeApply}
                  style={({ pressed }) => [
                    styles.cancelBtn,
                    {
                      borderColor: theme.border,
                      backgroundColor: pressed ? theme.background : "transparent",
                    },
                  ]}
                >
                  <Text style={{ color: theme.textPrimary, fontWeight: "800" }}>
                    {t("common.cancel")}
                  </Text>
                </Pressable>
              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusBar: { height: 44 },

  topBar: {
    height: 56,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: { fontSize: 20, fontWeight: "600", letterSpacing: -0.3 },

  detailHeader: {
    padding: 20,
    borderBottomWidth: 1,
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  detailCompany: { marginTop: 10, fontSize: 15, opacity: 0.9 },

  tagsWrap: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  section: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 10,
  },
  sectionText: { fontSize: 16, lineHeight: 24, opacity: 0.95 },

  sticky: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  applyBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtnText: { fontSize: 17, fontWeight: "800" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 16,
    justifyContent: "center",
  },
  modalCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  modalTitle: { fontSize: 20, fontWeight: "800" },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  fieldLabel: { fontSize: 15, fontWeight: "800", marginBottom: 10 },

  textArea: {
    minHeight: 140,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    textAlignVertical: "top",
  },

  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },

  fileRow: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  errorBox: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },

  submitBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { fontSize: 17, fontWeight: "900" },

  cancelBtn: {
    marginTop: 10,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
