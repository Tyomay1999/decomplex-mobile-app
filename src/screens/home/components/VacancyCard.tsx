import React, { JSX } from "react";
import { Pressable, Text, View } from "react-native";
import type { VacancyDto } from "../../../features/vacancies/vacanciesTypes";
import type { TFunction } from "i18next";
import {
  formatCompanyLabel,
  formatJobTypeLabel,
  formatPostedLabel,
  formatSalaryLabel,
  isNewByCreatedAt,
} from "../hooks";
import { vacancyCardStyles as styles } from "./styles";

type Props = {
  item: VacancyDto;
  t: TFunction;
  isAuthed: boolean;
  onOpen: (id: string) => void;
  theme: {
    surface: string;
    border: string;
    background: string;
    primary: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
  };
};

export function VacancyCard(props: Props): JSX.Element {
  const { item, t, isAuthed, onOpen, theme } = props;

  const companyLabel = formatCompanyLabel(t, item.companyId);
  const jobTypeLabel = formatJobTypeLabel(t, item.jobType);
  const salaryLabel = formatSalaryLabel(t, item.salaryFrom, item.salaryTo);
  const locationLabel = item.location?.trim() ? item.location : t("vacancy.locationNotSpecified");
  const postedLabel = formatPostedLabel(t, item.createdAt);
  const isNew = isNewByCreatedAt(item.createdAt);

  return (
    <Pressable
      testID={`home.vacancy.${item.id}`}
      onPress={() => onOpen(item.id)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          transform: [{ scale: pressed ? 0.985 : 1 }],
          opacity: pressed ? 0.98 : 1,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={[styles.subTitle, { color: theme.textSecondary }]} numberOfLines={1}>
            {t("vacancy.companyLabel")}: {companyLabel}
          </Text>
        </View>

        {isNew ? (
          <View
            style={[styles.badge, { borderColor: theme.border, backgroundColor: theme.background }]}
          >
            <Text style={[styles.badgeText, { color: theme.textPrimary }]}>
              {t("vacancy.badgeNew")}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.chipsRow}>
        <View
          style={[styles.chip, { borderColor: theme.border, backgroundColor: theme.background }]}
        >
          <Text style={[styles.chipText, { color: theme.textSecondary }]}>
            {t("vacancy.jobTypeLabel")}: {jobTypeLabel}
          </Text>
        </View>

        <View
          style={[styles.chip, { borderColor: theme.border, backgroundColor: theme.background }]}
        >
          <Text style={[styles.chipText, { color: theme.textSecondary }]}>
            {t("vacancy.salaryLabel")}: {salaryLabel}
          </Text>
        </View>
      </View>

      {item.description ? (
        <Text style={[styles.desc, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
      ) : (
        <Text style={[styles.desc, { color: theme.textTertiary }]} numberOfLines={2}>
          {t("vacancy.descriptionNotProvided")}
        </Text>
      )}

      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: theme.textSecondary }]} numberOfLines={1}>
          {t("vacancy.locationLabel")}: {locationLabel}
        </Text>

        <Text style={[styles.meta, { color: theme.textSecondary }]} numberOfLines={1}>
          {t("vacancy.postedLabel")}: {postedLabel}
        </Text>
      </View>

      <View style={styles.actionsRow}>
        {isAuthed ? (
          <Pressable
            testID={`home.vacancy.${item.id}.details`}
            onPress={() => onOpen(item.id)}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                borderColor: theme.border,
                backgroundColor: pressed ? theme.background : "transparent",
              },
            ]}
          >
            <Text style={[styles.actionText, { color: theme.textPrimary }]}>
              {t("vacancy.actionsDetails")}
            </Text>
          </Pressable>
        ) : (
          <Text style={[styles.guestHint, { color: theme.textTertiary }]}>
            {t("vacancy.guestHint")}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
