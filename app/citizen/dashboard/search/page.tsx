"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Property } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ShieldCheck,
  Building,
  Building2,
  ArrowRight,
  FileText,
  CheckCircle2,
  X,
  Sparkles,
  Info,
  Hash,
  Home,
  Store,
  ExternalLink,
  Layers,
  User,
  Calendar
} from "lucide-react";
import { useCitizenData } from "@/hooks/useCitizenData";
import { INITIAL_PROPERTIES } from "@/data/mockData";
import { PropertyResponse, getListedProperties, getSession } from "@/lib/api";

interface SearchHousePageProps {
  properties?: Property[];
  onSelectProperty?: (property: Property) => void;
  onOpenApplyLease?: (property: Property) => void;
}

export const SearchHousePage: React.FC<SearchHousePageProps> = (props) => {
  const router = useRouter();
  const context = useCitizenData();

  // Search state - ONLY search by propertyCode, initially empty with NO default properties displayed
  const [propertyCodeInput, setPropertyCodeInput] = useState<string>("");
  const [submittedCode, setSubmittedCode] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [listedProperties, setListedProperties] = useState<PropertyResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch listed properties from backend on mount
  useEffect(() => {
    const fetchListedProperties = async () => {
      setIsLoading(true);
      try {
        const properties = await getListedProperties();
        setListedProperties(properties);
      } catch (error) {
        console.error("Failed to fetch listed properties:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListedProperties();
  }, []);

  // Merge all available properties across sources
  const allKnownProperties = useMemo(() => {
    const combined: Property[] = [];
    const seenCodes = new Set<string>();

    const addProp = (p: Property) => {
      const code = (p.propertyCode || p.id).toUpperCase();
      if (!seenCodes.has(code)) {
        seenCodes.add(code);
        combined.push({
          ...p,
          propertyCode: p.propertyCode || p.id
        });
      }
    };

    // 1. Backend listed properties (only LISTED status)
    listedProperties.forEach((rp) => {
      if (rp.status === "LISTED") {
        addProp({
          id: rp.id,
          propertyCode: rp.propertyCode,
          title: rp.title || `${rp.propertyType} in ${rp.address?.subCity || "Addis Ababa"}`,
          type: (rp.propertyType as any) || "Apartment",
          price: rp.monthlyRent || 0,
          location: `${rp.address?.subCity || ""}, Woreda ${rp.address?.woreda || ""}, Addis Ababa`,
          subCity: rp.address?.subCity || "Bole Sub City",
          woreda: rp.address?.woreda || "Woreda 01",
          houseNo: rp.houseNumber || rp.address?.houseNumber,
          bedrooms: rp.bedroomCount,
          bathrooms: rp.bathroomCount,
          area: rp.areaSqMeter || 100,
          floor: rp.floorNumber,
          status: "Available",
          verified: true,
          featuredImage: rp.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
          galleryImages: rp.images?.map((i) => i.imageUrl) || [],
          description: rp.description || "Government registered municipal property.",
          amenities: ["Verified Ownership Deed", "Municipal Registration", "Water & Power Access"],
          securityDepositMonths: rp.securityDepositMonths || 2,
          minLeasePeriod: rp.minLeasePeriod || "1 Year",
          utilitiesIncluded: false,
          availableFrom: rp.availableFrom || "Immediate",
          landlordName: rp.landlordName || "N/A",
          unitsCount: rp.units?.length,
          units: rp.units
        });
      }
    });

    // 2. Props or context properties
    const primaryList = props.properties || context?.properties || [];
    primaryList.forEach(addProp);

    // 3. Initial static dataset
    INITIAL_PROPERTIES.forEach(addProp);

    // 4. LocalStorage registered properties
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("registered_properties");
        if (stored) {
          const parsed: PropertyResponse[] = JSON.parse(stored);
          parsed.forEach((rp) => {
            if (rp.status === "LISTED") {
              addProp({
                id: rp.id,
                propertyCode: rp.propertyCode,
                title: rp.title || `${rp.propertyType} in ${rp.address?.subCity || "Addis Ababa"}`,
                type: (rp.propertyType as any) || "Apartment",
                price: rp.monthlyRent || 0,
                location: `${rp.address?.subCity || ""}, Woreda ${rp.address?.woreda || ""}, Addis Ababa`,
                subCity: rp.address?.subCity || "Bole Sub City",
                woreda: rp.address?.woreda || "Woreda 01",
                houseNo: rp.houseNumber || rp.address?.houseNumber,
                bedrooms: rp.bedroomCount,
                bathrooms: rp.bathroomCount,
                area: rp.areaSqMeter || 100,
                floor: rp.floorNumber,
                status: "Available",
                verified: true,
                featuredImage: rp.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
                galleryImages: rp.images?.map((i) => i.imageUrl) || [],
                description: rp.description || "Government registered municipal property.",
                amenities: ["Verified Ownership Deed", "Municipal Registration", "Water & Power Access"],
                securityDepositMonths: 2,
                minLeasePeriod: "1 Year",
                utilitiesIncluded: false,
                availableFrom: "Immediate",
                landlordName: rp.landlordName || "Registered Landlord",
                unitsCount: rp.units?.length,
                units: rp.units
              });
            }
          });
        }
      } catch {
        // ignore JSON parse error
      }
    }

    return combined;
  }, [props.properties, context?.properties, listedProperties]);

  // Handle Input Change with automatic Capitalization
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Automatically capitalize input and remove excessive spaces
    const upperValue = e.target.value.toUpperCase();
    setPropertyCodeInput(upperValue);
    
    // If user clears the input completely, reset search state so NO default properties show
    if (!upperValue.trim()) {
      setSubmittedCode("");
      setHasSearched(false);
    }
  };

  // Perform search by Property Code (case-insensitive & whitespace tolerant)
  const handleSearch = (codeToSearch?: string) => {
    const rawQuery = (codeToSearch !== undefined ? codeToSearch : propertyCodeInput).trim();
    if (!rawQuery) {
      setSubmittedCode("");
      setHasSearched(false);
      return;
    }

    // Capitalize query automatically
    const cleanUpperQuery = rawQuery.toUpperCase();
    setPropertyCodeInput(cleanUpperQuery);
    setSubmittedCode(cleanUpperQuery);
    setHasSearched(true);
  };

  // Filter properties ONLY by Property Code (matching against propertyCode and ID)
  const matchedProperties = useMemo(() => {
    if (!hasSearched || !submittedCode.trim()) {
      return [];
    }

    const query = submittedCode.trim().toUpperCase().replace(/\s+/g, "");

    return allKnownProperties.filter((item) => {
      const code = (item.propertyCode || "").toUpperCase().replace(/\s+/g, "");
      const id = (item.id || "").toUpperCase().replace(/\s+/g, "");
      
      // Match exact or partial propertyCode, or id
      return (
        code.includes(query) ||
        id.includes(query) ||
        query.includes(code)
      );
    });
  }, [allKnownProperties, hasSearched, submittedCode]);

  // Handle Navigation to Property Detail
  const handleViewPropertyDetails = (property: Property) => {
    if (props.onSelectProperty) {
      props.onSelectProperty(property);
    } else if (context?.handleSelectProperty) {
      context.handleSelectProperty(property);
    }
    
    // Also navigate via router to ensure full details page opens
    const targetCode = property.propertyCode || property.id;
    router.push(`/citizen/dashboard/properties/property-detail?id=${encodeURIComponent(targetCode)}`);
  };

  const handleApplyLease = (property: Property) => {
    if (props.onOpenApplyLease) {
      props.onOpenApplyLease(property);
    } else if (context?.setApplyingLeaseProperty) {
      context.setApplyingLeaseProperty(property);
    }
  };

  const handleClear = () => {
    setPropertyCodeInput("");
    setSubmittedCode("");
    setHasSearched(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Search Header and Property Code Search Bar Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            FDRE Housing & Urban Registry
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Property Code Search
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Enter an official government-registered Property Code to look up certified residential and commercial property records.
          </p>

          {/* Focused Property Code Search Bar */}
          <div className="mt-6 pt-2 max-w-2xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
            >
              <div className="relative flex-1">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>

                <Input
                  id="property-code-search-input"
                  type="text"
                  placeholder="Enter Property Code (e.g. PRP-2023-0891)"
                  value={propertyCodeInput}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 h-12 text-sm font-mono uppercase bg-slate-50/70 border-slate-300 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 rounded-xl transition-all tracking-wider"
                  autoFocus
                />

                {propertyCodeInput && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 transition-colors"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <Button
                type="submit"
                id="search-property-code-btn"
                className="h-12 px-6 bg-[#00450d] hover:bg-[#1b5e20] text-white font-medium text-sm rounded-xl shadow-xs shrink-0 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Conditional Content: Results or Guidance State */}
      {!hasSearched ? (
        /* Initial Clean State: NO default properties displayed */
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center shadow-xs">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-[#00450d]">
              <Search className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900">
                Ready to Search the Municipal Registry
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Type or paste a registered <span className="font-mono font-medium text-slate-700">PRP-XXXX-XXXX</span> property code into the search bar above to view certified details, ownership status, and lease application options.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-left bg-slate-50/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <Info className="w-3.5 h-3.5 text-emerald-700" />
                <span>Where do I find my Property Code?</span>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                <li>Printed on your official FDRE Municipal Title Deed Certificate</li>
                <li>Issued upon completion of Landlord Property Registration</li>
                <li>Included in your government lease agreement documents</li>
              </ul>
            </div>
          </div>
        </div>
      ) : matchedProperties.length > 0 ? (
        /* Search Results Found */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-slate-900">
                Found {matchedProperties.length} matching registry {matchedProperties.length === 1 ? "record" : "records"} for{" "}
                <span className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70">
                  {submittedCode}
                </span>
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="text-xs h-8 text-slate-600 hover:text-slate-900"
            >
              Clear Search
            </Button>
          </div>

          {/* Render Matched Property Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {matchedProperties.map((property) => (
              <Card
                key={property.id}
                className="overflow-hidden border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col bg-white rounded-2xl group"
              >
                {/* Property Hero Image with Code and Status Badge */}
                <div
                  onClick={() => handleViewPropertyDetails(property)}
                  className="relative h-52 overflow-hidden cursor-pointer bg-slate-100"
                >
                  <img
                    src={property.featuredImage}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-black/30" />

                  {/* Property Code Pill */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-slate-900/90 backdrop-blur-md text-emerald-300 font-mono text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30 shadow-sm flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-emerald-400" />
                      {property.propertyCode || property.id}
                    </span>

                    {property.verified && (
                      <span className="bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Rent Tag */}
                  <div className="absolute bottom-3 left-3">
                    <span className="text-white text-base sm:text-lg font-bold drop-shadow-sm">
                      ETB {property.price >= 1000 ? property.price.toLocaleString() : property.price}{" "}
                      <span className="text-xs font-normal text-slate-200">/ month</span>
                    </span>
                  </div>

                  {/* Type Badge */}
                  <div className="absolute bottom-3 right-3">
                    <span className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-0.5 rounded-md">
                      {property.type}
                    </span>
                  </div>
                </div>

                {/* Card Content & Details */}
                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        onClick={() => handleViewPropertyDetails(property)}
                        className="font-bold text-base text-slate-900 hover:text-[#00450d] cursor-pointer transition-colors line-clamp-1"
                      >
                        {property.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{property.location}</span>
                    </p>

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-3 pb-1 border-t border-slate-100 text-xs text-slate-700">
                      <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate font-medium">{property.subCity}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
                        <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{property.area} m²</span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
                        {property.bedrooms !== undefined ? (
                          <>
                            <Bed className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium">{property.bedrooms} Bed</span>
                          </>
                        ) : property.units && property.units.length > 0 ? (
                          <>
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium">{property.units.length} Units</span>
                          </>
                        ) : (
                          <>
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium">{property.floor || "Ground"}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {property.landlordName && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          Owner: <strong className="text-slate-700 font-medium">{property.landlordName}</strong>
                        </span>
                        {property.houseNo && (
                          <span className="font-mono text-slate-600">H.No: {property.houseNo}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2.5 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPropertyDetails(property)}
                      className="flex-1 text-xs font-medium h-9 border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>View Details</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleApplyLease(property)}
                      className="flex-1 bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs font-medium h-9 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>Apply Lease</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* No Match Found State */
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200 space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
            <Building className="w-7 h-7" />
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-semibold text-slate-900">
              No Registered Property Found
            </h3>
            <p className="text-xs text-slate-500">
              No government-verified property found matching code{" "}
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                {submittedCode}
              </span>
              . Please verify the code on your Title Deed or municipal certificate and try again.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="text-xs h-8"
            >
              Clear Search
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchHousePage;
