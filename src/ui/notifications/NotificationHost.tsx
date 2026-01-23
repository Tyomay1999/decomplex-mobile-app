import React, { JSX, useContext, useEffect, useMemo, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { notificationsActions } from "./notificationSlice";
import { ThemeContext } from "../../app/ThemeProvider";
import type { NotificationItem } from "./types";

function pickTop(queue: NotificationItem[]): NotificationItem | null {
  if (!queue.length) return null;
  return queue[0] ?? null;
}

export function NotificationHost(): JSX.Element | null {
  const dispatch = useAppDispatch();
  const themeCtx = useContext(ThemeContext);
  const theme = themeCtx?.theme;

  const queue = useAppSelector((s) => s.notifications.queue);
  const top = useMemo(() => pickTop(queue), [queue]);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (!top) return;

    opacity.setValue(0);
    translateY.setValue(10);

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start();

    const id = top.id;

    const now = Date.now();
    const remainingMs = Math.max(0, top.expiresAt - now);

    const timer = setTimeout(() => {
      dispatch(notificationsActions.remove(id));
    }, remainingMs);

    return () => clearTimeout(timer);
  }, [dispatch, opacity, translateY, top?.id, top?.expiresAt]);

  if (!theme || !top) return null;

  const bg = top.kind === "error" ? "#DC2626" : top.kind === "success" ? "#16A34A" : theme.surface;

  const border = top.kind === "info" ? theme.border : "transparent";
  const text = top.kind === "info" ? theme.textPrimary : "#FFFFFF";
  const subText = top.kind === "info" ? theme.textSecondary : "rgba(255,255,255,0.9)";

  return (
    <View pointerEvents="box-none" style={styles.root}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: bg,
            borderColor: border,
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <Pressable
          onPress={() => dispatch(notificationsActions.remove(top.id))}
          style={({ pressed }) => [styles.press, pressed && styles.pressed]}
        >
          <View style={styles.content}>
            {top.title ? (
              <Text style={[styles.title, { color: text }]} numberOfLines={1}>
                {top.title}
              </Text>
            ) : null}

            <Text style={[styles.message, { color: top.title ? subText : text }]} numberOfLines={3}>
              {top.message}
            </Text>
          </View>

          <Text style={[styles.close, { color: text }]}>✕</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 58,
    zIndex: 999,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  press: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  pressed: { opacity: 0.9 },
  content: { flex: 1, gap: 4 },
  title: { fontSize: 14, fontWeight: "900" },
  message: { fontSize: 14, fontWeight: "700" },
  close: { fontSize: 16, fontWeight: "900" },
});
