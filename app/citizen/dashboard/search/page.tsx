"use client";

import React, { useState } from "react";
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
  ArrowUpDown
} from "lucide-react";

import { useCitizenData } from "@/hooks/useCitizenData";

interface SearchHousePageProps {
  properties?: Property[];
  onSelectProperty?: (property: Property) => void;
  onOpenApplyLease?: (property: Property) => void;
}

export const SearchHousePage: React.FC<SearchHousePageProps> = (props) => {
  const context = useCitizenData();
  const properties = props.properties || context.properties;
  const onSelectProperty = props.onSelectProperty || context.handleSelectProperty;
  const onOpenApplyLease = props.onOpenApplyLease || ((p) => context.setApplyingLeaseProperty(p));
  const [locationQuery, setLocationQuery] = useState("");
  const [propertyType, setPropertyType] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<string>("all");
  const [houseNoQuery, setHouseNoQuery] = useState("");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "area-desc">("price-asc");

  // Recent Search Pills
  const recentSearches = [
    { label: "2BR Apartment in Bole", location: "Bole", type: "Apartment" },
    { label: "Villa in Old Airport", location: "Old Airport", type: "Villa" },
    { label: "3BR Condominium Gofa", location: "Gofa", type: "Condominium" },
    { label: "Commercial in Piassa", location: "Piassa", type: "Commercial" },
  ];

  const handlePillClick = (item: { location: string; type: string }) => {
    setLocationQuery(item.location);
    setPropertyType(item.type);
  };

  // Filter properties
  const filteredProperties = properties.filter((item) => {
    if (locationQuery) {
      const q = locationQuery.toLowerCase();
      const matchLoc =
        item.location.toLowerCase().includes(q) ||
        item.subCity.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q);
      if (!matchLoc) return false;
    }

    if (houseNoQuery) {
      const hq = houseNoQuery.toLowerCase();
      if (!item.houseNo || !item.houseNo.toLowerCase().includes(hq)) {
        return false;
      }
    }

    if (propertyType !== "all" && item.type !== propertyType) {
      return false;
    }

    if (maxPrice !== "all") {
      const priceNum = parseInt(maxPrice, 10);
      if (item.price > priceNum) return false;
    }

    if (onlyVerified && !item.verified) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "area-desc") return b.area - a.area;
    return 0;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header & Clean Hero Search Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-clean">
        <div className="max-w-3xl">
          {/*<div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
              FDRE Housing Registry
            </span>
          </div> */}
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Government-Verified Residential & Commercial Listings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search verified properties across Addis Ababa with legally certified lease agreements.
          </p>

          {/* Search Controls Card */}
          <div className="mt-5 bg-slate-50/80 border border-slate-200/90 rounded-lg p-3 sm:p-4 text-slate-900">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {/* Location */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Location / Sub-city
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="e.g. Bole, Old Airport"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="pl-8.5 h-9 text-xs"
                  />
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 shadow-2xs"
                >
                  <option value="all">All Types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Condominium">Condominium</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Max Price (ETB)
                </label>
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 shadow-2xs"
                >
                  <option value="all">Any Price</option>
                  <option value="20000">Up to 20,000 ETB</option>
                  <option value="30000">Up to 30,000 ETB</option>
                  <option value="50000">Up to 50,000 ETB</option>
                  <option value="90000">Up to 90,000 ETB</option>
                </select>
              </div>

              {/* Search Action / House Number */}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    House No.
                  </label>
                  <Input
                    placeholder="# 442"
                    value={houseNoQuery}
                    onChange={(e) => setHouseNoQuery(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <Button
                  onClick={() => {}}
                  className="h-9 px-3 bg-[#00450d] hover:bg-[#1b5e20] text-white shrink-0 font-medium rounded-lg"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Search Pills 
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium text-[11px]">Popular:</span>
            {recentSearches.map((pill) => (
              <button
                key={pill.label}
                onClick={() => handlePillClick(pill)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md text-xs font-medium transition-colors"
              >
                {pill.label}
              </button>
            ))}
          </div>*/}
        </div>
      </div>

      {/* Results Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-clean">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-900">
            {filteredProperties.length} Properties Available
          </span>
          {onlyVerified && (
            <Badge variant="verified" className="text-[10px]">
              Verified Only
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyVerified}
              onChange={(e) => setOnlyVerified(e.target.checked)}
              className="rounded border-slate-300 text-[#00450d] focus:ring-slate-900/10 w-3.5 h-3.5"
            />
            <span>GRAMS Verified Only</span>
          </label>

          <div className="h-3.5 w-px bg-slate-200" />

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="area-desc">Size: Largest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Property Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProperties.map((property) => (
          <Card
            key={property.id}
            className="overflow-hidden border-slate-200 hover:border-slate-300 shadow-clean hover:shadow-md transition-all flex flex-col group bg-white"
          >
            {/* Property Image Hero */}
            <div
              onClick={() => onSelectProperty(property)}
              className="relative h-48 overflow-hidden cursor-pointer bg-slate-100"
            >
              <img
                src={property.featuredImage}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-2xs">
                  ETB {property.price >= 1000 ? `${(property.price / 1000).toFixed(0)}K` : property.price} / mo
                </span>
                {property.verified && (
                  <span className="bg-emerald-50/90 backdrop-blur-xs text-emerald-800 border border-emerald-200/80 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                )}
              </div>
              <span className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
                {property.type}
              </span>
            </div>

            {/* Content Body */}
            <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
              <div>
                <h3
                  onClick={() => onSelectProperty(property)}
                  className="font-semibold text-sm text-slate-900 hover:text-[#00450d] cursor-pointer transition-colors line-clamp-1"
                >
                  {property.title}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{property.location}</span>
                </p>

                {/* Specs / Meta Badges */}
                <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-slate-100 text-xs text-slate-600">
                  {property.bedrooms !== undefined && (
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{property.bedrooms}</strong> Bed
                    </span>
                  )}
                  {property.bathrooms !== undefined && (
                    <span className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{property.bathrooms}</strong> Bath
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Maximize2 className="w-3 h-3 text-slate-400" />
                    <strong>{property.area}</strong> m²
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectProperty(property)}
                  className="flex-1 text-xs font-medium h-8"
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  onClick={() => onOpenApplyLease(property)}
                  className="flex-1 bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs font-medium h-8"
                >
                  Apply Lease
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="bg-white rounded-xl p-10 text-center border border-slate-200 space-y-3">
          <Building className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-900">No properties match your filter</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms, removing price caps, or checking different sub-cities.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setLocationQuery("");
              setPropertyType("all");
              setMaxPrice("all");
              setHouseNoQuery("");
              setOnlyVerified(false);
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchHousePage;

