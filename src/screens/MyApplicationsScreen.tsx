import React, { useCallback, useContext, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { TFunction } from "i18next";

import { ThemeContext } from "../app/ThemeProvider";
import type { Theme } from "../app/theme";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { useLazyListMyApplicationsQuery } from "../features/applications/applicationsApi";
import type { ApplicationDto } from "../features/applications/applicationsTypes";
import { useGetVacancyByIdQuery } from "../features/vacancies/vacanciesApi";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type VacancyMeta = {
    title: string;
    location: string | null;
};

type SortKey = "time_desc" | "time_asc" | "title_asc" | "title_desc" | "location_asc";

function formatDate(v?: string | null): string {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
}

function safeLower(v: string): string {
    return v.trim().toLowerCase();
}

function normalizeSpaces(v: string): string {
    return v.replace(/\s+/g, " ").trim();
}

function compareText(a: string, b: string): number {
    return a.localeCompare(b, undefined, { sensitivity: "base" });
}

function toTime(v?: string | null): number {
    if (!v) return 0;
    const d = new Date(v);
    const ts = d.getTime();
    return Number.isNaN(ts) ? 0 : ts;
}

function countActiveFilters(p: { sortKey: SortKey; locationQuery: string }): number {
    let n = 0;
    if (p.sortKey !== "time_desc") n += 1;
    if (p.locationQuery.trim().length > 0) n += 1;
    return n;
}

function sortKeyLabel(key: SortKey, t: TFunction): string {
    if (key === "time_desc") return String(t("profile.sortNewest", { defaultValue: "Newest" }));
    if (key === "time_asc") return String(t("profile.sortOldest", { defaultValue: "Oldest" }));
    if (key === "title_asc") return String(t("profile.sortTitleAz", { defaultValue: "Title A–Z" }));
    if (key === "title_desc") return String(t("profile.sortTitleZa", { defaultValue: "Title Z–A" }));
    return String(t("profile.sortLocationAz", { defaultValue: "Location" }));
}

function Chip({
                  theme,
                  label,
                  onPress,
              }: {
    theme: Theme;
    label: string;
    onPress: () => void;
}): React.JSX.Element {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.chipMini,
                { borderColor: theme.border, backgroundColor: pressed ? theme.background : "transparent" },
            ]}
        >
            <Text
                style={{ color: theme.textSecondary, fontWeight: "800", fontSize: 12 }}
                numberOfLines={1}
            >
                {label}
            </Text>
        </Pressable>
    );
}

function SortChip({
                      theme,
                      active,
                      label,
                      onPress,
                  }: {
    theme: Theme;
    active: boolean;
    label: string;
    onPress: () => void;
}): React.JSX.Element {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.sortChip,
                {
                    borderColor: theme.border,
                    backgroundColor: active ? theme.background : pressed ? theme.background : "transparent",
                },
            ]}
        >
            <Text style={{ color: theme.textPrimary, fontWeight: "900", fontSize: 13 }}>{label}</Text>
        </Pressable>
    );
}

