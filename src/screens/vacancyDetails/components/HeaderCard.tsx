import React, { JSX } from "react";
import { Text, View } from "react-native";
import type { Theme } from "../../../app/theme";
import type { TFunction } from "i18next";
import { headerStyles as styles } from "./styles";
import type { VacancyDto } from "../../../features/vacancies/vacanciesTypes";

function safeText(v: unknown, fallback = "—"): string {
  if (typeof v === "string" && v.trim().length > 0) return v;
  return fallback;
}

function shortId(id: string, take = 6) {
  if (!id) return "";
  return `${id.slice(0, take)}…`;
}

export function HeaderCard({
  theme,
  t,
  vacancy,
  tags,
}: {
  theme: Theme;
  t: TFunction;
  vacancy: VacancyDto | undefined;
  tags: { key: string; label: string }[];
}): JSX.Element {
  return (
    <View
      style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}
    >
      <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={3}>
        {safeText(vacancy?.title, "Untitled vacancy")}
      </Text>

      <Text style={[styles.company, { color: theme.textSecondary }]}>
        {vacancy?.companyId
          ? `${t("vacancy.companyLabel")}: ${shortId(String(vacancy.companyId))}`
          : t("vacancy.companyNotSpecified")}
      </Text>

      <View style={styles.tagsWrap}>
        {tags.map((x) => (
          <View
            key={x.key}
            style={[styles.tag, { borderColor: theme.border, backgroundColor: theme.background }]}
          >
            <Text style={{ color: theme.textSecondary, fontWeight: "600", fontSize: 12 }}>
              {x.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
