"use client";
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CitizenProvider } from "@/hooks/useCitizenData";

// Reads role from localStorage and redirects before rendering children.
// This runs on every navigation within /officer/**.
export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // The login page itself must always render — skip the guard there.
    if (pathname === "/officer") return;

    const role = (localStorage.getItem("userRole") ?? "").toLowerCase();
    const token = localStorage.getItem("accessToken");

    // Not logged in at all → back to login
    if (!token) {
      router.replace("/officer");
      return;
    }

    // Route based on role
    if (role === "woreda_officer") {
      // Officers may only be under /officer/office/**
      if (!pathname.startsWith("/officer/office")) {
        router.replace("/officer/office/dashboard");
      }
      return;
    }

    if (role === "woreda_supervisor") {
      // Supervisors may only be under /officer/supervisor/**
      if (!pathname.startsWith("/officer/supervisor")) {
        router.replace("/officer/supervisor/dashboard");
      }
      return;
    }

    if (role === "tax_officer" || role === "taxofficer") {
      // Tax officers may be under /officer/taxOfficer/** or /officer/taxOffice/**
      if (!pathname.startsWith("/officer/taxOfficer") && !pathname.startsWith("/officer/taxOffice")) {
        router.replace("/officer/taxOfficer/dashboard");
      }
      return;
    }

    // Any other role has no business here
    router.replace("/officer");
  }, [pathname, router]);

  return <CitizenProvider>{children}</CitizenProvider>;
}