export function MyApplicationsScreen(): React.JSX.Element {
    const { t } = useTranslation();
    const nav = useNavigation<Nav>();

    const themeCtx = useContext(ThemeContext);
    const theme = themeCtx?.theme;

    const listRef = useRef<FlatList<ApplicationDto> | null>(null);
    const scrollOffsetRef = useRef(0);

    const [items, setItems] = useState<ApplicationDto[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [initialLoaded, setInitialLoaded] = useState(false);

    const [vacancyMetaById, setVacancyMetaById] = useState<Record<string, VacancyMeta>>({});

    const [sortKey, setSortKey] = useState<SortKey>("time_desc");
    const [titleQuery, setTitleQuery] = useState("");
    const [locationQuery, setLocationQuery] = useState("");

    const [filtersOpen, setFiltersOpen] = useState(false);

    const [trigger, queryState] = useLazyListMyApplicationsQuery();

    const loadFirst = useCallback(async () => {
        const res = await trigger({ limit: 20 }).unwrap();
        setItems(res.items);
        setNextCursor(res.nextCursor);
        setInitialLoaded(true);
    }, [trigger]);

    const loadMore = useCallback(async () => {
        if (!nextCursor) return;
        if (queryState.isFetching) return;

        const res = await trigger({ limit: 20, cursor: nextCursor }).unwrap();

        setItems((prev) => {
            const merged = prev.concat(res.items);
            const seen = new Set<string>();
            return merged.filter((x) => {
                if (seen.has(x.id)) return false;
                seen.add(x.id);
                return true;
            });
        });

        setNextCursor(res.nextCursor);
    }, [nextCursor, queryState.isFetching, trigger]);

    React.useEffect(() => {
        if (initialLoaded) return;
        void loadFirst();
    }, [initialLoaded, loadFirst]);

    useFocusEffect(
        useCallback(() => {
            const y = scrollOffsetRef.current;
            if (y <= 0) return;

            requestAnimationFrame(() => {
                listRef.current?.scrollToOffset({ offset: y, animated: false });
            });
        }, []),
    );

    const goBack = () => nav.goBack();

    const openVacancy = (vacancyId: string) => {
        nav.navigate("VacancyDetails", { vacancyId });
    };

    const onVacancyMeta = useCallback((vacancyId: string, meta: VacancyMeta) => {
        setVacancyMetaById((prev) => {
            const existing = prev[vacancyId];
            if (existing && existing.title === meta.title && existing.location === meta.location) return prev;
            return { ...prev, [vacancyId]: meta };
        });
    }, []);

    const filtersActive = useMemo(() => {
        return locationQuery.trim().length > 0 || sortKey !== "time_desc";
    }, [locationQuery, sortKey]);

    const filteredSortedItems = useMemo(() => {
        const qTitle = safeLower(normalizeSpaces(titleQuery));
        const qLoc = safeLower(normalizeSpaces(locationQuery));

        const base = items.filter((app) => {
            if (qTitle.length === 0 && qLoc.length === 0) return true;

            const meta = vacancyMetaById[app.vacancyId];
            const title = meta?.title ? safeLower(meta.title) : "";
            const loc = meta?.location ? safeLower(meta.location) : "";

            if (qTitle.length > 0) {
                if (!title) return false;
                if (!title.includes(qTitle)) return false;
            }

            if (qLoc.length > 0) {
                if (!loc) return false;
                if (!loc.includes(qLoc)) return false;
            }

            return true;
        });

        const arr = base.slice();

        arr.sort((a, b) => {
            if (sortKey === "time_desc") return toTime(b.createdAt) - toTime(a.createdAt);
            if (sortKey === "time_asc") return toTime(a.createdAt) - toTime(b.createdAt);

            const metaA = vacancyMetaById[a.vacancyId];
            const metaB = vacancyMetaById[b.vacancyId];

            const titleA = metaA?.title?.trim() || "";
            const titleB = metaB?.title?.trim() || "";
            const locA = metaA?.location?.trim() || "";
            const locB = metaB?.location?.trim() || "";

            if (sortKey === "title_asc") return compareText(titleA, titleB);
            if (sortKey === "title_desc") return compareText(titleB, titleA);
            if (sortKey === "location_asc") return compareText(locA, locB);

            return 0;
        });

        return arr;
    }, [items, vacancyMetaById, titleQuery, locationQuery, sortKey]);

    const clearFilters = () => {
        setSortKey("time_desc");
        setLocationQuery("");
    };

    if (!theme) return <View style={{ flex: 1 }} />;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.statusBar, { backgroundColor: theme.surface }]} />

            <View style={[styles.topBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                <Pressable
                    onPress={goBack}
                    style={({ pressed }) => [
                        styles.backBtn,
                        { backgroundColor: pressed ? theme.background : "transparent" },
                    ]}
                >
                    <Text style={{ fontSize: 22, color: theme.textPrimary }}>‹</Text>
                </Pressable>

                <Text style={[styles.topTitle, { color: theme.textPrimary }]}>
                    {t("profile.myApplications", { defaultValue: "My applications" })}
                </Text>

                <View style={{ width: 40 }} />
            </View>

            <View
                style={[
                    styles.filterHeader,
                    { borderBottomColor: theme.border, backgroundColor: theme.surface },
                ]}
            >
                <View style={styles.searchRow}>
                    <View
                        style={[
                            styles.searchBox,
                            { borderColor: theme.border, backgroundColor: theme.background },
                        ]}
                    >
                        <Text style={{ color: theme.textTertiary, fontSize: 16, marginRight: 8 }}>⌕</Text>

                        <TextInput
                            value={titleQuery}
                            onChangeText={setTitleQuery}
                            placeholder={t("profile.searchPlaceholder", "Search")}
                            placeholderTextColor={theme.textTertiary}
                            style={[styles.searchInput, { color: theme.textPrimary }]}
                            returnKeyType="search"
                        />
                    </View>

                    <Pressable
                        onPress={() => setFiltersOpen(true)}
                        style={({ pressed }) => [
                            styles.filtersBtn,
                            {
                                borderColor: theme.border,
                                backgroundColor: pressed ? theme.background : theme.surface,
                            },
                        ]}
                    >
                        <Text style={{ color: theme.textPrimary, fontWeight: "900" }}>
                            {t("profile.filters", "Filters")}
                        </Text>

                        {countActiveFilters({ sortKey, locationQuery }) > 0 ? (
                            <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                                <Text style={{ color: theme.surface, fontWeight: "900", fontSize: 12 }}>
                                    {countActiveFilters({ sortKey, locationQuery })}
                                </Text>
                            </View>
                        ) : null}
                    </Pressable>
                </View>

                <View style={styles.activeRow}>
                    <Chip theme={theme} label={sortKeyLabel(sortKey, t)} onPress={() => setFiltersOpen(true)} />
                    {locationQuery.trim() ? (
                        <Chip
                            theme={theme}
                            label={`${t("profile.locationShort", "Location")}: ${locationQuery.trim()}`}
                            onPress={() => setFiltersOpen(true)}
                        />
                    ) : null}

                    {filtersActive ? (
                        <Chip
                            theme={theme}
                            label={t("profile.clearFilters", "Clear")}
                            onPress={clearFilters}
                        />
                    ) : null}
                </View>
            </View>

            {queryState.isError ? (
                <View style={{ padding: 16 }}>
                    <Text style={{ color: theme.textSecondary }}>{t("common.error")}</Text>
                    <Pressable onPress={() => void loadFirst()} style={{ marginTop: 10 }}>
                        <Text style={{ color: theme.textPrimary, fontWeight: "700" }}>{t("common.retry")}</Text>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    ref={listRef}
                    data={filteredSortedItems}
                    keyExtractor={(x) => x.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
                    onEndReachedThreshold={0.35}
                    onEndReached={() => void loadMore()}
                    onScroll={(e) => {
                        scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
                    }}
                    scrollEventThrottle={16}
                    ListEmptyComponent={
                        queryState.isLoading ? (
                            <View style={{ paddingTop: 20 }}>
                                <Text style={{ color: theme.textSecondary }}>{t("common.loading")}</Text>
                            </View>
                        ) : (
                            <View style={{ paddingTop: 20 }}>
                                <Text style={{ color: theme.textSecondary }}>
                                    {t("profile.noApplications", "You have not applied yet")}
                                </Text>
                            </View>
                        )
                    }
                    ListFooterComponent={
                        queryState.isFetching && items.length > 0 ? (
                            <View style={{ paddingVertical: 14 }}>
                                <ActivityIndicator />
                            </View>
                        ) : null
                    }
                    renderItem={({ item }) => (
                        <ApplicationRow
                            item={item}
                            theme={theme}
                            t={t}
                            onOpenVacancy={openVacancy}
                            onVacancyMeta={onVacancyMeta}
                        />
                    )}
                />
            )}

            <Modal
                visible={filtersOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setFiltersOpen(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setFiltersOpen(false)}>
                    <Pressable
                        onPress={(e) => e.stopPropagation()}
                        style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    >
                        <View style={styles.sheetHeader}>
                            <Text style={{ color: theme.textPrimary, fontWeight: "900", fontSize: 18 }}>
                                {t("profile.filters", "Filters")}
                            </Text>

                            <Pressable
                                onPress={() => setFiltersOpen(false)}
                                style={({ pressed }) => [
                                    styles.sheetClose,
                                    { backgroundColor: pressed ? theme.background : "transparent" },
                                ]}
                            >
                                <Text style={{ color: theme.textSecondary, fontSize: 18 }}>✕</Text>
                            </Pressable>
                        </View>

                        <Text style={[styles.sheetLabel, { color: theme.textTertiary }]}>
                            {t("profile.sortBy", "Sort by")}
                        </Text>

                        <View style={styles.chipsRow}>
                            <SortChip
                                theme={theme}
                                active={sortKey === "time_desc"}
                                label={t("profile.sortNewest", "Newest")}
                                onPress={() => setSortKey("time_desc")}
                            />
                            <SortChip
                                theme={theme}
                                active={sortKey === "time_asc"}
                                label={t("profile.sortOldest", "Oldest")}
                                onPress={() => setSortKey("time_asc")}
                            />
                            <SortChip
                                theme={theme}
                                active={sortKey === "title_asc"}
                                label={t("profile.sortTitleAz", "Title A–Z")}
                                onPress={() => setSortKey("title_asc")}
                            />
                            <SortChip
                                theme={theme}
                                active={sortKey === "location_asc"}
                                label={t("profile.sortLocationAz", "Location")}
                                onPress={() => setSortKey("location_asc")}
                            />
                        </View>

                        <View style={{ height: 14 }} />

                        <Text style={[styles.sheetLabel, { color: theme.textTertiary }]}>
                            {t("profile.locationLabel", "Location")}
                        </Text>

                        <View
                            style={[
                                styles.locationBox,
                                { borderColor: theme.border, backgroundColor: theme.background },
                            ]}
                        >
                            <TextInput
                                value={locationQuery}
                                onChangeText={setLocationQuery}
                                placeholder={t("profile.filterLocationPlaceholder", "Type location")}
                                placeholderTextColor={theme.textTertiary}
                                style={[styles.locationInput, { color: theme.textPrimary }]}
                            />
                        </View>

                        <View style={{ height: 16 }} />

                        <View style={styles.sheetActions}>
                            <Pressable
                                onPress={clearFilters}
                                style={({ pressed }) => [
                                    styles.sheetBtn,
                                    {
                                        borderColor: theme.border,
                                        backgroundColor: pressed ? theme.background : "transparent",
                                    },
                                ]}
                            >
                                <Text style={{ color: theme.textPrimary, fontWeight: "900" }}>
                                    {t("profile.clearFilters", "Clear")}
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => setFiltersOpen(false)}
                                style={({ pressed }) => [
                                    styles.sheetPrimary,
                                    { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
                                ]}
                            >
                                <Text style={{ color: theme.surface, fontWeight: "900" }}>
                                    {t("profile.applyFilters", "Apply")}
                                </Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

function ApplicationRow({
                            item,
                            theme,
                            t,
                            onOpenVacancy,
                            onVacancyMeta,
                        }: {
    item: ApplicationDto;
    theme: Theme;
    t: TFunction;
    onOpenVacancy: (vacancyId: string) => void;
    onVacancyMeta: (vacancyId: string, meta: VacancyMeta) => void;
}): React.JSX.Element {
    const { data } = useGetVacancyByIdQuery(item.vacancyId);

    React.useEffect(() => {
        const titleRaw = typeof data?.title === "string" ? data.title.trim() : "";
        const locationRaw = typeof data?.location === "string" ? data.location.trim() : "";

        if (!titleRaw && !locationRaw) return;

        onVacancyMeta(item.vacancyId, {
            title: titleRaw || t("profile.vacancyUnknown", "Vacancy").toString(),
            location: locationRaw || null,
        });
    }, [data?.title, data?.location, item.vacancyId, onVacancyMeta, t]);

    const title = useMemo(() => {
        const v = typeof data?.title === "string" ? data.title.trim() : "";
        return v && v.length > 0 ? v : t("profile.vacancyUnknown", "Vacancy").toString();
    }, [data?.title, t]);

    const locationLabel = useMemo(() => {
        const loc = typeof data?.location === "string" ? data.location.trim() : "";
        return loc && loc.length > 0 ? loc : "—";
    }, [data?.location]);

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
                {t("profile.applicationStatus", "Status").toString()}: {String(item.status)}
            </Text>

            <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
                {t("profile.appliedAt", "Applied").toString()}: {formatDate(item.createdAt)}
            </Text>

            <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
                {t("profile.locationLabel", "Location").toString()}: {locationLabel}
            </Text>

            <Text style={{ color: theme.textTertiary, marginTop: 10, fontSize: 12 }}>
                ID: {item.id.slice(0, 6)}…
            </Text>
        </Pressable>
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

    filterHeader: {
        borderBottomWidth: 1,
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 12,
        gap: 10,
    },
    searchRow: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
    },
    searchBox: {
        flex: 1,
        height: 46,
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: "700",
    },
    filtersBtn: {
        height: 46,
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    badge: {
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        paddingHorizontal: 6,
        alignItems: "center",
        justifyContent: "center",
    },

    activeRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chipMini: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 7,
        maxWidth: "100%",
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
        padding: 12,
    },
    sheet: {
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
    },
    sheetHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    sheetClose: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    sheetLabel: {
        fontSize: 12,
        fontWeight: "900",
        letterSpacing: 1,
        marginBottom: 10,
    },
    chipsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    sortChip: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },

    locationBox: {
        height: 46,
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 12,
        justifyContent: "center",
    },
    locationInput: {
        fontSize: 15,
        fontWeight: "700",
    },

    sheetActions: {
        flexDirection: "row",
        gap: 10,
    },
    sheetBtn: {
        flex: 1,
        height: 46,
        borderWidth: 1,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    sheetPrimary: {
        flex: 1,
        height: 46,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },

    card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
});