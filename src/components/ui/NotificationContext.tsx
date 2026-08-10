"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { NotificationToast } from "./NotificationToast";
import { ConfirmationDialog } from "./ConfirmationDialog";

export type NotificationType = "info" | "success" | "warning" | "error";

interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
}

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface NotificationContextValue {
  notify: (message: string, type?: NotificationType) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [confirmation, setConfirmation] = useState<(
    ConfirmOptions & { resolve: (value: boolean) => void }
  ) | null>(null);

  const notify = useCallback((message: string, type: NotificationType = "info") => {
    const id = crypto.randomUUID();
    setNotifications((current) => [...current, { id, message, type }]);
  }, []);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setConfirmation({ ...options, resolve });
      }),
    []
  );

  useEffect(() => {
    if (notifications.length === 0) return;
    const timer = window.setTimeout(() => {
      setNotifications((current) => current.slice(1));
    }, 4200);
    return () => window.clearTimeout(timer);
  }, [notifications]);

  const contextValue = useMemo(
    () => ({ notify, confirm }),
    [notify, confirm]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationToast notifications={notifications} />
      <ConfirmationDialog
        confirmation={confirmation}
        onCancel={() => {
          if (confirmation) confirmation.resolve(false);
          setConfirmation(null);
        }}
        onConfirm={() => {
          if (confirmation) confirmation.resolve(true);
          setConfirmation(null);
        }}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}

export function useConfirm() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useConfirm must be used within NotificationProvider");
  }
  return context.confirm;
}
