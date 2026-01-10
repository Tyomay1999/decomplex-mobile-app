import React, { JSX, useEffect, useMemo } from "react";
import { Pressable, Text } from "react-native";
import type { Theme } from "../../../app/theme";
import type { TFunction } from "i18next";
import type { ApplicationDto } from "../../../features/applications/applicationsTypes";
import { useGetVacancyByIdQuery } from "../../../features/vacancies/vacanciesApi";
import type { VacancyMeta } from "../hooks";
import { applicationCardStyles as styles } from "./styles";

function formatDate(v?: string | null): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

export function ApplicationCard({
  item,
  theme,
  t,
  onOpenVacancy,
  onVacancyMeta,
  cachedMeta,
}: {
  item: ApplicationDto;
  theme: Theme;
  t: TFunction;
  onOpenVacancy: (vacancyId: string) => void;
  onVacancyMeta: (vacancyId: string, meta: VacancyMeta) => void;
  cachedMeta?: VacancyMeta;
}): JSX.Element {
  const { data } = useGetVacancyByIdQuery(item.vacancyId);

  useEffect(() => {
    const titleRaw = typeof data?.title === "string" ? data.title.trim() : "";
    const locationRaw = typeof data?.location === "string" ? data.location.trim() : "";

    if (!titleRaw && !locationRaw) return;

    onVacancyMeta(item.vacancyId, {
      title: titleRaw || String(t("profile.vacancyUnknown", { defaultValue: "Vacancy" })),
      location: locationRaw || null,
    });
  }, [data?.title, data?.location, item.vacancyId, onVacancyMeta, t]);

  const title = useMemo(() => {
    const local = cachedMeta?.title?.trim();
    if (local) return local;

    const v = typeof data?.title === "string" ? data.title.trim() : "";
    return v ? v : String(t("profile.vacancyUnknown", { defaultValue: "Vacancy" }));
  }, [cachedMeta?.title, data?.title, t]);

  const locationLabel = useMemo(() => {
    const local = cachedMeta?.location?.trim();
    if (local) return local;

    const v = typeof data?.location === "string" ? data.location.trim() : "";
    return v ? v : "—";
  }, [cachedMeta?.location, data?.location]);

  return (
    <Pressable
      onPress={() => onOpenVacancy(item.vacancyId)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: "800" }} numberOfLines={2}>
        {title}
      </Text>

      <Text style={{ color: theme.textSecondary, marginTop: 8 }}>
        {String(t("profile.applicationStatus", { defaultValue: "Status" }))}: {String(item.status)}
      </Text>

      <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
        {String(t("profile.appliedAt", { defaultValue: "Applied" }))}: {formatDate(item.createdAt)}
      </Text>

      <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
        {String(t("profile.locationLabel", { defaultValue: "Location" }))}: {locationLabel}
      </Text>

      <Text style={{ color: theme.textTertiary, marginTop: 10, fontSize: 12 }}>
        ID: {item.id.slice(0, 6)}…
      </Text>
    </Pressable>
  );
}
