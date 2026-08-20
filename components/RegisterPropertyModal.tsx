"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Property, PropertyUnit } from "@/types";
import { Building2, Building, Home, Store, Plus, Check, Copy, Trash2, Lock } from "lucide-react";

interface RegisterPropertyModalProps {
  open: boolean;
  onClose: () => void;
  onRegister: (property: Property) => void;
}

type PropertyTypeOption = "Villa" | "Apartment" | "Condominium" | "Shopping Mall";

interface ModalShopUnit {
  id: string;
  shopNumber: string;
  floorLevel: string;
  area: number;
  rentAmount: number;
  category: string;
}

export const RegisterPropertyModal: React.FC<RegisterPropertyModalProps> = ({
  open,
  onClose,
  onRegister,
}) => {
  const [title, setTitle] = useState("");
  const [propType, setPropType] = useState<PropertyTypeOption>("Villa");
  const [price, setPrice] = useState("35000");
  const [subCity, setSubCity] = useState("Bole Sub-city");
  const [woreda, setWoreda] = useState("03");
  const [houseNo, setHouseNo] = useState("456/A");
  const [ownershipType, setOwnershipType] = useState("Private");
  const [area, setArea] = useState("120");
  const [description, setDescription] = useState("");

  // Villa Specs
  const [villaBedrooms, setVillaBedrooms] = useState("4");
  const [villaBathrooms, setVillaBathrooms] = useState("3");
  const [villaLivingRooms, setVillaLivingRooms] = useState("2");
  const [villaFloor, setVillaFloor] = useState("Ground");
  const [isServiceQuarter, setIsServiceQuarter] = useState(false);

  // Apartment & Condo Typologies (Studio, 1-bed, 2-bed, 3-bed only)
  const [roomTypology, setRoomTypology] = useState<"studio" | "1-bed" | "2-bed" | "3-bed">("2-bed");
  const [aptBathrooms, setAptBathrooms] = useState("2");
  const [aptFloor, setAptFloor] = useState("3rd Floor");

  // Commercial / Shopping
  const [commercialKind, setCommercialKind] = useState<"single-shop" | "mall">("mall");
  const [shopUnitNumber, setShopUnitNumber] = useState("Shop G-12");
  
  const [modalMallUnits, setModalMallUnits] = useState<ModalShopUnit[]>([
    {
      id: "u1",
      shopNumber: "Shop G-01",
      floorLevel: "Ground Floor",
      area: 40,
      rentAmount: 26000,
      category: "Retail / Boutique",
    },
    {
      id: "u2",
      shopNumber: "Shop G-02",
      floorLevel: "Ground Floor",
      area: 35,
      rentAmount: 22000,
      category: "Café / Restaurant",
    },
    {
      id: "u3",
      shopNumber: "Shop 1-01",
      floorLevel: "1st Floor",
      area: 50,
      rentAmount: 20000,
      category: "Electronics / Telecom",
    },
  ]);

  const handleDuplicateModalUnit = (idx: number) => {
    const src = modalMallUnits[idx];
    const existing = modalMallUnits.map((u) => u.shopNumber.toLowerCase());
    let nextNum = `${src.shopNumber} (Copy)`;
    const match = src.shopNumber.match(/^(.*?)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const numStr = match[2];
      let num = parseInt(numStr, 10);
      let candidate = `${prefix}${String(num + 1).padStart(numStr.length, "0")}`;
      while (existing.includes(candidate.toLowerCase())) {
        num++;
        candidate = `${prefix}${String(num + 1).padStart(numStr.length, "0")}`;
      }
      nextNum = candidate;
    }

    const cloned: ModalShopUnit = {
      ...src,
      id: `mu-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      shopNumber: nextNum,
    };
    const updated = [...modalMallUnits];
    updated.splice(idx + 1, 0, cloned);
    setModalMallUnits(updated);
  };

  const handleAddModalUnit = () => {
    const nextIdx = modalMallUnits.length + 1;
    const newUnit: ModalShopUnit = {
      id: `mu-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      shopNumber: `Shop G-${String(nextIdx).padStart(2, "0")}`,
      floorLevel: "Ground Floor",
      area: 40,
      rentAmount: 25000,
      category: "Retail / Boutique",
    };
    setModalMallUnits([...modalMallUnits, newUnit]);
  };

  const handleDeleteModalUnit = (idx: number) => {
    if (modalMallUnits.length <= 1) return;
    setModalMallUnits(modalMallUnits.filter((_, i) => i !== idx));
  };

  const handleUpdateModalUnit = <K extends keyof ModalShopUnit>(
    idx: number,
    field: K,
    val: ModalShopUnit[K]
  ) => {
    const updated = [...modalMallUnits];
    updated[idx] = {
      ...updated[idx],
      [field]: val,
    };
    setModalMallUnits(updated);
  };

  const modalMallTotalArea = modalMallUnits.reduce((acc, u) => acc + (Number(u.area) || 0), 0);
  const modalMallTotalRent = modalMallUnits.reduce((acc, u) => acc + (Number(u.rentAmount) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let derivedBedrooms: number | undefined = undefined;
    let derivedBathrooms: number | undefined = undefined;

    if (propType === "Villa") {
      derivedBedrooms = isServiceQuarter ? 1 : parseInt(villaBedrooms, 10) || 3;
      derivedBathrooms = parseInt(villaBathrooms, 10) || 2;
    } else if (propType === "Apartment" || propType === "Condominium") {
      derivedBedrooms = roomTypology === "studio" ? 0 : roomTypology === "1-bed" ? 1 : roomTypology === "2-bed" ? 2 : 3;
      derivedBathrooms = parseInt(aptBathrooms, 10) || 1;
    }

    const typeMapping: Property["type"] = propType === "Shopping Mall" ? "Commercial" : (propType as Property["type"]);

    const newProp: Property = {
      // eslint-disable-next-line
      id: `prop-${Date.now()}`,
      title,
      type: typeMapping,
      price:
        propType === "Shopping Mall" && commercialKind === "mall"
          ? modalMallTotalRent
          : parseFloat(price) || 30000,
      location: `${subCity}, Woreda ${woreda}, Addis Ababa`,
      subCity,
      woreda: `Woreda ${woreda}`,
      houseNo: houseNo || "N/A",
      bedrooms: derivedBedrooms,
      bathrooms: derivedBathrooms,
      area:
        propType === "Shopping Mall" && commercialKind === "mall"
          ? modalMallTotalArea
          : parseFloat(area) || 100,
      floor: propType === "Villa" ? villaFloor : propType === "Shopping Mall" ? "Commercial Multi-Floor" : aptFloor,
      status: "Available",
      verified: true,
      featuredImage:
        propType === "Villa"
          ? "https://lh3.googleusercontent.com/aida-public/AB6AXuA3TaI97tONXc4KYzx8tqT7YFB29kuW5ebmAc0n4GHLxjWTMahWsEcnd_YEYvg-glb6cPg0HqWqgwuRkdCidk9ZrQqiczihUwg7yuZVCs0XMq0civZUmHoDSTc-_pEQGb6aovXWcfYbxKRlE-xis_vjicGD8jg20O1yzO8GQGI8-uzuMAonwwBeevXlI3oADlVe58PPocmoWdb5IU2gxoBO81y1GBO3bHG-no4mb4YhbWmt-Sjq_v1R7w"
          : "https://lh3.googleusercontent.com/aida-public/AB6AXuArZM8eccqrTxsJgQGwrJ9QdADLY41kgOvV3jzwXGn16dj5ogp9Z4MXSSZi-vq4D1_T1QkfKp9Ds7ueGwa3pSV7KomN4uiFrhUl2SHywD6J6oIvRLsmWNXwZngHiVFOTxbAAj31SuxMaN27rZD65OyNS5KSgJCXepQqV3TiMmcCwBODUSyNOIBG_DRAZDJDeOA9zSw0COPkh474PN-PSeniepcpIHYXDZUtnPrcDrBuSbOaztsZ3PQ-Ww",
      galleryImages: [],
      description: description || `Government registered ${propType} property under GRAMS municipal verification.`,
      amenities: ["Backup Generator", "Dedicated Water Tank", "24/7 Security", "Compound Parking"],
      securityDepositMonths: 2,
      minLeasePeriod: "1 Year",
      utilitiesIncluded: false,
      availableFrom: "Immediate",
      landlordName: "Dagmawit Mesfin",
      unitsCount: propType === "Shopping Mall" && commercialKind === "mall" ? modalMallUnits.length : 1,
      units:
        propType === "Shopping Mall" && commercialKind === "mall"
          ? modalMallUnits.map((u) => ({
              id: u.id,
              unitCode: u.shopNumber,
              name: `${u.floorLevel} - ${u.category}`,
              type: u.category,
              area: u.area,
              status: "Available",
              rentAmount: u.rentAmount,
              floorLevel: u.floorLevel,
              category: u.category,
              shopNumber: u.shopNumber,
              submeter: true,
              waterSupply: true,
            }))
          : undefined,
    };

    onRegister(newProp);
    onClose();
    setTitle("");
    setHouseNo("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-slate-900 mb-1">
            <Building2 className="w-4 h-4 text-emerald-800" />
            <DialogTitle>Register New Property</DialogTitle>
          </div>
          <DialogDescription>
            Register residential or commercial property in the GRAMS municipal registry.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Property Type Grid (Villa, Apartment, Condominium, Shopping Mall) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Property Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPropType("Villa")}
                className={`p-3 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
                  propType === "Villa"
                    ? "bg-[#e8f1ea] border-[#00450d] ring-1 ring-[#00450d] text-slate-900"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-[11px] font-semibold">Villa</span>
              </button>

              <button
                type="button"
                onClick={() => setPropType("Apartment")}
                className={`p-3 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
                  propType === "Apartment"
                    ? "bg-[#e8f1ea] border-[#00450d] ring-1 ring-[#00450d] text-slate-900"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Building className="w-5 h-5" />
                <span className="text-[11px] font-semibold">Apartment</span>
              </button>

              <button
                type="button"
                onClick={() => setPropType("Condominium")}
                className={`p-3 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
                  propType === "Condominium"
                    ? "bg-[#e8f1ea] border-[#00450d] ring-1 ring-[#00450d] text-slate-900"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="text-[11px] font-semibold">Condo</span>
              </button>

              <button
                type="button"
                onClick={() => setPropType("Shopping Mall")}
                className={`p-3 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
                  propType === "Shopping Mall"
                    ? "bg-[#e8f1ea] border-[#00450d] ring-1 ring-[#00450d] text-slate-900"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Store className="w-5 h-5" />
                <span className="text-[11px] font-semibold">Shopping Mall</span>
              </button>
            </div>
          </div>

          {/* Property Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Property Name / Listing Title
            </label>
            <Input
              required
              placeholder="e.g. Bole Atlas Executive Residence"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* Address & Ownership */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Sub-city
              </label>
              <select
                value={subCity}
                onChange={(e) => setSubCity(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
              >
                <option value="Bole Sub-city">Bole</option>
                <option value="Kirkos Sub-city">Kirkos</option>
                <option value="Yeka Sub-city">Yeka</option>
                <option value="Arada Sub-city">Arada</option>
                <option value="Nifas Silk-Lafto">Nifas Silk</option>
                <option value="Lideta Sub-city">Lideta</option>
                <option value="Lemi Kura">Lemi Kura</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Woreda
              </label>
              <Input
                placeholder="e.g. 03"
                value={woreda}
                onChange={(e) => setWoreda(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                House Number
              </label>
              <Input
                placeholder="e.g. 456/A"
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Ownership Type
              </label>
              <select
                value={ownershipType}
                onChange={(e) => setOwnershipType(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
              >
                <option value="Private">Private</option>
                <option value="Government / Kebele">Government / Kebele</option>
                <option value="Commercial Entity">Commercial Entity</option>
              </select>
            </div>
          </div>

          {/* DYNAMIC SPECIFICATIONS FORM */}

          {/* A. Villa / Compound House */}
          {propType === "Villa" && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-900 block">
                Residential Specifications (Villa)
              </span>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Bedrooms</label>
                  <Input
                    type="number"
                    min="0"
                    disabled={isServiceQuarter}
                    value={villaBedrooms}
                    onChange={(e) => setVillaBedrooms(e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Bathrooms</label>
                  <Input
                    type="number"
                    min="1"
                    value={villaBathrooms}
                    onChange={(e) => setVillaBathrooms(e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Living Rooms</label>
                  <Input
                    type="number"
                    min="0"
                    value={villaLivingRooms}
                    onChange={(e) => setVillaLivingRooms(e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Floor Number</label>
                  <Input
                    value={villaFloor}
                    onChange={(e) => setVillaFloor(e.target.value)}
                    placeholder="Ground"
                    className="h-8 text-xs bg-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isServiceQuarter}
                  onChange={(e) => {
                    setIsServiceQuarter(e.target.checked);
                    if (e.target.checked) setVillaBedrooms("1");
                  }}
                  className="w-4 h-4 text-[#00450d] rounded border-slate-300"
                />
                <span>Classify as Single Dormitory (Service Quarter)</span>
              </label>
            </div>
          )}

          {/* B. Apartment / Condominium (Studio, 1-bed, 2-bed, 3-bed only) */}
          {(propType === "Apartment" || propType === "Condominium") && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-900 block">
                {propType} Room Typology
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "studio", label: "Studio" },
                  { id: "1-bed", label: "1 Bed" },
                  { id: "2-bed", label: "2 Beds" },
                  { id: "3-bed", label: "3 Beds" },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRoomTypology(r.id as any)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      roomTypology === r.id
                        ? "bg-[#00450d] text-white border-[#00450d]"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Bathrooms</label>
                  <Input
                    type="number"
                    min="1"
                    value={aptBathrooms}
                    onChange={(e) => setAptBathrooms(e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Floor Level</label>
                  <Input
                    value={aptFloor}
                    onChange={(e) => setAptFloor(e.target.value)}
                    placeholder="3rd Floor"
                    className="h-8 text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* C. Shopping Mall / Single Shop (No Bedrooms!) */}
          {propType === "Shopping Mall" && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-900 block">
                Commercial Specifications (No Bedrooms)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCommercialKind("single-shop")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    commercialKind === "single-shop"
                      ? "bg-[#00450d] text-white border-[#00450d]"
                      : "bg-white text-slate-700 border-slate-200"
                  }`}
                >
                  Single Retail Shop
                </button>
                <button
                  type="button"
                  onClick={() => setCommercialKind("mall")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    commercialKind === "mall"
                      ? "bg-[#00450d] text-white border-[#00450d]"
                      : "bg-white text-slate-700 border-slate-200"
                  }`}
                >
                  Shopping Mall / Plaza
                </button>
              </div>

              {commercialKind === "single-shop" ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Shop House Number <span className="text-[#00450d] font-normal">(Landlord Exclusive)</span>
                  </label>
                  <Input
                    value={shopUnitNumber}
                    onChange={(e) => setShopUnitNumber(e.target.value)}
                    placeholder="e.g. Shop G-12"
                    className="h-8 text-xs bg-white font-bold text-slate-900"
                  />
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Shopping House Units Directory ({modalMallUnits.length} Units)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Landlord can duplicate and assign official shop numbers.
                      </span>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddModalUnit}
                      size="sm"
                      className="h-7 text-[11px] bg-[#00450d] hover:bg-[#1b5e20] text-white gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Unit
                    </Button>
                  </div>

                  <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center gap-2 text-[11px] text-emerald-950">
                    <Lock className="w-3.5 h-3.5 text-[#00450d] shrink-0" />
                    <span><strong>Landlord Exclusive Control:</strong> Edit official shop numbers below and use <strong>Duplicate</strong> to quickly create next units.</span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {modalMallUnits.map((unit, idx) => (
                      <div
                        key={unit.id}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-1">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <Input
                              value={unit.shopNumber}
                              onChange={(e) => handleUpdateModalUnit(idx, "shopNumber", e.target.value)}
                              placeholder="Shop Number"
                              className="h-7 text-xs font-bold text-slate-900 bg-slate-50/70 border-emerald-200 focus:border-[#00450d]"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              onClick={() => handleDuplicateModalUnit(idx)}
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-[11px] text-[#00450d] border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 gap-1 font-semibold"
                              title="Duplicate this unit"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Duplicate</span>
                            </Button>
                            <Button
                              type="button"
                              onClick={() => handleDeleteModalUnit(idx)}
                              disabled={modalMallUnits.length <= 1}
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 disabled:opacity-30"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-0.5">Floor</label>
                            <select
                              value={unit.floorLevel}
                              onChange={(e) => handleUpdateModalUnit(idx, "floorLevel", e.target.value)}
                              className="w-full h-7 px-1.5 rounded border border-slate-200 bg-white text-[11px]"
                            >
                              <option value="Ground Floor">Ground</option>
                              <option value="1st Floor">1st Fl</option>
                              <option value="2nd Floor">2nd Fl</option>
                              <option value="3rd Floor">3rd Fl</option>
                              <option value="Basement">Basement</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 mb-0.5">Area m²</label>
                            <Input
                              type="number"
                              value={unit.area}
                              onChange={(e) => handleUpdateModalUnit(idx, "area", parseFloat(e.target.value) || 0)}
                              className="h-7 text-[11px] bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 mb-0.5">Rent (ETB)</label>
                            <Input
                              type="number"
                              value={unit.rentAmount}
                              onChange={(e) => handleUpdateModalUnit(idx, "rentAmount", parseFloat(e.target.value) || 0)}
                              className="h-7 text-[11px] font-bold text-emerald-900 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 mb-0.5">Trade Category</label>
                            <select
                              value={unit.category}
                              onChange={(e) => handleUpdateModalUnit(idx, "category", e.target.value)}
                              className="w-full h-7 px-1.5 rounded border border-slate-200 bg-white text-[11px]"
                            >
                              <option value="Retail / Boutique">Retail</option>
                              <option value="Pharmacy / Clinic">Pharmacy</option>
                              <option value="Café / Restaurant">Café</option>
                              <option value="Electronics / Telecom">Electronics</option>
                              <option value="Office / Agency">Office</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-2 bg-slate-100 rounded-lg text-xs flex justify-between text-slate-700 font-medium">
                    <span>Total Leasable: <strong>{modalMallTotalArea} m²</strong></span>
                    <span>Gross Rent: <strong className="text-[#00450d]">ETB {modalMallTotalRent.toLocaleString()}/mo</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Area & Price */}
          {!(propType === "Shopping Mall" && commercialKind === "mall") && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Area (m²)
                </label>
                <Input
                  type="number"
                  min="10"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Asking Rent (ETB)
                </label>
                <Input
                  type="number"
                  min="1000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-9 text-xs font-bold"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="h-9 text-xs">
              Cancel
            </Button>
            <Button type="submit" className="bg-[#00450d] hover:bg-[#1b5e20] text-white h-9 text-xs font-semibold">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Save & Register
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterPropertyModal;
