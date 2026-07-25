"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ThemeManager() {
  const pathname = usePathname();

  useEffect(() => {
    const isLandingPage = pathname === "/";
    if (!isLandingPage) {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      document.body.classList.remove("dark");
      document.body.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      document.body.classList.remove("light");
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  }, [pathname]);

  return null;
}
