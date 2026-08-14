"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

import {
  LANGUAGES,
  LanguageConfig,
} from "./LanguageConfig";

interface LanguageContextType {

  language: LanguageConfig;

  setLanguage: (name: string) => void;

  languages: LanguageConfig[];

}

const LanguageContext =
  createContext<LanguageContextType | undefined>(
    undefined
  );

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [languageName, setLanguageName] =
    useState("Java");

  const language = useMemo(() => {

    return (

      LANGUAGES.find(

        (lang) => lang.name === languageName

      ) || LANGUAGES[0]

    );

  }, [languageName]);

  return (

    <LanguageContext.Provider
      value={{

        language,

        setLanguage: setLanguageName,

        languages: LANGUAGES,

      }}
    >

      {children}

    </LanguageContext.Provider>

  );

}

export function useLanguage() {

  const context = useContext(LanguageContext);

  if (!context) {

    throw new Error(

      "useLanguage must be used inside LanguageProvider"

    );

  }

  return context;

}