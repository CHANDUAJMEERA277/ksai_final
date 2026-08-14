export type ExplorerItemType = "file" | "folder";

export interface ExplorerItem {

  id: string;

  name: string;

  type: ExplorerItemType;

  extension?: string;

  content?: string;

  expanded?: boolean;

  favorite?: boolean;

  children?: ExplorerItem[];

}

export interface Workspace {

  id: string;

  name: string;

  language: string;

  items: ExplorerItem[];

}