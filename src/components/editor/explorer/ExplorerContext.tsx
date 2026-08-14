"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { useLanguage } from "../languages/LanguageContext";

import {
  ExplorerItem,
  Workspace,
} from "./ExplorerTypes";

import {
  createWorkspace,
} from "./FileSystem";

interface ExplorerContextType {

  workspace: Workspace;

  setWorkspace: React.Dispatch<
    React.SetStateAction<Workspace>
  >;

  selectedFile: ExplorerItem | null;

  setSelectedFile: (
    file: ExplorerItem | null
  ) => void;

  createFile: (parentId?: string) => void;

createFolder: (parentId?: string) => void;

renameItem: (
  id: string,
  newName: string
) => void;

deleteItem: (
  id: string
) => void;

toggleFolder: (
  id: string
) => void;

}

const ExplorerContext =
  createContext<ExplorerContextType | undefined>(
    undefined
  );

export function ExplorerProvider({
  children,
}: {
  children: ReactNode;
}) {

  const { language } = useLanguage();

  const [workspace, setWorkspace] =
    useState<Workspace>(
      createWorkspace(language)
    );

  const [selectedFile, setSelectedFile] =
    useState<ExplorerItem | null>(null);

  useEffect(() => {

    setWorkspace(createWorkspace(language));

    const root = createWorkspace(language);

    const src = root.items.find(
      (item) => item.type === "folder"
    );

    if (src?.children?.length) {

      setSelectedFile(src.children[0]);

    }

  }, [language]);

  function updateItems(

  items: ExplorerItem[],

  callback: (
    item: ExplorerItem
  ) => ExplorerItem

): ExplorerItem[] {

  return items.map((item) => {

    const updated = callback(item);

    if (updated.children) {

      updated.children = updateItems(

        updated.children,

        callback

      );

    }

    return updated;

  });

}

const createFolder = (

  parentId = "src"

) => {

  const newFolder: ExplorerItem = {

    id: crypto.randomUUID(),

    name: "New Folder",

    type: "folder",

    expanded: true,

    children: [],

  };

  setWorkspace((prev) => ({

    ...prev,

    items: updateItems(

      prev.items,

      (item) => {

        if (

          item.id === parentId &&

          item.type === "folder"

        ) {

          return {

            ...item,

            children: [

              ...(item.children || []),

              newFolder,

            ],

          };

        }

        return item;

      }

    ),

  }));

};

function getDefaultTemplate() {

  switch (language.extension) {

    case ".java":

      return `public class Main {

    public static void main(String[] args) {

        System.out.println("Hello KnowledgeStream AI");

    }

}`;

    case ".py":

      return `print("Hello KnowledgeStream AI")`;

    case ".js":

      return `console.log("Hello KnowledgeStream AI");`;

    case ".cpp":

      return `#include <iostream>

using namespace std;

int main(){

    cout<<"Hello";

}`;

    case ".c":

      return `#include <stdio.h>

int main(){

    printf("Hello");

    return 0;

}`;

    case ".html":

      return `<!DOCTYPE html>
<html>
<head>
<title>KnowledgeStream AI</title>
</head>
<body>

</body>
</html>`;

    default:

      return "";

  }

}

const createFile = (

  parentId = "src"

) => {

  const newFile: ExplorerItem = {

  id: crypto.randomUUID(),

  name: "Untitled" + language.extension,

  extension: language.extension,

  type: "file",

  content: getDefaultTemplate(),

};

  setWorkspace((prev) => ({

    ...prev,

    items: updateItems(

      prev.items,

      (item) => {

        if (

          item.id === parentId &&

          item.type === "folder"

        ) {

          return {

            ...item,

            children: [

              ...(item.children || []),

              newFile,

            ],

          };

        }

        return item;

      }

    ),

  }));

  setSelectedFile(newFile);

};

const renameItem = (

  id: string,

  newName: string

) => {

  setWorkspace((prev) => ({

    ...prev,

    items: updateItems(

      prev.items,

      (item) =>

        item.id === id

          ? {

              ...item,

              name: newName,

            }

          : item

    ),

  }));

};

function removeItem(

  items: ExplorerItem[],

  id: string

): ExplorerItem[] {

  return items

    .filter(

      (item) => item.id !== id

    )

    .map((item) => ({

      ...item,

      children: item.children

        ? removeItem(

            item.children,

            id

          )

        : undefined,

    }));

}

const deleteItem = (

  id: string

) => {

  setWorkspace((prev) => ({

    ...prev,

    items: removeItem(

      prev.items,

      id

    ),

  }));

};

const toggleFolder = (id: string) => {

  setWorkspace((prev) => ({

    ...prev,

    items: updateItems(

      prev.items,

      (item) => {

        if (

          item.id === id &&

          item.type === "folder"

        ) {

          return {

            ...item,

            expanded: !item.expanded,

          };

        }

        return item;

      }

    ),

  }));

};

  return (

    <ExplorerContext.Provider
      value={{

  workspace,

  setWorkspace,

  selectedFile,

  setSelectedFile,

  createFile,

  createFolder,

  renameItem,

  deleteItem,

  toggleFolder,

}}
    >

      {children}

    </ExplorerContext.Provider>

  );

}

export function useExplorer() {

  const context = useContext(
    ExplorerContext
  );

  if (!context) {

    throw new Error(

      "useExplorer must be used inside ExplorerProvider"

    );

  }

  return context;

}