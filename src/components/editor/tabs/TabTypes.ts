import type { CompilerError } from "../monaco/ErrorParser";

export interface EditorTab {
    id: string;
    name: string;
    path: string;
    language: string;
    content: string;
    isDirty: boolean;
    isPinned: boolean;
}

export interface TabContextType {
    tabs: EditorTab[];

    activeTab: EditorTab | null;

    activeTabId: string | null;

    saveActiveTab: () => void;

    openTab: (tab: EditorTab) => void;

    closeTab: (tabId: string) => void;

    setActiveTab: (tabId: string) => void;

    updateTabContent: (
        tabId: string,
        content: string
    ) => void;

    markSaved: (
        tabId: string
    ) => void;

    pinTab: (
        tabId: string
    ) => void;

    /*
     * Diagnostics are stored separately
     * for every editor tab.
     */
    diagnosticsByTab: Record<
        string,
        CompilerError[]
    >;

    setTabDiagnostics: (
        tabId: string,
        errors: CompilerError[]
    ) => void;

    clearTabDiagnostics: (
        tabId: string
    ) => void;
}