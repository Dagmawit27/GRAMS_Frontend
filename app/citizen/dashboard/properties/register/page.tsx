"use client";
import React, { useState } from "react";
import { useCitizenData } from "@/hooks/useCitizenData";
import { Property, PropertyUnit } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Building,
  Home,
  Store,
  MapPin,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Camera,
  Layers,
  Sparkles,
  Lock,
  FileCheck,
  Check,
  Eye,
  Info,
  DollarSign,
  Calendar,
  Warehouse,
  ShoppingBag,
  Sliders,
  CheckSquare,
  Square,
  Copy,
  X
} from "lucide-react";

export interface MallShopUnit {
  id: string;
  shopNumber: string;
  floorLevel: string;
  area: number;
  rentAmount: number;
  category: string;
  frontage: string;
  submeter: boolean;
  waterSupply: boolean;
  status: 'Available' | 'Rented' | 'Reserved';
}

export interface TitleDeedDoc {
  name: string;
  size: string;
  number?: string;
  uploadedAt?: string;
  file?: File;
}

export interface UploadedPropertyImage {
  id: string;
  url: string;
  label?: string;
  isCover?: boolean;
  file?: File;
}

const SAMPLE_PROPERTY_IMAGES = [
  {
    label: "Modern Bole Apartment",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuArZM8eccqrTxsJgQGwrJ9QdADLY41kgOvV3jzwXGn16dj5ogp9Z4MXSSZi-vq4D1_T1QkfKp9Ds7ueGwa3pSV7KomN4uiFrhUl2SHywD6J6oIvRLsmWNXwZngHiVFOTxbAAj31SuxMaN27rZD65OyNS5KSgJCXepQqV3TiMmcCwBODUSyNOIBG_DRAZDJDeOA9zSw0COPkh474PN-PSeniepcpIHYXDZUtnPrcDrBuSbOaztsZ3PQ-Ww",
  },
  {
    label: "Luxury Villa Compound",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3TaI97tONXc4KYzx8tqT7YFB29kuW5ebmAc0n4GHLxjWTMahWsEcnd_YEYvg-glb6cPg0HqWqgwuRkdCidk9ZrQqiczihUwg7yuZVCs0XMq0civZUmHoDSTc-_pEQGb6aovXWcfYbxKRlE-xis_vjicGD8jg20O1yzO8GQGI8-uzuMAonwwBeevXlI3oADlVe58PPocmoWdb5IU2gxoBO81y1GBO3bHG-no4mb4YhbWmt-Sjq_v1R7w",
  },
  {
    label: "Executive Condominium",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9e4qG_1h_3-Kx1Qz7s8n30_V18gP7xGzV7X3Qn9U1R6Q1y0e5gP7AB6AXuArZM8eccqrTxsJgQGwrJ9QdADLY41kgOvV3jzwXGn16dj5ogp9Z4MXSSZi-vq4D1_T1QkfKp9Ds7ueGwa3pSV7KomN4uiFrhUl2SHywD6J6oIvRLsmWNXwZngHiVFOTxbAAj31SuxMaN27rZD65OyNS5KSgJCXepQqV3TiMmcCwBODUSyNOIBG_DRAZDJDeOA9zSw0COPkh474PN-PSeniepcpIHYXDZUtnPrcDrBuSbOaztsZ3PQ-Ww",
  },
  {
    label: "Commercial Shopping Center",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYhYyC_2gZ_Rz5n7w30_4iMv6gU5vGvF2X9xK1w3-00YVz7H5wZp18R4xGzV7X3Qn9U1R6Q1y0e5gP7",
  }
];

const DEFAULT_SAMPLE_IMAGES: UploadedPropertyImage[] = [
  {
    id: "sample-1",
    label: "Modern Bole Apartment",
    url: SAMPLE_PROPERTY_IMAGES[0].url,
    isCover: true,
  },
  {
    id: "sample-2",
    label: "Luxury Villa Compound",
    url: SAMPLE_PROPERTY_IMAGES[1].url,
  },
  {
    id: "sample-3",
    label: "Executive Condominium",
    url: SAMPLE_PROPERTY_IMAGES[2].url,
  },
  {
    id: "sample-4",
    label: "Commercial Shopping Center",
    url: SAMPLE_PROPERTY_IMAGES[3].url,
  }
];

type MainPropertyType = "Villa" | "Apartment" | "Condominium" | "Shopping Mall";
type CommercialSubType = "single-shop" | "shopping-mall" | "office-space";
type CondominiumTypology = "studio" | "1-bed" | "2-bed" | "3-bed";
type ApartmentTypology = "studio" | "1-bed" | "2-bed" | "3-bed";

