"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SubCityRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/officer/subcity/reports");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Redirecting to Sub-City Reports...</p>
      </div>
    </div>
  );
}
