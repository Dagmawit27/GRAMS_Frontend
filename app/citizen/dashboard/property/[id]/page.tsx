"use client";

import React, { useState } from "react";
import { Property } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Building,
  ShieldCheck,
  CheckCircle2,
  Wifi,
  Zap,
  Shield,
  Car,
  Droplets,
  Layers,
  Trash2,
  Share2
} from "lucide-react";

import { useCitizenData } from "@/hooks/useCitizenData";

interface PropertyDetailsPageProps {
  property?: Property;
  onBack?: () => void;
  onBookVisit?: (property: Property) => void;
  onApplyLease?: (property: Property) => void;
}

export const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = (props) => {
  const context = useCitizenData();
  const property = props.property || context.selectedProperty || context.properties[0];
  const onBack = props.onBack || context.handleBackFromPropertyDetails;
  const onBookVisit = props.onBookVisit || ((p) => context.setBookingVisitProperty(p));
  const onApplyLease = props.onApplyLease || ((p) => context.setApplyingLeaseProperty(p));
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const amenityIcons: Record<string, React.ReactNode> = {
    "High-speed Internet": <Wifi className="w-4 h-4 text-slate-500" />,
    "Backup Generator": <Zap className="w-4 h-4 text-slate-500" />,
    "24/7 Security": <Shield className="w-4 h-4 text-slate-500" />,
    "Parking Space": <Car className="w-4 h-4 text-slate-500" />,
    "Water Tank": <Droplets className="w-4 h-4 text-slate-500" />,
    "Elevator Access": <Layers className="w-4 h-4 text-slate-500" />,
    "Waste Disposal": <Trash2 className="w-4 h-4 text-slate-500" />,
    "Private Garden": <CheckCircle2 className="w-4 h-4 text-slate-500" />,
    "Guard Post": <Shield className="w-4 h-4 text-slate-500" />,
  };

  const allImages = property.galleryImages?.length > 0
    ? property.galleryImages
    : [property.featuredImage];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Breadcrumb & Navigation Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Search House</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-500 font-normal">Property Details</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                alert("Property link copied to clipboard!");
              }
            }}
            className="text-xs h-8 gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>
        </div>
      </div>

      {/* Main Grid: Gallery + Details (Left 2/3), Terms & Actions (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Images, Title, Specs, Description, Amenities) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo Gallery Grid */}
          <div className="space-y-3">
            {/* Main Featured Photo */}
            <div className="relative h-72 sm:h-96 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={allImages[selectedPhotoIndex] || property.featuredImage}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {property.verified && (
                <div className="absolute top-3.5 left-3.5 bg-slate-900/90 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm backdrop-blur-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Property</span>
                </div>
              )}
            </div>

            {/* Thumbnails Row */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5">
                {allImages.slice(0, 4).map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative h-20 sm:h-24 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedPhotoIndex === idx
                        ? "border-slate-900 ring-2 ring-slate-900/10"
                        : "border-transparent hover:opacity-80"
                    }`}
                  >
                    <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                    {idx === 3 && allImages.length > 4 && (
                      <div className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center font-medium text-xs">
                        +{allImages.length - 3} Photos
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Property Header */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-4 shadow-clean">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {property.title}
                </h1>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {property.location} {property.houseNo ? `(H.No ${property.houseNo})` : ""}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Monthly Rent</span>
                <span className="text-xl sm:text-2xl font-bold text-slate-900">
                  ETB {property.price.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400"> / month</span>
              </div>
            </div>

            {/* Quick Specs Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-slate-100">
              {property.bedrooms !== undefined && (
                <div className="p-2.5 bg-slate-50 rounded-lg text-center border border-slate-100">
                  <Bed className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                  <span className="block text-xs font-semibold text-slate-900">{property.bedrooms} Bedrooms</span>
                  <span className="text-[10px] text-slate-400">Master + Guest</span>
                </div>
              )}
              {property.bathrooms !== undefined && (
                <div className="p-2.5 bg-slate-50 rounded-lg text-center border border-slate-100">
                  <Bath className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                  <span className="block text-xs font-semibold text-slate-900">{property.bathrooms} Bathrooms</span>
                  <span className="text-[10px] text-slate-400">Modern Fixtures</span>
                </div>
              )}
              <div className="p-2.5 bg-slate-50 rounded-lg text-center border border-slate-100">
                <Maximize2 className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                <span className="block text-xs font-semibold text-slate-900">{property.area} m²</span>
                <span className="text-[10px] text-slate-400">Floor Area</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg text-center border border-slate-100">
                <Building className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                <span className="block text-xs font-semibold text-slate-900">{property.floor || property.type}</span>
                <span className="text-[10px] text-slate-400">Building Level</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-2.5 shadow-clean">
            <h3 className="text-sm font-bold text-slate-900">Property Description</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities Section */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3 shadow-clean">
            <h3 className="text-sm font-bold text-slate-900">Amenities & Utilities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {property.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800"
                >
                  {amenityIcons[amenity] || <CheckCircle2 className="w-4 h-4 text-slate-400" />}
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Sticky Rental Terms Card & Call to Action) */}
        <div className="space-y-6">
          {/* Rental Terms Card */}
          <Card className="border-slate-200 shadow-clean bg-white sticky top-24">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-sm text-slate-900">Rental Terms</h3>
                <Badge variant="secondary" className="text-[10px]">
                  GRAMS Verified
                </Badge>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Security Deposit</span>
                  <span className="font-medium text-slate-900">{property.securityDepositMonths} Months (ETB {(property.price * property.securityDepositMonths).toLocaleString()})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Min. Lease Period</span>
                  <span className="font-medium text-slate-900">{property.minLeasePeriod}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Utilities</span>
                  <span className="font-medium text-slate-900">{property.utilitiesIncluded ? "Included" : "Not Included"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Available From</span>
                  <span className="font-medium text-slate-900">{property.availableFrom}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={() => onApplyLease(property)}
                  className="w-full bg-[#00450d] hover:bg-[#1b5e20] text-white font-medium h-10 shadow-xs rounded-lg"
                >
                  Apply for Lease
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onBookVisit(property)}
                  className="w-full font-medium h-10 rounded-lg text-xs"
                >
                  Book a Visit
                </Button>
              </div>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                By applying, you agree to the GRAMS rental terms and conditions as stipulated by the Federal Housing Authority.
              </p>
            </CardContent>
          </Card>

          {/* Location & Map Preview Card */}
          <Card className="border-slate-200 bg-white shadow-clean">
            <CardContent className="p-4 space-y-2.5">
              <h4 className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Location & Neighborhood
              </h4>
              <p className="text-xs text-slate-500">{property.location}</p>

              {/* Simulated Map View */}
              <div className="h-36 rounded-lg bg-slate-100 relative overflow-hidden flex items-center justify-center border border-slate-200">
                <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md animate-bounce">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="mt-1 bg-white px-2 py-0.5 rounded text-[10px] font-semibold shadow-xs text-slate-900 border border-slate-200">
                    {property.subCity}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
