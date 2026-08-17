"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Property, RentalAgreement } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  DoorOpen,
  TrendingUp,
  Plus,
  MapPin,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Store,
  Home,
  Bed,
  Bath,
  Maximize2,
  CheckCircle2
} from "lucide-react";

import { useCitizenData } from "@/hooks/useCitizenData";

interface PropertiesPageProps {
  properties?: Property[];
  agreements?: RentalAgreement[];
  onOpenRegisterProperty?: () => void;
  onSelectProperty?: (property: Property) => void;
  onViewAgreementForProperty?: (propertyTitle: string) => void;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = (props) => {
  const context = useCitizenData();
  const properties = props.properties || context.properties;
  const agreements = props.agreements || context.agreements;
  const onOpenRegisterProperty = props.onOpenRegisterProperty || (() => context.setIsRegisterPropertyModalOpen(true));
  const onSelectProperty = props.onSelectProperty || context.handleSelectProperty;
  const onViewAgreementForProperty = props.onViewAgreementForProperty || context.handleViewAgreementForProperty;
  const [expandedMallUnits, setExpandedMallUnits] = useState(false);
  const router = useRouter();

  // Compute dynamic stats
  const totalPropertiesCount = properties.length > 0 ? properties.length : 12;
  const totalUnitsCount = 48 + Math.max(0, properties.length - 5);
  const occupancyRate = 85;

  // Custom / user registered properties that aren't the static bento properties
  const additionalProperties = properties.filter(
    (p) => p.title !== "Bole Atlas Villa" && p.title !== "Piassa Grand Mall"
  );

  const handleOpenRegisterProperty = () => {
    router.push("/citizen/dashboard/properties/register");
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Properties
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your registered municipal titles, units, and occupancy rates.
          </p>
        </div>
        <Button
          onClick={handleOpenRegisterProperty}
          className="bg-[#00450d] hover:bg-[#1b5e20] text-white shadow-xs font-medium gap-2 self-start sm:self-auto h-9 px-4 rounded-lg cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register Property</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200 shadow-clean">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Properties
              </span>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {totalPropertiesCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Registered in GRAMS</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-clean">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Units
              </span>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {totalUnitsCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Commercial & Residential</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <DoorOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-clean">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Occupancy Rate
              </span>
              <div className="mt-1 text-2xl font-bold text-slate-900 flex items-baseline gap-2">
                <span>{occupancyRate}%</span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  High Demand
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">41 of {totalUnitsCount} active leases</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bento Grid: Single Unit Villa & Multi-Unit Commercial Complex */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Single Unit Property Card: Bole Atlas Villa */}
        <Card className="bg-white border-slate-200 shadow-clean hover:border-slate-300 transition-all flex flex-col justify-between">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="active" className="text-[10px] mb-1.5">
                  Rented
                </Badge>
                <CardTitle className="text-base font-semibold text-slate-900">
                  Bole Atlas Villa
                </CardTitle>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Bole Sub-city, Woreda 03, H.No 442
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Home className="w-4 h-4" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-0 space-y-3.5">
            {/* Property Image & Status */}
            <div className="relative h-40 rounded-lg overflow-hidden bg-slate-100">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3TaI97tONXc4KYzx8tqT7YFB29kuW5ebmAc0n4GHLxjWTMahWsEcnd_YEYvg-glb6cPg0HqWqgwuRkdCidk9ZrQqiczihUwg7yuZVCs0XMq0civZUmHoDSTc-_pEQGb6aovXWcfYbxKRlE-xis_vjicGD8jg20O1yzO8GQGI8-uzuMAonwwBeevXlI3oADlVe58PPocmoWdb5IU2gxoBO81y1GBO3bHG-no4mb4YhbWmt-Sjq_v1R7w"
                alt="Bole Atlas Villa"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Tenant details */}
            <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-medium text-xs">
                  AK
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Current Tenant
                  </span>
                  <span className="font-semibold text-xs text-slate-900">Abebe Kebede</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Monthly Rent
                </span>
                <span className="font-semibold text-xs text-slate-900">ETB 45,000</span>
              </div>
            </div>

            <div className="pt-1 flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => onViewAgreementForProperty("Bole Atlas Villa")}
                className="w-full text-xs font-medium gap-1.5 h-8 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Agreement
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Unit Commercial Property Card: Piassa Grand Mall */}
        <Card className="bg-white border-slate-200 shadow-clean hover:border-slate-300 transition-all flex flex-col justify-between">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="default" className="text-[10px]">
                    Commercial Complex
                  </Badge>
                  <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                    24 Units (20 Rented, 4 Available)
                  </span>
                </div>
                <CardTitle className="text-base font-semibold text-slate-900">
                  Piassa Grand Mall
                </CardTitle>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Arada Sub-city, Woreda 01, Piassa Commercial Core
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-0 space-y-3">
            {/* Units Sub-list */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
                <span>Unit Code & Type</span>
                <span>Status & Rent</span>
              </div>

              {/* Unit Rows */}
              <div className="space-y-1.5">
                <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 mr-2">G-01</span>
                    <span className="font-medium text-slate-700">Ground Floor Retail</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">(45 sqm)</span>
                  </div>
                  <Badge variant="active" className="text-[9px]">
                    Rented (ETB 22K)
                  </Badge>
                </div>

                <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 mr-2">G-02</span>
                    <span className="font-medium text-slate-700">Ground Floor Kiosk</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">(15 sqm)</span>
                  </div>
                  <Badge variant="active" className="text-[9px]">
                    Rented (ETB 9.5K)
                  </Badge>
                </div>

                <div className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-amber-900 mr-2">F1-05</span>
                    <span className="font-medium text-slate-800">First Floor Office</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">(60 sqm)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
                      Available
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 text-[10px] px-2 cursor-pointer"
                      onClick={onOpenRegisterProperty}
                    >
                      List Unit
                    </Button>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 mr-2">F2-12</span>
                    <span className="font-medium text-slate-700">Second Floor Store</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">(30 sqm)</span>
                  </div>
                  <Badge variant="active" className="text-[9px]">
                    Rented (ETB 11K)
                  </Badge>
                </div>

                {expandedMallUnits && (
                  <>
                    <div className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-200/80 flex items-center justify-between text-xs animate-in fade-in">
                      <div>
                        <span className="font-semibold text-amber-900 mr-2">F3-01</span>
                        <span className="font-medium text-slate-800">Third Floor Tech Hub</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">(90 sqm)</span>
                      </div>
                      <Badge variant="pending" className="text-[9px]">
                        Available (ETB 28K)
                      </Badge>
                    </div>

                    <div className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-200/80 flex items-center justify-between text-xs animate-in fade-in">
                      <div>
                        <span className="font-semibold text-amber-900 mr-2">G-04</span>
                        <span className="font-medium text-slate-800">Ground Pharmacy Space</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">(50 sqm)</span>
                      </div>
                      <Badge variant="pending" className="text-[9px]">
                        Available (ETB 24K)
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => setExpandedMallUnits(!expandedMallUnits)}
              className="w-full py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-1 mt-1 cursor-pointer"
            >
              <span>{expandedMallUnits ? "Hide Extra Units" : "View All 24 Units Directory"}</span>
              {expandedMallUnits ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Registered Properties Portfolio */}
      {additionalProperties.length > 0 && (
        <div className="pt-2 space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Registered Titles Portfolio ({additionalProperties.length})
              </h3>
              <p className="text-xs text-slate-500">
                Residential and commercial units registered with the municipal housing bureau.
              </p>
            </div>
            <Button
              onClick={onOpenRegisterProperty}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Add Another Property</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {additionalProperties.map((prop) => (
              <Card
                key={prop.id}
                className="bg-white border-slate-200 shadow-clean hover:border-slate-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="h-36 relative overflow-hidden bg-slate-100">
                    <img
                      src={prop.featuredImage || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=60"}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {prop.type}
                      </span>
                      {prop.verified && (
                        <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <span className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-slate-900 text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                      ETB {prop.price.toLocaleString()}/mo
                    </span>
                  </div>

                  <CardContent className="p-4 space-y-2.5">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 group-hover:text-[#00450d] transition-colors">
                        {prop.title}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{prop.location}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 pt-1 border-t border-slate-100">
                      {prop.bedrooms !== undefined && (
                        <span className="flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-slate-400" />
                          <span>{prop.bedrooms} Bed</span>
                        </span>
                      )}
                      {prop.bathrooms !== undefined && (
                        <span className="flex items-center gap-1">
                          <Bath className="w-3.5 h-3.5 text-slate-400" />
                          <span>{prop.bathrooms} Bath</span>
                        </span>
                      )}
                      {prop.area && (
                        <span className="flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{prop.area} m²</span>
                        </span>
                      )}
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectProperty(prop)}
                    className="w-full text-xs h-7.5 cursor-pointer hover:bg-slate-50"
                  >
                    View Property Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
