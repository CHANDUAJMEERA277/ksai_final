"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

/* ============================================================
   STORAGE
============================================================ */

const STORAGE_KEY = "ks_editor_settings";

/* ============================================================
   TYPES
============================================================ */

export type ThemeMode =
  | "light"
  | "dark"
  | "system";

export type CursorStyle =
  | "line"
  | "block"
  | "underline";

export type Keymap =
  | "VS Code"
  | "Cursor"
  | "IntelliJ"
  | "Vim"
  | "Emacs";

export type ShellType =
  | "PowerShell"
  | "CMD"
  | "Git Bash"
  | "WSL";

export type AIProvider =
  | "Gemini"
  | "OpenAI"
  | "Claude"
  | "DeepSeek"
  | "Ollama";

/* ============================================================
   APPEARANCE
============================================================ */

export interface AppearanceSettings {

  theme: ThemeMode;

  accentColor: string;

  compactMode: boolean;

  glassEffect: boolean;

}

/* ============================================================
   EDITOR
============================================================ */

export interface EditorSettings {

  fontFamily: string;

  fontSize: number;

  wordWrap: boolean;

  minimap: boolean;

  lineNumbers: boolean;

  cursorStyle: CursorStyle;

  tabSize: number;

  formatOnSave: boolean;

}

/* ============================================================
   AI
============================================================ */

export interface AISettings {

  /* Provider */

  provider: AIProvider;

  model: string;

  apiKey: string;

  /* Generation */

  temperature: number;

  maxTokens: number;

  streaming: boolean;

  /* Coding Assistant */

  autoComplete: boolean;

  suggestions: boolean;

  inlineCompletion: boolean;

  autoExplain: boolean;

  fixErrors: boolean;

  refactorCode: boolean;

  generateTests: boolean;

  generateDocs: boolean;

  /* KnowledgeStream AI */

  screenMentor: boolean;

  dictator: boolean;

  autoCode: boolean;

  teacherMode: boolean;

  quizGenerator: boolean;

  interviewMode: boolean;

  voiceMentor: boolean;

  /* Privacy */

  offlineMode: boolean;

  cloudSync: boolean;

  storeHistory: boolean;

}

/* ============================================================
   TERMINAL
============================================================ */

export interface TerminalSettings {

  shell: ShellType;

  fontFamily: string;

  fontSize: number;

  theme: "dark" | "light";

  cursorStyle: "block" | "line" | "underline";

  cursorBlink: boolean;

  scrollback: number;

  copyOnSelect: boolean;

  rightClickPaste: boolean;

  terminalBell: boolean;

  clearOnRun: boolean;

  startupCommand: string;

}

/* ============================================================
   GENERAL
============================================================ */

export interface GeneralSettings {

  autoSave: boolean;

  restoreSession: boolean;

  confirmBeforeExit: boolean;

}

/* ============================================================
   KEYBOARD
============================================================ */

export interface KeyboardSettings {

  keymap: Keymap;

  vimMode: boolean;

  emacsMode: boolean;

  autoCompleteShortcut: string;

  runShortcut: string;

  formatShortcut: string;

  explainShortcut: string;

  autoCodeShortcut: string;

  screenMentorShortcut: string;

  dictatorShortcut: string;

}

/* ============================================================
   Account Settings
============================================================ */

export interface AccountSettings {

  /* Profile */

  avatar: string;

  fullName: string;

  username: string;

  email: string;

  company: string;

  role: string;

  location: string;

  website: string;

  bio: string;

  /* Workspace */

  workspaceName: string;

  organization: string;

  /* Account */

  loggedIn: boolean;

  loginProvider:
    | "Google"
    | "GitHub"
    | "Microsoft"
    | "Email";

  /* Cloud */

  cloudSync: boolean;

  autoBackup: boolean;

  backupFrequency:
    | "Daily"
    | "Weekly"
    | "Monthly";

  /* Subscription */

  subscription:
    | "Free"
    | "Pro"
    | "Enterprise";

  aiCredits: number;

  storageUsed: number;

  storageLimit: number;

}


/* ============================================================
   ROOT SETTINGS
============================================================ */

export interface IDESettings {

  appearance: AppearanceSettings;

  editor: EditorSettings;

  ai: AISettings;

  terminal: TerminalSettings;

  general: GeneralSettings;

  keyboard: KeyboardSettings;

  account: AccountSettings;

}

/* ============================================================
   DEFAULT SETTINGS
============================================================ */

