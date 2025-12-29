import React, { useContext, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { ListRenderItem } from "react-native";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

import { ThemeContext } from "../app/ThemeProvider";
import { useListVacanciesQuery } from "../features/vacancies/vacanciesApi";
import type { VacancyDto } from "../features/vacancies/vacanciesTypes";

import { LanguageMenu } from "../components/LanguageMenu";
import type { Locale } from "../storage/sessionStorage";
import { persistSession } from "../storage/sessionStorage";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { authActions } from "../features/auth/authSlice";

function shortId(id: string, take = 6) {
  if (!id) return "";
  return `${id.slice(0, take)}…`;
}

function formatCompanyLabel(t: TFunction, companyId: string | null | undefined) {
  if (!companyId) return t("vacancy.companyNotSpecified");
  return t("vacancy.companyIdShort", { id: shortId(companyId) });
}

function formatJobTypeLabel(t: TFunction, jobType: string | null | undefined) {
  if (!jobType) return t("vacancy.jobTypeNotSpecified");
  return t(`vacancy.jobType_${jobType}`);
}

function formatSalaryLabel(
  t: TFunction,
  salaryFrom: number | null | undefined,
  salaryTo: number | null | undefined,
) {
  const from = salaryFrom ?? null;
  const to = salaryTo ?? null;

  if (from == null && to == null) return t("vacancy.salaryNotSpecified");
  if (from != null && to != null) return t("vacancy.salaryRange", { from, to });
  if (from != null) return t("vacancy.salaryFrom", { from });
  return t("vacancy.salaryTo", { to });
}

function formatPostedLabel(t: TFunction, createdAtIso: string | null | undefined) {
  if (!createdAtIso) return "—";
  const d = new Date(createdAtIso);
  const date = Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
  return t("vacancy.postedDate", { date });
}

function isNewByCreatedAt(createdAtIso: string | null | undefined): boolean {
  if (!createdAtIso) return false;
  const created = new Date(createdAtIso).getTime();
  if (Number.isNaN(created)) return false;
  const diffDays = (Date.now() - created) / (1000 * 60 * 60 * 24);
  return diffDays <= 3;
}

export function HomeScreen(): React.JSX.Element {
  const { t, i18n } = useTranslation();

  const dispatch = useAppDispatch();
  const language = useAppSelector((s) => s.auth.language);

  const user = useAppSelector((s) => s.auth.user);
  const isAuthed = Boolean(user);

  const themeCtx = useContext(ThemeContext);
  const theme = themeCtx?.theme;

  const { data: vacancies = [], isLoading, isFetching, isError, refetch } = useListVacanciesQuery();

  const [search, setSearch] = useState("");
  const [langOpen, setLangOpen] = useState(false);

  const onSelectLanguage = async (next: Locale) => {
    if (next === language) return;
    dispatch(authActions.setLanguage(next));
    await i18n.changeLanguage(next);
    await persistSession({ language: next });
  };

  const data = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vacancies;

    return vacancies.filter((v) => {
      const title = v.title?.toLowerCase() ?? "";
      const companyId = (v.companyId ?? "").toLowerCase();
      const location = (v.location ?? "").toLowerCase();
      const jobType = (v.jobType ?? "").toLowerCase();

      return (
        title.includes(q) || companyId.includes(q) || location.includes(q) || jobType.includes(q)
      );
    });
  }, [search, vacancies]);

  if (!theme) return <View style={{ flex: 1 }} />;

  const renderItem: ListRenderItem<VacancyDto> = ({ item }) => {
    const companyLabel = formatCompanyLabel(t, item.companyId);
    const jobTypeLabel = formatJobTypeLabel(t, item.jobType);

    const salaryLabel = formatSalaryLabel(t, item.salaryFrom, item.salaryTo);
    const locationLabel = item.location?.trim() ? item.location : t("vacancy.locationNotSpecified");

    const postedLabel = formatPostedLabel(t, item.createdAt);
    const isNew = isNewByCreatedAt(item.createdAt);

    return (
      <Pressable
        onPress={() => {}}
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
              style={[
                styles.badge,
                { borderColor: theme.border, backgroundColor: theme.background },
              ]}
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
          <Pressable
            onPress={() => {
              // TODO: details
            }}
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

          {isAuthed ? (
            <>
              <Pressable
                onPress={() => {
                  // TODO: save
                }}
                style={({ pressed }) => [
                  styles.actionBtn,
                  {
                    borderColor: theme.border,
                    backgroundColor: pressed ? theme.background : "transparent",
                  },
                ]}
              >
                <Text style={[styles.actionText, { color: theme.textPrimary }]}>
                  {t("vacancy.actionsSave")}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  // TODO: apply
                }}
                style={({ pressed }) => [
                  styles.actionBtnPrimary,
                  { backgroundColor: pressed ? theme.primary : theme.primary },
                ]}
              >
                <Text style={[styles.actionTextPrimary, { color: theme.surface }]}>
                  {t("vacancy.actionsApply")}
                </Text>
              </Pressable>
            </>
          ) : (
            <Text style={[styles.guestHint, { color: theme.textTertiary }]}>
              {t("vacancy.guestHint")}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.statusBar, { backgroundColor: theme.surface }]} />

      <View
        style={[
          styles.topBar,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.topTitle, { color: theme.textPrimary }]}>{t("home.jobsTitle")}</Text>

        <View style={styles.topActions}>
          <Pressable
            onPress={() => setLangOpen(true)}
            style={({ pressed }) => [
              styles.langBtn,
              {
                borderColor: theme.border,
                backgroundColor: pressed ? theme.background : "transparent",
              },
            ]}
          >
            <Text style={{ color: theme.textSecondary, fontWeight: "800", letterSpacing: 0.4 }}>
              {t(`auth.language.${language}`, language.toUpperCase())}
            </Text>
          </Pressable>

          <Pressable
            onPress={themeCtx?.toggleTheme}
            style={({ pressed }) => [
              styles.iconBtn,
              { backgroundColor: pressed ? theme.background : "transparent" },
            ]}
          >
            <Text style={{ fontSize: 18, color: theme.textSecondary }}>
              {theme.name === "light" ? "🌙" : "☀️"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <View
          style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Text style={{ fontSize: 18, color: theme.textSecondary }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t("home.searchPlaceholder")}
            placeholderTextColor={theme.textTertiary}
            style={[styles.searchInput, { color: theme.textPrimary }]}
          />
        </View>

        <Pressable
          onPress={() => {
            // TODO: filters bottom sheet
          }}
          style={({ pressed }) => [
            styles.filterBtn,
            {
              borderColor: theme.border,
              backgroundColor: pressed ? theme.background : "transparent",
            },
          ]}
        >
          <Text style={{ fontSize: 18, color: theme.textSecondary }}>⚙️</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          {t("home.availablePositions")}
        </Text>
        <Text style={[styles.sectionCount, { color: theme.textSecondary }]}>
          {t("home.jobsCount", { count: data.length })}
        </Text>
      </View>

      {isLoading ? (
        <Text style={{ paddingHorizontal: 16, color: theme.textSecondary }}>
          {t("common.loading")}
        </Text>
      ) : isError ? (
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{ color: theme.textSecondary }}>{t("common.error")}</Text>
          <Pressable onPress={refetch} style={{ marginTop: 10 }}>
            <Text style={{ color: theme.textPrimary, fontWeight: "700" }}>{t("common.retry")}</Text>
          </Pressable>
        </View>
      ) : isFetching ? (
        <Text style={{ paddingHorizontal: 16, color: theme.textSecondary }}>
          {t("common.updating")}
        </Text>
      ) : null}

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      />

      <LanguageMenu
        visible={langOpen}
        value={language}
        title={t("auth.language.label")}
        cancelLabel={t("common.cancel")}
        onClose={() => setLangOpen(false)}
        onSelect={onSelectLanguage}
        theme={{
          surface: theme.surface,
          border: theme.border,
          textPrimary: theme.textPrimary,
          textSecondary: theme.textSecondary,
          primary: theme.primary,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusBar: { height: 44 },

  topBar: {
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topTitle: { fontSize: 20, fontWeight: "600", letterSpacing: -0.3 },

  topActions: { flexDirection: "row", alignItems: "center", gap: 10 },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  langBtn: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  searchWrap: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  searchBar: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 16 },

  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  sectionTitle: { fontSize: 20, fontWeight: "600", letterSpacing: -0.3 },
  sectionCount: { fontSize: 14, opacity: 0.8 },

  card: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 12 },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  subTitle: { fontSize: 13, marginTop: 6, opacity: 0.9 },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: "700" },

  title: { fontSize: 18, fontWeight: "600", letterSpacing: -0.2, lineHeight: 24 },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: { fontSize: 12, fontWeight: "600" },

  desc: { marginTop: 12, fontSize: 14, lineHeight: 20, opacity: 0.95 },

  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 },
  meta: { fontSize: 14, opacity: 0.8 },

  actionsRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  actionBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionBtnPrimary: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionText: { fontSize: 13, fontWeight: "700" },
  actionTextPrimary: { fontSize: 13, fontWeight: "800" },

  guestHint: { fontSize: 12, opacity: 0.8 },
});
