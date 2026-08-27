"use client";
import React, { useState, useEffect } from "react";
import { useCitizenData } from "@/hooks/useCitizenData";
import { Property, PropertyUnit } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  Building2,
  Building,
  Home,
  Store,
  RefreshCw,
  FileUp,
  ImagePlus,
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
  X,
  User,
  Mail,
  Phone,
  Shield,
  FileCheck2, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Maximize2, 
  QrCode,
} from "lucide-react";
import { getSession, registerProperty } from "@/lib/api";
export interface MallShopUnit {
  id: string;
  shopNumber: string;
  floorLevel: string;
  area: number;
  rentAmount: number;
  category: string;
  submeter: boolean;
  waterSupply: boolean;
}

export interface TitleDeedDoc {
  name: string;
  size: string;
  number?: string;
  uploadedAt?: string;
  file?: File;
  url?: string;
}

export interface UploadedPropertyImage {
  id: string;
  url: string;
  label?: string;
  isCover?: boolean;
  file?: File;
}

type MainPropertyType = "Villa" | "Apartment" | "Condominium" | "Shopping Mall";
type CommercialSubType = "single-shop" | "shopping-mall" | "office-space";
type CondominiumTypology = "studio" | "1-bed" | "2-bed" | "3-bed";
type ApartmentTypology = "studio" | "1-bed" | "2-bed" | "3-bed";

