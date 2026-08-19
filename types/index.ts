export type NavPage = 
  | 'dashboard' 
  | 'search' 
  | 'agreements' 
  | 'properties' 
  | 'register-property'
  | 'payments' 
  | 'bills' 
  | 'citizen'
  | 'profile';

export type UserRole = 'landlord' | 'tenant';

export interface Property {
  id: string;
  title: string;
  type: 'Apartment' | 'Villa' | 'Condominium' | 'Commercial';
  price: number; // in ETB
  location: string;
  subCity: string;
  woreda?: string;
  houseNo?: string;
  bedrooms?: number;
  bathrooms?: number;
  area: number; // sq m
  floor?: string;
  status: 'Available' | 'Rented' | 'Under Maintenance';
  verified: boolean;
  featuredImage: string;
  galleryImages: string[];
  description: string;
  amenities: string[];
  securityDepositMonths: number;
  minLeasePeriod: string;
  utilitiesIncluded: boolean;
  availableFrom: string;
  landlordName?: string;
  tenantName?: string;
  unitsCount?: number;
  units?: PropertyUnit[];
}

export interface PropertyUnit {
  id: string;
  unitCode: string;
  name: string;
  type: string;
  area: number;
  status: 'Rented' | 'Available' | 'Reserved';
  rentAmount?: number;
  tenant?: string;
  floorLevel?: string;
  category?: string;
  shopNumber?: string;
  submeter?: boolean;
  waterSupply?: boolean;
  frontage?: string;
}

export interface LeaseRequest {
  id: string;
  requestCode: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyType?: string;
  propertyImage?: string;
  unitNumber?: string;
  area?: number;
  role: 'Landlord' | 'Tenant App';
  counterpartyName: string;
  counterpartyInitials?: string;
  counterpartyRole?: 'Tenant' | 'Landlord';
  proposedRent: number;
  securityDeposit?: number;
  leaseDuration?: string;
  startDate?: string;
  endDate?: string;
  status: 'Pending Review' | 'Accepted' | 'Declined' | 'Ready to Sign' | 'Awaiting Approval';
  dateSubmitted: string;
  notes?: string;
  statusNote?: string;
  declineReason?: string;
  tenantNationalId?: string;
  tenantPhone?: string;
  tenantEmail?: string;
  tenantEmployment?: string;
  tenantVerified?: boolean;
  landlordName?: string;
  landlordInitials?: string;
  landlordSigned?: boolean;
  landlordSignedDate?: string;
  landlordSignatureHash?: string;
  landlordIpAddress?: string;
  tenantSigned?: boolean;
  tenantSignedDate?: string;
  tenantSignatureHash?: string;
}

export interface RentalAgreement {
  id: string;
  agreementCode: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyImage?: string;
  unitNumber?: string;
  area?: number;
  counterpartyName: string;
  counterpartyInitials: string;
  counterpartyRole: 'Tenant' | 'Landlord';
  startDate: string;
  endDate: string;
  monthlyRent: number;
  status: 'Active' | 'Expired' | 'Terminated' | 'Pending';
  depositAmount: number;
  termsSummary: string;
  landlordName?: string;
  tenantName?: string;
  landlordSigned?: boolean;
  tenantSigned?: boolean;
  landlordSignedDate?: string;
  tenantSignedDate?: string;
  landlordSignatureHash?: string;
  tenantSignatureHash?: string;
}

export interface Invoice {
  id: string;
  invoiceCode: string;
  propertyTitle: string;
  dueDate: string;
  baseRent: number;
  waterUtility: number;
  electricityMaintenance: number;
  latePenalty: number;
  totalAmount: number;
  status: 'Overdue' | 'Pending' | 'Future' | 'Paid';
  period: string;
}

export interface Receipt {
  id: string;
  receiptCode: string;
  date: string;
  propertyName: string;
  paymentMethod: 'Telebirr' | 'CBE Transfer' | 'Bank Transfer' | 'Awash Birr';
  amount: number;
  status: 'Paid';
  transactionRef: string;
  payerName: string;
  taxRegistrationNumber: string;
}

export interface ActivityNotification {
  id: string;
  type: 'payment' | 'agreement' | 'maintenance' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  linkPage?: NavPage;
}
