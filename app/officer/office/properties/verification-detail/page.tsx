"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPropertyForOfficer, updatePropertyStatus, PropertyResponse, getUnitById, PropertyUnitResponse } from "@/lib/api";
import { getOfficerJurisdiction } from "@/app/officer/useOfficerJurisdiction";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
  MapPin,
  Building2,
  Bed,
  Bath,
  Maximize2,
  FileText,
  Eye,
  Download,
  RefreshCw,
  Home,
  Store,
  Calendar,
} from "lucide-react";

function DetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("id");
  const rawJurisdiction = getOfficerJurisdiction();

  const jurisdiction = useMemo(() => rawJurisdiction, [
    rawJurisdiction?.token,
    rawJurisdiction?.subCity,
    rawJurisdiction?.woreda,
    rawJurisdiction?.user?.id,
  ]);

  const token = jurisdiction?.token;
  const subCity = jurisdiction?.subCity;
  const woreda = jurisdiction?.woreda;

  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<{ name: string; url: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [checklist, setChecklist] = useState({
    titleDeed: false,
    ownerIdentity: false,
    boundaries: false,
  });
  const [selectedUnit, setSelectedUnit] = useState<PropertyUnitResponse | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);

  const toggle = (k: keyof typeof checklist) => setChecklist((p) => ({ ...p, [k]: !p[k] }));
  const allChecked = Object.values(checklist).every(Boolean);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!propertyId) {
      setError("No property ID provided.");
      setLoading(false);
      return;
    }
    if (!jurisdiction || !token) {
      setError("Session expired.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    setProperty(null);
    // eslint-disable-next-line no-console
    console.log("[OfficerDetail] loading id:", propertyId, "token length:", token.length, "subCity:", subCity, "woreda:", woreda);
    getPropertyForOfficer(propertyId, token)
      .then((data) => {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.log("[OfficerDetail] success:", data);
        setProperty(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.error("[OfficerDetail] fetch FAILED:", err);
        setError(err instanceof Error ? err.message : "Failed to load property.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [propertyId, token, subCity, woreda]);

  const handleVerify = async () => {
    if (!jurisdiction || !property) return;
    setActionLoading(true);
    try {
      await updatePropertyStatus(jurisdiction.token, property.id, "VERIFIED", "Officer verification complete.");
      showToast("Property verified — forwarded to supervisor.");
      setTimeout(() => router.push("/officer/office/properties"), 1800);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Action failed.");
    } finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!jurisdiction || !property) return;
    if (!rejectReason.trim()) { showToast("Please provide a rejection reason."); return; }
    setActionLoading(true);
    try {
      await updatePropertyStatus(jurisdiction.token, property.id, "REJECTED", rejectReason.trim());
      showToast("Property rejected.");
      setTimeout(() => router.push("/officer/office/properties"), 1800);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Action failed.");
    } finally { setActionLoading(false); }
  };

  const handleUnitClick = async (unitId: string) => {
    if (!jurisdiction?.token) return;

    try {
      const unitData = await getUnitById(unitId, jurisdiction.token);
      setSelectedUnit(unitData);
      setShowUnitModal(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load unit details");
    }
  };

  if (!jurisdiction) return (
    <div className="py-12 text-center text-slate-500 text-sm">
      Session expired. <a href="/officer" className="text-[#00450d] underline">Sign in again</a>.
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-2 pb-6 space-y-6 animate-in fade-in duration-150">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toast}
        </div>
      )}

      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00450d]" /> {previewUrl.name}
              </span>
              <button onClick={() => setPreviewUrl(null)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500">✕</button>
            </div>
            <div className="p-6 bg-slate-900 flex items-center justify-center max-h-[70vh] overflow-y-auto">
              <img src={previewUrl.url} alt={previewUrl.name} className="max-h-[60vh] rounded-lg object-contain" />
            </div>
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button size="sm" variant="outline" className="text-xs gap-1.5">
                <Download className="w-3.5 h-3.5" /> Download
              </Button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => router.push("/officer/office/properties")}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 uppercase tracking-wider transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Pending List
      </button>

      {loading && (
        <div className="flex items-center justify-center py-24 gap-2 text-slate-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-[#00450d]" /> Loading property...
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <AlertTriangle className="w-10 h-10 text-red-400" />
          <p className="text-sm font-semibold text-slate-700">{error}</p>
          <Button variant="outline" size="sm" onClick={() => router.push("/officer/office/properties")} className="text-xs">Back</Button>
        </div>
      )}

      {!loading && !error && property && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-black text-slate-900">
                  {property.title ?? property.propertyType} —{" "}
                  <span className="text-[#00450d] font-mono text-base">{property.propertyCode}</span>
                </h1>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide">
                  Pending Verification
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#00450d]" />
                {[
                  property.address?.city,
                  property.address?.subCity,
                  property.address?.woreda && `Woreda ${property.address.woreda}`,
                  property.address?.houseNumber,
                ].filter(Boolean).join(", ") || "Address unavailable"}
              </p>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5" />
              {property.createdAt
                ? new Date(property.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "—"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-5">
              {/* Images */}
              {property.images && property.images.length > 0 ? (
                <div className="space-y-2">
                  <div className="relative h-56 sm:h-72 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={property.images.find((i) => i.isCover)?.imageUrl ?? property.images[0]?.imageUrl}
                      alt={property.title ?? property.propertyType ?? "Property photo"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {property.propertyType ?? "Property"}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      {property.images.length} photo{property.images.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  {property.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {property.images.map((img, idx) => (
                        <div key={img.id || idx} className="w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                          <img
                            src={img.imageUrl}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-56 sm:h-64 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2">
                  {property.propertyType?.toLowerCase().includes("mall") || property.propertyType?.toLowerCase().includes("commercial")
                    ? <Store className="w-14 h-14" />
                    : <Home className="w-14 h-14" />}
                  <span className="text-[11px] font-semibold">No photos uploaded yet</span>
                </div>
              )}

              {/* Details */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#00450d]" /> Property Details
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  {[
                    ["Type", property.propertyType ?? "—"],
                    property.bedroomCount != null ? ["Bedrooms", `${property.bedroomCount}`] : null,
                    property.bathroomCount != null ? ["Bathrooms", `${property.bathroomCount}`] : null,
                    property.areaSqMeter != null ? ["Area", `${Number(property.areaSqMeter).toLocaleString()} m²`] : null,
                    property.floorNumber ? ["Floor", property.floorNumber] : null,
                    ["Monthly Rent", `ETB ${Number(property.monthlyRent ?? 0).toLocaleString()}`],
                    property.furnishingStatus ? ["Furnishing", property.furnishingStatus] : null,
                    property.ownershipType ? ["Ownership", property.ownershipType] : null,
                    property.cadastralParcelId ? ["Cadastral ID", property.cadastralParcelId] : null,
                    property.titleDeedNumber ? ["Title Deed #", property.titleDeedNumber] : null,
                  ].filter((x): x is [string, string] => x !== null).map(([k, v]) => (
                    <div key={k as string}>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{k}</span>
                      <span className={`font-semibold text-slate-900 ${k === "Monthly Rent" ? "text-[#00450d]" : ""} ${k === "Cadastral ID" || k === "Title Deed #" ? "font-mono" : ""}`}>{v}</span>
                    </div>
                  ))}
                </div>
                {property.description && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Description</span>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{property.description}</p>
                  </div>
                )}
                {property.specificLandmark && (
                  <p className="text-xs text-slate-500 flex items-start gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" /> {property.specificLandmark}
                  </p>
                )}
              </div>

              {/* Documents */}
              {property.ownershipDocuments && property.ownershipDocuments.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
                  <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-[#00450d]" /> Ownership Documents</span>
                    <span className="text-xs font-normal text-slate-400">
                      {property.ownershipDocuments.length} file{property.ownershipDocuments.length !== 1 ? "s" : ""}
                    </span>
                  </h3>
                  {property.ownershipDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{doc.documentType}</p>
                          <p className="text-[10px] text-slate-500">
                            Ref: {doc.documentNumber}{doc.issueDate ? ` · ${doc.issueDate}` : ""}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => doc.filePath && setPreviewUrl({ name: doc.documentType, url: doc.filePath })}
                        disabled={!doc.filePath}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Mall Units (for shopping malls) */}
              {(property.propertyType?.toLowerCase().includes("mall") ||
                property.propertyType?.toLowerCase().includes("commercial") ||
                property.propertyType?.toLowerCase().includes("plaza") ||
                property.propertyType?.toLowerCase().includes("shopping") ||
                property.propertyType?.toLowerCase().includes("retail") ||
                (property.units && property.units.length > 0)) && property.units && property.units.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
                  <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-2"><Store className="w-4 h-4 text-[#00450d]" /> Shopping Mall Units</span>
                    <span className="text-xs font-normal text-slate-400">
                      {property.units.length} unit{property.units.length !== 1 ? "s" : ""}
                    </span>
                  </h3>
                  {property.units.map((unit) => (
                    <div
                      key={unit.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors cursor-pointer"
                      onClick={() => handleUnitClick(unit.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded bg-emerald-100 text-[#00450d] flex items-center justify-center font-bold text-xs shrink-0">
                          {unit.unitCode?.slice(0, 2) || "UN"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900">{unit.unitCode || unit.shopNumber || "—"}</p>
                          <p className="text-[10px] text-slate-500">{unit.unitType || unit.category || "—"}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-slate-900">{unit.rentAmount ? `ETB ${Number(unit.rentAmount).toLocaleString()}` : "—"}</p>
                        <p className="text-[10px] text-slate-500">{unit.areaSqMeter ? `${Number(unit.areaSqMeter).toLocaleString()} m²` : "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right col */}
            <div className="space-y-5">

              
              {/* Landlord Information */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#00450d]" /> Landlord Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Owner Name</span>
                    <span className="font-semibold text-slate-900">{property.landlordName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Phone</span>
                    <span className="font-semibold text-slate-900">{property.landlordPhone || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Email</span>
                    <span className="font-semibold text-slate-900">{property.landlordEmail || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Title Deed #</span>
                    <span className="font-semibold text-slate-900 font-mono">{property.titleDeedNumber || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00450d]" /> Verification Checklist
                </h3>
                <div className="space-y-2.5">
                  {([
                    ["titleDeed",     "Title Deed Authenticity Verified"],
                    ["ownerIdentity", "Owner Identity Confirmed"],
                    ["boundaries",    "Cadastral Boundaries Match Documents"],
                  ] as [keyof typeof checklist, string][]).map(([key, label]) => (
                    <label key={key} className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      checklist[key] ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200 hover:bg-slate-100/70"
                    }`}>
                      <input type="checkbox" checked={checklist[key]} onChange={() => toggle(key)}
                        className="mt-0.5 w-4 h-4 accent-[#00450d] rounded" />
                      <span className="text-xs font-medium text-slate-800">{label}</span>
                    </label>
                  ))}
                </div>
                {!allChecked && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Complete all checklist items to verify.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button disabled={!allChecked || actionLoading} onClick={handleVerify}
                  className="w-full h-11 bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs font-bold rounded-lg gap-2 shadow-sm">
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Verify → Forward to Supervisor
                </Button>

                {!showRejectInput ? (
                  <Button variant="outline" onClick={() => setShowRejectInput(true)} disabled={actionLoading}
                    className="w-full h-11 border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold rounded-lg gap-2">
                    <XCircle className="w-4 h-4" /> Reject Registration
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Rejection reason (required)..."
                      className="w-full text-xs p-3 rounded-xl border border-red-200 bg-red-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-400 resize-none" />
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setShowRejectInput(false); setRejectReason(""); }} className="text-xs">Cancel</Button>
                      <Button size="sm" disabled={actionLoading || !rejectReason.trim()} onClick={handleReject}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold">
                        {actionLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Confirm Reject"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </>
      )}

      {/* Unit Detail Modal */}
      {showUnitModal && selectedUnit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Unit Details</h3>
              <button
                onClick={() => setShowUnitModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Unit Code</span>
                  <span className="font-semibold text-slate-900">{selectedUnit.unitCode || selectedUnit.shopNumber || "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Type</span>
                  <span className="font-semibold text-slate-900">{selectedUnit.unitType || selectedUnit.category || "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Floor</span>
                  <span className="font-semibold text-slate-900">{selectedUnit.floorLevel || "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Area</span>
                  <span className="font-semibold text-slate-900">{selectedUnit.areaSqMeter ? `${Number(selectedUnit.areaSqMeter).toLocaleString()} m²` : "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Monthly Rent</span>
                  <span className="font-semibold text-slate-900">{selectedUnit.rentAmount ? `ETB ${Number(selectedUnit.rentAmount).toLocaleString()}` : "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Status</span>
                  <span className="font-semibold text-slate-900">{selectedUnit.status}</span>
                </div>
              </div>
              {selectedUnit.tenantName && (
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Current Tenant</span>
                  <span className="font-semibold text-slate-900">{selectedUnit.tenantName}</span>
                </div>
              )}
              {selectedUnit.description && (
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Description</span>
                  <p className="text-slate-700 leading-relaxed">{selectedUnit.description}</p>
                </div>
              )}
            </div>
            <Button
              onClick={() => setShowUnitModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs h-9 rounded-lg"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OfficerVerificationDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24 gap-2 text-slate-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-[#00450d]" /> Loading property...
        </div>
      }
    >
      <DetailContent />
    </Suspense>
  );
}
