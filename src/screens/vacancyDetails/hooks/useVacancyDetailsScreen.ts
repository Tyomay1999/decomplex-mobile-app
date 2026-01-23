import { useCallback, useContext, useMemo, useState, useEffect } from "react";
import { Keyboard, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as DocumentPicker from "expo-document-picker";
import { useTranslation } from "react-i18next";

import { ThemeContext } from "../../../app/ThemeProvider";
import type { Theme } from "../../../app/theme";
import type { RootStackParamList } from "../../../navigation/types";
import { notificationsActions } from "../../../ui/notifications";
import { useAppDispatch } from "../../../store/hooks";
import {
  useApplyToVacancyMutation,
  useGetVacancyByIdQuery,
} from "../../../features/vacancies/vacanciesApi";
import type { VacancyDto } from "../../../features/vacancies/vacanciesTypes";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type VacancyDetailsRoute = RouteProp<RootStackParamList, "VacancyDetails">;

type PickedFile = {
  uri: string;
  name: string;
  type: string;
  size?: number;
};

type BackendErrorResponse = { error?: { message?: string } };
type RNFormDataFile = { uri: string; name: string; type: string };

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getBackendErrorMessage(err: unknown): string | null {
  if (typeof err !== "object" || err === null) return null;

  if ("data" in err) {
    const data = (err as { data?: BackendErrorResponse }).data;
    if (typeof data?.error?.message === "string") return data.error.message;
  }

  return null;
}

function isAlreadyAppliedError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;

  const withStatus = err as { status?: unknown };
  const status = typeof withStatus.status === "number" ? withStatus.status : undefined;
  if (status === 409) return true;

  const msg = getBackendErrorMessage(err);
  if (!msg) return false;

  const s = msg.toLowerCase();
  return s.includes("already") && s.includes("appl");
}

