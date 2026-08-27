"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Building2,
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
  ArrowLeft,
  Calendar,
  FileText,
  FileCheck2,
  ShieldCheck,
  Download,
  Share2,
  Phone,
  Mail,
  User,
  Zap,
  Droplets,
  Layers,
  Sparkles,
  ExternalLink,
  QrCode,
  Check,
  Plus,
  DoorOpen,
  ShoppingBag,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Upload,
  HardDrive,
  Database,
  Image as ImageIcon,
  Expand,
  X,
  Settings2,
  Copy,
  TrendingUp,
  Receipt,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Eye,
  Tag,
  Activity,
  CheckCircle
} from "lucide-react";
import { getSession, getMyProperties, getPropertyById, PropertyResponse } from "@/lib/api";
import { useCitizenData } from "@/hooks/useCitizenData";
import { PropertyUnit } from "@/types";
import {
  getDynamicPropertyGallery,
  resolveMinioImageUrl,
  getMinioConfig,
  setMinioConfig,
  MinioConfig
} from "@/lib/minio";

// Derives a display label and badge variant from the backend status enum
function statusMeta(status: PropertyResponse["status"]): { label: string; variant: "active" | "pending" | "rejected" | "default" } {
  switch (status) {
    case "LISTED":    return { label: "Listed on GRAMS",       variant: "active"   };
    case "VERIFIED":  return { label: "Municipality Verified", variant: "active"   };
    case "RENTED":    return { label: "Currently Rented",      variant: "active"   };
    case "PENDING":   return { label: "Pending Verification",  variant: "pending"  };
    case "REJECTED":  return { label: "Verification Rejected", variant: "rejected" };
    case "UNLISTED":  return { label: "Unlisted / Draft",      variant: "default"  };
    default:          return { label: status,                  variant: "default"  };
  }
}

function StatusIcon({ status }: { status: PropertyResponse["status"] }) {
  if (status === "LISTED" || status === "VERIFIED" || status === "RENTED")
    return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  if (status === "PENDING")
    return <Hourglass className="w-4 h-4 text-amber-500" />;
  if (status === "REJECTED")
    return <XCircle className="w-4 h-4 text-red-500" />;
  return <Clock className="w-4 h-4 text-slate-400" />;
}

// Generate realistic default shopping mall units if not supplied or if mall has > 1 unit
function generateDefaultMallUnits(count: number = 24, propertyCode: string = "PRP-MALL"): PropertyUnit[] {
  const units: PropertyUnit[] = [
    {
      id: "u-1",
      unitCode: "G-01",
      name: "Anchor Retail Space",
      type: "Anchor Retail",
      category: "Retail / Boutique",
      area: 65,
      status: "Rented",
      rentAmount: 35000,
      tenant: "Al-Noor Electronics & Home Appliances",
      floorLevel: "Ground Floor",
      shopNumber: "Shop G-01",
      submeter: true,
      waterSupply: true,
      frontage: "Glass Display Window Frontage",
    },
    {
      id: "u-2",
      unitCode: "G-02",
      name: "Coffee & Beverage Kiosk",
      type: "Café / Kiosk",
      category: "Café / Restaurant",
      area: 22,
      status: "Rented",
      rentAmount: 18000,
      tenant: "Kaldis Express Coffee",
      floorLevel: "Ground Floor",
      shopNumber: "Shop G-02",
      submeter: true,
      waterSupply: true,
      frontage: "Glass Frontage w/ Seating Bay",
    },
    {
      id: "u-3",
      unitCode: "G-03",
      name: "Commercial Pharmacy Space",
      type: "Pharmacy / Medical",
      category: "Pharmacy / Clinic",
      area: 55,
      status: "Available",
      rentAmount: 28000,
      floorLevel: "Ground Floor",
      shopNumber: "Shop G-03",
      submeter: true,
      waterSupply: true,
      frontage: "Roller Shutter Frontage",
    },
    {
      id: "u-4",
      unitCode: "G-04",
      name: "Cosmetics & Fragrance Boutique",
      type: "Retail Boutique",
      category: "Cosmetics & Beauty",
      area: 38,
      status: "Rented",
      rentAmount: 22000,
      tenant: "Lul Beauty & Fragrances",
      floorLevel: "Ground Floor",
      shopNumber: "Shop G-04",
      submeter: true,
      waterSupply: false,
      frontage: "Glass Display Window",
    },
    {
      id: "u-5",
      unitCode: "F1-01",
      name: "Commercial Bank Branch",
      type: "Banking & Financial",
      category: "Banking / Financial",
      area: 120,
      status: "Rented",
      rentAmount: 58000,
      tenant: "Dashen Bank (S.C.)",
      floorLevel: "1st Floor",
      shopNumber: "Shop 1-01",
      submeter: true,
      waterSupply: true,
      frontage: "Heavy Security & ATM Vestibule",
    },
    {
      id: "u-6",
      unitCode: "F1-02",
      name: "Specialized Dental Clinic",
      type: "Healthcare Clinic",
      category: "Pharmacy / Clinic",
      area: 75,
      status: "Available",
      rentAmount: 34000,
      floorLevel: "1st Floor",
      shopNumber: "Shop 1-02",
      submeter: true,
      waterSupply: true,
      frontage: "Double Glass Door Entry",
    },
    {
      id: "u-7",
      unitCode: "F1-03",
      name: "Optometry & Eyewear Studio",
      type: "Retail Optical",
      category: "Retail / Boutique",
      area: 42,
      status: "Rented",
      rentAmount: 21000,
      tenant: "Vision Care Optical",
      floorLevel: "1st Floor",
      shopNumber: "Shop 1-03",
      submeter: true,
      waterSupply: false,
      frontage: "Glass Display Window",
    },
    {
      id: "u-8",
      unitCode: "F1-04",
      name: "Executive Law Chambers",
      type: "Professional Office",
      category: "Professional Office",
      area: 60,
      status: "Rented",
      rentAmount: 26000,
      tenant: "Tadesse & Partners Legal Firm",
      floorLevel: "1st Floor",
      shopNumber: "Shop 1-04",
      submeter: true,
      waterSupply: false,
      frontage: "Acoustic Partition Wall",
    },
    {
      id: "u-9",
      unitCode: "F2-01",
      name: "Luxury Hair Salon & Spa",
      type: "Beauty & Wellness",
      category: "Salon / Beauty",
      area: 95,
      status: "Rented",
      rentAmount: 42000,
      tenant: "Elegance Hair & Day Spa",
      floorLevel: "2nd Floor",
      shopNumber: "Shop 2-01",
      submeter: true,
      waterSupply: true,
      frontage: "Open Reception w/ Wash Stations",
    },
    {
      id: "u-10",
      unitCode: "F2-02",
      name: "Mobile Phones & Gadgets Hub",
      type: "Electronics",
      category: "Electronics / Telecom",
      area: 48,
      status: "Rented",
      rentAmount: 24000,
      tenant: "Ethio-Smart Tech Solutions",
      floorLevel: "2nd Floor",
      shopNumber: "Shop 2-02",
      submeter: true,
      waterSupply: false,
      frontage: "Glass Display Window",
    },
    {
      id: "u-11",
      unitCode: "F2-03",
      name: "Traditional Habesha Fashion",
      type: "Apparel Boutique",
      category: "Retail / Boutique",
      area: 52,
      status: "Available",
      rentAmount: 25000,
      floorLevel: "2nd Floor",
      shopNumber: "Shop 2-03",
      submeter: true,
      waterSupply: false,
      frontage: "Glass Display Window",
    },
    {
      id: "u-12",
      unitCode: "F2-04",
      name: "Software & Digital Design Studio",
      type: "Tech Office",
      category: "Professional Office",
      area: 70,
      status: "Rented",
      rentAmount: 31000,
      tenant: "Sheba Cloud Solutions",
      floorLevel: "2nd Floor",
      shopNumber: "Shop 2-04",
      submeter: true,
      waterSupply: false,
      frontage: "Soundproof Glass Office",
    },
    {
      id: "u-13",
      unitCode: "F3-01",
      name: "Rooftop Bistro & Terrace Lounge",
      type: "Restaurant / Lounge",
      category: "Café / Restaurant",
      area: 160,
      status: "Rented",
      rentAmount: 65000,
      tenant: "Skyline Sunset Bistro",
      floorLevel: "3rd Floor",
      shopNumber: "Shop 3-01",
      submeter: true,
      waterSupply: true,
      frontage: "Panoramic Balcony Glass Wall",
    },
    {
      id: "u-14",
      unitCode: "F3-02",
      name: "Accounting & Auditing Bureau",
      type: "Financial Office",
      category: "Professional Office",
      area: 65,
      status: "Available",
      rentAmount: 27000,
      floorLevel: "3rd Floor",
      shopNumber: "Shop 3-02",
      submeter: true,
      waterSupply: false,
      frontage: "Executive Suite",
    },
  ];

  if (count <= units.length) {
    return units.slice(0, count);
  }

  // Generate remainder up to count
  const additional: PropertyUnit[] = [];
  for (let i = units.length + 1; i <= count; i++) {
    const floorIdx = (i % 4);
    const floorNames = ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor"];
    const floorPrefixes = ["G", "F1", "F2", "F3"];
    const fl = floorNames[floorIdx];
    const fp = floorPrefixes[floorIdx];
    const shopNum = `${fp}-${i < 10 ? "0" + i : i}`;
    const isRented = i % 5 !== 0;

    additional.push({
      id: `u-${i}`,
      unitCode: shopNum,
      name: `${fl} Commercial Unit ${i}`,
      type: "Commercial Shop",
      category: i % 3 === 0 ? "Retail / Boutique" : i % 3 === 1 ? "Professional Office" : "Electronics / Telecom",
      area: 35 + (i % 5) * 12,
      status: isRented ? "Rented" : "Available",
      rentAmount: 18000 + (i % 6) * 3500,
      tenant: isRented ? `Tenant Enterprise #${100 + i}` : undefined,
      floorLevel: fl,
      shopNumber: `Shop ${shopNum}`,
      submeter: true,
      waterSupply: i % 2 === 0,
      frontage: "Glass Display Frontage",
    });
  }

  return [...units, ...additional];
}