export const DEFAULT_SETTINGS: IDESettings = {

  appearance: {

    theme: "light",

    accentColor: "#2563EB",

    compactMode: false,

    glassEffect: true,

  },

  editor: {

    fontFamily: "JetBrains Mono",

    fontSize: 15,

    wordWrap: true,

    minimap: true,

    lineNumbers: true,

    cursorStyle: "line",

    tabSize: 4,

    formatOnSave: true,

  },

 ai: {

  provider: "Gemini",

  model: "Gemini 2.5 Pro",

  apiKey: "",

  temperature: 0.7,

  maxTokens: 8192,

  streaming: true,

  autoComplete: true,

  suggestions: true,

  inlineCompletion: true,

  autoExplain: true,

  fixErrors: true,

  refactorCode: true,

  generateTests: true,

  generateDocs: true,

  screenMentor: true,

  dictator: true,

  autoCode: true,

  teacherMode: true,

  quizGenerator: true,

  interviewMode: true,

  voiceMentor: false,

  offlineMode: false,

  cloudSync: true,

  storeHistory: true,

},

 terminal: {

  shell: "PowerShell",

  fontFamily: "JetBrains Mono",

  fontSize: 14,

  theme: "dark",

  cursorStyle: "block",

  cursorBlink: true,

  scrollback: 5000,

  copyOnSelect: true,

  rightClickPaste: true,

  terminalBell: false,

  clearOnRun: true,

  startupCommand: "",

},

  general: {

    autoSave: true,

    restoreSession: true,

    confirmBeforeExit: true,

  },

  keyboard: {

  keymap: "VS Code",

  vimMode: false,

  emacsMode: false,

  autoCompleteShortcut: "Ctrl+Space",

  runShortcut: "Ctrl+F5",

  formatShortcut: "Shift+Alt+F",

  explainShortcut: "Ctrl+E",

  autoCodeShortcut: "Ctrl+Shift+A",

  screenMentorShortcut: "Ctrl+Shift+M",

  dictatorShortcut: "Ctrl+D",

},

account: {

  avatar: "/images/avatar.png",

  fullName: "KnowledgeStream User",

  username: "ks_user",

  email: "user@example.com",

  company: "KnowledgeStream AI",

  role: "Developer",

  location: "India",

  website: "",

  bio: "",

  workspaceName: "My Workspace",

  organization: "KnowledgeStream",

  loggedIn: true,

  loginProvider: "Google",

  cloudSync: true,

  autoBackup: true,

  backupFrequency: "Daily",

  subscription: "Free",

  aiCredits: 1000,

  storageUsed: 1.2,

  storageLimit: 10,

},

};

/* ============================================================
   CONTEXT
============================================================ */

interface EditorSettingsContextType {

  settings: IDESettings;

  updateAppearance: (
    values: Partial<AppearanceSettings>
  ) => void;

  updateEditor: (
    values: Partial<EditorSettings>
  ) => void;

  updateAI: (
    values: Partial<AISettings>
  ) => void;

  updateTerminal: (
    values: Partial<TerminalSettings>
  ) => void;

  updateGeneral: (
    values: Partial<GeneralSettings>
  ) => void;

  updateKeyboard: (
    values: Partial<KeyboardSettings>
  ) => void;

  updateAccount: (
  values: Partial<AccountSettings>
) => void;

  resetSettings: () => void;

}

const EditorSettingsContext =
  createContext<EditorSettingsContextType | null>(null);

/* ============================================================
   PROVIDER
============================================================ */

export function EditorSettingsProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [settings, setSettings] =
    useState<IDESettings>(DEFAULT_SETTINGS);

  /* ----------------------------------------------------------
      Restore Settings
  ---------------------------------------------------------- */

  useEffect(() => {

    try {

      const saved =
        localStorage.getItem(STORAGE_KEY);

      if (saved) {

        setSettings(JSON.parse(saved));

      }

    } catch (err) {

      console.error(
        "Unable to restore editor settings",
        err
      );

    }

  }, []);

  /* ----------------------------------------------------------
      Save Settings
  ---------------------------------------------------------- */

  useEffect(() => {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );

    } catch (err) {

      console.error(
        "Unable to save editor settings",
        err
      );

    }

  }, [settings]);


/* ============================================================
   UPDATE FUNCTIONS
============================================================ */

const updateAppearance = (
  values: Partial<AppearanceSettings>
) => {

  setSettings((prev) => ({
    ...prev,
    appearance: {
      ...prev.appearance,
      ...values,
    },
  }));

};

const updateEditor = (
  values: Partial<EditorSettings>
) => {

  setSettings((prev) => ({
    ...prev,
    editor: {
      ...prev.editor,
      ...values,
    },
  }));

};

const updateAI = (
  values: Partial<AISettings>
) => {

  setSettings((prev) => ({
    ...prev,
    ai: {
      ...prev.ai,
      ...values,
    },
  }));

};

const updateTerminal = (
  values: Partial<TerminalSettings>
) => {

  setSettings((prev) => ({
    ...prev,
    terminal: {
      ...prev.terminal,
      ...values,
    },
  }));

};

const updateGeneral = (
  values: Partial<GeneralSettings>
) => {

  setSettings((prev) => ({
    ...prev,
    general: {
      ...prev.general,
      ...values,
    },
  }));

};

const updateKeyboard = (
  values: Partial<KeyboardSettings>
) => {

  setSettings((prev) => ({
    ...prev,
    keyboard: {
      ...prev.keyboard,
      ...values,
    },
  }));

};

const updateAccount = (
  values: Partial<AccountSettings>
) => {

  setSettings((prev) => ({

    ...prev,

    account: {

      ...prev.account,

      ...values,

    },

  }));

};

/* ============================================================
   RESET
============================================================ */

const resetSettings = () => {

  setSettings(DEFAULT_SETTINGS);

};

/* ============================================================
   PROVIDER
============================================================ */

return (

  <EditorSettingsContext.Provider
    value={{
      settings,
      updateAppearance,
      updateEditor,
      updateAI,
      updateTerminal,
      updateGeneral,
      updateKeyboard,
      updateAccount,
      resetSettings,
    }}
  >

    {children}

  </EditorSettingsContext.Provider>

);

}

/* ============================================================
   HOOK
============================================================ */

export function useEditorSettings() {

  const context =
    useContext(EditorSettingsContext);

  if (!context) {

    throw new Error(
      "useEditorSettings must be used inside EditorSettingsProvider"
    );

  }

  return context;

}
