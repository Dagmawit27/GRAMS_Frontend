import React from "react";
import { CitizenProvider } from "@/hooks/useCitizenData";
import "@/app/globals.css";

export const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CitizenProvider>
      <div className="min-h-screen font-sans antialiased">
        {children}
      </div>
    </CitizenProvider>
  );
};

export default RootLayout;
