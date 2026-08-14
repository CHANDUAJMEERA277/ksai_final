"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react";
import { NotificationType } from "./NotificationContext";

const iconByType: Record<NotificationType, typeof CheckCircle2> = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

const badgeByType: Record<NotificationType, string> = {
  success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  info: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  warning: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  error: "bg-rose-500/20 text-rose-300 border-rose-500/40",
};

const iconColorByType: Record<NotificationType, string> = {
  success: "text-emerald-400",
  info: "text-sky-400",
  warning: "text-amber-400",
  error: "text-rose-400",
};

interface NotificationToastProps {
  notifications: Array<{ id: string; message: string; type: NotificationType }>;
}

export function NotificationToast({ notifications }: NotificationToastProps) {
  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = iconByType[notification.type];
          const iconColor = iconColorByType[notification.type];
          const badgeStyle = badgeByType[notification.type];

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto rounded-2xl bg-slate-900/95 border border-slate-800 text-white shadow-2xl p-4 backdrop-blur-xl ring-1 ring-white/10"
            >
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-xl border ${badgeStyle} shrink-0 mt-0.5`}>
                  <Icon size={18} className={iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      {notification.type}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-100 leading-relaxed mt-0.5">
                    {notification.message}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
