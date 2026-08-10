"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QuizGeneratorPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/practice");
  }, [router]);

  return null;
}