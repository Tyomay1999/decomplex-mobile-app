import React, { JSX } from "react";
import { Pressable, Text, View } from "react-native";
import type { Theme } from "../../../app/theme";
import { InfoRow } from "./InfoRow";
import { cardStyles as styles } from "./styles";

type Props = {
  title: string;
  emailLabel: string;
  typeLabel: string;
  roleLabel: string;

  emailValue: string;
  typeValue: string;
  roleValue: string;

  myApplicationsLabel: string;
  logoutLabel: string;

  onMyApplications: () => void;
  onLogout: () => void;

  theme: Theme;
};

export function AccountCard(props: Props): JSX.Element {
  const {
    title,
    emailLabel,
    typeLabel,
    roleLabel,
    emailValue,
    typeValue,
    roleValue,
    myApplicationsLabel,
    logoutLabel,
    onMyApplications,
    onLogout,
    theme,
  } = props;

  return (
    <View style={styles.actionsWrap}>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text
          style={{ color: theme.textPrimary, fontSize: 17, fontWeight: "700", marginBottom: 16 }}
        >
          {title}
        </Text>

        <InfoRow label={emailLabel} value={emailValue} theme={theme} />
        <InfoRow label={typeLabel} value={typeValue} theme={theme} />
        <InfoRow label={roleLabel} value={roleValue} theme={theme} />
      </View>

      <Pressable
        onPress={onMyApplications}
        style={({ pressed }) => [
          styles.secondaryBtn,
          { borderColor: theme.border, marginTop: 12 },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text style={{ color: theme.textPrimary, fontWeight: "700", fontSize: 17 }}>
          {myApplicationsLabel}
        </Text>
      </Pressable>

      <Pressable
        onPress={onLogout}
        style={({ pressed }) => [
          styles.secondaryBtn,
          { borderColor: theme.border, marginTop: 12 },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text style={{ color: theme.textPrimary, fontWeight: "700", fontSize: 17 }}>
          {logoutLabel}
        </Text>
      </Pressable>
    </View>
  );
}
