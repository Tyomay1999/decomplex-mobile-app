import React, { JSX, useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { vacancyCardStyles as cardStyles } from "./styles";

type Props = {
  theme: {
    surface: string;
    border: string;
    background: string;
  };
};

export function VacancyCardSkeleton({ theme }: Props): JSX.Element {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    );

    anim.start();
    return () => {
      anim.stop();
    };
  }, [pulse]);

  const opacity = useMemo(
    () => pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] }),
    [pulse],
  );

  const blockStyle = useMemo(
    () => [
      s.block,
      {
        backgroundColor: theme.border,
        opacity,
      },
    ],
    [opacity, theme.border],
  );

  return (
    <View style={[cardStyles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={s.rowBetween}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Animated.View style={[blockStyle, { height: 18, width: "78%", borderRadius: 8 }]} />
          <View style={{ height: 10 }} />
          <Animated.View style={[blockStyle, { height: 12, width: "55%", borderRadius: 8 }]} />
        </View>

        <Animated.View style={[blockStyle, { height: 26, width: 62, borderRadius: 999 }]} />
      </View>

      <View style={s.chipsRow}>
        <Animated.View style={[blockStyle, { height: 26, width: 140, borderRadius: 999 }]} />
        <Animated.View style={[blockStyle, { height: 26, width: 160, borderRadius: 999 }]} />
      </View>

      <View style={{ height: 14 }} />

      <Animated.View style={[blockStyle, { height: 12, width: "92%", borderRadius: 8 }]} />
      <View style={{ height: 10 }} />
      <Animated.View style={[blockStyle, { height: 12, width: "78%", borderRadius: 8 }]} />

      <View style={{ height: 16 }} />

      <View style={s.metaRow}>
        <Animated.View style={[blockStyle, { height: 12, width: 170, borderRadius: 8 }]} />
        <Animated.View style={[blockStyle, { height: 12, width: 120, borderRadius: 8 }]} />
      </View>

      <View style={{ height: 16 }} />

      <View style={s.actionsRow}>
        <Animated.View style={[blockStyle, { height: 36, width: 120, borderRadius: 12 }]} />
        <Animated.View style={[blockStyle, { height: 12, width: 140, borderRadius: 8 }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  block: {},
  rowBetween: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  actionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, alignItems: "center" },
});
