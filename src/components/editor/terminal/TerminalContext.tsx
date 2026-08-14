"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

import { TerminalTab } from "./TerminalTypes";

interface TerminalContextType {
  tabs: TerminalTab[];

  activeTab: string;

  activePanel:
    | "terminal"
    | "output"
    | "problems";

  clearSignal: number;

  output: string;

  appendOutput: (text: string) => void;

  showTerminal: boolean;

setShowTerminal: (
  value: boolean
) => void;

  setActivePanel: (
    value:
      | "terminal"
      | "output"
      | "problems"
  ) => void;

  clearTerminal: () => void;

  createTab: () => void;

  closeTab: (id: string) => void;

  setActiveTab: (id: string) => void;
}

const TerminalContext = createContext<
  TerminalContextType | undefined
>(undefined);

export function TerminalProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [showTerminal, setShowTerminal] =
  useState(true);


  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: crypto.randomUUID(),
      name: "Terminal 1",
    },
  ]);

  const [activeTab, setActiveTab] =
  useState(tabs[0]?.id || "");

  const [activePanel, setActivePanel] =
    useState<
      "terminal" | "output" | "problems"
    >("terminal");

  const [clearSignal, setClearSignal] =
    useState(0);


  const [output, setOutput] = useState("");  

  const clearTerminal = () => {
    setClearSignal((prev) => prev + 1);
    setOutput("");
};


  const appendOutput = (text: string) => {
    setOutput(text);
};

  const createTab = () => {
    const newTab = {
      id: crypto.randomUUID(),
      name: `Terminal ${tabs.length + 1}`,
    };

    setTabs((prev) => [
      ...prev,
      newTab,
    ]);

    setActiveTab(newTab.id);
  };

  const closeTab = (id: string) => {
  const remaining = tabs.filter(
    (tab) => tab.id !== id
  );

  setTabs(remaining);

  if (remaining.length > 0) {
    setActiveTab(remaining[0].id);
  } else {
    setShowTerminal(false);
  }
};

  return (
    <TerminalContext.Provider
      value={{
  tabs,
  activeTab,
  createTab,
  closeTab,
  setActiveTab,
  activePanel,
  setActivePanel,
  clearSignal,
clearTerminal,

output,
appendOutput,

showTerminal,
setShowTerminal,
}}
    >
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  const context =
    useContext(TerminalContext);

  if (!context) {
    throw new Error(
      "TerminalProvider missing."
    );
  }

  return context;
}