"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  DoorOpen,
  TrendingUp,
  Plus,
  MapPin,
  Home,
  Store,
  Bed,
  Bath,
  Maximize2,
  Clock,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Hourglass,
} from "lucide-react";
import { getSession, getMyProperties, PropertyResponse } from "@/lib/api";

// Derives a display label and badge variant from the backend status enum
function statusMeta(status: PropertyResponse["status"]): { label: string; variant: "active" | "pending" | "rejected" | "default" } {
  switch (status) {
    case "LISTED":    return { label: "Listed",    variant: "active"   };
    case "VERIFIED":  return { label: "Verified",  variant: "active"   };
    case "RENTED":    return { label: "Rented",    variant: "active"   };
    case "PENDING":   return { label: "Pending",   variant: "pending"  };
    case "REJECTED":  return { label: "Rejected",  variant: "rejected" };
    case "UNLISTED":  return { label: "Unlisted",  variant: "default"  };
    default:          return { label: status,      variant: "default"  };
  }
}

function StatusIcon({ status }: { status: PropertyResponse["status"] }) {
  if (status === "LISTED" || status === "VERIFIED" || status === "RENTED")
    return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
  if (status === "PENDING")
    return <Hourglass className="w-3.5 h-3.5 text-amber-500" />;
  if (status === "REJECTED")
    return <XCircle className="w-3.5 h-3.5 text-red-500" />;
  return <Clock className="w-3.5 h-3.5 text-slate-400" />;
}

export const PropertiesPage: React.FC = () => {
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [ownerName, setOwnerName] = useState("—");
  const [ownerEmail, setOwnerEmail] = useState("—");
  const [ownerPhone, setOwnerPhone] = useState("—");

  useEffect(() => {
    const s = getSession();
    if (!s) {
      setError("Session expired. Please log in again.");
      setLoading(false);
      return;
    }
    
    // Set owner info from session
    setOwnerName([s.user.firstName, s.user.middleName, s.user.lastName].filter(Boolean).join(" ") || "—");
    setOwnerEmail(s.user.email ?? "—");
    setOwnerPhone(s.user.phoneNumber ?? "—");
    
    getMyProperties(s.token)
      .then((data) => {
        setProperties(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load properties.");
        setLoading(false);
      });
  }, []);

  const pendingCount   = properties.filter((p) => p.status === "PENDING").length;
  const activeCount    = properties.filter((p) => ["LISTED","VERIFIED","RENTED"].includes(p.status)).length;
  const rejectedCount  = properties.filter((p) => p.status === "REJECTED").length;

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200/60">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">My Properties</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered under <span className="font-semibold text-slate-700">{ownerName}</span> · {ownerEmail}
          </p>
        </div>
        <Button
          onClick={() => router.push("/citizen/dashboard/properties/register")}
          className="bg-[#00450d] hover:bg-[#1b5e20] text-white shadow-xs font-medium text-xs gap-1.5 self-start sm:self-auto h-8 px-3 rounded-md"
        >
          <Plus className="w-3.5 h-3.5" />
          Register Property
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-white border-slate-200 shadow-clean">
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total</p>
              <p className="text-xl font-bold text-slate-900">{loading ? "—" : properties.length}</p>
              <p className="text-[10px] text-slate-400">Registered in GRAMS</p>
            </div>
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-700">
              <Building2 className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-clean">
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Active</p>
              <p className="text-xl font-bold text-emerald-700">{loading ? "—" : activeCount}</p>
              <p className="text-[10px] text-slate-400">Listed / Rented</p>
            </div>
            <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-clean">
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Pending Review</p>
              <p className="text-xl font-bold text-amber-600">{loading ? "—" : pendingCount}</p>
              <p className="text-[10px] text-slate-400">Awaiting officer verification</p>
            </div>
            <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center text-amber-600">
              <Hourglass className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading your properties...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && properties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <Building2 className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No properties registered yet</p>
          <p className="text-xs text-slate-500 max-w-xs">
            Register your first property to start managing it through the GRAMS municipal platform.
          </p>
          <Button
            onClick={() => router.push("/citizen/dashboard/properties/register")}
            className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-9 px-5 mt-1"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Register First Property
          </Button>
        </div>
      )}

      {/* Property cards */}
      {!loading && !error && properties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((p) => {
            const { label, variant } = statusMeta(p.status);
            const coverImage = p.images.find((i) => i.isCover)?.imageUrl ?? p.images[0]?.imageUrl;
            const isCommercial = p.propertyType.toLowerCase().includes("mall") || p.propertyType.toLowerCase().includes("commercial");

            return (
              <Card
                key={p.id}
                onClick={() => router.push(`/citizen/dashboard/properties/property-detail?id=${p.id}`)}
                className="bg-white border-slate-200 shadow-clean hover:border-[#00450d]/30 hover:shadow-md transition-all flex flex-col"
              >
                {/* Cover image */}
                <div className="relative h-36 rounded-t-xl overflow-hidden bg-slate-100 shrink-0">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={p.title ?? p.propertyType}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      {isCommercial ? <Store className="w-10 h-10" /> : <Home className="w-10 h-10" />}
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant={variant} className="text-[9px] flex items-center gap-1">
                      <StatusIcon status={p.status} />
                      {label}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-3 flex flex-col gap-2 flex-1">
                  {/* Title & code */}
                  <div>
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {p.title ?? `${p.propertyType} — ${p.address.subCity}`}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">{p.propertyCode}</p>
                  </div>

                  {/* Address */}
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    {[p.address.subCity, p.address.woreda && `Woreda ${p.address.woreda}`, p.address.houseNumber]
                      .filter(Boolean)
                      .join(", ")}
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 text-[10px] text-slate-600 border-t border-slate-100 pt-2 mt-auto">
                    {p.bedroomCount != null && (
                      <span className="flex items-center gap-1">
                        <Bed className="w-3 h-3 text-slate-400" /> {p.bedroomCount} bed
                      </span>
                    )}
                    {p.bathroomCount != null && (
                      <span className="flex items-center gap-1">
                        <Bath className="w-3 h-3 text-slate-400" /> {p.bathroomCount} bath
                      </span>
                    )}
                    {p.areaSqMeter != null && (
                      <span className="flex items-center gap-1">
                        <Maximize2 className="w-3 h-3 text-slate-400" /> {Number(p.areaSqMeter).toLocaleString()} m²
                      </span>
                    )}
                    <span className="ml-auto font-bold text-slate-900">
                      ETB {Number(p.monthlyRent).toLocaleString()}/mo
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