export const RegisterPropertyPage: React.FC = () => {
  const { handleNavigate, handleRegisterProperty } = useCitizenData();

  // 4-Step Registration Process as shown in the design:
  // 1: Basic Info, 2: Property Details, 3: Documents, 4: Review
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // Step 1: Basic Info
  const [registrationRole, setRegistrationRole] = useState<"individual" | "developer" | "representative">("individual");
  const [title, setTitle] = useState("Bole Atlas Luxury Villa Residence");
  const [landlordName, setLandlordName] = useState("Dagmawit Mesfin");
  const [faydaId, setFaydaId] = useState("ET-NID-00892418");
  const [phone, setPhone] = useState("+251 91 144 8920");
  const [email, setEmail] = useState("dagmawit.mesfin@gmail.com");
  const [monthlyRent, setMonthlyRent] = useState("45000");
  const [securityDepositMonths, setSecurityDepositMonths] = useState("2");
  const [minLeasePeriod, setMinLeasePeriod] = useState("1 Year");
  const [availableFrom, setAvailableFrom] = useState("Immediate");

  // Step 2: Property Details
  const [propertyType, setPropertyType] = useState<MainPropertyType>("Villa");

  // Address & Ownership
  const [subCity, setSubCity] = useState("Bole");
  const [woreda, setWoreda] = useState("03");
  const [houseNo, setHouseNo] = useState("456/A");
  const [ownershipType, setOwnershipType] = useState("Private");
  const [specificLandmark, setSpecificLandmark] = useState("Behind Atlas Hotel, Near Japanese Embassy");

  // A. Villa / Compound House Specifics
  const [villaBedrooms, setVillaBedrooms] = useState("4");
  const [villaBathrooms, setVillaBathrooms] = useState("3");
  const [villaLivingRooms, setVillaLivingRooms] = useState("2");
  const [villaFloorNumber, setVillaFloorNumber] = useState("Ground");
  const [villaCompoundArea, setVillaCompoundArea] = useState("350");
  const [isServiceQuarter, setIsServiceQuarter] = useState(false);
  const [villaParkingSlots, setVillaParkingSlots] = useState("2 Dedicated Slots");

  // B. Apartment Specifics (Studio, 1-bed, 2-bed, 3-bed only)
  const [aptTypology, setAptTypology] = useState<ApartmentTypology>("2-bed");
  const [aptBathrooms, setAptBathrooms] = useState("2");
  const [aptLivingRooms, setAptLivingRooms] = useState("1");
  const [aptFloorNumber, setAptFloorNumber] = useState("4th Floor");
  const [aptBlockNumber, setAptBlockNumber] = useState("Block B");
  const [aptUnitDoor, setAptUnitDoor] = useState("Unit 402");
  const [aptArea, setAptArea] = useState("110");
  const [aptHasElevator, setAptHasElevator] = useState(true);
  const [aptHasBalcony, setAptHasBalcony] = useState(true);

  // C. Condominium Specifics (Studio, 1-bed, 2-bed, 3-bed only)
  const [condoTypology, setCondoTypology] = useState<CondominiumTypology>("2-bed");
  const [condoScheme, setCondoScheme] = useState<"20/80" | "40/60" | "Private">("40/60");
  const [condoSiteName, setCondoSiteName] = useState("Bole Arabsa Site");
  const [condoBlockNumber, setCondoBlockNumber] = useState("Block 24");
  const [condoFloorNumber, setCondoFloorNumber] = useState("3rd Floor");
  const [condoUnitNumber, setCondoUnitNumber] = useState("Door 12");
  const [condoArea, setCondoArea] = useState("85");
  const [condoBathrooms, setCondoBathrooms] = useState("1");

  // D. Commercial / Shopping Mall Specifics (NO BEDROOMS!)
  const [commercialSubType, setCommercialSubType] = useState<CommercialSubType>("shopping-mall");
  // D1. Single Shop Form
  const [shopNumber, setShopNumber] = useState("Shop G-14");
  const [shopFloorLevel, setShopFloorLevel] = useState("Ground Floor");
  const [shopArea, setShopArea] = useState("38");
  const [shopCategory, setShopCategory] = useState("Retail / Boutique");
  const [shopFrontage, setShopFrontage] = useState("Glass Display Window Frontage");
  const [hasElectricSubmeter, setHasElectricSubmeter] = useState(true);
  const [hasWaterSupply, setHasWaterSupply] = useState(true);

  // D2. Shopping Mall / Complex Form with Landlord-Managed Shopping House Units
  const [mallTotalFloors, setMallTotalFloors] = useState("4 Floors (B+G+2)");
  const [mallParkingCapacity, setMallParkingCapacity] = useState("30 Vehicles");
  const [mallHasGenerator, setMallHasGenerator] = useState(true);
  const [mallHasElevatorEscalator, setMallHasElevatorEscalator] = useState(true);
  const [mallHas24Security, setMallHas24Security] = useState(true);
  const [mallHasLoadingDock, setMallHasLoadingDock] = useState(true);

  // Title Deed Upload
  const [titleDeedFile, setTitleDeedFile] = useState<TitleDeedDoc>({
    name: "Official_Title_Deed_Certificate_Scan.pdf",
    size: "2.4 MB",
    number: "ETH-MUDC-2024-88412",
    uploadedAt: "Today, 10:15 AM",
  });

  // Multiple Property Images & Active Selected Image
  const [propertyImages, setPropertyImages] = useState<UploadedPropertyImage[]>(DEFAULT_SAMPLE_IMAGES);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Active Display Image (Featured Property Visual)
  const activePropertyVisual = propertyImages[activeImageIndex]?.url || propertyImages[0]?.url || DEFAULT_SAMPLE_IMAGES[0].url;

  // Handle Multi-Image Upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newFiles: File[] = Array.from(e.target.files);
    
    const newImgs: UploadedPropertyImage[] = newFiles.map((file: File, idx: number) => ({
      id: `custom-img-${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      label: file.name.replace(/\.[^/.]+$/, ""),
      isCover: propertyImages.length === 0 && idx === 0,
      file,
    }));

    setPropertyImages((prev) => [...prev, ...newImgs]);
    setActiveImageIndex(propertyImages.length);
  };

  // Handle Title Deed Upload
  const handleTitleDeedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    setTitleDeedFile({
      name: file.name,
      size: sizeMb,
      number: titleDeedNumber || "ETH-TD-" + Math.floor(100000 + Math.random() * 900000),
      uploadedAt: "Just now",
      file,
    });
  };

  const handleSetCoverImage = (index: number) => {
    setPropertyImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isCover: i === index,
      }))
    );
    setActiveImageIndex(index);
  };

  const handleRemoveImage = (index: number) => {
    if (propertyImages.length <= 1) return;
    const updated = propertyImages.filter((_, i) => i !== index);
    setPropertyImages(updated);
    if (activeImageIndex >= updated.length) {
      setActiveImageIndex(updated.length - 1);
    }
  };

  // Landlord Unit Inventory List: Each unit shopping house with landlord-editable number & duplicate action
  const [mallUnits, setMallUnits] = useState<MallShopUnit[]>([
    {
      id: "unit-1",
      shopNumber: "Shop G-01",
      floorLevel: "Ground Floor",
      area: 45,
      rentAmount: 28000,
      category: "Retail / Boutique",
      frontage: "Glass Display Window Frontage",
      submeter: true,
      waterSupply: true,
      status: "Available",
    },
    {
      id: "unit-2",
      shopNumber: "Shop G-02",
      floorLevel: "Ground Floor",
      area: 35,
      rentAmount: 22000,
      category: "Café / Restaurant",
      frontage: "Glass Display Window Frontage",
      submeter: true,
      waterSupply: true,
      status: "Available",
    },
    {
      id: "unit-3",
      shopNumber: "Shop 1-01",
      floorLevel: "1st Floor",
      area: 55,
      rentAmount: 20000,
      category: "Electronics / Telecom",
      frontage: "Glass Display Window Frontage",
      submeter: true,
      waterSupply: false,
      status: "Available",
    },
    {
      id: "unit-4",
      shopNumber: "Shop 1-02",
      floorLevel: "1st Floor",
      area: 40,
      rentAmount: 18000,
      category: "Pharmacy / Clinic",
      frontage: "Roller Shutter Frontage",
      submeter: true,
      waterSupply: true,
      status: "Available",
    },
  ]);

  // Landlord duplicate unit action: Clones unit configuration and auto-generates the next shop number
  const handleDuplicateUnit = (index: number) => {
    const source = mallUnits[index];
    const existingNumbers = mallUnits.map((u) => u.shopNumber.trim().toLowerCase());

    let nextShopNumber = `${source.shopNumber} (Copy)`;
    const match = source.shopNumber.match(/^(.*?)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const numStr = match[2];
      let num = parseInt(numStr, 10);
      let candidate = `${prefix}${String(num + 1).padStart(numStr.length, "0")}`;
      while (existingNumbers.includes(candidate.trim().toLowerCase())) {
        num++;
        candidate = `${prefix}${String(num + 1).padStart(numStr.length, "0")}`;
      }
      nextShopNumber = candidate;
    }

    const clonedUnit: MallShopUnit = {
      ...source,
      id: `unit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      shopNumber: nextShopNumber,
      status: "Available",
    };

    const updated = [...mallUnits];
    updated.splice(index + 1, 0, clonedUnit);
    setMallUnits(updated);
  };

  // Landlord add fresh unit
  const handleAddUnit = () => {
    const nextIdx = mallUnits.length + 1;
    const newUnit: MallShopUnit = {
      id: `unit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      shopNumber: `Shop G-${String(nextIdx).padStart(2, "0")}`,
      floorLevel: "Ground Floor",
      area: 40,
      rentAmount: 25000,
      category: "Retail / Boutique",
      frontage: "Glass Display Window Frontage",
      submeter: true,
      waterSupply: true,
      status: "Available",
    };
    setMallUnits([...mallUnits, newUnit]);
  };

  // Delete unit (keep at least 1)
  const handleDeleteUnit = (index: number) => {
    if (mallUnits.length <= 1) return;
    setMallUnits(mallUnits.filter((_, i) => i !== index));
  };

  // Update specific unit field
  const handleUpdateUnit = <K extends keyof MallShopUnit>(
    index: number,
    field: K,
    value: MallShopUnit[K]
  ) => {
    const updated = [...mallUnits];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setMallUnits(updated);
  };

  // Calculated totals for shopping mall
  const mallTotalLeasableArea = mallUnits.reduce((acc, u) => acc + (Number(u.area) || 0), 0);
  const mallTotalMonthlyGrossRent = mallUnits.reduce((acc, u) => acc + (Number(u.rentAmount) || 0), 0);

  // Step 3: Documents & Cadastre
  const [cadastralParcelId, setCadastralParcelId] = useState("AA-BOL-03-P99120");
  const [titleDeedNumber, setTitleDeedNumber] = useState("ETH-MUDC-2024-88412");
  const [featuredImage, setFeaturedImage] = useState(SAMPLE_PROPERTY_IMAGES[1].url);
  const [description, setDescription] = useState(
    "High-standard registered property located in Addis Ababa, fully compliant with national housing registry and cadastral standards."
  );

  // Step 4: Proclamation Consent
  const [agreedToProclamation, setAgreedToProclamation] = useState(true);

  const getDerivedBedroomsCount = (): number | undefined => {
    if (propertyType === "Shopping Mall") return undefined;
    if (propertyType === "Villa") return isServiceQuarter ? 1 : parseInt(villaBedrooms, 10) || 0;
    if (propertyType === "Apartment") {
      if (aptTypology === "studio") return 0;
      if (aptTypology === "1-bed") return 1;
      if (aptTypology === "2-bed") return 2;
      if (aptTypology === "3-bed") return 3;
    }
    if (propertyType === "Condominium") {
      if (condoTypology === "studio") return 0;
      if (condoTypology === "1-bed") return 1;
      if (condoTypology === "2-bed") return 2;
      if (condoTypology === "3-bed") return 3;
    }
    return 2;
  };

  const getDerivedBathroomsCount = (): number | undefined => {
    if (propertyType === "Shopping Mall") return undefined;
    if (propertyType === "Villa") return parseInt(villaBathrooms, 10) || 1;
    if (propertyType === "Apartment") return parseInt(aptBathrooms, 10) || 1;
    if (propertyType === "Condominium") return parseInt(condoBathrooms, 10) || 1;
    return 1;
  };

  const getDerivedArea = (): number => {
    if (propertyType === "Villa") return parseFloat(villaCompoundArea) || 250;
    if (propertyType === "Apartment") return parseFloat(aptArea) || 110;
    if (propertyType === "Condominium") return parseFloat(condoArea) || 85;
    if (propertyType === "Shopping Mall") {
      return commercialSubType === "single-shop"
        ? parseFloat(shopArea) || 38
        : mallTotalLeasableArea || 180;
    }
    return 100;
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const typeMapping: Property["type"] =
        propertyType === "Shopping Mall"
          ? "Commercial"
          : (propertyType as Property["type"]);

      const newProperty: Property = {
        id: `prop-${Date.now()}`,
        title: title || `${subCity} ${propertyType} Property`,
        type: typeMapping,
        price:
          propertyType === "Shopping Mall" && commercialSubType === "shopping-mall"
            ? mallTotalMonthlyGrossRent
            : parseFloat(monthlyRent) || 35000,
        location: `${woreda ? `Woreda ${woreda}, ` : ""}${subCity} Sub-city, Addis Ababa`,
        subCity: `${subCity} Sub City`,
        woreda: `Woreda ${woreda}`,
        houseNo: houseNo || "N/A",
        bedrooms: getDerivedBedroomsCount(),
        bathrooms: getDerivedBathroomsCount(),
        area: getDerivedArea(),
        floor:
          propertyType === "Villa"
            ? villaFloorNumber
            : propertyType === "Apartment"
            ? aptFloorNumber
            : propertyType === "Condominium"
            ? condoFloorNumber
            : commercialSubType === "single-shop"
            ? shopFloorLevel
            : mallTotalFloors,
        status: "Available",
        verified: true,
        featuredImage: activePropertyVisual,
        galleryImages: propertyImages.map((img) => img.url),
        description:
          description ||
          `Government registered ${propertyType} property under GRAMS municipal title verification.`,
        amenities:
          propertyType === "Shopping Mall"
            ? [
                "3-Phase Industrial Generator",
                "Customer Parking Facility",
                "24/7 Security CCTV",
                "Dedicated Electric Sub-Meters",
              ]
            : [
                "Dedicated Water Reservoir",
                "24/7 Security Guard",
                "Compound Parking",
                "Backup Power Support",
              ],
        securityDepositMonths: parseInt(securityDepositMonths, 10) || 2,
        minLeasePeriod,
        utilitiesIncluded: false,
        availableFrom,
        landlordName,
        unitsCount:
          propertyType === "Shopping Mall" && commercialSubType === "shopping-mall"
            ? mallUnits.length
            : 1,
        units:
          propertyType === "Shopping Mall" && commercialSubType === "shopping-mall"
            ? mallUnits.map((u) => ({
                id: u.id,
                unitCode: u.shopNumber,
                name: `${u.floorLevel} - ${u.category}`,
                type: u.category,
                area: u.area,
                status: u.status,
                rentAmount: u.rentAmount,
                floorLevel: u.floorLevel,
                category: u.category,
                shopNumber: u.shopNumber,
                submeter: u.submeter,
                waterSupply: u.waterSupply,
                frontage: u.frontage,
              }))
            : undefined,
      };

      handleRegisterProperty(newProperty);
      setIsSubmitting(false);
      setIsSubmittedSuccess(true);
    }, 800);
  };

  const steps = [
    { num: 1, label: "Basic Info" },
    { num: 2, label: "Property Details" },
    { num: 3, label: "Documents" },
    { num: 4, label: "Review" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Register New Property
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Submit property holding details for municipal cadastral certification and digital lease integration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNavigate("properties")}
            className="text-xs h-9"
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* 4-Step Stepper Header */}
      <div className="py-2">
        <div className="flex items-center justify-between max-w-3xl mx-auto px-4">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <React.Fragment key={step.num}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(step.num)}
                  className="flex flex-col items-center group focus:outline-none"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted || isCurrent
                        ? "bg-[#00450d] text-white ring-4 ring-emerald-100/80 shadow-xs"
                        : "bg-white border-2 border-slate-300 text-slate-400 group-hover:border-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      step.num
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                      isCurrent
                        ? "font-bold text-slate-900"
                        : isCompleted
                        ? "text-[#00450d]"
                        : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </button>

                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] mx-2 -mt-5 transition-colors ${
                      currentStep > step.num ? "bg-[#00450d]" : "bg-slate-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Submitted Success Screen */}
      {isSubmittedSuccess ? (
        <Card className="border-slate-200 bg-white shadow-clean text-center p-8 sm:p-12 max-w-2xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#00450d] flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="space-y-1.5">
            <Badge variant="verified" className="mx-auto">
              Registration Successful
            </Badge>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Property Successfully Registered in GRAMS
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              <strong>{title}</strong> ({propertyType}) has been logged in the Addis Ababa Land & Housing Bureau Title Database with digital cadastral verification.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-left max-w-md mx-auto space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Registry Reference:</span>
              <span className="font-mono font-bold text-slate-900">
                ETH-GRAMS-{Date.now().toString().slice(-6)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Property Type:</span>
              <span className="font-semibold text-slate-900">{propertyType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Sub-City & Woreda:</span>
              <span className="font-medium text-slate-900">
                {subCity} Sub-city, Woreda {woreda}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Monthly Registered Rent:</span>
              <span className="font-bold text-slate-900">
                ETB {parseFloat(monthlyRent).toLocaleString()}/mo
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => handleNavigate("properties")}
              className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-10 px-6 font-semibold w-full sm:w-auto"
            >
              View My Properties Portfolio
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmittedSuccess(false);
                setCurrentStep(1);
              }}
              className="text-xs h-10 px-5 w-full sm:w-auto"
            >
              Register Another Property
            </Button>
          </div>
        </Card>
      ) : (
        /* STEP WIZARD FORM */
        <Card className="border border-slate-200/90 rounded-2xl bg-white shadow-clean overflow-hidden">
          {/* STEP 1: Basic Info */}
          {currentStep === 1 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Basic Info & Ownership
                </h2>
              </div>

              {/* Landlord Identification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal Landlord Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={landlordName}
                    onChange={(e) => setLandlordName(e.target.value)}
                    placeholder="e.g. Dagmawit Mesfin"
                    className="h-10 text-xs bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fayda National Digital ID (FIN) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      value={faydaId}
                      onChange={(e) => setFaydaId(e.target.value)}
                      placeholder="ET-NID-XXXXXXXX"
                      className="h-10 text-xs font-mono bg-white pl-8"
                      required
                    />
                    <ShieldCheck className="w-4 h-4 text-emerald-600 absolute left-2.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 9X XXX XXXX"
                    className="h-10 text-xs bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Email Address
                  </label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="h-10 text-xs bg-white"
                  />
                </div>
              </div>

              {/* Property Title & Financials */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Monthly Asking Rent (ETB) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(e.target.value)}
                      placeholder="45000"
                      className="h-10 text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Security Deposit
                    </label>
                    <select
                      value={securityDepositMonths}
                      onChange={(e) => setSecurityDepositMonths(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00450d]"
                    >
                      <option value="1">1 Month Rent</option>
                      <option value="2">2 Months Rent</option>
                      <option value="3">3 Months Rent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Minimum Lease Period
                    </label>
                    <select
                      value={minLeasePeriod}
                      onChange={(e) => setMinLeasePeriod(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00450d]"
                    >
                      <option value="6 Months">6 Months</option>
                      <option value="1 Year">1 Year Standard</option>
                      <option value="2 Years">2 Years Commercial</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleNavigate("properties")}
                  className="px-6 text-xs h-10"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-10 px-6 font-semibold gap-1.5"
                >
                  <span>Save & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Property Details */}
          {currentStep === 2 && (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Header Title */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Property Details
                </h2>
              </div>

              {/* 1. Property Type Grid (4 Cards: Villa, Apartment, Condominium, Shopping Mall) */}
              <div className="space-y-2.5">
                <label className="block text-sm font-semibold text-slate-900">
                  Property Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                  {/* Card 1: Villa */}
                  <button
                    type="button"
                    onClick={() => setPropertyType("Villa")}
                    className={`relative p-2 rounded-xl border flex flex-row items-center justify-center gap-2.5 transition-all ${
                      propertyType === "Villa"
                        ? "bg-[#e8f1ea] border-[#00450d] ring-1 ring-[#00450d] text-slate-900"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {propertyType === "Villa" && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#00450d] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="w-8 h-8 flex items-center justify-center">
                      <Home className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <span className="text-xs font-semibold">Villa</span>
                  </button>

                  {/* Card 2: Apartment */}
                  <button
                    type="button"
                    onClick={() => setPropertyType("Apartment")}
                    className={`relative p-2 rounded-xl border flex flex-row items-center justify-center gap-2.5 transition-all ${
                      propertyType === "Apartment"
                        ? "bg-[#e8f1ea] border-[#00450d] ring-1 ring-[#00450d] text-slate-900"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {propertyType === "Apartment" && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#00450d] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="w-8 h-8 flex items-center justify-center">
                      <Building className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <span className="text-xs font-semibold">Apartment</span>
                  </button>

                  {/* Card 3: Condominium */}
                  <button
                    type="button"
                    onClick={() => setPropertyType("Condominium")}
                    className={`relative p-2 rounded-xl border text-center flex flex-row items-center justify-center gap-2.5 transition-all ${
                      propertyType === "Condominium"
                        ? "bg-[#e8f1ea] border-[#00450d] ring-1 ring-[#00450d] text-slate-900"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {propertyType === "Condominium" && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#00450d] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="w-8 h-8 flex items-center justify-center">
                      <Building2 className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <span className="text-xs font-semibold">Condominium</span>
                  </button>

                  {/* Card 4: Shopping Mall */}
                  <button
                    type="button"
                    onClick={() => setPropertyType("Shopping Mall")}
                    className={`relative p-2 rounded-xl border flex flex-row items-center justify-center gap-2.5 transition-all ${
                      propertyType === "Shopping Mall"
                        ? "bg-[#e8f1ea] border-[#00450d] ring-1 ring-[#00450d] text-slate-900"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {propertyType === "Shopping Mall" && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#00450d] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="w-8 h-8 flex items-center justify-center">
                      <Store className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <span className="text-xs font-semibold">Shopping Mall</span>
                  </button>
                </div>
              </div>

              {/* 2. Address & Ownership Section */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-slate-900">
                  Address & Ownership
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Sub-city
                    </label>
                    <select
                      value={subCity}
                      onChange={(e) => setSubCity(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00450d]"
                    >
                      <option value="">Select Sub-city</option>
                      <option value="Bole">Bole Sub-city (ቦሌ)</option>
                      <option value="Kirkos">Kirkos Sub-city (ቂርቆስ)</option>
                      <option value="Yeka">Yeka Sub-city (የካ)</option>
                      <option value="Arada">Arada Sub-city (አራዳ)</option>
                      <option value="Nifas Silk-Lafto">Nifas Silk-Lafto (ንፋስ ስልክ)</option>
                      <option value="Lideta">Lideta Sub-city (ልደታ)</option>
                      <option value="Gullele">Gullele Sub-city (ጉለሌ)</option>
                      <option value="Akaky Kaliti">Akaky Kaliti (አቃቂ ቃሊቲ)</option>
                      <option value="Kolfe Keranio">Kolfe Keranio (ኮልፌ ቀራኒዮ)</option>
                      <option value="Addis Ketema">Addis Ketema (አዲስ ከተማ)</option>
                      <option value="Lemi Kura">Lemi Kura Sub-city (ለሚ ኩራ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Woreda
                    </label>
                    <Input
                      value={woreda}
                      onChange={(e) => setWoreda(e.target.value)}
                      placeholder="e.g. 03"
                      className="h-11 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      House Number
                    </label>
                    <Input
                      value={houseNo}
                      onChange={(e) => setHouseNo(e.target.value)}
                      placeholder="e.g. 456/A"
                      className="h-11 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 3. DYNAMIC SPECIFICATION FORMS BASED ON USER LOGIC RULES */}

              {/* CASE A: VILLA / COMPOUND HOUSE */}
              {propertyType === "Villa" && (
                <div className="border border-slate-200/90 rounded-xl p-4 sm:p-5 bg-slate-50/40 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Residential Specifications (Compound House / Villa)
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Detached Compound Form
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Bedrooms
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={villaBedrooms}
                        onChange={(e) => setVillaBedrooms(e.target.value)}
                        placeholder="0"
                        disabled={isServiceQuarter}
                        className="h-11 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Bathrooms
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={villaBathrooms}
                        onChange={(e) => setVillaBathrooms(e.target.value)}
                        placeholder="0"
                        className="h-11 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Living Rooms
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={villaLivingRooms}
                        onChange={(e) => setVillaLivingRooms(e.target.value)}
                        placeholder="0"
                        className="h-11 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Floor Number
                      </label>
                      <Input
                        value={villaFloorNumber}
                        onChange={(e) => setVillaFloorNumber(e.target.value)}
                        placeholder="Ground"
                        className="h-11 text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Single Dormitory (Service Quarter) Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isServiceQuarter}
                        onChange={(e) => {
                          setIsServiceQuarter(e.target.checked);
                          if (e.target.checked) setVillaBedrooms("1");
                        }}
                        className="w-4 h-4 text-[#00450d] rounded border-slate-300 focus:ring-[#00450d]"
                      />
                      <span>Classify as Single Dormitory (Service Quarter)</span>
                    </label>
                  </div>

                  {/* Additional Compound Attributes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-200/60">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Compound / Plot Area (m²)
                      </label>
                      <Input
                        type="number"
                        value={villaCompoundArea}
                        onChange={(e) => setVillaCompoundArea(e.target.value)}
                        placeholder="e.g. 350"
                        className="h-9 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Parking Capacity
                      </label>
                      <Input
                        value={villaParkingSlots}
                        onChange={(e) => setVillaParkingSlots(e.target.value)}
                        placeholder="e.g. 2 Dedicated Slots"
                        className="h-9 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CASE B: APARTMENT */}
              {propertyType === "Apartment" && (
                <div className="border border-slate-200/90 rounded-xl p-4 sm:p-5 bg-slate-50/40 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Apartment Specifications (Fixed Room Typology)
                    </h3>
                    <Badge variant="default" className="text-[10px]">
                      Residential Flat
                    </Badge>
                  </div>

                  {/* Room Typology Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Apartment Bedroom Layout <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: "studio", label: "Studio" },
                        { id: "1-bed", label: "1 Bedroom" },
                        { id: "2-bed", label: "2 Bedrooms" },
                        { id: "3-bed", label: "3 Bedrooms" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setAptTypology(t.id as ApartmentTypology)}
                          className={`py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all ${
                            aptTypology === t.id
                              ? "bg-[#00450d] text-white border-[#00450d] shadow-2xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Bathrooms
                      </label>
                      <select
                        value={aptBathrooms}
                        onChange={(e) => setAptBathrooms(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                      >
                        <option value="1">1 Bathroom</option>
                        <option value="2">2 Bathrooms</option>
                        <option value="3">3 Bathrooms</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Floor Level
                      </label>
                      <Input
                        value={aptFloorNumber}
                        onChange={(e) => setAptFloorNumber(e.target.value)}
                        placeholder="e.g. 4th Floor"
                        className="h-10 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Block / Wing
                      </label>
                      <Input
                        value={aptBlockNumber}
                        onChange={(e) => setAptBlockNumber(e.target.value)}
                        placeholder="Block B"
                        className="h-10 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Floor Area (m²)
                      </label>
                      <Input
                        type="number"
                        value={aptArea}
                        onChange={(e) => setAptArea(e.target.value)}
                        placeholder="110"
                        className="h-10 text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-200/60 text-xs text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aptHasElevator}
                        onChange={(e) => setAptHasElevator(e.target.checked)}
                        className="w-4 h-4 text-[#00450d] rounded border-slate-300"
                      />
                      <span>High-speed Passenger Elevator Access</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aptHasBalcony}
                        onChange={(e) => setAptHasBalcony(e.target.checked)}
                        className="w-4 h-4 text-[#00450d] rounded border-slate-300"
                      />
                      <span>Private Balcony & Panoramic View</span>
                    </label>
                  </div>
                </div>
              )}

              {/* CASE C: CONDOMINIUM */}
              {propertyType === "Condominium" && (
                <div className="border border-slate-200/90 rounded-xl p-4 sm:p-5 bg-slate-50/40 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Condominium Specifications (Scheme & Unit Typology)
                    </h3>
                    <Badge variant="verified" className="text-[10px]">
                      Municipal Housing Scheme
                    </Badge>
                  </div>

                  {/* Condominium Scheme Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Condominium Scheme Category
                      </label>
                      <select
                        value={condoScheme}
                        onChange={(e) => setCondoScheme(e.target.value as any)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                      >
                        <option value="40/60">40/60 Scheme (Middle Class Housing)</option>
                        <option value="20/80">20/80 Scheme (Public Housing)</option>
                        <option value="Private">Private Mixed Development Scheme</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Condominium Site / Project Name
                      </label>
                      <Input
                        value={condoSiteName}
                        onChange={(e) => setCondoSiteName(e.target.value)}
                        placeholder="e.g. Bole Arabsa / Jemo 1 / Gotera"
                        className="h-10 text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Room Typology Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Condominium Room Typology <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: "studio", label: "Studio (ስቱዲዮ)" },
                        { id: "1-bed", label: "1 Bedroom (ባለ 1 መኝታ)" },
                        { id: "2-bed", label: "2 Bedrooms (ባለ 2 መኝታ)" },
                        { id: "3-bed", label: "3 Bedrooms (ባለ 3 መኝታ)" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setCondoTypology(t.id as CondominiumTypology)}
                          className={`py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all ${
                            condoTypology === t.id
                              ? "bg-[#00450d] text-white border-[#00450d] shadow-2xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Block Number
                      </label>
                      <Input
                        value={condoBlockNumber}
                        onChange={(e) => setCondoBlockNumber(e.target.value)}
                        placeholder="Block 24"
                        className="h-10 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Floor Level
                      </label>
                      <Input
                        value={condoFloorNumber}
                        onChange={(e) => setCondoFloorNumber(e.target.value)}
                        placeholder="3rd Floor"
                        className="h-10 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Door Number
                      </label>
                      <Input
                        value={condoUnitNumber}
                        onChange={(e) => setCondoUnitNumber(e.target.value)}
                        placeholder="Door 12"
                        className="h-10 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Floor Area (m²)
                      </label>
                      <Input
                        type="number"
                        value={condoArea}
                        onChange={(e) => setCondoArea(e.target.value)}
                        placeholder="85"
                        className="h-10 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CASE D: SHOPPING MALL / COMMERCIAL */}
              {propertyType === "Shopping Mall" && (
                <div className="border border-slate-200/90 rounded-xl p-4 sm:p-5 bg-slate-50/40 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Commercial & Shopping Specifications
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Commercial property profile (Excludes residential room specifications).
                      </p>
                    </div>
                    <Badge variant="default" className="text-[10px]">
                      Commercial Space
                    </Badge>
                  </div>

                  {/* Commercial Sub-Type Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Select Commercial Category Form
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCommercialSubType("shopping-mall")}
                        className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                          commercialSubType === "shopping-mall"
                            ? "bg-emerald-50/70 border-[#00450d] ring-1 ring-[#00450d]"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-[#00450d] flex items-center justify-center shrink-0 mt-0.5">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Entire Shopping Mall / Complex</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Multi-unit retail plaza with commercial amenities</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCommercialSubType("single-shop")}
                        className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                          commercialSubType === "single-shop"
                            ? "bg-emerald-50/70 border-[#00450d] ring-1 ring-[#00450d]"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-[#00450d] flex items-center justify-center shrink-0 mt-0.5">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Single Retail Shop / Store</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Individual boutique, grocery, kiosk or showroom</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* SUB-FORM D1: SINGLE RETAIL SHOP */}
                  {commercialSubType === "single-shop" && (
                    <div className="space-y-3.5 pt-2 border-t border-slate-200/60">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Shop / Store Unit Number
                          </label>
                          <Input
                            value={shopNumber}
                            onChange={(e) => setShopNumber(e.target.value)}
                            placeholder="e.g. Shop G-14"
                            className="h-10 text-xs bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Floor Level
                          </label>
                          <select
                            value={shopFloorLevel}
                            onChange={(e) => setShopFloorLevel(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                          >
                            <option value="Ground Floor">Ground Floor (Street Front)</option>
                            <option value="1st Floor">1st Floor</option>
                            <option value="2nd Floor">2nd Floor</option>
                            <option value="Basement">Basement Level</option>
                            <option value="Mezzanine">Mezzanine</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Shop Net Area (m²)
                          </label>
                          <Input
                            type="number"
                            value={shopArea}
                            onChange={(e) => setShopArea(e.target.value)}
                            placeholder="38"
                            className="h-10 text-xs bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Commercial Trade Usage
                          </label>
                          <select
                            value={shopCategory}
                            onChange={(e) => setShopCategory(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                          >
                            <option value="Retail / Boutique">Retail / Boutique / Clothes</option>
                            <option value="Pharmacy / Clinic">Pharmacy / Health & Beauty</option>
                            <option value="Café / Restaurant">Café / Restaurant / Eatery</option>
                            <option value="Electronics / Telecom">Electronics & Tech Services</option>
                            <option value="Salon / Spa">Salon / Barber / Spa</option>
                            <option value="Office / Agency">Office / Financial Agency</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Shop Frontage Type
                          </label>
                          <Input
                            value={shopFrontage}
                            onChange={(e) => setShopFrontage(e.target.value)}
                            placeholder="Glass Display Window Frontage"
                            className="h-10 text-xs bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-700">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasElectricSubmeter}
                            onChange={(e) => setHasElectricSubmeter(e.target.checked)}
                            className="w-4 h-4 text-[#00450d] rounded border-slate-300"
                          />
                          <span>Dedicated 3-Phase Electric Sub-Meter</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasWaterSupply}
                            onChange={(e) => setHasWaterSupply(e.target.checked)}
                            className="w-4 h-4 text-[#00450d] rounded border-slate-300"
                          />
                          <span>Dedicated Water Tap & Drainage Point</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* SUB-FORM D2: ENTIRE SHOPPING MALL / COMPLEX */}
                  {commercialSubType === "shopping-mall" && (
                    <div className="space-y-5 pt-2 border-t border-slate-200/60">
                      {/* Mall General Specs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Number of Commercial Floors
                          </label>
                          <Input
                            value={mallTotalFloors}
                            onChange={(e) => setMallTotalFloors(e.target.value)}
                            placeholder="e.g. 4 Floors (B+G+2)"
                            className="h-10 text-xs bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Customer Parking Capacity
                          </label>
                          <Input
                            value={mallParkingCapacity}
                            onChange={(e) => setMallParkingCapacity(e.target.value)}
                            placeholder="e.g. 30 Vehicles"
                            className="h-10 text-xs bg-white"
                          />
                        </div>
                      </div>

                      {/* Mall Infrastructure Checklist */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 text-xs cursor-pointer hover:bg-slate-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={mallHasGenerator}
                            onChange={(e) => setMallHasGenerator(e.target.checked)}
                            className="w-4 h-4 text-[#00450d] rounded border-slate-300 focus:ring-[#00450d]"
                          />
                          <span className="font-medium text-slate-800">3-Phase Industrial Auto Backup Generator</span>
                        </label>

                        <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 text-xs cursor-pointer hover:bg-slate-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={mallHasElevatorEscalator}
                            onChange={(e) => setMallHasElevatorEscalator(e.target.checked)}
                            className="w-4 h-4 text-[#00450d] rounded border-slate-300 focus:ring-[#00450d]"
                          />
                          <span className="font-medium text-slate-800">Passenger Lifts & Escalators</span>
                        </label>

                        <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 text-xs cursor-pointer hover:bg-slate-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={mallHas24Security}
                            onChange={(e) => setMallHas24Security(e.target.checked)}
                            className="w-4 h-4 text-[#00450d] rounded border-slate-300 focus:ring-[#00450d]"
                          />
                          <span className="font-medium text-slate-800">24/7 Security CCTV & Control Center</span>
                        </label>

                        <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 text-xs cursor-pointer hover:bg-slate-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={mallHasLoadingDock}
                            onChange={(e) => setMallHasLoadingDock(e.target.checked)}
                            className="w-4 h-4 text-[#00450d] rounded border-slate-300 focus:ring-[#00450d]"
                          />
                          <span className="font-medium text-slate-800">Cargo Loading Dock & Service Lift</span>
                        </label>
                      </div>

                      {/* LANDLORD SHOPPING HOUSES INVENTORY SECTION */}
                      <div className="pt-4 border-t border-slate-200 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <Store className="w-4 h-4 text-[#00450d]" />
                              <h4 className="text-sm font-bold text-slate-900">
                                Shopping House Units Inventory ({mallUnits.length} Units)
                              </h4>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Register each individual retail shop house. Use the <strong>Duplicate</strong> button to quickly clone unit configurations.
                            </p>
                          </div>

                          <Button
                            type="button"
                            onClick={handleAddUnit}
                            className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-8 px-3 font-semibold gap-1.5 self-start sm:self-auto"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Shopping Unit</span>
                          </Button>
                        </div>

                        {/* Landlord Notice Box */}
                        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                          <Lock className="w-4 h-4 text-[#00450d] shrink-0 mt-0.5" />
                          <div className="text-[11px] text-emerald-950 leading-relaxed">
                            <span className="font-bold text-[#00450d]">Landlord Exclusive Access:</span> Only the registered property landlord has permission to change and assign official <strong>Shopping House Numbers</strong> (e.g. Shop G-01) for municipal registry records, leasing agreements, and separate utility billing.
                          </div>
                        </div>

                        {/* Summary KPI Strip */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                              Total Units
                            </span>
                            <span className="text-base font-bold text-slate-900">
                              {mallUnits.length} Shopping Houses
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                              Total Leasable Area
                            </span>
                            <span className="text-base font-bold text-slate-900">
                              {mallTotalLeasableArea} m²
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                              Gross Monthly Rent
                            </span>
                            <span className="text-base font-bold text-[#00450d]">
                              ETB {mallTotalMonthlyGrossRent.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                              Initial Status
                            </span>
                            <span className="text-base font-bold text-slate-800">
                              {mallUnits.filter((u) => u.status === "Available").length} Available
                            </span>
                          </div>
                        </div>

                        {/* Unit Cards List */}
                        <div className="space-y-3.5">
                          {mallUnits.map((unit, idx) => (
                            <div
                              key={unit.id}
                              className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3 hover:border-slate-300 transition-all relative"
                            >
                              {/* Unit Top Bar */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                                <div className="flex items-center gap-2.5 flex-1 max-w-md">
                                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                                    {idx + 1}
                                  </span>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <Lock className="w-3 h-3 text-[#00450d]" />
                                      <label className="text-[11px] font-bold text-slate-800">
                                        Shopping House Number <span className="text-[#00450d]">(Landlord Only)</span>
                                      </label>
                                    </div>
                                    <Input
                                      value={unit.shopNumber}
                                      onChange={(e) => handleUpdateUnit(idx, "shopNumber", e.target.value)}
                                      placeholder="e.g. Shop G-01"
                                      className="h-8 text-xs font-bold text-slate-900 bg-slate-50/50 border-emerald-200 focus:border-[#00450d]"
                                    />
                                  </div>
                                </div>

                                {/* Duplicate & Delete Actions */}
                                <div className="flex items-center gap-2 self-end sm:self-center">
                                  <Button
                                    type="button"
                                    onClick={() => handleDuplicateUnit(idx)}
                                    variant="outline"
                                    className="h-8 px-3 text-xs font-semibold gap-1.5 text-[#00450d] border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100 hover:text-[#00450d]"
                                    title="Duplicate this unit configuration and create next unit"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Duplicate</span>
                                  </Button>

                                  <Button
                                    type="button"
                                    onClick={() => handleDeleteUnit(idx)}
                                    disabled={mallUnits.length <= 1}
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                                    title="Delete unit"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Unit Configuration Fields Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                    Floor Level
                                  </label>
                                  <select
                                    value={unit.floorLevel}
                                    onChange={(e) => handleUpdateUnit(idx, "floorLevel", e.target.value)}
                                    className="w-full h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs text-slate-900"
                                  >
                                    <option value="Ground Floor">Ground Floor (Street Front)</option>
                                    <option value="Ground Floor Galleria">Ground Floor (Galleria)</option>
                                    <option value="1st Floor">1st Floor</option>
                                    <option value="2nd Floor">2nd Floor</option>
                                    <option value="3rd Floor">3rd Floor</option>
                                    <option value="4th Floor & Above">4th Floor & Above</option>
                                    <option value="Basement">Basement Level (-1)</option>
                                    <option value="Mezzanine">Mezzanine Level</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                    Shop Net Area (m²)
                                  </label>
                                  <Input
                                    type="number"
                                    min="5"
                                    value={unit.area}
                                    onChange={(e) => handleUpdateUnit(idx, "area", parseFloat(e.target.value) || 0)}
                                    className="h-8 text-xs bg-white"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                    Monthly Asking Rent (ETB)
                                  </label>
                                  <Input
                                    type="number"
                                    min="1000"
                                    value={unit.rentAmount}
                                    onChange={(e) => handleUpdateUnit(idx, "rentAmount", parseFloat(e.target.value) || 0)}
                                    className="h-8 text-xs font-bold text-emerald-900 bg-white"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                    Trade Category
                                  </label>
                                  <select
                                    value={unit.category}
                                    onChange={(e) => handleUpdateUnit(idx, "category", e.target.value)}
                                    className="w-full h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs text-slate-900"
                                  >
                                    <option value="Retail / Boutique">Retail / Boutique / Clothes</option>
                                    <option value="Pharmacy / Clinic">Pharmacy / Health & Beauty</option>
                                    <option value="Café / Restaurant">Café / Restaurant / Eatery</option>
                                    <option value="Electronics / Telecom">Electronics & Tech Services</option>
                                    <option value="Salon / Spa">Salon / Barber / Spa</option>
                                    <option value="Office / Agency">Office / Financial Agency</option>
                                    <option value="Supermarket / Kiosk">Supermarket / Grocery / Kiosk</option>
                                    <option value="Storage / Warehouse">Storage / Stock Unit</option>
                                  </select>
                                </div>
                              </div>

                              {/* Unit Frontage & Utilities */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                                <div>
                                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                    Frontage Type
                                  </label>
                                  <Input
                                    value={unit.frontage}
                                    onChange={(e) => handleUpdateUnit(idx, "frontage", e.target.value)}
                                    placeholder="Glass Display Window Frontage"
                                    className="h-8 text-xs bg-white"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                    Occupancy Status
                                  </label>
                                  <select
                                    value={unit.status}
                                    onChange={(e) => handleUpdateUnit(idx, "status", e.target.value as any)}
                                    className="w-full h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs text-slate-900 font-semibold"
                                  >
                                    <option value="Available">Available (For Lease)</option>
                                    <option value="Rented">Rented / Occupied</option>
                                    <option value="Reserved">Reserved / Under Fit-out</option>
                                  </select>
                                </div>

                                <div className="flex items-center gap-3 pt-4">
                                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-700">
                                    <input
                                      type="checkbox"
                                      checked={unit.submeter}
                                      onChange={(e) => handleUpdateUnit(idx, "submeter", e.target.checked)}
                                      className="w-3.5 h-3.5 text-[#00450d] rounded border-slate-300"
                                    />
                                    <span>Electric Sub-Meter</span>
                                  </label>

                                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-700">
                                    <input
                                      type="checkbox"
                                      checked={unit.waterSupply}
                                      onChange={(e) => handleUpdateUnit(idx, "waterSupply", e.target.checked)}
                                      className="w-3.5 h-3.5 text-[#00450d] rounded border-slate-300"
                                    />
                                    <span>Water Point</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Bottom Actions for Shopping Units */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                          <Button
                            type="button"
                            onClick={handleAddUnit}
                            variant="outline"
                            className="h-9 text-xs font-semibold gap-1.5 text-slate-700 border-slate-300 hover:bg-slate-50"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Another Shopping House</span>
                          </Button>

                          <Button
                            type="button"
                            onClick={() => handleDuplicateUnit(mallUnits.length - 1)}
                            variant="outline"
                            className="h-9 text-xs font-semibold gap-1.5 text-[#00450d] border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Duplicate Last Unit ({mallUnits[mallUnits.length - 1]?.shopNumber})</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons: Cancel and Save & Continue */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleNavigate("properties")}
                  className="px-6 text-xs h-10 text-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-10 px-6 font-semibold shadow-xs"
                >
                  Save & Continue
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: TITLE DEED & PROPERTY IMAGES */}
          {currentStep === 3 && (
            <div className="p-6 sm:p-8 space-y-5 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">3. Title Deed Certificate & Property Visuals</h2>
                <p className="text-slate-500 text-xs">Upload your official title deed scan and multiple property photos.</p>
              </div>

              {/* Title Deed Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="font-semibold block mb-1">Title Deed Document Number</label>
                  <Input value={titleDeedNumber} onChange={(e) => setTitleDeedNumber(e.target.value)} className="h-8.5 text-xs bg-white font-mono" />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Upload Title Deed Scan (PDF)</label>
                  <label className="flex items-center justify-between px-3 py-1.5 bg-white border border-emerald-300 rounded-lg cursor-pointer hover:bg-emerald-50/50">
                    <span className="truncate text-slate-700">{titleDeedFile?.name || "Choose file..."}</span>
                    <Upload className="w-4 h-4 text-[#00450d] shrink-0 ml-2" />
                    <input type="file" accept=".pdf,.png,.jpg" onChange={handleTitleDeedUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Active Property Visual Display */}
              <div className="space-y-2">
                <label className="font-semibold block">Featured Property Visual (Active Preview)</label>
                <div className="relative h-44 rounded-xl overflow-hidden border border-slate-300 bg-slate-950">
                  <img src={activePropertyVisual} alt="Selected visual" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                    <div className="text-white">
                      <p className="font-bold text-sm">{title}</p>
                      <p className="text-xs text-emerald-300">{propertyImages.length} Photos Attached &bull; {subCity}, Addis Ababa</p>
                    </div>
                  </div>
                </div>

                {/* Multiple Images Upload & Gallery */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-700">Property Photos ({propertyImages.length})</span>
                    <label className="cursor-pointer text-xs font-bold text-[#00450d] hover:underline inline-flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload Multiple Images</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                    </label>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {propertyImages.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`h-16 rounded-lg overflow-hidden border cursor-pointer relative ${
                          activeImageIndex === idx ? "ring-2 ring-[#00450d] border-[#00450d]" : "border-slate-200 opacity-80"
                        }`}
                      >
                        <img src={img.url} alt="prop" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(idx);
                          }}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded p-0.5"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="text-xs h-8.5">
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(4)} className="bg-[#00450d] text-white text-xs h-8.5 px-4 gap-1.5">
                  <span>Continue to Final Review</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Certification Submission */}
          {currentStep === 4 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Review & Final Submission
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Confirm the recorded property information before official municipal registration.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Card: Property Overview */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <span className="font-bold text-slate-900 text-sm">{title}</span>
                    <Badge variant="default" className="text-[10px]">{propertyType}</Badge>
                  </div>

                  <div className="space-y-1.5 text-slate-600">
                    <div className="flex justify-between">
                      <span>Address:</span>
                      <span className="font-semibold text-slate-900">
                        {subCity} Sub-city, Woreda {woreda}, H.No {houseNo}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ownership:</span>
                      <span className="font-semibold text-slate-900">{ownershipType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cadastral UPI:</span>
                      <span className="font-mono text-emerald-800 font-bold">{cadastralParcelId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Title Deed #:</span>
                      <span className="font-mono text-slate-900">{titleDeedNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Right Card: Specifications & Financials */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <span className="font-bold text-slate-900 text-sm">Specifications & Terms</span>
                    <span className="font-bold text-[#00450d] text-sm">
                      {propertyType === "Shopping Mall" && commercialSubType === "shopping-mall"
                        ? `ETB ${mallTotalMonthlyGrossRent.toLocaleString()}/mo`
                        : `ETB ${parseFloat(monthlyRent).toLocaleString()}/mo`}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-600">
                    {propertyType !== "Shopping Mall" ? (
                      <>
                        <div className="flex justify-between">
                          <span>Bedrooms:</span>
                          <span className="font-semibold text-slate-900">{getDerivedBedroomsCount()} Bedrooms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bathrooms:</span>
                          <span className="font-semibold text-slate-900">{getDerivedBathroomsCount()} Bathrooms</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between">
                        <span>Commercial Form:</span>
                        <span className="font-semibold text-slate-900">
                          {commercialSubType === "single-shop"
                            ? `Single Shop (${shopNumber})`
                            : `Shopping Mall (${mallUnits.length} Registered Units)`}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Total Area:</span>
                      <span className="font-semibold text-slate-900">{getDerivedArea()} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deposit & Lease:</span>
                      <span className="font-semibold text-slate-900">{securityDepositMonths} Mo. / {minLeasePeriod}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shopping Mall Units Inventory Table Breakdown (if Shopping Mall) */}
              {propertyType === "Shopping Mall" && commercialSubType === "shopping-mall" && (
                <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-[#00450d]" />
                      <h4 className="text-xs font-bold text-slate-900">
                        Registered Shopping House Units Inventory ({mallUnits.length} Units)
                      </h4>
                    </div>
                    <Badge variant="verified" className="text-[10px]">
                      Landlord Validated Numbers
                    </Badge>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                        <tr>
                          <th className="py-2 px-3">Shop Number</th>
                          <th className="py-2 px-3">Floor Level</th>
                          <th className="py-2 px-3">Category</th>
                          <th className="py-2 px-3">Area (m²)</th>
                          <th className="py-2 px-3">Rent (ETB)</th>
                          <th className="py-2 px-3">Utilities</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {mallUnits.map((unit) => (
                          <tr key={unit.id} className="hover:bg-slate-50/70">
                            <td className="py-2 px-3 font-bold text-slate-900">{unit.shopNumber}</td>
                            <td className="py-2 px-3 text-slate-600">{unit.floorLevel}</td>
                            <td className="py-2 px-3 text-slate-700">{unit.category}</td>
                            <td className="py-2 px-3 font-medium">{unit.area} m²</td>
                            <td className="py-2 px-3 font-bold text-[#00450d]">
                              ETB {unit.rentAmount.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-[11px] text-slate-500">
                              {[unit.submeter ? "Sub-meter" : null, unit.waterSupply ? "Water" : null]
                                .filter(Boolean)
                                .join(", ") || "None"}
                            </td>
                            <td className="py-2 px-3">
                              <Badge
                                variant={unit.status === "Available" ? "active" : "secondary"}
                                className="text-[10px]"
                              >
                                {unit.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Compliance Consent */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200/70 rounded-xl">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToProclamation}
                    onChange={(e) => setAgreedToProclamation(e.target.checked)}
                    className="w-4 h-4 text-[#00450d] rounded border-slate-300 mt-0.5"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    I solemnly declare that all property specifications, cadastral identifiers, and title deed documents submitted are authentic and comply with <strong>Proclamation No. 1320/2024 (Residential Housing & Commercial Title Registration)</strong>.
                  </span>
                </label>
              </div>

              {/* Action Bar */}
              <div className="pt-6 border-t border-slate-200 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 text-xs h-10"
                >
                  Back to Documents
                </Button>
                <Button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={!agreedToProclamation || isSubmitting}
                  className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-10 px-6 font-semibold gap-1.5 shadow-sm"
                >
                  {isSubmitting ? (
                    <span>Registering with Title Bureau...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit for Municipal Registration</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default RegisterPropertyPage;
