import { LanguageConfig } from "../languages/LanguageConfig";
import {
  ExplorerItem,
  Workspace,
} from "./ExplorerTypes";

function folder(
  id: string,
  name: string,
  children: ExplorerItem[] = []
): ExplorerItem {

  return {

    id,

    name,

    type: "folder",

    expanded: true,

    children,

  };

}

function file(
  id: string,
  name: string,
  extension: string
): ExplorerItem {

  return {

    id,

    name,

    extension,

    type: "file",

  };

}

export function createWorkspace(
  language: LanguageConfig
): Workspace {

  const srcFolder = folder(

    "src",

    language.defaultFolder || "src",

    [

      file(

        "main",

        language.defaultFile,

        language.extension

      ),

    ]

  );

  return {

    id: crypto.randomUUID(),

    name: language.projectName,

    language: language.name,

    items: [

      srcFolder,

      file(

        "readme",

        "README.md",

        ".md"

      ),

      file(

        "gitignore",

        ".gitignore",

        ""

      ),

    ],

  };

}