import React, { JSX, ReactNode, useEffect, useMemo, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import type { Theme } from "../../../app/theme";
import { selectionStyles as styles } from "./styles";

function usePulse(durationMs: number): Animated.Value {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration: durationMs,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration: durationMs,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    anim.start();
    return () => anim.stop();
  }, [durationMs, v]);

  return v;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

type SkeletonLineProps = {
  theme: Theme;
  height: number;
  widthPx?: number;
  widthPercent?: `${number}%`;
  pulse: Animated.Value;
  phase: number;
};

function SkeletonLine({
  theme,
  height,
  widthPx,
  widthPercent,
  pulse,
  phase,
}: SkeletonLineProps): JSX.Element {
  const baseColor = useMemo(() => {
    return theme.name === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)";
  }, [theme.name]);

  const opacity = useMemo(() => {
    const from = clamp01(0.35 + phase);
    const to = clamp01(0.85 + phase);

    return pulse.interpolate({
      inputRange: [0, 1],
      outputRange: [from, to],
    });
  }, [phase, pulse]);

  const outerStyle = useMemo(() => {
    if (typeof widthPx === "number") return { width: widthPx };
    if (typeof widthPercent === "string") return { width: widthPercent };
    return { width: "100%" as const };
  }, [widthPx, widthPercent]);

  return (
    <View style={outerStyle}>
      <Animated.View
        style={[
          styles.line,
          {
            height,
            backgroundColor: baseColor,
            opacity,
          },
        ]}
      />
    </View>
  );
}

function SkeletonCard({ theme, children }: { theme: Theme; children: ReactNode }): JSX.Element {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function VacancyDetailsSkeleton({ theme }: { theme: Theme }): JSX.Element {
  const pulseFast = usePulse(800);
  const pulseSlow = usePulse(1200);

  return (
    <View style={styles.container}>
      <SkeletonCard theme={theme}>
        <SkeletonLine theme={theme} height={22} widthPercent="75%" pulse={pulseSlow} phase={0.0} />
        <View style={{ height: 10 }} />
        <SkeletonLine theme={theme} height={14} widthPercent="45%" pulse={pulseFast} phase={0.08} />
      </SkeletonCard>

      <View style={styles.tagsRow}>
        <SkeletonLine theme={theme} height={24} widthPx={72} pulse={pulseFast} phase={0.02} />
        <SkeletonLine theme={theme} height={24} widthPx={88} pulse={pulseSlow} phase={0.05} />
        <SkeletonLine theme={theme} height={24} widthPx={64} pulse={pulseFast} phase={0.09} />
      </View>

      <SkeletonCard theme={theme}>
        <SkeletonLine theme={theme} height={14} pulse={pulseSlow} phase={0.01} />
        <View style={{ height: 10 }} />
        <SkeletonLine theme={theme} height={14} pulse={pulseFast} phase={0.06} />
        <View style={{ height: 10 }} />
        <SkeletonLine theme={theme} height={14} widthPercent="85%" pulse={pulseSlow} phase={0.03} />
      </SkeletonCard>

      <SkeletonCard theme={theme}>
        <SkeletonLine theme={theme} height={13} widthPercent="60%" pulse={pulseFast} phase={0.03} />
        <View style={{ height: 8 }} />
        <SkeletonLine theme={theme} height={13} widthPercent="52%" pulse={pulseSlow} phase={0.07} />
        <View style={{ height: 8 }} />
        <SkeletonLine theme={theme} height={13} widthPercent="48%" pulse={pulseFast} phase={0.11} />
      </SkeletonCard>
    </View>
  );
}