export const PropertyDetailPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("id");
  const citizenContext = useCitizenData();

  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [propertyUnits, setPropertyUnits] = useState<PropertyUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"details" | "units" | "cadastre" | "agreements" | "storage">("details");
  const [toast, setToast] = useState<string | null>(null);

  // Unit Directory Filters & View Mode
  const [unitSearchQuery, setUnitSearchQuery] = useState("");
  const [unitFloorFilter, setUnitFloorFilter] = useState("ALL");
  const [unitStatusFilter, setUnitStatusFilter] = useState("ALL");
  const [unitCategoryFilter, setUnitCategoryFilter] = useState("ALL");
  const [unitViewMode, setUnitViewMode] = useState<"table" | "grid">("table");

  // Unit Modal States
  const [selectedUnitForDetail, setSelectedUnitForDetail] = useState<PropertyUnit | null>(null);
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [newUnitCode, setNewUnitCode] = useState("");
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitCategory, setNewUnitCategory] = useState("Retail / Boutique");
  const [newUnitFloor, setNewUnitFloor] = useState("Ground Floor");
  const [newUnitArea, setNewUnitArea] = useState("45");
  const [newUnitRent, setNewUnitRent] = useState("25000");
  const [newUnitFrontage, setNewUnitFrontage] = useState("Glass Display Window Frontage");
  const [newUnitSubmeter, setNewUnitSubmeter] = useState(true);
  const [newUnitWater, setNewUnitWater] = useState(true);

  // MinIO & Lightbox States
  const [minioConfig, setLocalMinioConfig] = useState<MinioConfig>(getMinioConfig());
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [endpointInput, setEndpointInput] = useState(minioConfig.endpoint);
  const [bucketInput, setBucketInput] = useState(minioConfig.bucket);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [manualKeyInput, setManualKeyInput] = useState("");
  const [imageLabelInput, setImageLabelInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load property from database / context / local storage
  useEffect(() => {
    const s = getSession();
    const token = s?.token || "";

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        let loadedProp: PropertyResponse | null = null;

        // Attempt 1: direct get by ID from API / database
        if (propertyId) {
          const found = await getPropertyById(propertyId, token);
          if (found) {
            loadedProp = found;
          }
        }

        // Attempt 2: Load user properties from API / localStorage
        if (!loadedProp) {
          const list = await getMyProperties(token);
          if (list && list.length > 0) {
            const match = propertyId ? list.find((p) => p.id === propertyId || p.propertyCode === propertyId) : list[0];
            if (match) loadedProp = match;
          }
        }

        // Attempt 3: Check citizenContext properties or mock INITIAL_PROPERTIES
        if (!loadedProp && citizenContext?.properties && citizenContext.properties.length > 0) {
          const ctxMatch = propertyId ? citizenContext.properties.find((p) => p.id === propertyId) : citizenContext.properties[0];
          if (ctxMatch) {
            const isMallType =
              ctxMatch.type === "Commercial" ||
              (ctxMatch.title && ctxMatch.title.toLowerCase().includes("mall")) ||
              (ctxMatch.unitsCount && ctxMatch.unitsCount > 1);

            const transformed: PropertyResponse = {
              id: ctxMatch.id,
              propertyCode: ctxMatch.id,
              title: ctxMatch.title,
              propertyType: isMallType ? "Shopping Mall" : ctxMatch.type,
              address: {
                id: `addr-${ctxMatch.id}`,
                city: "Addis Ababa",
                subCity: ctxMatch.subCity,
                woreda: ctxMatch.woreda || "Woreda 01",
                houseNumber: ctxMatch.houseNo,
              },
              houseNumber: ctxMatch.houseNo,
              floorNumber: typeof ctxMatch.floor === "number" ? String(ctxMatch.floor) : ctxMatch.floor || (isMallType ? "Ground + 3 Floors" : "1"),
              bedroomCount: ctxMatch.bedrooms,
              bathroomCount: ctxMatch.bathrooms,
              areaSqMeter: ctxMatch.area,
              monthlyRent: ctxMatch.price,
              description: ctxMatch.description,
              status: ctxMatch.status === "Rented" ? "RENTED" : "LISTED",
              landlordId: "current-user",
              landlordName: ctxMatch.landlordName || "Dagmawit Mesfin Tadesse",
              unitsCount: ctxMatch.unitsCount || (ctxMatch.units ? ctxMatch.units.length : (isMallType ? 24 : 1)),
              units: ctxMatch.units,
              images: ctxMatch.galleryImages?.map((url, i) => ({
                id: `img-${i}`,
                imageUrl: url,
                isCover: i === 0,
                uploadedAt: new Date().toISOString(),
              })) || [
                {
                  id: "cover-1",
                  imageUrl: ctxMatch.featuredImage,
                  isCover: true,
                  uploadedAt: new Date().toISOString(),
                },
              ],
              ownershipDocuments: [
                {
                  id: "doc-1",
                  documentNumber: "TD-ET-902148",
                  documentType: "Title Deed (Certificate of Land Registry)",
                  filePath: "Title_Deed_Scan_Official.pdf",
                  issueDate: "2024-01-15",
                }
              ],
              createdAt: new Date().toISOString(),
            };
            loadedProp = transformed;
          }
        }

        if (loadedProp) {
          setProperty(loadedProp);

          // Populate units array
          const isMall =
            loadedProp.propertyType.toLowerCase().includes("mall") ||
            loadedProp.propertyType.toLowerCase().includes("commercial") ||
            loadedProp.propertyType.toLowerCase().includes("plaza") ||
            (loadedProp.title && loadedProp.title.toLowerCase().includes("mall")) ||
            (loadedProp.unitsCount && loadedProp.unitsCount > 1);

          if (loadedProp.units && loadedProp.units.length > 0) {
            setPropertyUnits(loadedProp.units);
          } else if (isMall) {
            const count = loadedProp.unitsCount || 24;
            const generated = generateDefaultMallUnits(count, loadedProp.propertyCode);
            setPropertyUnits(generated);
          } else {
            setPropertyUnits([]);
          }

          setLoading(false);
        } else {
          setError("Property record not found in municipal database.");
          setLoading(false);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load property details.");
        setLoading(false);
      }
    }

    loadData();
  }, [propertyId, citizenContext?.properties]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleBack = () => {
    if (citizenContext?.handleBackFromPropertyDetails) {
      citizenContext.handleBackFromPropertyDetails();
    }
    router.push("/citizen/dashboard/properties");
  };

  const handleSaveMinioConfig = () => {
    setMinioConfig(endpointInput.trim(), bucketInput.trim());
    setLocalMinioConfig({
      endpoint: endpointInput.trim(),
      bucket: bucketInput.trim(),
      useSsl: endpointInput.startsWith("https"),
    });
    setIsConfigModalOpen(false);
    showToast("MinIO endpoint settings saved successfully");
  };

  const handleAddMinioImage = (urlOrKey: string, label?: string) => {
    if (!property) return;
    const newImg = {
      id: `minio-${Date.now()}`,
      imageUrl: urlOrKey,
      isCover: false,
      uploadedAt: new Date().toISOString(),
      label: label || `MinIO Asset ${property.images?.length ? property.images.length + 1 : 1}`
    };

    const updatedImages = [...(property.images || []), newImg];
    const updatedProp = { ...property, images: updatedImages };
    setProperty(updatedProp);

    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("registered_properties");
      if (existing) {
        try {
          const list: PropertyResponse[] = JSON.parse(existing);
          const idx = list.findIndex((p) => p.id === property.id);
          if (idx !== -1) {
            list[idx] = updatedProp;
            localStorage.setItem("registered_properties", JSON.stringify(list));
          }
        } catch {
          // ignore
        }
      }
    }

    setSelectedImageIndex(updatedImages.length - 1);
    setIsUploadModalOpen(false);
    setManualKeyInput("");
    setImageLabelInput("");
    showToast("New image added to property MinIO storage bucket");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    handleAddMinioImage(localUrl, imageLabelInput || file.name);
  };

  // Add new unit to shopping mall inventory
  const handleAddUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitCode.trim()) return;

    const createdUnit: PropertyUnit = {
      id: `unit-${Date.now()}`,
      unitCode: newUnitCode.trim().toUpperCase(),
      name: newUnitName.trim() || `${newUnitFloor} - ${newUnitCategory}`,
      type: newUnitCategory,
      category: newUnitCategory,
      shopNumber: `Shop ${newUnitCode.trim().toUpperCase()}`,
      floorLevel: newUnitFloor,
      area: Number(newUnitArea) || 40,
      rentAmount: Number(newUnitRent) || 20000,
      status: "Available",
      submeter: newUnitSubmeter,
      waterSupply: newUnitWater,
      frontage: newUnitFrontage,
    };

    const updated = [createdUnit, ...propertyUnits];
    setPropertyUnits(updated);

    if (property) {
      const updatedProp = { ...property, units: updated, unitsCount: updated.length };
      setProperty(updatedProp);
      if (typeof window !== "undefined") {
        const existing = localStorage.getItem("registered_properties");
        if (existing) {
          try {
            const list: PropertyResponse[] = JSON.parse(existing);
            const idx = list.findIndex((p) => p.id === property.id);
            if (idx !== -1) {
              list[idx] = updatedProp;
              localStorage.setItem("registered_properties", JSON.stringify(list));
            }
          } catch {
            // ignore
          }
        }
      }
    }

    setIsAddUnitModalOpen(false);
    setNewUnitCode("");
    setNewUnitName("");
    showToast(`Unit ${createdUnit.unitCode} successfully registered to Shopping Mall inventory.`);
  };

  // Navigate to agreements prefilled for a unit
  const handleDraftAgreementForUnit = (unit: PropertyUnit) => {
    if (citizenContext?.handleNavigate) {
      citizenContext.handleNavigate("agreements");
    } else {
      router.push("/citizen/dashboard/agreements");
    }
    showToast(`Initiating Lease Contract for Shop Unit ${unit.unitCode} (${unit.category || unit.type})`);
  };

  // Check if this property is a Shopping Mall / Multi-Unit Complex
  const isShoppingMall = Boolean(
    property &&
      (property.propertyType.toLowerCase().includes("mall") ||
        property.propertyType.toLowerCase().includes("commercial") ||
        property.propertyType.toLowerCase().includes("plaza") ||
        property.propertyType.toLowerCase().includes("complex") ||
        property.propertyType.toLowerCase().includes("retail") ||
        (property.title && property.title.toLowerCase().includes("mall")) ||
        (property.title && property.title.toLowerCase().includes("plaza")) ||
        (property.unitsCount && property.unitsCount > 1) ||
        propertyUnits.length > 1)
  );

  const isMultiUnit = isShoppingMall || propertyUnits.length > 1;

  // Filtered units list
  const filteredUnits = useMemo(() => {
    return propertyUnits.filter((u) => {
      // Floor filter
      const matchFloor =
        unitFloorFilter === "ALL" ||
        (u.floorLevel && u.floorLevel.toLowerCase().includes(unitFloorFilter.toLowerCase())) ||
        (unitFloorFilter === "Ground" && (u.unitCode.startsWith("G") || (u.floorLevel && u.floorLevel.includes("Ground")))) ||
        (unitFloorFilter === "1st" && (u.unitCode.includes("F1") || (u.floorLevel && u.floorLevel.includes("1st")))) ||
        (unitFloorFilter === "2nd" && (u.unitCode.includes("F2") || (u.floorLevel && u.floorLevel.includes("2nd")))) ||
        (unitFloorFilter === "3rd" && (u.unitCode.includes("F3") || (u.floorLevel && u.floorLevel.includes("3rd"))));

      // Status filter
      const matchStatus =
        unitStatusFilter === "ALL" ||
        u.status.toLowerCase() === unitStatusFilter.toLowerCase();

      // Category filter
      const matchCategory =
        unitCategoryFilter === "ALL" ||
        (u.category && u.category.toLowerCase().includes(unitCategoryFilter.toLowerCase())) ||
        (u.type && u.type.toLowerCase().includes(unitCategoryFilter.toLowerCase()));

      // Search query
      const q = unitSearchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.unitCode.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.type.toLowerCase().includes(q) ||
        (u.category && u.category.toLowerCase().includes(q)) ||
        (u.tenant && u.tenant.toLowerCase().includes(q)) ||
        (u.shopNumber && u.shopNumber.toLowerCase().includes(q));

      return matchFloor && matchStatus && matchCategory && matchSearch;
    });
  }, [propertyUnits, unitFloorFilter, unitStatusFilter, unitCategoryFilter, unitSearchQuery]);

  // Aggregate stats for Shopping Mall / Multi-unit
  const totalUnitsCount = propertyUnits.length > 0 ? propertyUnits.length : (property?.unitsCount || 1);
  const rentedUnitsCount = propertyUnits.filter((u) => u.status === "Rented").length;
  const availableUnitsCount = propertyUnits.filter((u) => u.status === "Available").length;
  const occupancyPct = totalUnitsCount > 0 ? Math.round((rentedUnitsCount / totalUnitsCount) * 100) : 100;
  const totalMonthlyRoll = propertyUnits.length > 0
    ? propertyUnits.reduce((acc, u) => acc + (u.rentAmount || 0), 0)
    : (property?.monthlyRent || 35000);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#00450d]" />
        <p className="text-sm font-medium">Loading property details...</p>
        <p className="text-xs text-slate-400 font-mono">Verifying municipal registry record</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Property Details Unavailable</h3>
        <p className="text-xs text-slate-500">{error || "The requested property could not be retrieved from the database."}</p>
        <div className="pt-2 flex justify-center gap-3">
          <Button
            onClick={handleBack}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9 px-4 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Properties List
          </Button>
          <Button
            onClick={() => router.push("/citizen/dashboard/properties/register")}
            className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-9 px-4 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Register New Property
          </Button>
        </div>
      </div>
    );
  }

  const { label, variant } = statusMeta(property.status);

  // Derive dynamic gallery using property type and ID
  const dynamicGallery = getDynamicPropertyGallery(
    property.images,
    property.propertyType,
    property.id || property.propertyCode
  );

  const activeImage = dynamicGallery[selectedImageIndex] || dynamicGallery[0];

  return (
    <div className="space-y-5 animate-in fade-in duration-150 max-w-6xl mx-auto pb-12 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
            className="h-8.5 px-3 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Properties
          </Button>
          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">{property.propertyCode}</span>
              <Badge variant={variant} className="text-[10px] py-0.5 px-2 flex items-center gap-1 font-semibold">
                <StatusIcon status={property.status} />
                <span>{label}</span>
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {isMultiUnit && (
            <Button
              onClick={() => setIsAddUnitModalOpen(true)}
              className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-8.5 px-3 rounded-lg shadow-xs font-semibold gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Shop / Mall Unit</span>
            </Button>
          )}

          {/* MinIO Configuration Trigger */}
          <Button
            onClick={() => setIsConfigModalOpen(true)}
            variant="outline"
            size="sm"
            className="h-8.5 px-2.5 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg shadow-xs"
            title="Configure MinIO S3 Endpoint"
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">MinIO Storage</span>
          </Button>

          <Button
            onClick={() => showToast("Municipal Property Verification Cadastre Dossier (PDF) downloaded.")}
            variant="outline"
            className="h-8.5 px-3 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Title PDF</span>
          </Button>
          <Button
            onClick={() => {
              if (citizenContext?.handleNavigate) {
                citizenContext.handleNavigate("agreements");
              } else {
                router.push("/citizen/dashboard/agreements");
              }
            }}
            className="bg-[#00450d] hover:bg-[#1b5e20] text-white h-8.5 px-3.5 text-xs gap-1.5 font-medium rounded-lg shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Create Lease Agreement</span>
          </Button>
        </div>
      </div>

      {/* Main Title & Address Header */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {property.title || property.description?.slice(0, 60) || `${property.propertyType} — ${property.address.subCity}`}
          </h1>
          {isMultiUnit && (
            <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[11px] font-bold py-0.5 px-2.5">
              <Store className="w-3 h-3 mr-1 text-amber-700" />
              {totalUnitsCount} Units Commercial Complex
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-600 mt-1.5">
          <span className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            {[
              property.address.city || "Addis Ababa",
              property.address.subCity,
              property.address.woreda && `Woreda ${property.address.woreda}`,
              property.address.kebele && `Kebele ${property.address.kebele}`,
              property.address.houseNumber && `Plot/House #${property.address.houseNumber}`
            ].filter(Boolean).join(", ")}
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="flex items-center gap-1 text-slate-500">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            {isShoppingMall ? "Shopping Mall / Commercial Plaza" : property.propertyType}
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="flex items-center gap-1 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Registered on {new Date(property.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* KPI Performance Bar for Commercial Mall / Multi-Unit Complex */}
      {isMultiUnit && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <Card className="bg-white border-slate-200/90 shadow-clean rounded-2xl">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Leasable Units</p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">{totalUnitsCount}</p>
                <p className="text-[10px] text-slate-400">Shops, Kiosks & Suites</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Store className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200/90 shadow-clean rounded-2xl">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mall Occupancy Rate</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <p className="text-xl font-extrabold text-emerald-700">{occupancyPct}%</p>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                    {rentedUnitsCount} Leased
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">{availableUnitsCount} units available</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                <TrendingUp className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200/90 shadow-clean rounded-2xl">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gross Leasable Area</p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {Number(property.areaSqMeter || 1200).toLocaleString()} m²
                </p>
                <p className="text-[10px] text-slate-400">{property.floorNumber || "Ground + 3 Levels"}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Maximize2 className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200/90 shadow-clean rounded-2xl">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Monthly Rent Roll</p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                  ETB {totalMonthlyRoll.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400">Total monthly revenue</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-[#00450d]">
                <Receipt className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Image Gallery and Key Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Dynamic Gallery */}
        <div className="lg:col-span-2 space-y-2.5">
          <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/90 shadow-clean group">
            <img
              src={activeImage.imageUrl}
              alt={activeImage.label || property.propertyType}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              onError={(e) => {
                const target = e.currentTarget;
                const fallback = resolveMinioImageUrl("", property.propertyType, property.id, selectedImageIndex);
                if (target.src !== fallback) {
                  target.src = fallback;
                }
              }}
            />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                {isMultiUnit ? <Store className="w-3.5 h-3.5 text-amber-400" /> : <Home className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isShoppingMall ? `Shopping Mall (${totalUnitsCount} Units)` : property.propertyType}</span>
              </span>
              <span className="bg-emerald-950/85 border border-emerald-500/30 backdrop-blur-md text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Database className="w-3 h-3" />
                <span>MinIO S3</span>
              </span>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg">
                {activeImage.label}
              </span>
              <div className="flex items-center gap-1.5 pointer-events-auto">
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="bg-slate-900/80 hover:bg-slate-900 text-white p-1.5 rounded-lg backdrop-blur-md transition-colors"
                  title="Expand Fullscreen"
                >
                  <Expand className="w-4 h-4" />
                </button>
                <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono px-2.5 py-1 rounded-lg">
                  {selectedImageIndex + 1} / {dynamicGallery.length}
                </span>
              </div>
            </div>

            {/* Navigation Arrows */}
            {dynamicGallery.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : dynamicGallery.length - 1));
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) => (prev < dynamicGallery.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Dynamic Thumbnails Strip & Add Photo Button */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5">
            {dynamicGallery.map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all group/thumb ${
                  selectedImageIndex === idx
                    ? "border-[#00450d] ring-2 ring-[#00450d]/20 scale-102"
                    : "border-slate-200 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={img.imageUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = resolveMinioImageUrl("", property.propertyType, property.id, idx);
                    if (target.src !== fallback) target.src = fallback;
                  }}
                />
                {img.isCover && (
                  <span className="absolute bottom-1 left-1 bg-[#00450d] text-[8px] font-bold text-white px-1 rounded">
                    Cover
                  </span>
                )}
              </button>
            ))}

            {/* Add Photo to MinIO Bucket */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="w-20 h-16 rounded-xl shrink-0 border-2 border-dashed border-slate-300 hover:border-emerald-700 bg-slate-50 hover:bg-emerald-50/50 flex flex-col items-center justify-center text-slate-500 hover:text-emerald-800 transition-all text-[10px] font-medium gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Photo</span>
            </button>
          </div>
        </div>

        {/* Financial & Landlord Summary Card */}
        <div className="space-y-4">
          <Card className="bg-white border-slate-200/90 shadow-clean rounded-2xl">
            <CardHeader className="p-4 pb-2 border-b border-slate-100">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {isMultiUnit ? "MONTHLY GROSS RENT ROLL" : "MUNICIPAL VALUATION & RENT"}
              </p>
              <div className="flex items-baseline justify-between mt-1">
                <div className="text-2xl font-extrabold text-slate-900">
                  ETB {Number(isMultiUnit ? totalMonthlyRoll : property.monthlyRent).toLocaleString()}
                  <span className="text-xs font-normal text-slate-500"> / month</span>
                </div>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                {isMultiUnit ? `Aggregate revenue across ${totalUnitsCount} retail units` : "Standard Municipal Landlord Index Rate"}
              </p>
            </CardHeader>

            <CardContent className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Gross Area</span>
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                    <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                    {property.areaSqMeter ? `${Number(property.areaSqMeter).toLocaleString()} m²` : "1,200 m²"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Floor Structure</span>
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    {property.floorNumber || (isMultiUnit ? "Ground + 3" : "Ground + 1")}
                  </span>
                </div>

                {isMultiUnit ? (
                  <>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Total Units</span>
                      <span className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                        <Store className="w-3.5 h-3.5 text-amber-600" />
                        {totalUnitsCount} Commercial Units
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Occupancy</span>
                      <span className="text-sm font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        {occupancyPct}% ({rentedUnitsCount}/{totalUnitsCount})
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {property.bedroomCount != null && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">Bedrooms</span>
                        <span className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                          <Bed className="w-3.5 h-3.5 text-slate-500" />
                          {property.bedroomCount} Bedrooms
                        </span>
                      </div>
                    )}
                    {property.bathroomCount != null && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">Bathrooms</span>
                        <span className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                          <Bath className="w-3.5 h-3.5 text-slate-500" />
                          {property.bathroomCount} Baths
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* MinIO Object Storage Reference Banner */}
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                    <HardDrive className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>MinIO Storage Connected</span>
                  </div>
                  <button
                    onClick={() => setIsConfigModalOpen(true)}
                    className="text-[10px] text-emerald-700 hover:text-emerald-900 font-mono underline"
                  >
                    Settings
                  </button>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed font-mono">
                  Bucket: <span className="font-bold">{minioConfig.bucket}</span> · Images: {dynamicGallery.length} assets
                </p>
                <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-emerald-900">
                  <span className="truncate max-w-[170px]">{minioConfig.endpoint}</span>
                  <span className="font-bold text-emerald-700">ONLINE</span>
                </div>
              </div>

              {/* Primary Actions */}
              <div className="space-y-2 pt-1">
                {isMultiUnit && (
                  <Button
                    onClick={() => setActiveTab("units")}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white h-9 text-xs font-semibold rounded-xl gap-1.5"
                  >
                    <Store className="w-3.5 h-3.5 text-amber-400" />
                    <span>Browse All {totalUnitsCount} Units & Directory</span>
                  </Button>
                )}
                <Button
                  onClick={() => {
                    if (citizenContext?.handleNavigate) {
                      citizenContext.handleNavigate("agreements");
                    } else {
                      router.push("/citizen/dashboard/agreements");
                    }
                  }}
                  className="w-full bg-[#00450d] hover:bg-[#1b5e20] text-white h-9 text-xs font-semibold rounded-xl"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Manage Rental Contracts
                </Button>
                <Button
                  onClick={() => showToast("Property QR Pass generated for municipal inspection")}
                  variant="outline"
                  className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 h-9 text-xs font-medium rounded-xl"
                >
                  <QrCode className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  Generate GRAMS QR Stamp
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("details")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "details" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>General Details & Amenities</span>
        </button>

        {isMultiUnit && (
          <button
            onClick={() => setActiveTab("units")}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "units" ? "bg-[#00450d] text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Mall Units & Shop Inventory ({totalUnitsCount})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("cadastre")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "cadastre" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Title Deed & Cadastre</span>
        </button>

        <button
          onClick={() => setActiveTab("agreements")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "agreements" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Registered Lease Contracts</span>
        </button>

        <button
          onClick={() => setActiveTab("storage")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "storage" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>MinIO Image Assets ({dynamicGallery.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DETAILS & AMENITIES                                                */}
      {/* ========================================================================= */}
      {activeTab === "details" && (
        <div className="space-y-5">
          {/* If Multi-Unit Shopping Mall: Show prominent Multi-Unit Building Summary Banner */}
          {isMultiUnit && (
            <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none shadow-md rounded-2xl overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold uppercase tracking-wider">
                        Commercial Complex Architecture
                      </span>
                      <span className="text-xs text-slate-300 font-mono">
                        {propertyUnits.length} Leasable Shop Units Registered
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">
                      Shopping Mall Floor Directory & Retail Distribution
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl mt-0.5">
                      This commercial property is configured as a multi-tenant shopping mall across {property.floorNumber || "Ground + 3 floors"}.
                      Each shop is individually sub-metered for water and 3-phase electricity under GRAMS municipal standards.
                    </p>
                  </div>
                  <Button
                    onClick={() => setActiveTab("units")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-9 px-4 rounded-xl shrink-0 gap-1.5"
                  >
                    <Store className="w-4 h-4" />
                    <span>View All {totalUnitsCount} Units Directory</span>
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-700/60">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Ground Floor Units</span>
                    <span className="text-base font-extrabold text-white">
                      {propertyUnits.filter((u) => u.floorLevel?.includes("Ground") || u.unitCode.startsWith("G")).length || 6} Shops
                    </span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">Anchor retail & kiosks</span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">1st Floor Units</span>
                    <span className="text-base font-extrabold text-white">
                      {propertyUnits.filter((u) => u.floorLevel?.includes("1st") || u.unitCode.includes("F1")).length || 6} Units
                    </span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">Banking, clinic & offices</span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">2nd Floor Units</span>
                    <span className="text-base font-extrabold text-white">
                      {propertyUnits.filter((u) => u.floorLevel?.includes("2nd") || u.unitCode.includes("F2")).length || 6} Units
                    </span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">Salons, gadgets & apparel</span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">3rd Floor Units</span>
                    <span className="text-base font-extrabold text-white">
                      {propertyUnits.filter((u) => u.floorLevel?.includes("3rd") || u.unitCode.includes("F3")).length || 6} Units
                    </span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">Rooftop bistro & tech hubs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="bg-white border-slate-200/90 shadow-clean rounded-2xl">
              <CardHeader className="p-4 pb-2 border-b border-slate-100">
                <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">Property Description</CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-xs text-slate-600 leading-relaxed space-y-3">
                <p>
                  {property.description ||
                    `High-standard municipal ${isShoppingMall ? "commercial shopping mall and retail center" : "property"} registered in Addis Ababa, ${property.address.subCity}. Fully verified under the Government Rental Administration & Management System (GRAMS). Featuring official title deed registration, sub-metered utility feeds, and municipal cadastre documentation.`}
                </p>
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <p className="font-bold text-slate-800">
                    {isShoppingMall ? "Commercial Retail Infrastructure:" : "Furnishing & Interior Specifications:"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {isShoppingMall ? (
                      <>
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-medium">
                          Multi-Story Elevators: Passenger & Freight
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-medium">
                          Power: 3-Phase Industrial Power & Auto Backup
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-medium">
                          Submeters: Dedicated Electric & Water
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-medium">
                          Customer Parking: Basement & Compound
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-medium">
                          Status: {property.furnishingStatus || "Semi-Furnished"}
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-medium">
                          Flooring: Ceramic & Parquet
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-medium">
                          Water Line: Dedicated Municipal Supply
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/90 shadow-clean rounded-2xl">
              <CardHeader className="p-4 pb-2 border-b border-slate-100">
                <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">Infrastructure & Utilities</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>3-Phase Electricity & Backup Generator</span>
                  </span>
                  <Badge variant="active" className="text-[10px]">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span>Dedicated Overhead Water Reserve (20,000L)</span>
                  </span>
                  <Badge variant="active" className="text-[10px]">Verified</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>24/7 Security Guard & CCTV Compliance</span>
                  </span>
                  <Badge variant="active" className="text-[10px]">Equipped</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-600" />
                    <span>Fire Hose Reels & Smoke Sensor Network</span>
                  </span>
                  <Badge variant="active" className="text-[10px]">Certified</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MALL UNITS & RETAIL DIRECTORY (FOR SHOPPING MALL / COMMERCIAL)     */}
      {/* ========================================================================= */}
      {activeTab === "units" && (
        <div className="space-y-4">
          <Card className="bg-white border-slate-200/90 shadow-clean rounded-2xl">
            <CardHeader className="p-4 pb-3 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Shopping Mall Units & Retail Directory
                    </CardTitle>
                    <span className="bg-emerald-100 text-[#00450d] text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {propertyUnits.length} Total Units
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Individual commercial shop units registered across {property.floorNumber || "Ground + 3 levels"} with dedicated sub-meters
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setUnitViewMode("table")}
                      className={`p-1.5 rounded-md text-xs transition-colors ${unitViewMode === "table" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-900"}`}
                      title="Table View"
                    >
                      <ListIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setUnitViewMode("grid")}
                      className={`p-1.5 rounded-md text-xs transition-colors ${unitViewMode === "grid" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-900"}`}
                      title="Grid Cards View"
                    >
                      <Grid className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Button
                    onClick={() => setIsAddUnitModalOpen(true)}
                    size="sm"
                    className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-8 px-3 rounded-lg gap-1.5 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Shop Unit</span>
                  </Button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="pt-3 grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                {/* Search query */}
                <div className="relative sm:col-span-1">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={unitSearchQuery}
                    onChange={(e) => setUnitSearchQuery(e.target.value)}
                    placeholder="Search unit #, tenant, type..."
                    className="h-8 pl-8 text-xs bg-slate-50 border-slate-200"
                  />
                </div>

                {/* Floor Filter */}
                <div>
                  <select
                    value={unitFloorFilter}
                    onChange={(e) => setUnitFloorFilter(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#00450d]"
                  >
                    <option value="ALL">All Floor Levels</option>
                    <option value="Ground">Ground Floor</option>
                    <option value="1st">1st Floor</option>
                    <option value="2nd">2nd Floor</option>
                    <option value="3rd">3rd Floor</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={unitStatusFilter}
                    onChange={(e) => setUnitStatusFilter(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#00450d]"
                  >
                    <option value="ALL">All Statuses ({propertyUnits.length})</option>
                    <option value="Available">Available Only ({availableUnitsCount})</option>
                    <option value="Rented">Rented / Leased ({rentedUnitsCount})</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={unitCategoryFilter}
                    onChange={(e) => setUnitCategoryFilter(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#00450d]"
                  >
                    <option value="ALL">All Commercial Categories</option>
                    <option value="Retail">Retail & Boutiques</option>
                    <option value="Café">Café / Food & Beverage</option>
                    <option value="Pharmacy">Pharmacy / Clinic</option>
                    <option value="Banking">Banking & Financial</option>
                    <option value="Office">Professional Office</option>
                    <option value="Electronics">Electronics & Tech</option>
                    <option value="Salon">Salon & Spa</option>
                  </select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {filteredUnits.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Store className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-700">No shop units matched your filter criteria.</p>
                  <p className="text-[11px] text-slate-400">Try resetting your search query or floor selection.</p>
                  <Button
                    onClick={() => {
                      setUnitSearchQuery("");
                      setUnitFloorFilter("ALL");
                      setUnitStatusFilter("ALL");
                      setUnitCategoryFilter("ALL");
                    }}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs mt-1"
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : unitViewMode === "table" ? (
                /* Table View */
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-2.5 px-4">Unit Code</th>
                        <th className="py-2.5 px-4">Category & Usage</th>
                        <th className="py-2.5 px-4">Floor Level</th>
                        <th className="py-2.5 px-4">Leasable Area</th>
                        <th className="py-2.5 px-4">Monthly Rent</th>
                        <th className="py-2.5 px-4">Sub-meters</th>
                        <th className="py-2.5 px-4">Lease Status</th>
                        <th className="py-2.5 px-4">Active Tenant</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUnits.map((u) => (
                        <tr key={u.id || u.unitCode} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                              {u.unitCode}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{u.name}</div>
                            <div className="text-[10px] text-slate-500">{u.category || u.type}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">{u.floorLevel || "Ground Floor"}</td>
                          <td className="py-3 px-4 text-slate-700 font-medium">{u.area} m²</td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            ETB {Number(u.rentAmount || 20000).toLocaleString()}
                            <span className="text-[10px] font-normal text-slate-400">/mo</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                              <span className="flex items-center gap-0.5 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                <Zap className="w-2.5 h-2.5" /> Elec
                              </span>
                              {u.waterSupply && (
                                <span className="flex items-center gap-0.5 text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                  <Droplets className="w-2.5 h-2.5" /> Water
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={u.status === "Available" ? "active" : "secondary"}
                              className={`text-[10px] font-bold ${u.status === "Available" ? "bg-emerald-100 text-emerald-900 border-emerald-300" : "bg-slate-100 text-slate-700"}`}
                            >
                              {u.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-slate-600 truncate max-w-[150px]">
                            {u.tenant ? (
                              <span className="font-medium text-slate-900">{u.tenant}</span>
                            ) : (
                              <span className="text-slate-400 italic">Available for lease</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                onClick={() => setSelectedUnitForDetail(u)}
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-slate-600 hover:text-slate-900 px-2 rounded-md"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                <span>Specs</span>
                              </Button>
                              <Button
                                onClick={() => handleDraftAgreementForUnit(u)}
                                size="sm"
                                className="h-7 text-xs bg-[#00450d] hover:bg-[#1b5e20] text-white px-2.5 rounded-md font-medium"
                              >
                                Lease
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Grid View */
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {filteredUnits.map((u) => (
                    <div
                      key={u.id || u.unitCode}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-600 hover:shadow-md transition-all space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-xs rounded">
                              {u.unitCode}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">{u.floorLevel}</span>
                          </div>
                          <Badge
                            variant={u.status === "Available" ? "active" : "secondary"}
                            className={`text-[10px] font-bold ${u.status === "Available" ? "bg-emerald-100 text-emerald-900 border-emerald-300" : "bg-slate-100 text-slate-700"}`}
                          >
                            {u.status}
                          </Badge>
                        </div>

                        <div>
                          <p className="font-bold text-slate-900 text-xs">{u.name}</p>
                          <p className="text-[11px] text-slate-500">{u.category || u.type}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">Leasable Area</span>
                            <span className="font-bold text-slate-800">{u.area} m²</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">Monthly Rent</span>
                            <span className="font-bold text-slate-900">ETB {Number(u.rentAmount || 20000).toLocaleString()}</span>
                          </div>
                        </div>

                        {u.tenant && (
                          <div className="p-2 rounded-lg bg-slate-50 text-[11px] text-slate-700">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Current Tenant</span>
                            <span className="font-semibold text-slate-900">{u.tenant}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <Button
                          onClick={() => setSelectedUnitForDetail(u)}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs flex-1 text-slate-700"
                        >
                          Details
                        </Button>
                        <Button
                          onClick={() => handleDraftAgreementForUnit(u)}
                          size="sm"
                          className="h-7 text-xs flex-1 bg-[#00450d] hover:bg-[#1b5e20] text-white font-medium"
                        >
                          Draft Lease
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TITLE DEED & CADASTRE                                              */}
      {/* ========================================================================= */}
      {activeTab === "cadastre" && (
        <div className="space-y-4">
          <Card className="bg-white border-slate-200/90 shadow-clean rounded-2xl">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Ownership & Title Deed Documents
                </CardTitle>
                <p className="text-[11px] text-slate-400">Scanned and verified through Woreda Land Administration</p>
              </div>
              <Badge variant="active" className="text-[10px]">Digital Seal Attached</Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {property.ownershipDocuments && property.ownershipDocuments.length > 0 ? (
                property.ownershipDocuments.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#00450d] flex items-center justify-center font-bold">
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{doc.documentType || "Certificate of Title Deed"}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Doc Ref: {doc.documentNumber} · Issued: {doc.issueDate || "2024-01-15"}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => showToast(`Downloading verified certificate ${doc.documentNumber}`)}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5 border-slate-300 text-slate-700 hover:bg-white rounded-lg"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Scan</span>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#00450d] flex items-center justify-center font-bold">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Certificate of Title Deed (Land Register)</p>
                      <p className="text-[11px] text-slate-500 font-mono">Doc Ref: TD-ET-902148 · Scanned Copy</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => showToast("Downloading verified certificate TD-ET-902148")}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 border-slate-300 text-slate-700 hover:bg-white rounded-lg"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Scan</span>
                  </Button>
                </div>
              )}

              {/* Municipal Cadastre Block */}
              <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MUNICIPAL CADASTRE LOCATOR</span>
                  <span className="text-[10px] font-mono text-emerald-400">STATUS: VERIFIED</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">CITY</span>
                    <span className="text-slate-200">{property.address.city || "Addis Ababa"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">SUB-CITY</span>
                    <span className="text-slate-200">{property.address.subCity}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">WOREDA</span>
                    <span className="text-slate-200">{property.address.woreda}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">PARCEL ID</span>
                    <span className="text-emerald-300">PCL-2026-9912</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: REGISTERED LEASE CONTRACTS                                         */}
      {/* ========================================================================= */}
      {activeTab === "agreements" && (
        <Card className="bg-white border-slate-200/90 shadow-clean rounded-2xl">
          <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Active & Pending Rental Agreements
              </CardTitle>
              <p className="text-[11px] text-slate-400">Contracts registered under GRAMS municipal framework</p>
            </div>
            <Button
              onClick={() => {
                if (citizenContext?.handleNavigate) {
                  citizenContext.handleNavigate("agreements");
                } else {
                  router.push("/citizen/dashboard/agreements");
                }
              }}
              size="sm"
              className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-8 px-3 rounded-lg gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Draft New Agreement</span>
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {isMultiUnit && propertyUnits.filter((u) => u.status === "Rented").length > 0 ? (
              propertyUnits
                .filter((u) => u.status === "Rented")
                .map((u, idx) => (
                  <div key={u.id || idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/90">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#00450d] flex items-center justify-center font-bold">
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-xs font-mono">
                            AG-ET-2026-08{idx + 10} · Unit {u.unitCode}
                          </p>
                          <Badge variant="active" className="text-[10px]">Verified & Active</Badge>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Tenant: {u.tenant || "Commercial Tenant"} · Floor: {u.floorLevel} · Rent: ETB {Number(u.rentAmount || 20000).toLocaleString()}/mo
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        if (citizenContext?.handleNavigate) {
                          citizenContext.handleNavigate("agreements");
                        } else {
                          router.push("/citizen/dashboard/agreements");
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1 border-slate-300 text-slate-700 hover:bg-white rounded-lg"
                    >
                      <span>View Contract</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))
            ) : (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/90">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#00450d] flex items-center justify-center font-bold">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-xs font-mono">AG-ET-2026-0814</p>
                      <Badge variant="active" className="text-[10px]">Verified & Active</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Tenant: Hanna Girma · Term: 01 Sep 2025 to 31 Aug 2026 · Rent: ETB {Number(property.monthlyRent).toLocaleString()}/mo
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (citizenContext?.handleNavigate) {
                      citizenContext.handleNavigate("agreements");
                    } else {
                      router.push("/citizen/dashboard/agreements");
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1 border-slate-300 text-slate-700 hover:bg-white rounded-lg"
                >
                  <span>View Full Contract</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MINIO STORAGE & ASSETS EXPLORER                                    */}
      {/* ========================================================================= */}
      {activeTab === "storage" && (
        <div className="space-y-4">
          <Card className="bg-white border-slate-200/90 shadow-clean rounded-2xl">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  MinIO Storage Bucket Explorer
                </CardTitle>
                <p className="text-[11px] text-slate-400 font-mono">
                  s3://{minioConfig.bucket}/properties/{property.propertyCode}/
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsConfigModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 border-slate-200 text-slate-700"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Endpoint Config</span>
                </Button>
                <Button
                  onClick={() => setIsUploadModalOpen(true)}
                  size="sm"
                  className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-8 px-3 rounded-lg gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Asset</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {dynamicGallery.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 flex flex-col group/asset hover:shadow-md transition-all"
                  >
                    <div className="relative h-40 bg-slate-900 overflow-hidden">
                      <img
                        src={img.imageUrl}
                        alt={img.label}
                        className="w-full h-full object-cover group-hover/asset:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallback = resolveMinioImageUrl("", property.propertyType, property.id, idx);
                          if (target.src !== fallback) target.src = fallback;
                        }}
                      />
                      <div className="absolute top-2 left-2 flex gap-1">
                        {img.isCover && (
                          <span className="bg-[#00450d] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                            COVER
                          </span>
                        )}
                        <span className="bg-slate-900/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-xs">
                          {idx + 1}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 text-xs space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="font-bold text-slate-900 truncate">{img.label}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                          {img.imageUrl.startsWith("blob:") ? "local-upload.jpg" : img.imageUrl.split("/").pop()}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(img.uploadedAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedImageIndex(idx);
                              showToast(`Set ${img.label} as active preview`);
                            }}
                            className="text-[11px] text-[#00450d] hover:underline font-medium"
                          >
                            Preview
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UNIT SPECIFICATIONS DETAIL                                         */}
      {/* ========================================================================= */}
      {selectedUnitForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4 font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900">
                <Store className="w-5 h-5 text-[#00450d]" />
                <div>
                  <h3 className="font-bold text-sm">Shop Unit Specification — {selectedUnitForDetail.unitCode}</h3>
                  <p className="text-[11px] text-slate-400">{selectedUnitForDetail.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUnitForDetail(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Floor Level</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5">{selectedUnitForDetail.floorLevel || "Ground Floor"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Leasable Area</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5">{selectedUnitForDetail.area} m²</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Monthly Rent</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5">
                  ETB {Number(selectedUnitForDetail.rentAmount || 20000).toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Lease Status</span>
                <Badge
                  variant={selectedUnitForDetail.status === "Available" ? "active" : "secondary"}
                  className="text-[10px] mt-1"
                >
                  {selectedUnitForDetail.status}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800">Utility & Technical Specs:</p>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Electric Sub-Meter: <strong className="text-slate-800">Active (MTR-{selectedUnitForDetail.unitCode})</strong></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  <span>Water Supply: <strong className="text-slate-800">{selectedUnitForDetail.waterSupply ? "Connected" : "Not Required"}</strong></span>
                </span>
                <span className="flex items-center gap-1.5 col-span-2">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>Frontage: <strong className="text-slate-800">{selectedUnitForDetail.frontage || "Standard Display Glass"}</strong></span>
                </span>
              </div>
            </div>

            {selectedUnitForDetail.tenant && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">Registered Tenant Entity</span>
                <p className="font-bold text-emerald-950 text-sm">{selectedUnitForDetail.tenant}</p>
                <p className="text-[11px] text-emerald-800">Contract registered under GRAMS municipal framework</p>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedUnitForDetail(null)}
                className="h-8.5 text-xs"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setSelectedUnitForDetail(null);
                  handleDraftAgreementForUnit(selectedUnitForDetail);
                }}
                className="bg-[#00450d] hover:bg-[#1b5e20] text-white h-8.5 text-xs font-semibold"
              >
                Draft Lease Agreement
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD SHOP UNIT FORM                                                 */}
      {/* ========================================================================= */}
      {isAddUnitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900">
                <Store className="w-5 h-5 text-[#00450d]" />
                <h3 className="font-bold text-sm">Register New Shop / Mall Unit</h3>
              </div>
              <button
                onClick={() => setIsAddUnitModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUnitSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Shop / Unit Code *</label>
                  <Input
                    required
                    value={newUnitCode}
                    onChange={(e) => setNewUnitCode(e.target.value)}
                    placeholder="e.g. G-05 or F2-08"
                    className="h-8.5 text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Floor Level *</label>
                  <select
                    value={newUnitFloor}
                    onChange={(e) => setNewUnitFloor(e.target.value)}
                    className="w-full h-8.5 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#00450d]"
                  >
                    <option value="Ground Floor">Ground Floor</option>
                    <option value="1st Floor">1st Floor</option>
                    <option value="2nd Floor">2nd Floor</option>
                    <option value="3rd Floor">3rd Floor</option>
                    <option value="Basement">Basement Level</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Unit Display Name / Usage</label>
                <Input
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="e.g. Retail Boutique or Coffee Kiosk"
                  className="h-8.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newUnitCategory}
                    onChange={(e) => setNewUnitCategory(e.target.value)}
                    className="w-full h-8.5 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#00450d]"
                  >
                    <option value="Retail / Boutique">Retail / Boutique</option>
                    <option value="Café / Restaurant">Café / Restaurant</option>
                    <option value="Electronics / Telecom">Electronics / Telecom</option>
                    <option value="Pharmacy / Clinic">Pharmacy / Clinic</option>
                    <option value="Banking / Financial">Banking / Financial</option>
                    <option value="Professional Office">Professional Office</option>
                    <option value="Salon / Beauty">Salon / Beauty</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Area (m²) *</label>
                  <Input
                    type="number"
                    required
                    min="5"
                    value={newUnitArea}
                    onChange={(e) => setNewUnitArea(e.target.value)}
                    placeholder="45"
                    className="h-8.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Monthly Rent (ETB) *</label>
                <Input
                  type="number"
                  required
                  min="1000"
                  value={newUnitRent}
                  onChange={(e) => setNewUnitRent(e.target.value)}
                  placeholder="25000"
                  className="h-8.5 text-xs font-bold"
                />
              </div>

              <div className="pt-1 flex items-center gap-4 text-xs font-medium text-slate-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newUnitSubmeter}
                    onChange={(e) => setNewUnitSubmeter(e.target.checked)}
                    className="rounded border-slate-300 text-[#00450d] focus:ring-[#00450d]"
                  />
                  <span>Electric Sub-Meter</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newUnitWater}
                    onChange={(e) => setNewUnitWater(e.target.checked)}
                    className="rounded border-slate-300 text-[#00450d] focus:ring-[#00450d]"
                  />
                  <span>Dedicated Water Line</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddUnitModalOpen(false)}
                  className="h-8.5 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#00450d] hover:bg-[#1b5e20] text-white h-8.5 text-xs font-semibold"
                >
                  Add to Mall Directory
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative max-w-5xl max-h-[80vh] flex items-center justify-center">
            <img
              src={activeImage.imageUrl}
              alt={activeImage.label}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
            {dynamicGallery.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : dynamicGallery.length - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev < dynamicGallery.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="mt-4 text-center text-white">
            <p className="text-sm font-semibold">{activeImage.label}</p>
            <p className="text-xs text-white/60 font-mono">
              Photo {selectedImageIndex + 1} of {dynamicGallery.length} · MinIO S3 Object Storage
            </p>
          </div>
        </div>
      )}

      {/* MinIO Configuration Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900">
                <HardDrive className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-sm">MinIO S3 Storage Settings</h3>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Configure your local or cloud MinIO endpoint and bucket. Image URLs on this property will automatically resolve through this S3-compatible service.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">MinIO Endpoint / Host</label>
                <Input
                  value={endpointInput}
                  onChange={(e) => setEndpointInput(e.target.value)}
                  placeholder="http://localhost:9000 or https://minio.yourdomain.com"
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Bucket Name</label>
                <Input
                  value={bucketInput}
                  onChange={(e) => setBucketInput(e.target.value)}
                  placeholder="grams-properties"
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsConfigModalOpen(false)}
                className="h-8.5 text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveMinioConfig}
                className="bg-[#00450d] hover:bg-[#1b5e20] text-white h-8.5 text-xs font-medium"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add MinIO Image / File Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900">
                <Upload className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-sm">Add / Upload MinIO Photo</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-700 bg-slate-50 text-center cursor-pointer">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div onClick={() => fileInputRef.current?.click()} className="space-y-1">
                  <ImageIcon className="w-6 h-6 mx-auto text-slate-400" />
                  <p className="font-bold text-slate-700">Choose Image File from Computer</p>
                  <p className="text-[10px] text-slate-400">JPG, PNG, WebP up to 10MB</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-[10px] justify-center">
                <div className="h-[1px] bg-slate-200 flex-1" />
                <span>OR SPECIFY MINIO OBJECT KEY / URL</span>
                <div className="h-[1px] bg-slate-200 flex-1" />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Object Key or Image URL</label>
                <Input
                  value={manualKeyInput}
                  onChange={(e) => setManualKeyInput(e.target.value)}
                  placeholder="properties/prp-442/living-room.jpg"
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Photo Label / Room Description</label>
                <Input
                  value={imageLabelInput}
                  onChange={(e) => setImageLabelInput(e.target.value)}
                  placeholder="e.g. Master Bedroom, Rooftop Terrace"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsUploadModalOpen(false)}
                className="h-8.5 text-xs"
              >
                Cancel
              </Button>
              <Button
                disabled={!manualKeyInput.trim()}
                onClick={() => handleAddMinioImage(manualKeyInput.trim(), imageLabelInput.trim())}
                className="bg-[#00450d] hover:bg-[#1b5e20] text-white h-8.5 text-xs font-medium disabled:opacity-50"
              >
                Attach to Property
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailPage;
