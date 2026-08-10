"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react";
import { NotificationType } from "./NotificationContext";

const iconByType: Record<NotificationType, typeof CheckCircle2> = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

const colorByType: Record<NotificationType, string> = {
  success: "bg-emerald-500/10 border-emerald-400/20 text-emerald-200",
  info: "bg-sky-500/10 border-sky-400/20 text-sky-200",
  warning: "bg-amber-500/10 border-amber-400/20 text-amber-200",
  error: "bg-rose-500/10 border-rose-400/20 text-rose-200",
};

interface NotificationToastProps {
  notifications: Array<{ id: string; message: string; type: NotificationType }>;
}

export function NotificationToast({ notifications }: NotificationToastProps) {
  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-3 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = iconByType[notification.type];
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className={`rounded-3xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${colorByType[notification.type]} border-white/10`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Icon size={18} />
                </div>
                <p className="text-sm leading-6">{notification.message}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
