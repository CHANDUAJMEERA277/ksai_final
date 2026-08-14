"use client";


import { Trash2 } from "lucide-react";
import { useTerminal } from "./TerminalContext";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function TerminalHeader({
  onClose,
}: Props) {
  const {
    activePanel,
    setActivePanel,
    clearTerminal,
  } = useTerminal();

  const {
 
  setShowTerminal,
} = useTerminal();

  return (
    <div className="flex gap-8 px-5 py-3">

      <button
        onClick={() =>
          setActivePanel("terminal")
        }
        className={
          activePanel === "terminal"
            ? "text-white"
            : "text-slate-500"
        }
      >
        TERMINAL
      </button>

      <button
        onClick={() =>
          setActivePanel("output")
        }
        className={
          activePanel === "output"
            ? "text-white"
            : "text-slate-500"
        }
      >
        OUTPUT
      </button>

      <button
        onClick={() =>
          setActivePanel("problems")
        }
        className={
          activePanel === "problems"
            ? "text-white"
            : "text-slate-500"
        }
      >
        PROBLEMS
      </button>

      <button onClick={clearTerminal}>
        <Trash2 size={16} />
      </button>

      <button
  onClick={onClose}
  className="p-1 rounded hover:bg-gray-200"
>
  <X size={16} />
</button>


    </div>
  );
}