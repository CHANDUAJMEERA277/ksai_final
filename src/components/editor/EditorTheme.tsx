"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

type ThemeContextType = {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  toggleTheme: () => void;
};

const EditorThemeContext = createContext<ThemeContextType | null>(null);

export function EditorThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <EditorThemeContext.Provider
      value={{
        darkMode,
        setDarkMode,
        toggleTheme,
      }}
    >
      {children}
    </EditorThemeContext.Provider>
  );
}

export function useEditorTheme() {
  const context = useContext(EditorThemeContext);

  if (!context) {
    throw new Error(
      "useEditorTheme must be used inside EditorThemeProvider"
    );
  }

  return context;
}