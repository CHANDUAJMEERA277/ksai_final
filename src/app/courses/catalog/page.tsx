"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CatalogRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const enroll = searchParams.get("enroll");
    if (enroll) {
      router.replace(`/dashboard?enroll=${enroll}`);
    } else {
      router.replace("/dashboard");
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-slate-500 font-mono text-xs animate-pulse">
      Loading course catalog...
    </div>
  );
}

export default function CatalogRedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-slate-500 font-mono text-xs">
        Loading...
      </div>
    }>
      <CatalogRedirect />
    </Suspense>
  );
}
