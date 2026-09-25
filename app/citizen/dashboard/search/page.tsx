"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Property } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  Calendar,
  Lock
} from "lucide-react";
import { PropertyResponse, getPropertyByCode, getSession } from "@/lib/api";

interface SearchHousePageProps {
  properties?: Property[];
  onSelectProperty?: (property: Property) => void;
  onOpenApplyLease?: (property: Property) => void;
}

export const SearchHousePage: React.FC<SearchHousePageProps> = (props) => {
  const router = useRouter();

  // Search state - ONLY search by propertyCode, initially empty with NO default properties displayed
  const [propertyCodeInput, setPropertyCodeInput] = useState<string>("");
  const [submittedCode, setSubmittedCode] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [searchedProperty, setSearchedProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Convert PropertyResponse to Property
  const convertToProperty = (rp: PropertyResponse): Property => ({
    id: rp.id,
    propertyCode: rp.propertyCode,
    title: rp.title || `${rp.propertyType} in ${rp.address?.subCity || "Addis Ababa"}`,
    type: (rp.propertyType as 'Apartment' | 'Villa' | 'Condominium' | 'Commercial') || 'Apartment',
    price: rp.monthlyRent || 0,
    location: `${rp.address?.subCity || ""}, Woreda ${rp.address?.woreda || ""}, Addis Ababa`,
    subCity: rp.address?.subCity || "Bole Sub City",
    woreda: rp.address?.woreda || "Woreda 01",
    houseNo: rp.houseNumber || rp.address?.houseNumber,
    bedrooms: rp.bedroomCount,
    bathrooms: rp.bathroomCount,
    area: rp.areaSqMeter || 100,
    floor: rp.floorNumber,
    status: (rp.status || "").toUpperCase() === "RENTED" ? "Rented" : "Available",
    verified: true,
    featuredImage: rp.images?.[0]?.imageUrl || "",
    galleryImages: rp.images?.map((i) => i.imageUrl) || [],
    description: rp.description || "",
    amenities: ["Verified Ownership Deed", "Municipal Registration", "Water & Power Access"],
    securityDepositMonths: rp.securityDepositMonths || 2,
    minLeasePeriod: rp.minLeasePeriod || "1 Year",
    utilitiesIncluded: false,
    availableFrom: rp.availableFrom || "Immediate",
    landlordName: rp.landlordName || "N/A",
    unitsCount: rp.units?.length,
    units: rp.units?.map((u) => ({
      id: u.id,
      unitCode: u.unitCode,
      unitName: u.unitName,
      unitType: u.unitType,
      areaSqMeter: u.areaSqMeter,
      status: u.status,
      rentAmount: u.rentAmount,
      floorLevel: u.floorLevel,
      category: u.category,
      submeter: u.submeter,
      waterSupply: u.waterSupply,
      frontage: u.frontage,
      description: u.description,
    })),
  });

  // Handle Input Change with automatic Capitalization
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upperValue = e.target.value.toUpperCase();
    setPropertyCodeInput(upperValue);
    
    if (!upperValue.trim()) {
      setSubmittedCode("");
      setHasSearched(false);
      setSearchedProperty(null);
      setError("");
    }
  };

  // Perform search by Property Code using API
  const handleSearch = async (codeToSearch?: string) => {
    const rawQuery = (codeToSearch !== undefined ? codeToSearch : propertyCodeInput).trim();
    if (!rawQuery) {
      setSubmittedCode("");
      setHasSearched(false);
      setSearchedProperty(null);
      setError("");
      return;
    }

    const cleanUpperQuery = rawQuery.toUpperCase();
    setPropertyCodeInput(cleanUpperQuery);
    setSubmittedCode(cleanUpperQuery);
    setHasSearched(true);
    setIsLoading(true);
    setError("");

    try {
      const session = getSession();
      const property = await getPropertyByCode(cleanUpperQuery, session?.token);
      
      if (property) {
        setSearchedProperty(convertToProperty(property));
      } else {
        setSearchedProperty(null);
        setError("Property not found");
      }
    } catch (err) {
      setSearchedProperty(null);
      setError(err instanceof Error ? err.message : "Failed to search property");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Navigation to Property Detail
  const handleViewPropertyDetails = (property: Property) => {
    if (props.onSelectProperty) {
      props.onSelectProperty(property);
    }
    
    // Navigate via router to search-detail page
    const targetCode = property.propertyCode || property.id;
    router.push(`/citizen/dashboard/search/search-detail?code=${encodeURIComponent(targetCode)}`);
  };

  const handleApplyLease = (property: Property) => {
    if (props.onOpenApplyLease) {
      props.onOpenApplyLease(property);
    }
  };

  const handleClear = () => {
    setPropertyCodeInput("");
    setSubmittedCode("");
    setHasSearched(false);
    setSearchedProperty(null);
    setError("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Search Header and Property Code Search Bar Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          
          <h1 className="text-1xl sm:text-2xl font-bold tracking-tight text-slate-600">
            Enter an official government-registered Property Code 
          </h1>


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
                  placeholder="Property Code"
                  value={propertyCodeInput}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 h-12 text-xs font-mono uppercase bg-slate-50/70 border-slate-300 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 rounded-xl transition-all tracking-wider"
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
            </div>

            <div className="pt-3 border-t border-slate-100 text-left bg-slate-50/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <Info className="w-3.5 h-3.5 text-emerald-700" />
                <span>Where do I find my Property Code?</span>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                <li>Issued upon completion of Landlord Property Registration</li>
                <li>Included in landloard property documents</li>
              </ul>
            </div>
          </div>
        </div>
      ) : searchedProperty ? (
        /* Search Results Found */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-slate-900">
                Property found for{" "}
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
            {[searchedProperty].map((property) => (
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
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
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

                    {property.units && property.units.length > 0 ? (
                      (() => {
                        const availableUnits = property.units.filter(
                          (u) => (u.status || "").toUpperCase() === "AVAILABLE"
                        ).length;
                        return availableUnits > 0 ? (
                          <span className="bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                            <Layers className="w-3 h-3" />
                            {availableUnits} of {property.units.length} Units Available
                          </span>
                        ) : (
                          <span className="bg-rose-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                            <Lock className="w-3 h-3" />
                            All Units Rented
                          </span>
                        );
                      })()
                    ) : property.status === "Rented" ? (
                      <span className="bg-rose-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <Lock className="w-3 h-3" />
                        Rented
                      </span>
                    ) : null}
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : isLoading ? (
        /* Loading State */
        <Card className="bg-white border-slate-200 rounded-2xl overflow-hidden shadow-2xs animate-in fade-in duration-100">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-44 w-full rounded-xl" />
              <div className="md:col-span-2 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Skeleton className="h-8 w-full rounded-lg" />
                  <Skeleton className="h-8 w-full rounded-lg" />
                  <Skeleton className="h-8 w-full rounded-lg" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        /* Error State */
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200 space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-700">
            <Building className="w-7 h-7" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-base font-semibold text-slate-900">
              Property Not Found
            </h3>
            <p className="text-xs text-slate-500">
              {error}
            </p>
            <div className="pt-2 text-left bg-slate-50/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <Info className="w-3.5 h-3.5 text-emerald-700" />
                <span>Troubleshooting Tips</span>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                <li>Verify the property code is entered correctly</li>
                <li>Check that the property is listed in the registry</li>
                <li>Contact support if you believe this is an error</li>
              </ul>
            </div>
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
