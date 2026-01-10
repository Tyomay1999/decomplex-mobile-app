import React, { JSX, useMemo } from "react";
import { ActivityIndicator, FlatList, Keyboard, Pressable, Text, View } from "react-native";

import { useMyApplicationsScreen } from "./hooks";
import {
  ActiveFilters,
  ApplicationCard,
  ApplicationCardSkeleton,
  EmptyState,
  FiltersModal,
  GuestGate,
  SearchHeader,
  TopBar,
} from "./components";
import { applicationScreenStyles as styles } from "./components/styles";
import { LanguageMenu } from "../../components/LanguageMenu";

export function MyApplicationsScreen(): JSX.Element {
  const h = useMyApplicationsScreen();
  const theme = h.theme;

  if (!theme) return <View style={{ flex: 1 }} />;

  const languageLabel = h.t(`auth.language.${h.language}`, String(h.language).toUpperCase());
  const skeletons = useMemo(() => Array.from({ length: 6 }, (_, i) => String(i)), []);

  if (!h.user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <GuestGate
          theme={theme}
          t={h.t}
          title={h.t("profile.myApplications", { defaultValue: "My applications" })}
          subtitle={h.t("profile.needLogin", {
            defaultValue: "Please log in to view your applications",
          })}
          loginLabel={h.t("auth.login.title", { defaultValue: "Log In" })}
          registerLabel={h.t("auth.register.title", { defaultValue: "Create account" })}
          onBack={h.goBack}
          onLogin={h.goLogin}
          onRegister={h.goRegister}
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.statusBar, { backgroundColor: theme.surface }]} />

      <TopBar
        theme={theme}
        title={h.t("profile.myApplications", { defaultValue: "My applications" })}
        onBack={h.goBack}
        languageLabel={languageLabel}
        onOpenLanguage={() => h.setLangOpen(true)}
      />

      <SearchHeader
        theme={theme}
        t={h.t}
        value={h.titleInput}
        onChange={h.setTitleInput}
        onSubmit={() => {
          Keyboard.dismiss();
          h.listRef.current?.scrollToOffset({ offset: 0, animated: true });
        }}
        onOpenFilters={h.openFilters}
        filtersCount={h.activeFiltersCount}
      />

      <ActiveFilters
        theme={theme}
        t={h.t}
        sortLabel={h.sortLabel}
        filtersActive={h.filtersActive}
        onClearSort={h.clearSortOnly}
        onClear={h.clearFilters}
      />

      {h.queryState.isError ? (
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.textSecondary }}>{h.t("common.error")}</Text>
          <Pressable onPress={() => void h.reload()} style={{ marginTop: 10 }}>
            <Text style={{ color: theme.textPrimary, fontWeight: "700" }}>
              {h.t("common.retry")}
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          ref={h.listRef}
          data={h.filteredSortedItems}
          keyExtractor={(x) => x.id}
          contentContainerStyle={styles.listContent}
          onEndReachedThreshold={0.35}
          onEndReached={() => void h.loadMore()}
          onScroll={h.onScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={() => Keyboard.dismiss()}
          ListEmptyComponent={
            h.queryState.isLoading ? (
              <View>
                {skeletons.map((k) => (
                  <ApplicationCardSkeleton key={k} theme={theme} />
                ))}
              </View>
            ) : (
              <EmptyState
                theme={theme}
                title={h.t("applications.empty.title", { defaultValue: "No applications yet" })}
                subtitle={h.t("applications.empty.subtitle", {
                  defaultValue: "When you apply to a vacancy, it will appear here.",
                })}
                primaryLabel={h.t("applications.empty.primary", { defaultValue: "Browse jobs" })}
                onPrimary={h.goBrowseJobs}
              />
            )
          }
          ListFooterComponent={
            h.queryState.isFetching && h.items.length > 0 ? (
              <View style={{ paddingVertical: 14 }}>
                <ActivityIndicator />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <ApplicationCard
              theme={theme}
              t={h.t}
              item={item}
              onOpenVacancy={h.openVacancy}
              onVacancyMeta={h.onVacancyMeta}
              cachedMeta={h.vacancyMetaById[item.vacancyId]}
            />
          )}
        />
      )}

      <FiltersModal
        theme={theme}
        t={h.t}
        visible={h.filtersOpen}
        onClose={h.closeFilters}
        sortKey={h.sortDraft}
        onChangeSort={h.setSortDraft}
        onClear={h.clearFilters}
        onApply={h.applyFilters}
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
