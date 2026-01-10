import React, { JSX } from "react";
import { Text, View } from "react-native";
import { headerStyles as styles } from "./styles";

type Props = {
  name: string;
  email: string;
  theme: {
    surface: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
  };
};

export function ProfileHeader(props: Props): JSX.Element {
  const { name, email, theme } = props;

  return (
    <View style={[styles.header, { borderBottomColor: theme.border }]}>
      <View style={[styles.avatar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={{ fontSize: 36 }}>👤</Text>
      </View>

      <Text style={[styles.name, { color: theme.textPrimary }]}>{name}</Text>
      <Text style={[styles.email, { color: theme.textSecondary }]}>{email}</Text>
    </View>
  );
}
