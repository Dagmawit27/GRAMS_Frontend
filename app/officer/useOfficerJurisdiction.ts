"use client";
import { getSession, UserSummary } from "@/lib/api";

export interface OfficerJurisdiction {
  subCity: string;
  woreda: string;
  user: UserSummary;
  token: string;
}

/**
 * Reads the logged-in officer's jurisdiction (subCity + woreda) directly
 * from localStorage via getSession(). Returns null if no valid session exists.
 */
export function getOfficerJurisdiction(): OfficerJurisdiction | null {
  const session = getSession();
  if (!session) return null;
  const { subCity, woreda } = session.user;
  if (!subCity || !woreda) return null;
  return { subCity, woreda, user: session.user, token: session.token };
}
