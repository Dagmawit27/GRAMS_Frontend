"use client";
import React from "react";
import { ActiveAgreementsListView } from "@/components/agreements/ActiveAgreementsListView";

export default function OfficerActiveAgreementsPage() {
  return (
    <div className="space-y-6">
      <ActiveAgreementsListView
        roleTitle="Woreda Officer"
        baseDetailPath="/officer/office/agreements/active"
      />
    </div>
  );
}
