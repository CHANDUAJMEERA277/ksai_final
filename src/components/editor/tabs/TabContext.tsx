"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
} from "react";

import {
    EditorTab,
    TabContextType,
} from "./TabTypes";

import type { CompilerError } from "../monaco/ErrorParser";

const TabContext =
  createContext<TabContextType | null>(null);

export function TabProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [tabs, setTabs] = useState<EditorTab[]>([
    {
        id: "main",
        name: "Main.java",
        path: "Main.java",
        language: "java",
        content: `public class Main {

    public static void main(String[] args) {
        System.out.println("Welcome");
    }
}`,
        isDirty: false,
        isPinned: false,
    },
]);

  const [activeTabId, setActiveTabId] =
    useState<string | null>("main");

  const [diagnosticsByTab, setDiagnosticsByTab] =
    useState<Record<string, CompilerError[]>>({
        main: [],
    });


  const activeTab =
  tabs.find((tab) => tab.id === activeTabId) || null;  

  function openTab(tab: EditorTab) {

    setTabs((prev) => {

        const exists = prev.find(
            (t) => t.id === tab.id
        );

        if (exists) {

            setActiveTabId(tab.id);

            return prev;
        }

        setActiveTabId(tab.id);

        setDiagnosticsByTab((diagnostics) => ({
            ...diagnostics,
            [tab.id]: [],
        }));

        return [
            ...prev,
            tab,
        ];
    });
}

  function closeTab(tabId: string) {

    setTabs((prev) => {

        const updated = prev.filter(
            (tab) => tab.id !== tabId
        );

        if (activeTabId === tabId) {

            setActiveTabId(
                updated.length
                    ? updated[
                          updated.length - 1
                      ].id
                    : null
            );
        }

        return updated;
    });

    setDiagnosticsByTab((prev) => {

        const updated = {
            ...prev,
        };

        delete updated[tabId];

        return updated;
    });
}

  function setActiveTab(tabId: string) {
    setActiveTabId(tabId);
  }

  function updateTabContent(
  tabId: string,
  content: string
) {
  setTabs((prev) =>
    prev.map((tab) =>
      tab.id === tabId
        ? {
            ...tab,
            content,
            isDirty: true,
          }
        : tab
    )
  );
}

  function markSaved(tabId: string) {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              isDirty: false,
            }
          : tab
      )
    );
  }

  function pinTab(tabId: string) {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              isPinned: !tab.isPinned,
            }
          : tab
      )
    );
  }

  function saveActiveTab() {

  if (!activeTabId) return;

  markSaved(activeTabId);

  console.log("Saved:", activeTabId);

}

function setTabDiagnostics(
    tabId: string,
    errors: CompilerError[]
) {
    setDiagnosticsByTab((prev) => ({
        ...prev,
        [tabId]: errors,
    }));
}

function clearTabDiagnostics(
    tabId: string
) {
    setDiagnosticsByTab((prev) => ({
        ...prev,
        [tabId]: [],
    }));
}

  return (
    <TabContext.Provider
      value={{
    tabs,
    activeTab,
    activeTabId,

    saveActiveTab,

    openTab,
    closeTab,
    setActiveTab,
    updateTabContent,
    markSaved,
    pinTab,

    diagnosticsByTab,
    setTabDiagnostics,
    clearTabDiagnostics,
}}
    >
      {children}
    </TabContext.Provider>
  );
}

export function useTabs() {
  const context = useContext(TabContext);

  if (!context) {
    throw new Error(
      "useTabs must be used inside TabProvider."
    );
  }

  return context;
}