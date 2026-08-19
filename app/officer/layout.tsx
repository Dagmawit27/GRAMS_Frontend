import React from "react";
import { CitizenProvider } from "@/hooks/useCitizenData";

export const OfficerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <CitizenProvider>{children}</CitizenProvider>;
};

export default OfficerLayout;
