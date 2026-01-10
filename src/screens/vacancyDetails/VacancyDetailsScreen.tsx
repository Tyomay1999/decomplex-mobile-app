import React, { JSX } from "react";
import { ScrollView, Text, View } from "react-native";

import { useVacancyDetailsScreen } from "./hooks";

import {
  ApplyModal,
  HeaderCard,
  ScreenError,
  Section,
  StickyApplyBar,
  VacancyDetailsSkeleton,
  TopBar,
} from "./components";
import { screenStyles as styles } from "./components/styles";

export function VacancyDetailsScreen(): JSX.Element {
  const h = useVacancyDetailsScreen();
  const theme = h.theme;

  if (!theme) return <View style={{ flex: 1 }} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.statusBar, { backgroundColor: theme.surface }]} />

      <TopBar theme={theme} title={h.t("vacancy.actionsDetails")} onBack={h.goBack} />

      {h.query.isLoading ? (
        <VacancyDetailsSkeleton theme={theme} />
      ) : h.query.isError ? (
        <ScreenError
          theme={theme}
          label={h.t("common.error")}
          retryLabel={h.t("common.retry")}
          onRetry={h.refetch}
        />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <HeaderCard theme={theme} t={h.t} vacancy={h.vacancy} tags={h.tags} />

            <Section
              theme={theme}
              title={h.t("vacancy.descriptionTitle")}
              text={h.safeText(h.vacancy?.description, h.t("vacancy.descriptionNotProvided"))}
            />

            <Section
              theme={theme}
              title={h.t("vacancy.detailsTitle")}
              text={[
                `${h.t("vacancy.statusLabel")}: ${h.formatStatus(h.vacancy?.status)}`,
                `${h.t("vacancy.postedLabel")}: ${h.formatPosted(h.vacancy?.createdAt ?? null)}`,
                `${h.t("vacancy.updatedLabel")}: ${
                  h.vacancy?.updatedAt ? h.formatPosted(h.vacancy.updatedAt) : "—"
                }`,
              ].join("\n")}
            />

            {h.query.isFetching ? (
              <View style={{ padding: 16 }}>
                <Text style={{ color: theme.textSecondary }}>{h.t("common.updating")}</Text>
              </View>
            ) : null}
          </ScrollView>

          <StickyApplyBar
            theme={theme}
            label={
              h.alreadyApplied
                ? h.t("vacancy.appliedAlready", { defaultValue: "Applied" })
                : h.t("vacancy.applyNow")
            }
            disabled={h.applyDisabled}
            onPress={h.openApply}
          />
        </>
      )}

      <ApplyModal
        theme={theme}
        t={h.t}
        visible={h.applyOpen}
        onClose={h.closeApply}
        vacancyTitle={h.safeText(h.vacancy?.title, "Vacancy")}
        coverLetter={h.coverLetter}
        onChangeCoverLetter={h.setCoverLetter}
        pickedFile={h.pickedFile}
        onPickResume={h.pickResume}
        onRemoveResume={h.removeResume}
        error={h.formError}
        submitLabel={h.t("vacancy.submitApplication")}
        cancelLabel={h.t("common.cancel")}
        onSubmit={h.submitApply}
        submitting={h.applyState.isLoading}
        coverLabel={h.t("vacancy.coverLetter")}
        coverPlaceholder={h.t("vacancy.coverLetterPlaceholder")}
        coverHint={h.t("vacancy.coverLetterHint")}
        resumeLabel={h.t("vacancy.resumeCv")}
        uploadLabel={h.t("vacancy.uploadResume")}
        uploadHint={h.t("vacancy.uploadHint")}
      />
    </View>
  );
}
