export type NotificationKind = "error" | "success" | "info";

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  message: string;
  title?: string;
  durationMs: number;
  createdAt: number;
  expiresAt: number;
};