export const RegisterPropertyPage: React.FC = () => {
  const { handleNavigate, setProperties, setNotifications } = useCitizenData();

  // 4-Step Registration Process as shown in the design:
  // 1: Owner Info (read-only from session), 2: Property Details, 3: Documents, 4: Review
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [registeredPropertyCode, setRegisteredPropertyCode] = useState<string>("");
  const [stepErrorBanner, setStepErrorBanner] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

    const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
    if (stepErrorBanner) setStepErrorBanner("");
  };
  // Step 1: Owner info — populated from localStorage, not editable
  const [landlordName, setLandlordName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const session = getSession();
    if (session?.user) {
      const { firstName, middleName, lastName, phoneNumber, email: userEmail } = session.user;
      setLandlordName([firstName, middleName, lastName].filter(Boolean).join(" "));
      setPhone(phoneNumber || "");
      setEmail(userEmail || "");
    }
  }, []);
  const [monthlyRent, setMonthlyRent] = useState("45000");
  const [securityDepositMonths, setSecurityDepositMonths] = useState("2");
  const [minLeasePeriod, setMinLeasePeriod] = useState("1 Year");
  const [availableFrom, setAvailableFrom] = useState("Immediate");

  // Step 2: Property Details
  const [propertyType, setPropertyType] = useState<MainPropertyType>("Villa");
  const [title, setTitle] = useState("Luxury Villa in Bole");

  // Address & Ownership
  const [subCity, setSubCity] = useState("");
  const [woreda, setWoreda] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [ownershipType, setOwnershipType] = useState("Private");
  const [specificLandmark, setSpecificLandmark] = useState("");

  // Sub-city to Woreda mapping
  const subCityWoredaMap: Record<string, number> = {
    "Lideta": 10,
    "Kirkos": 10,
    "Akaki Kality": 12,
    "Arada": 8,
    "Gullele": 10,
    "Addis Ketema": 12,
    "Bole": 11,
    "Yeka": 12,
    "Kolfe Keranio": 11,
    "Nifas Silk-Lafto": 13,
    "Lemi Kura": 10,
  };

  const getWoredaOptions = () => {
    const count = subCityWoredaMap[subCity] || 0;
    const options = [];
    for (let i = 1; i <= count; i++) {
      options.push(
        <option key={i} value={i.toString().padStart(2, '0')}>
          Woreda {i.toString().padStart(2, '0')}
        </option>
      );
    }
    return options;
  };

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
  const [titleDeedFile, setTitleDeedFile] = useState<TitleDeedDoc | null>(null);

  // Multiple Property Images & Active Selected Image
  const [propertyImages, setPropertyImages] = useState<UploadedPropertyImage[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  
  // Drag & drop hover states for styled upload boxes
  const [isDeedDragging, setIsDeedDragging] = useState<boolean>(false);
  const [isPhotosDragging, setIsPhotosDragging] = useState<boolean>(false);

  // Active Display Image (Featured Property Visual)
  const activePropertyVisual = propertyImages[activeImageIndex]?.url || propertyImages[0]?.url || "";

  const router = useRouter();
   const handleBack = () => {
    router.push("/citizen/dashboard/properties");
  };

  // Step 4 Review Previews (Lightbox & Document Modal)
  const [reviewActiveImageIdx, setReviewActiveImageIdx] = useState<number>(0);
  const [isImageLightboxOpen, setIsImageLightboxOpen] = useState<boolean>(false);
  const [isDocumentPreviewOpen, setIsDocumentPreviewOpen] = useState<boolean>(false);
  const [previewDocTab, setPreviewDocTab] = useState<'scan' | 'details'>('scan');
  
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!landlordName.trim()) {
      errs.landlordName = "Please enter the legal landlord full name.";
    }
    // if (!faydaId.trim()) {
    //   errs.faydaId = "Please enter a valid Fayda National Digital ID (FIN).";
    // } else if (faydaId.trim().length < 6) {
    //   errs.faydaId = "Please enter a valid Fayda FIN format (e.g. ET-NID-XXXXXXXX).";
    // }
    if (!phone.trim()) {
      errs.phone = "Please enter a valid contact phone number (e.g. +251 9X XXX XXXX).";
    } else if (!/^\+?[0-9\s\-()]{8,18}$/.test(phone.trim())) {
      errs.phone = "Please enter a valid telephone format.";
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address (e.g. name@example.com).";
    }
    if (!title.trim()) {
      errs.title = "Please enter a descriptive property display title / name.";
    }
    if (!monthlyRent.trim() || isNaN(Number(monthlyRent)) || Number(monthlyRent) <= 0) {
      errs.monthlyRent = "Please enter a valid monthly asking rent greater than 0 ETB.";
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setStepErrorBanner("Please complete all required fields highlighted in red before continuing to Step 2.");
      return false;
    }
    setStepErrorBanner("");
    return true;
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!subCity.trim()) {
      errs.subCity = "Please select a municipal Sub-city in Addis Ababa.";
    }
    if (!woreda.trim()) {
      errs.woreda = "Please select a woreda.";
    }
    if (!houseNo.trim()) {
      errs.houseNo = "Please enter the house number (e.g. 456/A).";
    }

    if (propertyType === "Villa") {
      if (!isServiceQuarter && (!villaBedrooms.trim() || isNaN(Number(villaBedrooms)) || Number(villaBedrooms) < 0)) {
        errs.villaBedrooms = "Please enter the number of bedrooms (>= 0).";
      }
      if (!villaBathrooms.trim() || isNaN(Number(villaBathrooms)) || Number(villaBathrooms) < 1) {
        errs.villaBathrooms = "Please enter at least 1 bathroom.";
      }
      if (!villaLivingRooms.trim() || isNaN(Number(villaLivingRooms)) || Number(villaLivingRooms) < 0) {
        errs.villaLivingRooms = "Please enter the number of living rooms (>= 0).";
      }
      if (!villaFloorNumber.trim()) {
        errs.villaFloorNumber = "Please enter the floor level (e.g. Ground or G+1).";
      }
      if (!villaCompoundArea.trim() || isNaN(Number(villaCompoundArea)) || Number(villaCompoundArea) <= 0) {
        errs.villaCompoundArea = "Compound / plot area must be greater than 0 m².";
      }
    } else if (propertyType === "Apartment") {
      if (!aptFloorNumber.trim()) {
        errs.aptFloorNumber = "Please enter the apartment floor level (e.g. 4th Floor).";
      }
      if (!aptBlockNumber.trim()) {
        errs.aptBlockNumber = "Please enter the block/wing number (e.g. Block B).";
      }
      if (!aptArea.trim() || isNaN(Number(aptArea)) || Number(aptArea) <= 0) {
        errs.aptArea = "Apartment floor area must be greater than 0 m².";
      }
    } else if (propertyType === "Condominium") {
      if (!condoSiteName.trim()) {
        errs.condoSiteName = "Please enter the condominium site name (e.g. Bole Arabsa).";
      }
      if (!condoBlockNumber.trim()) {
        errs.condoBlockNumber = "Please enter the block number (e.g. Block 24).";
      }
      if (!condoFloorNumber.trim()) {
        errs.condoFloorNumber = "Please enter the floor level (e.g. 3rd Floor).";
      }
      if (!condoUnitNumber.trim()) {
        errs.condoUnitNumber = "Please enter the door/unit number (e.g. Door 12).";
      }
      if (!condoArea.trim() || isNaN(Number(condoArea)) || Number(condoArea) <= 0) {
        errs.condoArea = "Condominium floor area must be greater than 0 m².";
      }
    } else if (propertyType === "Shopping Mall") {
      if (commercialSubType === "single-shop") {
        if (!shopNumber.trim()) {
          errs.shopNumber = "Please enter the shop unit number (e.g. Shop G-14).";
        }
        if (!shopArea.trim() || isNaN(Number(shopArea)) || Number(shopArea) <= 0) {
          errs.shopArea = "Shop net area must be greater than 0 m².";
        }
        if (!shopFrontage.trim()) {
          errs.shopFrontage = "Please enter the frontage description.";
        }
      } else {
        if (!mallTotalFloors.trim()) {
          errs.mallTotalFloors = "Please enter the number of commercial floors (e.g. 4 Floors).";
        }
        if (!mallParkingCapacity.trim()) {
          errs.mallParkingCapacity = "Please enter the customer parking capacity.";
        }
        if (mallUnits.length === 0) {
          errs.mallUnits = "Please add at least one shopping unit.";
        } else {
          const hasInvalidUnit = mallUnits.some((u) => !u.shopNumber.trim() || !u.area || u.area <= 0 || !u.rentAmount || u.rentAmount <= 0);
          if (hasInvalidUnit) {
            errs.mallUnits = "All shopping house units must have a valid Shop Number, area (> 0 m²), and rent (> 0 ETB).";
          }
        }
      }
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setStepErrorBanner("Please complete all required property detail inputs highlighted in red before continuing to Step 3.");
      return false;
    }
    setStepErrorBanner("");
    return true;
  };

  const validateStep3 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!titleDeedNumber.trim()) {
      errs.titleDeedNumber = "Please enter the official Title Deed Certificate document number.";
    }
    if (!titleDeedFile || !titleDeedFile.name) {
      errs.titleDeedFile = "Please upload an official Title Deed PDF or image scan.";
    }
    if (!cadastralParcelId.trim()) {
      errs.cadastralParcelId = "Please enter the Cadastral UPI parcel identifier.";
    }
    if (propertyImages.length === 0) {
      errs.propertyImages = "Please upload or attach at least one property photo.";
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setStepErrorBanner("Please complete all required document and photo fields before proceeding to Final Review.");
      return false;
    }
    setStepErrorBanner("");
    return true;
  };

  const handleStepNavigation = (targetStep: number) => {
    if (targetStep === currentStep) return;

    if (targetStep > currentStep) {
      if (currentStep === 1 || targetStep > 1) {
        if (!validateStep1()) {
          setCurrentStep(1);
          return;
        }
      }
      if (currentStep === 2 || targetStep > 2) {
        if (!validateStep2()) {
          setCurrentStep(2);
          return;
        }
      }
      if (currentStep === 3 || targetStep > 3) {
        if (!validateStep3()) {
          setCurrentStep(3);
          return;
        }
      }
    }

    setStepErrorBanner("");
    setErrors({});
    setCurrentStep(targetStep);
  };

  // Handle Multi-Image Upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newFiles: File[] = Array.from(e.target.files);
    
    // Check file size limit (15MB)
    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB in bytes
    const oversizedFiles = newFiles.filter(file => file.size > MAX_FILE_SIZE);
    
    if (oversizedFiles.length > 0) {
      const oversizedNames = oversizedFiles.map(f => f.name).join(", ");
      alert(`The following files exceed the 15MB limit: ${oversizedNames}. Please compress or select smaller files.`);
      return;
    }
    
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
    
    // Check file size limit (15MB)
    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      alert(`File "${file.name}" exceeds the 15MB limit. Please compress or select a smaller file.`);
      return;
    }
    
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    setTitleDeedFile({
      name: file.name,
      size: sizeMb,
      number: titleDeedNumber || "ETH-TD-" + Math.floor(100000 + Math.random() * 900000),
      uploadedAt: "Just now",
      file,
    });
  };
  
  // Drag-and-drop file drop handlers
  const handleDeedDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDeedDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Check file size limit (15MB)
      const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB in bytes
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" exceeds the 15MB limit. Please compress or select a smaller file.`);
        return;
      }
      
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      const objectUrl = URL.createObjectURL(file);
      setTitleDeedFile({
        name: file.name,
        size: sizeMb,
        number: titleDeedNumber || "ETH-TD-" + Math.floor(100000 + Math.random() * 900000),
        uploadedAt: "Just now",
        file,
        url: objectUrl,
      });
      setPreviewDocTab('scan');
      clearError("titleDeedFile");
    }
  };
  
  const handlePhotosDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsPhotosDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const allFiles = Array.from(e.dataTransfer.files) as File[];
      const newFiles = allFiles.filter((f) => f.type.startsWith("image/"));
      if (newFiles.length === 0) return;
      const newImgs: UploadedPropertyImage[] = newFiles.map((file: File, idx: number) => ({
        id: `custom-img-${Date.now()}-${idx}`,
        url: URL.createObjectURL(file),
        label: file.name.replace(/\.[^/.]+$/, ""),
        isCover: propertyImages.length === 0 && idx === 0,
        file,
      }));
      setPropertyImages((prev) => [...prev, ...newImgs]);
      clearError("propertyImages");
      if (propertyImages.length === 0) {
        setActiveImageIndex(0);
      }
    }
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
      submeter: true,
      waterSupply: true,
    },
    {
      id: "unit-2",
      shopNumber: "Shop G-02",
      floorLevel: "Ground Floor",
      area: 35,
      rentAmount: 22000,
      category: "Café / Restaurant",
      submeter: true,
      waterSupply: true,
    },
    {
      id: "unit-3",
      shopNumber: "Shop 1-01",
      floorLevel: "1st Floor",
      area: 55,
      rentAmount: 20000,
      category: "Electronics / Telecom",
      submeter: true,
      waterSupply: false,
    },
    {
      id: "unit-4",
      shopNumber: "Shop 1-02",
      floorLevel: "1st Floor",
      area: 40,
      rentAmount: 18000,
      category: "Pharmacy / Clinic",
      submeter: true,
      waterSupply: true,
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
      submeter: true,
      waterSupply: true,
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
  const [cadastralParcelId, setCadastralParcelId] = useState("");
  const [titleDeedNumber, setTitleDeedNumber] = useState("");
  const [description, setDescription] = useState("");

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

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    const session = getSession();
    if (!session || !session.token) {
      setSubmitError("Session expired or you are not signed in. Please sign in to your citizen account.");
      setIsSubmitting(false);
      return;
    }

    if (!subCity || !subCity.trim()) {
      setSubmitError("Please select a valid Sub-city in Step 2.");
      setCurrentStep(2);
      setIsSubmitting(false);
      return;
    }

    if (!woreda || !woreda.trim()) {
      setSubmitError("Please specify a valid Woreda number (e.g. 03) in Step 2.");
      setCurrentStep(2);
      setIsSubmitting(false);
      return;
    }

    const rentAmount =
      propertyType === "Shopping Mall" && commercialSubType === "shopping-mall"
        ? mallTotalMonthlyGrossRent
        : parseFloat(monthlyRent) || 0;

    if (rentAmount <= 0) {
      setSubmitError("Monthly asking rent must be greater than 0 ETB.");
      setCurrentStep(1);
      setIsSubmitting(false);
      return;
    }

    const bedroomCount = getDerivedBedroomsCount();
    const bathroomCount = getDerivedBathroomsCount();
    const areaSqMeter = getDerivedArea();

    const floorNumber =
      propertyType === "Villa" ? villaFloorNumber
      : propertyType === "Apartment" ? aptFloorNumber
      : propertyType === "Condominium" ? condoFloorNumber
      : commercialSubType === "single-shop" ? shopFloorLevel
      : mallTotalFloors;

    const imageFiles = propertyImages
      .filter((img) => img.file)
      .map((img) => img.file as File);

    const docFiles = titleDeedFile?.file ? [titleDeedFile.file] : [];

    const requestPayload = {
      propertyType,
      title: title?.trim() || `${subCity} ${propertyType} Property`,
      address: {
        city: "Addis Ababa",
        subCity: subCity.trim(),
        woreda: woreda.trim(),
        houseNumber: houseNo?.trim() || undefined,
      },
      houseNumber: houseNo?.trim() || undefined,
      floorNumber: floorNumber?.trim() || undefined,
      bedroomCount: bedroomCount !== undefined ? bedroomCount : undefined,
      bathroomCount: bathroomCount !== undefined ? bathroomCount : undefined,
      areaSqMeter: areaSqMeter,
      monthlyRent: rentAmount,
      furnishingStatus: undefined,
      description: description?.trim() || undefined,
      ownershipType: ownershipType?.trim() || "Private",
      specificLandmark: specificLandmark?.trim() || undefined,
      cadastralParcelId: cadastralParcelId?.trim() || undefined,
      titleDeedNumber: titleDeedNumber?.trim() || undefined,
      securityDepositMonths: parseInt(securityDepositMonths, 10) || 2,
      minLeasePeriod: minLeasePeriod || "1 Year",
      availableFrom: availableFrom || "Immediate",
      units: propertyType === "Shopping Mall" && commercialSubType === "shopping-mall"
        ? mallUnits.map((unit) => ({
            unitCode: unit.shopNumber,
            unitName: unit.shopNumber,
            unitType: unit.category,
            areaSqMeter: unit.area,
            status: "AVAILABLE",
            rentAmount: unit.rentAmount,
            tenantName: undefined,
            floorLevel: unit.floorLevel,
            category: unit.category,
            shopNumber: unit.shopNumber,
            submeter: unit.submeter,
            waterSupply: unit.waterSupply,
            frontage: undefined,
            description: undefined,
          }))
        : undefined,
    };

    try {
      const response = await registerProperty(
        session.token,
        requestPayload,
        imageFiles.length > 0 ? imageFiles : undefined,
        docFiles.length > 0 ? docFiles : undefined
      );

      setRegisteredPropertyCode(response.propertyCode);
      setIsSubmittedSuccess(true);

      const typeMapping: Property["type"] =
        propertyType === "Shopping Mall" ? "Commercial" : (propertyType as Property["type"]);

      const newPropertyItem: Property = {
        id: response.id,
        title: response.title || requestPayload.title,
        type: typeMapping,
        price: rentAmount,
        location: `${woreda ? `Woreda ${woreda}, ` : ""}${subCity} Sub-city, Addis Ababa`,
        subCity: `${subCity} Sub City`,
        woreda: `Woreda ${woreda}`,
        houseNo: houseNo || "N/A",
        bedrooms: bedroomCount,
        bathrooms: bathroomCount,
        area: areaSqMeter,
        floor: floorNumber,
        status: "Available",
        verified: false,
        featuredImage: response.images?.[0]?.imageUrl || propertyImages[0]?.url || "",
        galleryImages: response.images?.length
          ? response.images.map((i) => i.imageUrl)
          : propertyImages.map((i) => i.url),
        description,
        amenities: [],
        securityDepositMonths: parseInt(securityDepositMonths, 10) || 2,
        minLeasePeriod,
        utilitiesIncluded: false,
        availableFrom,
        landlordName: landlordName || "Landlord",
      };

      setProperties((prev) => [newPropertyItem, ...prev]);

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: "system",
          title: "Property Registered",
          description: `${newPropertyItem.title} (${response.propertyCode}) registered in municipal title database.`,
          timestamp: "Just now",
          read: false,
          linkPage: "properties",
        },
        ...prev,
      ]);
    } catch (err: unknown) {
      console.error("Property registration error:", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please verify MinIO storage and backend database connection."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: "Basic Info" },
    { num: 2, label: "Property Details" },
    { num: 3, label: "Documents" },
    { num: 4, label: "Review" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
      {/* Top Error Notification Banner */}
      {submitError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900 mb-0.5">Registration Failed</p>
              <p className="leading-relaxed">{submitError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSubmitError("")}
            className="text-red-400 hover:text-red-700 p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Register New Property
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
            className="h-8.5 px-3 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Properties
          </Button>
        </div>
      </div>

      {/* 4-Step Stepper Header */}
      <div className="py-1">
        <div className="flex items-center justify-between max-w-3xl mx-auto px-4">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <React.Fragment key={step.num}>
                <button
                  type="button"
                  onClick={() => handleStepNavigation(step.num)}
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
                    className={`text-xs mt-1 font-medium whitespace-nowrap ${
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
              <span className="font-mono font-bold text-slate-900">{registeredPropertyCode}</span>
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
              onClick={() => router.push("/citizen/dashboard/properties")}
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
          {/* Step Error Banner */}
          {stepErrorBanner && (
            <div className="bg-red-50 border-b border-red-200 p-4 flex items-start justify-between gap-3 text-xs text-red-800 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-red-900">Validation Notice:</span>
                  <span>{stepErrorBanner}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStepErrorBanner("")}
                className="text-red-400 hover:text-red-700 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* STEP 1: Basic Info */}
          {currentStep === 1 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Basic Info & Ownership
                </h2>
              </div>

              {/* Owner Info — read-only from session */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500">Owner details from your account (read-only)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" /> Full Name
                    </label>
                    <div className="h-10 px-3 flex items-center text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md cursor-not-allowed select-none">
                      {landlordName || "—"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Phone Number
                    </label>
                    <div className="h-10 px-3 flex items-center text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md cursor-not-allowed select-none">
                      {phone || "—"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email Address
                    </label>
                    <div className="h-10 px-3 flex items-center text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md cursor-not-allowed select-none truncate">
                      {email || "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Title & Financials */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Property Listing Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => {setTitle(e.target.value); clearError("title");}}
                    placeholder="e.g. Modern Luxury Villa in Bole Atlas"
                    className="h-10 text-xs font-medium"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Give your listing a descriptive title for municipal cataloging and tenant discovery.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Monthly Asking Rent (ETB) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={monthlyRent}
                      onChange={(e) => {setMonthlyRent(e.target.value); clearError("monthlyRent");}}
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
                  // onClick={() => {
                  //   setSubmitError("");
                  //   const rent = parseFloat(monthlyRent);
                  //   if (isNaN(rent) || rent <= 0) {
                  //     setSubmitError("Please enter a valid monthly asking rent greater than 0 ETB.");
                  //     return;
                  //   }
                  //   if (!title.trim()) {
                  //     setSubmitError("Please provide a property listing title.");
                  //     return;
                  //   }
                  //   setCurrentStep(2);
                  // }}
                  onClick={() => handleStepNavigation(2)}
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
                      onChange={(e) => {setSubCity(e.target.value); setWoreda(""); clearError("subCity"); clearError("woreda");}}
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00450d]"
                    >
                      <option value="">Select Sub-city</option>
                      <option value="Lideta">Lideta (10 Woredas)</option>
                      <option value="Kirkos">Kirkos (10 Woredas)</option>
                      <option value="Akaki Kality">Akaki Kality (12 Woredas)</option>
                      <option value="Arada">Arada (8 Woredas)</option>
                      <option value="Gullele">Gullele (10 Woredas)</option>
                      <option value="Addis Ketema">Addis Ketema (12 Woredas)</option>
                      <option value="Bole">Bole (11 Woredas)</option>
                      <option value="Yeka">Yeka (12 Woredas)</option>
                      <option value="Kolfe Keranio">Kolfe Keranio (11 Woredas)</option>
                      <option value="Nifas Silk-Lafto">Nifas Silk-Lafto (13 Woredas)</option>
                      <option value="Lemi Kura">Lemi Kura (10 Woredas)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Woreda
                    </label>
                    <select
                      value={woreda}
                      onChange={(e) => {setWoreda(e.target.value); clearError("woreda");}}
                      disabled={!subCity}
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00450d] disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">Select Woreda</option>
                      {getWoredaOptions()}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      House Number
                    </label>
                    <Input
                      value={houseNo}
                      onChange={(e) => {setHouseNo(e.target.value); clearError("houseNo");}}
                      placeholder="e.g. 456/A"
                      className="h-11 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Property Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => {setDescription(e.target.value); clearError("description");}}
                    placeholder="Describe your property (e.g., location features, amenities, nearby facilities)"
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00450d] resize-none"
                  />
                  {errors.description && (
                    <p className="text-[10px] text-red-600 mt-1">{errors.description}</p>
                  )}
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
                        onChange={(e) => {setVillaBedrooms(e.target.value); clearError("villaBedrooms");}}
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
                        onChange={(e) => {setVillaBathrooms(e.target.value); clearError("villaBathrooms");}}
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
                        onChange={(e) => {setVillaLivingRooms(e.target.value); clearError("villaLivingRooms");}}
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
                        onChange={(e) => {setVillaFloorNumber(e.target.value); clearError("villaFloorNumber");}}
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
                          clearError("villaBedrooms");
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
                        onChange={(e) => {setVillaCompoundArea(e.target.value); clearError("villaCompoundArea");}}
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
                        onChange={(e) => {setAptFloorNumber(e.target.value); clearError("aptFloorNumber");}}
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
                        onChange={(e) => {setAptBlockNumber(e.target.value); clearError("aptBlockNumber");}}
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
                        onChange={(e) => {setAptArea(e.target.value); clearError("aptArea");}}
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
                        onChange={(e) => {setCondoSiteName(e.target.value); clearError("condoSiteName");}}
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
                        onChange={(e) => {setCondoBlockNumber(e.target.value); clearError("condoBlockNumber");}}
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
                        onChange={(e) => {setCondoFloorNumber(e.target.value); clearError("condoFloorNumber");}}
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
                        onChange={(e) => {setCondoUnitNumber(e.target.value); clearError("condoUnitNumber");}}
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
                        onChange={(e) => {setCondoArea(e.target.value); clearError("condoArea");}}
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
                            onChange={(e) => {setShopNumber(e.target.value); clearError("shopNumber");}}
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
                            onChange={(e) => {setShopArea(e.target.value); clearError("shopArea");}}
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
                            onChange={(e) => {setShopFrontage(e.target.value); clearError("shopFrontage");}}
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
                            onChange={(e) => {setMallTotalFloors(e.target.value); clearError("mallTotalFloors");}}
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
                            onChange={(e) => {setMallParkingCapacity(e.target.value); clearError("mallParkingCapacity");}}
                            placeholder="e.g. 30 Vehicles"
                            className="h-10 text-xs bg-white"
                          />
                        </div>
                      </div>

                      {/* Mall Infrastructure Checklist */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
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
                                        Shopping House Number 
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
                                    onChange={(e) => {handleUpdateUnit(idx, "area", parseFloat(e.target.value) || 0);
                                      clearError(`mallUnits.${idx}.area`);
                                    }}
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
                                    onChange={(e) => {handleUpdateUnit(idx, "rentAmount", parseFloat(e.target.value) || 0);
                                      clearError(`mallUnits.${idx}.rentAmount`);
                                    }}
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
                  onClick={() => setCurrentStep(1)}
                  className="px-6 text-xs h-10 text-slate-700"
                >
                  Back to Basic Info
                </Button>
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
                  onClick={() => handleStepNavigation(3)}
                  className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-10 px-6 font-semibold shadow-xs"
                >
                  Save & Continue
                </Button>
              </div>
            </div>
          )}

          
          {/* STEP 3: TITLE DEED & PROPERTY IMAGES */}
          {currentStep === 3 && (
            <div className="p-6 sm:p-8 space-y-6 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">3. Title Deed Certificate & Property Visuals</h2>
                <p className="text-slate-500 text-xs">
                  Enter official cadastral identifiers, upload your official title deed document scan, and attach authentic property photos.
                </p>
              </div>

              {/* 1. Cadastral & Deed Identifiers Inputs */}
              <div className="bg-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-[#00450d]" />
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Landholding & Cadastral Registration Identifiers</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-1 text-slate-700">
                      Title Deed Document Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={titleDeedNumber}
                      onChange={(e) => {
                        setTitleDeedNumber(e.target.value);
                        clearError("titleDeedNumber");
                      }}
                      placeholder="e.g. ETH-MUDC-2024-88412"
                      className={`h-10 text-xs bg-white font-mono ${
                        errors.titleDeedNumber ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : ""
                      }`}
                    />
                    {errors.titleDeedNumber && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">
                        {errors.titleDeedNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-700">
                      Cadastral Parcel UPI <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={cadastralParcelId}
                      onChange={(e) => {
                        setCadastralParcelId(e.target.value);
                        clearError("cadastralParcelId");
                      }}
                      placeholder="e.g. AA-BOL-03-88219"
                      className={`h-10 text-xs bg-white font-mono text-emerald-900 font-bold ${
                        errors.cadastralParcelId ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : ""
                      }`}
                    />
                    {errors.cadastralParcelId && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">
                        {errors.cadastralParcelId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 2. Official Title Deed Document Upload Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#00450d]" />
                      <span>Official Title Deed Certificate Scan</span>
                      <span className="text-red-500">*</span>
                    </label>
                    {titleDeedFile && (
                      <Badge variant="verified" className="text-[10px]">
                        Scan Attached & Ready
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Upload a scanned copy of your official title deed or municipal land certificate (PDF, JPG, or PNG up to 15MB).
                  </p>

                  {/* Document Box Area */}
                  {!titleDeedFile ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDeedDragging(true);
                      }}
                      onDragLeave={() => setIsDeedDragging(false)}
                      onDrop={handleDeedDrop}
                      className={`relative rounded-xl border-2 border-dashed p-6 sm:p-8 text-center transition-all cursor-pointer ${
                        isDeedDragging
                          ? "border-[#00450d] bg-emerald-50/50 scale-[1.005]"
                          : errors.titleDeedFile
                          ? "border-red-500 bg-red-50/20"
                          : "border-slate-300 bg-slate-50/50 hover:border-[#00450d] hover:bg-emerald-50/30"
                      }`}
                    >
                      <input
                        type="file"
                        id="title-deed-upload-input"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleTitleDeedUpload}
                        className="hidden"
                      />
                      <label htmlFor="title-deed-upload-input" className="cursor-pointer block space-y-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-100/80 text-[#00450d] flex items-center justify-center mx-auto shadow-2xs">
                          <FileUp className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800 text-xs sm:text-sm">
                            Drag & drop your Title Deed scan here, or <span className="text-[#00450d] underline font-semibold">browse file</span>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Supports PDF documents, PNG, JPG, or JPEG images (Max 15MB)
                          </p>
                        </div>
                        <div className="pt-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium text-xs shadow-2xs hover:bg-slate-50">
                            <Upload className="w-3.5 h-3.5 text-[#00450d]" />
                            <span>Select Title Deed File</span>
                          </span>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="border border-emerald-300 bg-gradient-to-r from-emerald-50/70 via-emerald-50/30 to-white rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                          <FileCheck2 className="w-6 h-6 text-emerald-200" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm truncate" title={titleDeedFile?.name}>
                              {titleDeedFile?.name}
                            </p>
                            <Badge variant="verified" className="text-[9px] shrink-0">Verified</Badge>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            Size: <span className="font-semibold text-slate-800">{titleDeedFile?.size}</span> &bull; Uploaded: <span className="text-slate-800">{titleDeedFile?.uploadedAt}</span>
                          </p>
                          {titleDeedNumber && (
                            <p className="text-[11px] font-mono text-emerald-900 font-bold">
                              Deed #{titleDeedNumber}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsDocumentPreviewOpen(true)}
                          className="text-xs h-8 px-3 gap-1.5 bg-white border-emerald-300 text-slate-800 hover:bg-emerald-50"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Preview</span>
                        </Button>

                        <label className="cursor-pointer">
                          <span className="inline-flex items-center gap-1 text-xs h-8 px-3 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium">
                            <RefreshCw className="w-3 h-3 text-slate-600" />
                            <span>Replace</span>
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={handleTitleDeedUpload}
                            className="hidden"
                          />
                        </label>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setTitleDeedFile(null)}
                          className="text-xs h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                          title="Remove Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {errors.titleDeedFile && (
                    <p className="text-[11px] text-red-600 font-medium mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      {errors.titleDeedFile}
                    </p>
                  )}
                </div>

                {/* 3. Property Photos & Visuals Box */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-[#00450d]" />
                        <span>Property Photos & Visual Evidence</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Upload exterior facade, interior rooms, compound, and street entrance photos.
                      </p>
                    </div>
                    {propertyImages.length > 0 && (
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        {propertyImages.length} Photo{propertyImages.length > 1 ? "s" : ""} Attached
                      </span>
                    )}
                  </div>

                  {/* Empty State Upload Dropzone Box */}
                  {propertyImages.length === 0 ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsPhotosDragging(true);
                      }}
                      onDragLeave={() => setIsPhotosDragging(false)}
                      onDrop={handlePhotosDrop}
                      className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                        isPhotosDragging
                          ? "border-[#00450d] bg-emerald-50/50 scale-[1.005]"
                          : errors.propertyImages
                          ? "border-red-500 bg-red-50/20"
                          : "border-slate-300 bg-slate-50/50 hover:border-[#00450d] hover:bg-emerald-50/30"
                      }`}
                    >
                      <input
                        type="file"
                        id="property-photos-upload-input"
                        multiple
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                      <label htmlFor="property-photos-upload-input" className="cursor-pointer block space-y-3">
                        <div className="w-14 h-14 rounded-full bg-emerald-100/80 text-[#00450d] flex items-center justify-center mx-auto shadow-2xs">
                          <ImagePlus className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 text-sm sm:text-base">
                            Drag & drop property photos here, or <span className="text-[#00450d] underline font-semibold">browse files</span>
                          </p>
                          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                            Upload high-resolution exterior, compound, living room, and bedroom photos. Supports multiple JPEG, PNG, or WEBP images.
                          </p>
                        </div>
                        <div className="pt-1">
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00450d] text-white font-semibold text-xs shadow-xs hover:bg-[#1b5e20] transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                            <span>Select Photos From Device</span>
                          </span>
                        </div>
                      </label>
                    </div>
                  ) : (
                    /* Uploaded Photos Management Box */
                    <div className="space-y-4 border border-slate-200 rounded-xl p-4 sm:p-5 bg-white shadow-2xs">
                      {/* Active Featured Image Banner Preview */}
                      <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-950 aspect-[16/9] sm:aspect-[21/9]">
                        <img
                          src={activePropertyVisual}
                          alt="Active property visual"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                        {/* Top Badges & Actions */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="bg-black/70 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-full font-semibold border border-white/20">
                            Photo {activeImageIndex + 1} of {propertyImages.length}
                          </span>
                          {propertyImages[activeImageIndex]?.isCover && (
                            <span className="bg-[#00450d] text-white text-[11px] px-2.5 py-1 rounded-full font-bold border border-emerald-400/40 flex items-center gap-1 shadow-xs">
                              <Sparkles className="w-3 h-3" />
                              <span>Featured Cover Photo</span>
                            </span>
                          )}
                        </div>

                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          {!propertyImages[activeImageIndex]?.isCover && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleSetCoverImage(activeImageIndex)}
                              className="bg-black/60 hover:bg-black/80 text-white text-[10px] h-7 px-2.5 backdrop-blur-xs border border-white/20"
                            >
                              Set as Cover
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              setReviewActiveImageIdx(activeImageIndex);
                              setIsImageLightboxOpen(true);
                            }}
                            className="bg-black/60 hover:bg-black/80 text-white text-[10px] h-7 px-2 backdrop-blur-xs border border-white/20"
                          >
                            <Maximize2 className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Bottom Caption */}
                        <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
                          <div className="space-y-0.5">
                            <p className="font-bold text-sm sm:text-base drop-shadow-xs truncate max-w-md">
                              {title || "Property Registration"}
                            </p>
                            <p className="text-xs text-emerald-300 drop-shadow-xs">
                              {propertyImages[activeImageIndex]?.label || `${propertyType} Visual`} &bull; {subCity ? `${subCity}, Addis Ababa` : "Addis Ababa"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Gallery Thumbnails Strip & Add More Dropzone Tile */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-700 text-xs">
                            All Attached Photos ({propertyImages.length})
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Click thumbnail to select cover or preview
                          </span>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                          {propertyImages.map((img, idx) => (
                            <div
                              key={img.id || idx}
                              onClick={() => setActiveImageIndex(idx)}
                              className={`group relative aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all ${
                                activeImageIndex === idx
                                  ? "ring-2 ring-[#00450d] border-transparent scale-[1.02] shadow-xs"
                                  : "border-slate-200 opacity-85 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={img.url}
                                alt={img.label || `Photo ${idx + 1}`}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />

                              {/* Cover Badge */}
                              {img.isCover && (
                                <span className="absolute top-1 left-1 bg-[#00450d] text-[8px] text-white px-1.5 py-0.5 rounded font-bold shadow-xs">
                                  Cover
                                </span>
                              )}

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage(idx);
                                }}
                                className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded p-1 transition-colors opacity-90 group-hover:opacity-100"
                                title="Delete photo"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}

                          {/* Inline "+ Add More" Dropzone Tile */}
                          <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-[#00450d] hover:bg-emerald-50/50 flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-500 hover:text-[#00450d] p-2 text-center group">
                            <Plus className="w-5 h-5 mb-0.5 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-semibold leading-tight">Add Photo</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleImageFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Quick Action Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <label className="cursor-pointer">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00450d] hover:bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-300 bg-white transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                            <span>Upload More Images</span>
                          </span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageFileUpload}
                            className="hidden"
                          />
                        </label>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPropertyImages([])}
                          className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700 h-8"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          <span>Clear All Photos</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {errors.propertyImages && (
                    <p className="text-[11px] text-red-600 font-medium mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      {errors.propertyImages}
                    </p>
                  )}
                </div>
              </div>
              {/* Navigation Footer */}
              <div className="flex justify-between pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="text-xs h-9 px-5">
                  Back to Property Details
                </Button>
                <Button
                  onClick={() => handleStepNavigation(4)}
                  className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-9 px-5 gap-1.5 font-semibold"
                >
                  <span>Continue to Final Review</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Certification Submission */}
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Documents & Image Visuals Preview */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#00450d]" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Uploaded Documents & Visual Evidence Preview
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Municipal Title & Photo Verification
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: Official Title Deed Certificate Document Card */}
                  <div className="lg:col-span-5 flex flex-col justify-between border border-emerald-200/90 rounded-xl p-4 bg-gradient-to-b from-emerald-50/60 to-white space-y-3">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
                            <FileCheck2 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block leading-tight">
                              Official Title Deed Certificate
                            </span>
                            <span className="text-[10px] text-emerald-800 font-semibold">
                              Verified Digital Land Registry
                            </span>
                          </div>
                        </div>
                        <Badge variant="verified" className="text-[10px]">
                          Authenticated
                        </Badge>
                      </div>

                      {/* Document Details */}
                      <div className="mt-3 space-y-2 text-xs">
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Document Name:</span>
                            <span className="font-medium text-slate-900 truncate max-w-[170px]" title={titleDeedFile?.name || "Official_Title_Deed_Certificate_Scan.pdf"}>
                              {titleDeedFile?.name || "Official_Title_Deed_Certificate_Scan.pdf"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span>File Size & Type:</span>
                            <span className="font-semibold text-slate-800">
                              {titleDeedFile?.size || "2.4 MB"} • PDF Scan
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Deed Registry #:</span>
                            <span className="font-mono text-slate-900 font-bold">
                              {titleDeedNumber}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Cadastral Parcel UPI:</span>
                            <span className="font-mono text-emerald-800 font-bold">
                              {cadastralParcelId}
                            </span>
                          </div>
                        </div>

                        <div className="p-2 bg-emerald-50/70 rounded-md border border-emerald-100 flex items-center gap-2 text-[11px] text-emerald-900">
                          <Shield className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>Fayda ID validated for Landlord: <strong>{landlordName}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Preview Document Trigger */}
                    <div className="pt-2">
                      <Button
                        type="button"
                        onClick={() => setIsDocumentPreviewOpen(true)}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs h-9 gap-1.5 font-medium shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Inspect Digital Deed Certificate (PDF)</span>
                      </Button>
                    </div>
                  </div>

                  {/* Right Column: Property Visuals & Photo Gallery Preview */}
                  <div className="lg:col-span-7 border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-[#00450d]" />
                        <span className="text-xs font-bold text-slate-900">
                          Property Photos Preview ({propertyImages.length} Attached)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsImageLightboxOpen(true)}
                        className="text-[11px] h-7 px-2 text-[#00450d] hover:bg-emerald-50 gap-1"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Open Fullscreen Gallery</span>
                      </Button>
                    </div>

                    {/* Featured Active Image */}
                    <div
                      className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-950 aspect-video group cursor-pointer"
                      onClick={() => setIsImageLightboxOpen(true)}
                    >
                      <img
                        src={propertyImages[reviewActiveImageIdx]?.url || activePropertyVisual}
                        alt={propertyImages[reviewActiveImageIdx]?.label || "Property Review Visual"}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

                      {/* Image Details Overlay */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full font-medium border border-white/20">
                          Photo {reviewActiveImageIdx + 1} of {propertyImages.length}
                        </span>
                        {(propertyImages[reviewActiveImageIdx]?.isCover || reviewActiveImageIdx === activeImageIndex) && (
                          <span className="bg-[#00450d] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold border border-emerald-400/30 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Featured Cover</span>
                          </span>
                        )}
                      </div>

                      <div className="absolute top-2.5 right-2.5">
                        <div className="bg-black/60 backdrop-blur-xs text-white p-1.5 rounded-md hover:bg-black/80 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white flex items-center justify-between">
                        <span className="text-xs font-semibold truncate drop-shadow-xs">
                          {propertyImages[reviewActiveImageIdx]?.label || `${propertyType} Exterior & Interior`}
                        </span>
                        <span className="text-[10px] text-slate-300 shrink-0">Click to enlarge</span>
                      </div>
                    </div>

                    {/* Thumbnail Strip */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                      {propertyImages.map((img, idx) => (
                        <button
                          key={img.id || idx}
                          type="button"
                          onClick={() => setReviewActiveImageIdx(idx)}
                          className={`relative aspect-video rounded-md overflow-hidden border transition-all ${
                            reviewActiveImageIdx === idx
                              ? "ring-2 ring-[#00450d] border-transparent scale-102 shadow-xs"
                              : "border-slate-200 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.label || `Photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {img.isCover && (
                            <span className="absolute bottom-0 inset-x-0 bg-[#00450d]/90 text-[8px] text-white text-center font-bold py-0.5">
                              Cover
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

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

      {/* 1. Fullscreen Image Lightbox Modal */}
      {isImageLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsImageLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div
            className="w-full max-w-5xl flex items-center justify-between text-white pb-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                {propertyImages[reviewActiveImageIdx]?.label || `Property Visual ${reviewActiveImageIdx + 1}`}
              </span>
              <span className="text-xs text-slate-400">
                ({reviewActiveImageIdx + 1} / {propertyImages.length})
              </span>
            </div>
            <button
              onClick={() => setIsImageLightboxOpen(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Stage */}
          <div
            className="relative w-full max-w-5xl flex-1 flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Button */}
            {propertyImages.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setReviewActiveImageIdx((prev) =>
                    prev === 0 ? propertyImages.length - 1 : prev - 1
                  )
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors border border-white/20 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={propertyImages[reviewActiveImageIdx]?.url || activePropertyVisual}
              alt={propertyImages[reviewActiveImageIdx]?.label || "Property Visual"}
              className="max-h-[72vh] max-w-full rounded-lg object-contain shadow-2xl"
              referrerPolicy="no-referrer"
            />

            {/* Next Button */}
            {propertyImages.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setReviewActiveImageIdx((prev) =>
                    prev === propertyImages.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors border border-white/20 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails */}
          <div
            className="w-full max-w-3xl flex items-center justify-center gap-2 pt-3 overflow-x-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {propertyImages.map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setReviewActiveImageIdx(idx)}
                className={`w-14 h-10 rounded overflow-hidden border transition-all shrink-0 cursor-pointer ${
                  reviewActiveImageIdx === idx
                    ? "ring-2 ring-emerald-400 border-white scale-105"
                    : "border-white/30 opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img.url}
                  alt={img.label || `Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Official Government Title Deed Digital Inspection Modal */}
      {isDocumentPreviewOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setIsDocumentPreviewOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-[#00450d] to-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-bold">
                  <FileCheck2 className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold tracking-tight">
                    Ethiopian National Cadastral Title Deed Certificate
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    FDRE Ministry of Urban Development & Construction Land Bureau
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDocumentPreviewOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Preview Body */}
            <div className="p-6 overflow-y-auto bg-stone-50/60 font-sans">
              {titleDeedFile?.url ? (
                <iframe
                  src={titleDeedFile.url}
                  className="w-full h-[500px] border-0 rounded-lg"
                  title="Title Deed Document Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-[500px] text-slate-500">
                  <p>No document uploaded for preview</p>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDocumentPreviewOpen(false)}
                className="text-xs h-9"
              >
                Close Preview
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  const blob = new Blob(
                    [`FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA\nCADASTRAL TITLE DEED CERTIFICATE\n\nCadastral UPI: ${cadastralParcelId}\nTitle Deed Number: ${titleDeedNumber}\nOwner: ${landlordName}\nLocation: ${subCity} Sub-city, Woreda ${woreda}, H.No ${houseNo}\nArea: ${getDerivedArea()} sq.m\nCategory: ${propertyType}`],
                    { type: "text/plain" }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${cadastralParcelId}_Title_Deed_Certificate.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-9 gap-1.5 font-medium cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Verified Copy</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPropertyPage;
