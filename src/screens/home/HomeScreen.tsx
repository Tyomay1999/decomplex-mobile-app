import React, { JSX, useMemo } from "react";
import { ActivityIndicator, FlatList, Keyboard, Pressable, Text, View } from "react-native";

import { LanguageMenu } from "../../components/LanguageMenu";
import { screenStyles as styles } from "./components/styles";

import { useHomeScreen } from "./hooks";
import {
  FiltersSheet,
  VacancyCard,
  VacancyCardSkeleton,
  HomeSectionHeader,
  HomeSearchBar,
  HomeTopBar,
} from "./components";

export function HomeScreen(): JSX.Element {
  const h = useHomeScreen();
  const theme = h.theme;

  if (!theme) {
    return <View style={{ flex: 1 }} />;
  }

  const languageLabel = h.t(`auth.language.${h.language}`, String(h.language).toUpperCase());

  const isEmpty = useMemo(() => {
    return (
      !h.initialLoading && !h.listState.isFetching && !h.listState.isError && h.items.length === 0
    );
  }, [h.initialLoading, h.listState.isFetching, h.listState.isError, h.items.length]);

  const showInlineState = !h.initialLoading && (h.listState.isError || isEmpty);

  const hasActiveSearchOrFilters = useMemo(() => {
    const hasSearch = h.search.trim().length > 0;

    const defaultJobTypeValue = h.jobTypeOptions[0]?.value;
    const hasJobType = defaultJobTypeValue != null && h.jobType !== defaultJobTypeValue;

    const hasFilters = Boolean(h.salaryOnly || h.newOnly || hasJobType);

    return hasSearch || hasFilters;
  }, [h.search, h.salaryOnly, h.newOnly, h.jobType, h.jobTypeOptions]);

  const showRetry = h.listState.isError || (isEmpty && hasActiveSearchOrFilters);
  const showClear = isEmpty && hasActiveSearchOrFilters;

  const onRetry = () => {
    h.refresh();
  };

  const onClearAndReload = () => {
    h.setSearch("");
    h.refresh();
  };

  const isRefreshing = Boolean(h.refreshing);

  const onRefresh = () => {
    h.refresh();
  };

  const skeletonCount = 6;
  const skeletons = useMemo(() => Array.from({ length: skeletonCount }, (_, i) => `sk-${i}`), []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HomeTopBar
        title={h.t("home.jobsTitle")}
        languageLabel={languageLabel}
        onOpenLanguage={() => h.setLangOpen(true)}
        onToggleTheme={() => h.themeCtx?.toggleTheme()}
        theme={{
          name: theme.name,
          surface: theme.surface,
          border: theme.border,
          background: theme.background,
          textPrimary: theme.textPrimary,
          textSecondary: theme.textSecondary,
        }}
      />

      <HomeSearchBar
        value={h.search}
        onChange={h.setSearch}
        placeholder={h.t("home.searchPlaceholder")}
        onOpenFilters={h.openFilters}
        theme={{
          surface: theme.surface,
          border: theme.border,
          background: theme.background,
          textPrimary: theme.textPrimary,
          textSecondary: theme.textSecondary,
          textTertiary: theme.textTertiary,
        }}
      />

      <HomeSectionHeader
        title={h.t("home.availablePositions")}
        countLabel={h.t("home.jobsCount", { count: h.items.length })}
        theme={{
          textPrimary: theme.textPrimary,
          textSecondary: theme.textSecondary,
        }}
      />

      {h.initialLoading ? (
        <View style={styles.listContent}>
          {skeletons.map((key) => (
            <VacancyCardSkeleton
              key={key}
              theme={{ surface: theme.surface, border: theme.border, background: theme.background }}
            />
          ))}
        </View>
      ) : null}

      {!h.initialLoading && showInlineState ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 18 }}>
          <View
            testID="home.inlineState"
            style={{
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.surface,
              borderRadius: 18,
              padding: 18,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 34, marginBottom: 10 }}>
              {h.listState.isError ? "⚠️" : "🔎"}
            </Text>

            <Text
              style={{
                color: theme.textPrimary,
                fontWeight: "900",
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {h.listState.isError
                ? h.t("home.state.errorTitle", { defaultValue: "Something went wrong" })
                : h.t("home.state.emptyTitle", { defaultValue: "No jobs found" })}
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                marginTop: 6,
                lineHeight: 18,
                textAlign: "center",
              }}
            >
              {h.listState.isError
                ? h.t("home.state.errorSubtitle", {
                    defaultValue: "Check your connection and try again.",
                  })
                : h.t("home.state.emptySubtitle", {
                    defaultValue: "Try changing the search or clearing filters.",
                  })}
            </Text>

            {showRetry ? (
              <View style={{ flexDirection: "row", gap: 10, marginTop: 14, width: "100%" }}>
                <Pressable
                  testID="home.retry"
                  onPress={onRetry}
                  style={({ pressed }) => ({
                    flex: 1,
                    borderRadius: 14,
                    paddingVertical: 12,
                    alignItems: "center",
                    backgroundColor: theme.primary,
                    opacity: pressed ? 0.9 : 1,
                  })}
                >
                  <Text style={{ color: theme.surface, fontWeight: "900" }}>
                    {h.t("common.retry")}
                  </Text>
                </Pressable>

                {showClear ? (
                  <Pressable
                    testID="home.clear"
                    onPress={onClearAndReload}
                    style={({ pressed }) => ({
                      flex: 1,
                      borderRadius: 14,
                      paddingVertical: 12,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: theme.border,
                      backgroundColor: pressed ? theme.background : "transparent",
                    })}
                  >
                    <Text style={{ color: theme.textPrimary, fontWeight: "900" }}>
                      {h.t("home.state.clear", { defaultValue: "Clear" })}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      {!h.initialLoading ? (
        <FlatList
          testID="home.list"
          data={h.items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onEndReachedThreshold={0.6}
          onEndReached={() => {
            void h.loadNextPage();
          }}
          renderItem={({ item }) => (
            <VacancyCard
              item={item}
              t={h.t}
              isAuthed={h.isAuthed}
              onOpen={h.openVacancy}
              theme={{
                surface: theme.surface,
                border: theme.border,
                background: theme.background,
                primary: theme.primary,
                textPrimary: theme.textPrimary,
                textSecondary: theme.textSecondary,
                textTertiary: theme.textTertiary,
              }}
            />
          )}
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={() => Keyboard.dismiss()}
          ListHeaderComponent={
            h.refreshing ? (
              <View style={{ paddingTop: 8, paddingBottom: 4, alignItems: "center" }}>
                <ActivityIndicator />
              </View>
            ) : null
          }
          ListFooterComponent={
            h.listState.isFetching && !isRefreshing ? (
              <View style={{ paddingTop: 6 }}>
                <VacancyCardSkeleton
                  theme={{
                    surface: theme.surface,
                    border: theme.border,
                    background: theme.background,
                  }}
                />
                <VacancyCardSkeleton
                  theme={{
                    surface: theme.surface,
                    border: theme.border,
                    background: theme.background,
                  }}
                />
              </View>
            ) : null
          }
        />
      ) : null}

      <FiltersSheet
        t={h.t}
        visible={h.filtersOpen}
        onClose={h.closeFilters}
        sheetAnim={h.sheetAnim}
        sheetHeight={h.sheetHeight}
        title={h.t("home.filters.title")}
        jobTypeLabel={h.t("home.filters.jobType")}
        options={h.jobTypeOptions}
        value={h.draftJobType}
        onChange={h.setDraftJobType}
        salaryOnly={h.draftSalaryOnly}
        onToggleSalaryOnly={() => h.setDraftSalaryOnly((v) => !v)}
        newOnly={h.draftNewOnly}
        onToggleNewOnly={() => h.setDraftNewOnly((v) => !v)}
        resetLabel={h.t("common.reset")}
        applyLabel={h.t("common.apply")}
        onReset={h.resetDraftFilters}
        onApply={h.applyDraftFilters}
        applyDisabled={!h.hasPendingDraft}
        theme={{
          surface: theme.surface,
          border: theme.border,
          background: theme.background,
          primary: theme.primary,
          textPrimary: theme.textPrimary,
          textSecondary: theme.textSecondary,
          textTertiary: theme.textTertiary,
        }}
      />

      <LanguageMenu
        visible={h.langOpen}
        value={h.language}
        title={h.t("auth.language.label")}
        cancelLabel={h.t("common.cancel")}
        onClose={() => h.setLangOpen(false)}
        onSelect={h.onSelectLanguage}
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
