"use client";
import React from "react";
import { ActiveAgreementsListView } from "@/components/agreements/ActiveAgreementsListView";

export default function SupervisorActiveAgreementsPage() {
  return (
    <div className="space-y-6">
      <ActiveAgreementsListView
        roleTitle="Woreda Supervisor"
        baseDetailPath="/officer/supervisor/agreements/active"
      />
    </div>
  );
}
