"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import Image from "next/image";

const LANGUAGES = [
  {
    name: "Java",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  },
  {
    name: "Python",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  },
  {
    name: "C",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
  },
  {
    name: "C++",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  },
  {
    name: "JavaScript",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  },
  {
    name: "TypeScript",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  },
  {
    name: "HTML",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  },
  {
    name: "CSS",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  },
  {
    name: "React",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  },
  {
    name: "Node.js",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  },
  {
    name: "Go",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg",
  },
  {
    name: "Rust",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg",
  },
  {
    name: "Kotlin",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg",
  },
  {
    name: "PHP",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
  },
  {
    name: "Swift",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg",
  },
];

interface Props {
  value: string;
  onChange: (language: string) => void;
  darkMode: boolean;
}

export default function LanguageDropdown({
  value,
  onChange,
  darkMode,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);

    return () =>
      document.removeEventListener("mousedown", handleOutside);
  }, []);

  const filtered = LANGUAGES.filter((lang) =>
    lang.name.toLowerCase().includes(search.toLowerCase())
  );

  const selected =
    LANGUAGES.find((l) => l.name === value) || LANGUAGES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Button */}

      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-3 px-4 h-10 rounded-xl border transition ${
          darkMode
            ? "bg-[#151823] border-white/10 hover:bg-[#1C2130]"
            : "bg-gray-100 border-gray-300 hover:bg-gray-200"
        }`}
      >
        <Image
          src={selected.icon}
          alt={selected.name}
          width={20}
          height={20}
        />

        <span>{selected.name}</span>

        <ChevronDown
          size={16}
          className={`transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}

      {open && (
        <div
          className={`absolute mt-2 w-72 rounded-xl shadow-2xl border overflow-hidden z-50 ${
            darkMode
              ? "bg-[#11131B] border-white/10"
              : "bg-white border-gray-200"
          }`}
        >
          {/* Search */}

          <div className="p-3">
            <div
              className={`flex items-center gap-2 rounded-lg px-3 border ${
                darkMode
                  ? "bg-[#1A1D26] border-white/10"
                  : "bg-gray-100 border-gray-200"
              }`}
            >
              <Search size={16} />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search language..."
                className="flex-1 py-2 bg-transparent outline-none text-sm"
              />
            </div>
          </div>

          {/* Languages */}

          <div className="max-h-72 overflow-y-auto">
            {filtered.map((language) => (
              <button
                key={language.name}
                onClick={() => {
                  onChange(language.name);
                  setOpen(false);
                  setSearch("");
                }}
                className={`w-full flex items-center justify-between px-4 py-3 transition ${
                  darkMode
                    ? "hover:bg-[#1A1D26]"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={language.icon}
                    alt={language.name}
                    width={22}
                    height={22}
                  />

                  <span>{language.name}</span>
                </div>

                {language.name === value && (
                  <Check
                    size={18}
                    className="text-green-500"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}