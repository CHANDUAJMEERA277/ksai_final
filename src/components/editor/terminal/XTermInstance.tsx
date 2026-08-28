"use client";

import { useEffect, useRef } from "react";

import "xterm/css/xterm.css";

export default function XTermInstance() {
  const terminalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
  async function initializeTerminal() {
    if (!terminalRef.current) {
      return;
    }

    const { Terminal } = await import("xterm");

    const { FitAddon } = await import(
      "xterm-addon-fit"
    );

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      rows: 20,
      theme: {
        background: "#FFFFFF",
        foreground: "#111827",
        cursor: "#2563EB",
        selectionBackground: "#BFDBFE",
      },
    });

    const fitAddon = new FitAddon();

    terminal.loadAddon(fitAddon);

    terminal.open(terminalRef.current);

    fitAddon.fit();

    terminal.writeln("");

    terminal.writeln(
      "KnowledgeStream AI Terminal"
    );

    terminal.writeln(
      "--------------------------------"
    );

    terminal.write("$ ");

    const resizeHandler = () => {
      fitAddon.fit();
    };

    window.addEventListener(
      "resize",
      resizeHandler
    );
  }

  initializeTerminal();
}, []);

  return (
  <div
    ref={terminalRef}
    className="h-full w-full"
  />
);
}