async function buildApplyFormData(params: {
  coverLetter?: string;
  file: RNFormDataFile;
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
    const value: RNFormDataFile = {
      uri: params.file.uri,
      name: params.file.name,
      type: params.file.type || "application/octet-stream",
    };

    form.append("file", value as unknown as Blob);
  }

  return form;
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

export type UseVacancyDetailsScreen = {
  t: ReturnType<typeof useTranslation>["t"];
  theme: Theme | undefined;

  query: {
    isLoading: boolean;
    isError: boolean;
    isFetching: boolean;
  };

  vacancy: VacancyDto | undefined;
  refetch: () => void;

  goBack: () => void;

  tags: { key: string; label: string }[];

  applyOpen: boolean;
  openApply: () => void;
  closeApply: () => void;

  coverLetter: string;
  setCoverLetter: (v: string) => void;

  pickedFile: PickedFile | null;
  pickResume: () => Promise<void>;
  removeResume: () => void;

  formError: string | null;

  submitApply: () => Promise<void>;
  applyState: { isLoading: boolean };

  safeText: (v: unknown, fb?: string) => string;
  formatPosted: (v?: string | null) => string;

  formatStatus: (v?: unknown) => string;

  alreadyApplied: boolean;
  applyDisabled: boolean;
  formatFileSize: (bytes?: number) => string;
};

export function useVacancyDetailsScreen(): UseVacancyDetailsScreen {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const themeCtx = useContext(ThemeContext);
  const theme = themeCtx?.theme;

  const navigation = useNavigation<Nav>();
  const route = useRoute<VacancyDetailsRoute>();
  const { vacancyId } = route.params;

  const q = useGetVacancyByIdQuery(vacancyId);
  const vacancy = q.data as VacancyDto | undefined;

  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [appliedOnce, setAppliedOnce] = useState(false);

  useEffect(() => {
    setAppliedOnce(false);
  }, [vacancyId]);

  const [applyToVacancy, applyState] = useApplyToVacancyMutation();

  const alreadyAppliedFromVacancy = useMemo(() => {
    const v = vacancy;
    if (!v) return false;
    if (typeof v.applied === "boolean") return v.applied;
    if (typeof v.isApplied === "boolean") return v.isApplied;
    if (typeof v.hasApplied === "boolean") return v.hasApplied;
    if (typeof v.myApplicationId === "string" && v.myApplicationId.length > 0) return true;
    return false;
  }, [vacancy]);

  const alreadyApplied = useMemo(
    () => appliedOnce || alreadyAppliedFromVacancy,
    [appliedOnce, alreadyAppliedFromVacancy],
  );

  const applyDisabled = useMemo(
    () => applyState.isLoading || alreadyApplied,
    [applyState.isLoading, alreadyApplied],
  );

  const salaryLabel = useMemo(() => {
    const from = vacancy?.salaryFrom ?? null;
    const to = vacancy?.salaryTo ?? null;

    if (from == null && to == null) return t("vacancy.salaryNotSpecified");
    if (from != null && to != null) return t("vacancy.salaryRange", { from, to });
    if (from != null) return t("vacancy.salaryFrom", { from });
    return t("vacancy.salaryTo", { to });
  }, [t, vacancy?.salaryFrom, vacancy?.salaryTo]);

  const jobTypeLabel = useMemo(() => {
    const jt = vacancy?.jobType ?? null;
    if (!jt) return t("vacancy.jobTypeNotSpecified");
    return t(`vacancy.jobType_${jt}`, jt);
  }, [t, vacancy?.jobType]);

  const locationLabel = useMemo(() => {
    return vacancy?.location?.trim() ? vacancy.location : t("vacancy.locationNotSpecified");
  }, [t, vacancy?.location]);

  const postedLabel = useMemo(() => {
    const date = formatPosted(vacancy?.createdAt ?? null);
    if (date === "—") return date;
    return t("vacancy.postedDate", { date });
  }, [t, vacancy?.createdAt]);

  const tags = useMemo(() => {
    const items: { key: string; label: string }[] = [];
    items.push({ key: "loc", label: `📍 ${locationLabel}` });
    items.push({ key: "type", label: `💼 ${jobTypeLabel}` });
    items.push({ key: "salary", label: `💰 ${salaryLabel}` });
    if (postedLabel !== "—") items.push({ key: "posted", label: `🕒 ${postedLabel}` });
    return items;
  }, [jobTypeLabel, locationLabel, postedLabel, salaryLabel]);

  const openApply = useCallback(() => {
    if (applyDisabled) return;
    setCoverLetter("");
    setPickedFile(null);
    setFormError(null);
    setApplyOpen(true);
  }, [applyDisabled]);

  const closeApply = useCallback(() => {
    setApplyOpen(false);
    setFormError(null);
    Keyboard.dismiss();
  }, []);

  const pickResume = useCallback(async () => {
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

    setPickedFile({ uri: asset.uri, name, type: mimeType, size });
  }, [t]);

  const removeResume = useCallback(() => {
    setPickedFile(null);
    setFormError(null);
  }, []);

  const submitApply = useCallback(async () => {
    setFormError(null);

    if (applyDisabled) return;

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

      setAppliedOnce(true);
      closeApply();
      setCoverLetter("");
      setPickedFile(null);

      dispatch(
        notificationsActions.push({
          kind: "success",
          title: t("vacancy.applySuccess.title", { defaultValue: "Success" }),
          message: t("vacancy.applySuccess.message", { defaultValue: "Application sent." }),
        }),
      );

      q.refetch();
    } catch (e: unknown) {
      if (isAlreadyAppliedError(e)) {
        setAppliedOnce(true);
        closeApply();

        dispatch(
          notificationsActions.push({
            kind: "success",
            title: t("vacancy.applySuccess.title", { defaultValue: "Success" }),
            message: t("vacancy.applySuccess.already", {
              defaultValue: "You have already applied.",
            }),
          }),
        );

        return;
      }

      const backendMsg = getBackendErrorMessage(e);
      setFormError(backendMsg ?? t("vacancy.submitFailed"));
      Keyboard.dismiss();
    }
  }, [
    applyDisabled,
    applyToVacancy,
    closeApply,
    coverLetter,
    dispatch,
    pickedFile,
    q,
    t,
    vacancyId,
  ]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const formatStatus = useCallback(
    (v?: unknown): string => {
      const raw = typeof v === "string" ? v.trim().toLowerCase() : "";
      if (!raw) return "—";
      return t(`vacancy.status.${raw}`, { defaultValue: raw });
    },
    [t],
  );

  return {
    t,
    theme,

    query: { isLoading: q.isLoading, isError: q.isError, isFetching: q.isFetching },
    vacancy,
    refetch: q.refetch,

    goBack,

    tags,

    applyOpen,
    openApply,
    closeApply,

    coverLetter,
    setCoverLetter,

    pickedFile,
    pickResume,
    removeResume,

    formError,

    submitApply,
    applyState: { isLoading: applyState.isLoading },

    safeText,
    formatPosted,

    formatStatus,

    alreadyApplied,
    applyDisabled,
    formatFileSize,
  };
}
