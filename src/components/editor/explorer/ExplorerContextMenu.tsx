"use client";

import type { ReactNode } from "react";

import {
  FilePlus2,
  FolderPlus,
  Pencil,
  Trash2,
  Copy,
  ClipboardPaste,
  Star,
} from "lucide-react";

interface Props {

  x:number;

  y:number;

  onClose:()=>void;

  onNewFile:()=>void;

  onNewFolder:()=>void;

  onRename:()=>void;

  onDelete:()=>void;

  onCopy:()=>void;

  onPaste:()=>void;

  onFavorite:()=>void;

}

export default function ExplorerContextMenu({

  x,

  y,

  onClose,

  onNewFile,

  onNewFolder,

  onRename,

  onDelete,

  onCopy,

  onPaste,

  onFavorite,

}:Props){

  return(

    <>

      <div

        className="fixed inset-0 z-40"

        onClick={onClose}

      />

      <div

        style={{

          left:x,

          top:y,

        }}

        className="fixed z-50 w-72 rounded-2xl border border-slate-700 bg-[#1B1F2A] shadow-2xl p-2">

        <MenuItem
          icon={<FilePlus2 size={17}/>}
          label="New File"
          onClick={onNewFile}
        />

        <MenuItem
          icon={<FolderPlus size={17}/>}
          label="New Folder"
          onClick={onNewFolder}
        />

        <Divider/>

        <MenuItem
          icon={<Copy size={17}/>}
          label="Copy"
          onClick={onCopy}
        />

        <MenuItem
          icon={<ClipboardPaste size={17}/>}
          label="Paste"
          onClick={onPaste}
        />

        <Divider/>

        <MenuItem
          icon={<Pencil size={17}/>}
          label="Rename"
          onClick={onRename}
        />

        <MenuItem
          icon={<Trash2 size={17}/>}
          label="Delete"
          onClick={onDelete}
        />

        <Divider/>

        <MenuItem
          icon={<Star size={17}/>}
          label="Favorite"
          onClick={onFavorite}
        />

      </div>

    </>

  );

}

function Divider(){

  return(

    <div className="my-2 border-t border-white/10"/>

  );

}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        w-full
        flex
        items-center
        gap-3
        px-3
        py-2.5
        rounded-lg
        text-gray-200
        hover:bg-blue-600
        hover:text-white
        transition-all
        duration-200
      "
    >
      <span className="w-5 flex justify-center">
        {icon}
      </span>

      <span className="text-sm font-medium">
        {label}
      </span>
    </button>
  );
}