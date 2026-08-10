"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";

interface ConfirmationDialogProps {
  confirmation: null | {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({ confirmation, onConfirm, onCancel }: ConfirmationDialogProps) {
  if (!confirmation) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4 py-5">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        className="w-full max-w-lg rounded-3xl bg-[#0B1222] border border-white/10 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Confirmation Required</p>
            <h2 className="mt-3 text-xl font-bold text-white">{confirmation.title}</h2>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors p-2 rounded-full">
            <X size={20} />
          </button>
        </div>
        {confirmation.description ? (
          <p className="mt-4 text-sm text-slate-300 leading-relaxed">{confirmation.description}</p>
        ) : null}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button onClick={onCancel} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10 transition">
            {confirmation.cancelLabel || "Cancel"}
          </button>
          <button onClick={onConfirm} className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:brightness-105 transition">
            {confirmation.confirmLabel || "Confirm"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
