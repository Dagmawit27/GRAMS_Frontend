// Same-origin by default so the browser talks to Next.js, which rewrites to Spring Boot.
// Avoids CORS and Windows localhost → IPv6 (::1) connection failures.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

async function parseResponse(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new Error(
      "Cannot reach the API. Start the backend on port 8080 and refresh."
    );
  }
}

export interface UserSummary {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  dateOfBirth?: string;
  phoneNumber: string;
  email: string;
  worksOn?: string;
  createdAt: string;
  roles: string[];
  userType: "CITIZEN" | "GOVERNMENT_EMPLOYEE";
  governmentEmployee: boolean;
  employeeNumber?: string;
  positionTitle?: string;
  /** Jurisdiction for government employees */
  subCity?: string;
  woreda?: string;
  /** Citizen specific fields */
  nationalId?: string;
  taxIdentificationNumber?: string;
  tinNumber?: string;
  city?: string;
  houseNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  /** Landlord payout settings (Account 1 - Primary) */
  preferredPaymentMethod?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  /** Account 2 - Secondary */
  bankName2?: string;
  accountNumber2?: string;
  accountHolderName2?: string;
  /** Account 3 - Tertiary */
  bankName3?: string;
  accountNumber3?: string;
  accountHolderName3?: string;
}

export interface AuthResult {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserSummary;
}

export async function registerCitizen(data: {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  worksOn?: string;
  city?: string;
  subCity?: string;
  woreda?: string;
  rolePreference?: string;
  password: string;
}): Promise<AuthResult> {
  const res = await apiFetch(`${BASE_URL}/auth/register/citizen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Registration failed.");
  saveSession(json);
  return json;
}

export async function loginCitizen(data: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const res = await apiFetch(`${BASE_URL}/auth/login/citizen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Invalid credentials.");
  saveSession(json);
  return json;
}

export interface RegisterEmployeePayload {
  employeeNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  phoneNumber: string;
  email: string;
  positionTitle: string;
  subCity: string;
  woreda: string;
  officeType?: string;
  password?: string;
  roles: string[];
}

export async function registerEmployee(
  token: string,
  data: RegisterEmployeePayload
): Promise<AuthResult> {
  const res = await apiFetch(`${BASE_URL}/admin/employees/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Employee registration failed.");
  return json;
}

export async function loginOfficer(data: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const res = await apiFetch(`${BASE_URL}/auth/login/employee`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Invalid officer credentials.");
  // Guard: only WOREDA_OFFICER, WOREDA_SUPERVISOR, or TAX_OFFICER may use this portal
  const roles: string[] = (json.user?.roles ?? []).map((r: string) => r.toUpperCase());
  if (!roles.some((r) => r === "WOREDA_OFFICER" || r === "WOREDA_SUPERVISOR" || r === "TAX_OFFICER")) {
    throw new Error("Access denied. Only Woreda Officers, Supervisors, and Tax Officers may sign in here.");
  }
  saveSession(json);
  return json;
}

export async function getMe(token: string): Promise<UserSummary> {
  try {
    const res = await apiFetch(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await parseResponse(res);
    if (!res.ok) throw new Error("Session expired.");
    return json;
  } catch {
    const session = getSession();
    if (session?.user) return session.user;
    throw new Error("No active session.");
  }
}

export function saveSession(result: AuthResult) {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", result.accessToken);
  localStorage.setItem("user", JSON.stringify(result.user));
  if (result.user.roles && result.user.roles.length > 0) {
    localStorage.setItem("userRole", result.user.roles[0].toLowerCase());
  }
  localStorage.setItem("userType", result.user.userType);
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userType");
}

export function getSession(): { token: string; user: UserSummary } | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("accessToken");
  const raw = localStorage.getItem("user");
  if (!token || !raw) return null;
  try {
    return { token, user: JSON.parse(raw) };
  } catch {
    return null;
  }
}

export function isSessionExpired(): boolean {
  const session = getSession();
  if (!session) return true;
  
  // Check if token exists
  if (!session.token) return true;
  
  // Optional: Check if token is JWT and validate expiration
  try {
    const parts = session.token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp) {
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        return currentTime >= expirationTime;
      }
    }
  } catch (e) {
    // If token is not JWT or parsing fails, assume session is valid
    console.warn("Failed to parse JWT token for expiration check");
  }
  
  return false;
}

export function validateSession(): { valid: boolean; session?: { token: string; user: UserSummary } } {
  if (isSessionExpired()) {
    clearSession();
    return { valid: false };
  }
  
  const session = getSession();
  if (!session) {
    return { valid: false };
  }
  
  return { valid: true, session };
}

// ── Property ─────────────────────────────────────────────────────────────────

export type PropertyStatus =
  | "PENDING"
  | "VERIFIED"
  | "REJECTED"
  | "LISTED"
  | "RENTED"
  | "UNLISTED";

export interface AddressRequest {
  city: string;
  subCity: string;
  woreda: string;
  kebele?: string;
  street?: string;
  houseNumber?: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyRequest {
  propertyType: string;
  address: AddressRequest;
  title?: string;
  houseNumber?: string;
  floorNumber?: string;
  bedroomCount?: number;
  bathroomCount?: number;
  areaSqMeter?: number;
  monthlyRent: number;
  furnishingStatus?: string;
  description?: string;
  ownershipType?: string;
  specificLandmark?: string;
  cadastralParcelId?: string;
  titleDeedNumber?: string;
  advanceRent?: number;
  minLeasePeriod?: string;
  availableFrom?: string;
}

export interface PropertyResponse {
  id: string;
  propertyCode: string;
  propertyType: string;
  title?: string;
  address: {
    id: string;
    city: string;
    subCity: string;
    woreda: string;
    kebele?: string;
    street?: string;
    houseNumber?: string;
    latitude?: number;
    longitude?: number;
  };
  houseNumber?: string;
  floorNumber?: string;
  bedroomCount?: number;
  bathroomCount?: number;
  areaSqMeter?: number;
  monthlyRent: number;
  furnishingStatus?: string;
  description?: string; 
  ownershipType?: string;
  specificLandmark?: string;
  cadastralParcelId?: string;
  titleDeedNumber?: string;
  advanceRent?: number;
  minLeasePeriod?: string;
  availableFrom?: string;
  status: PropertyStatus;
  landlordId?: string;
  landlordName?: string;
  landlordPhone?: string;
  landlordEmail?: string;
  images: { id: string; imageUrl: string; isCover: boolean; uploadedAt: string }[];
  ownershipDocuments: {
    id: string;
    documentNumber: string;
    documentType: string;
    filePath: string;
    issueDate?: string;
    expiryDate?: string;
  }[];
  units?: PropertyUnitResponse[];
  unitsCount?: number;
  createdAt: string;
}

export interface PropertyUnitResponse {
  id: string;
  unitCode: string;
  unitName?: string;
  unitType?: string;
  areaSqMeter?: number;
  status: string;
  rentAmount?: number;
  tenantName?: string;
  floorLevel?: string;
  category?: string;
  shopNumber?: string;
  submeter?: boolean;
  waterSupply?: boolean;
  frontage?: string;
  description?: string;
  name?: string;
  type?: string;
  area?: number;
  tenant?: string;
}

export async function getUnitById(unitId: string, token: string): Promise<PropertyUnitResponse> {
  const response = await fetch(`${BASE_URL}/properties/units/${unitId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch unit details");
  }

  return response.json();
}

export async function registerProperty(
  token: string,
  data: PropertyRequest,
  images?: File[],
  documents?: File[]
): Promise<PropertyResponse> {
  const form = new FormData();
  form.append(
    "property",
    new Blob([JSON.stringify(data)], { type: "application/json" })
  );
  images?.forEach((f) => form.append("images", f));
  documents?.forEach((f) => form.append("documents", f));

  const res = await apiFetch(`${BASE_URL}/properties`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to register property.");
  return json;
}

export async function updateProperty(
  id: string,
  token: string,
  data: PropertyRequest,
  images?: File[],
  documents?: File[]
): Promise<PropertyResponse> {
  const form = new FormData();
  form.append(
    "property",
    new Blob([JSON.stringify(data)], { type: "application/json" })
  );
  images?.forEach((f) => form.append("images", f));
  documents?.forEach((f) => form.append("documents", f));

  const res = await apiFetch(`${BASE_URL}/properties/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to update property.");
  return json;
}

export async function getMyProperties(
  token: string
): Promise<PropertyResponse[]> {
  const res = await apiFetch(`${BASE_URL}/properties/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load properties.");
  return json;
}


export async function updatePropertyStatus(
  token: string,
  id: string,
  status: PropertyStatus,
  remarks?: string
): Promise<PropertyResponse> {
  const res = await apiFetch(`${BASE_URL}/properties/${id}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, remarks }),
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to update status.");
  return json;
}



export async function deleteProperty(
  id: string,
  token: string
): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/properties/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const json = await parseResponse(res);
    throw new Error(json.message || "Failed to delete property.");
  }
}

export async function getListedProperties(): Promise<PropertyResponse[]> {
  const res = await apiFetch(`${BASE_URL}/properties?status=LISTED`);
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load listed properties.");
  return json;
}

export async function getPropertyById(
  id: string,
  token?: string
): Promise<PropertyResponse | null> {
  const res = await apiFetch(`${BASE_URL}/properties/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load property.");
  return json;
}

export async function getPropertyByCode(
  propertyCode: string,
  token?: string
): Promise<PropertyResponse | null> {
  const res = await apiFetch(`${BASE_URL}/properties/code/${propertyCode}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load property.");
  return json;
}

/**
 * Officer/Supervisor version — hits the officer-scoped endpoint so LANDLORD
 * role restriction on GET /properties/my never gets triggered.
 */
export async function getPropertyForOfficer(
  id: string,
  token: string
): Promise<PropertyResponse> {
  const res = await apiFetch(`${BASE_URL}/properties/officer/detail/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load property.");
  return json;
}

export async function getPropertiesByStatus(
  status: PropertyStatus = "LISTED",
  token?: string
): Promise<PropertyResponse[]> {
  const res = await apiFetch(`${BASE_URL}/properties?status=${status}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load properties.");
  return json;
}

export async function getPropertiesByJurisdiction(
  token: string,
  subCity: string,
  woreda: string,
  status: PropertyStatus = "PENDING"
): Promise<PropertyResponse[]> {
  const params = new URLSearchParams({ subCity, woreda, status });
  const res = await apiFetch(`${BASE_URL}/properties/jurisdiction?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load jurisdiction properties.");
  return json;
}

// ── Location reference data ───────────────────────────────────────────────────

export interface SubCityDto {
  subCity: string;
  woredas: string[];
}

/** Returns all Addis Ababa sub-cities with their woredas. Public — no auth needed. */
export async function getSubCities(): Promise<SubCityDto[]> {
  const res = await apiFetch(`${BASE_URL}/locations/sub-cities`);
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load location data.");
  return json;
}

/** Returns woredas for a specific sub-city. Public. */
export async function getWoredas(subCity: string): Promise<string[]> {
  const res = await apiFetch(`${BASE_URL}/locations/sub-cities/${encodeURIComponent(subCity)}/woredas`);
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load woredas.");
  return json;
}

/** Validates that a sub-city + woreda combo is recognised. Public. */
export async function validateJurisdiction(subCity: string, woreda: string): Promise<boolean> {
  const params = new URLSearchParams({ subCity, woreda });
  const res = await apiFetch(`${BASE_URL}/locations/validate?${params}`);
  const json = await parseResponse(res);
  if (!res.ok) return false;
  return json.valid === true;
}

// ── Lease Request API ─────────────────────────────────────────────────────────

export interface LeaseRequestRequest {
  propertyId: string;
  unitId?: string;
  proposedRent: number;
  leaseDurationMonths: number;
  applicantNotes?: string;
}

export interface LeaseRequestResponse {
  id: string;
  requestCode: string;
  propertyCode: string;
  propertyTitle: string;
  propertyType: string;
  propertySubCity: string;
  propertyWoreda: string;
  propertyImage: string;
  propertyImages: string[];
  unitCode?: string;
  unitNumber?: string;
  area?: number;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  applicantNationalId?: string;
  applicantEmployment?: string;
  applicantCity: string;
  applicantSubCity: string;
  applicantWoreda: string;
  landlordName: string;
  landlordEmail: string;
  landlordPhone?: string;
  landlordCity?: string;
  landlordSubCity?: string;
  landlordWoreda?: string;
  proposedRent: number;
  securityDeposit: number;
  leaseDurationMonths: number;
  startDate: string;
  endDate: string;
  applicantNotes?: string;
  landlordRemarks?: string;
  status: "PENDING" | "LANDLORD_APPROVED" | "UNDER_VERIFICATION" | "PENDING_SUPERVISOR_APPROVAL" | "SUPERVISOR_APPROVED" | "REJECTED" | "CANCELLED" | "EXPIRED" | "APPROVED";
  createdAt: string;
  reviewedAt?: string;
  expiresAt?: string;
  leaseDuration?: string;
  landlordSigned?: boolean;
  tenantSigned?: boolean;
  supervisorSigned?: boolean;
  landlordSignedAt?: string;
  tenantSignedAt?: string;
  supervisorSignedAt?: string;
  propertyLocation?: string;
  propertyCity?: string;
  propertySpecificPlace?: string;
  propertyHouseNo?: string;
}

export interface LeaseStatusUpdateRequest {
  newStatus: "LANDLORD_APPROVED" | "REJECTED";
  remarks?: string;
}

export async function submitLeaseRequest(
  token: string,
  request: LeaseRequestRequest
): Promise<LeaseRequestResponse> {
  const res = await apiFetch(`${BASE_URL}/lease-requests`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to submit lease request.");
  return json;
}

export async function getMyLeaseRequests(token: string): Promise<LeaseRequestResponse[]> {
  const res = await apiFetch(`${BASE_URL}/lease-requests/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load lease requests.");
  return json;
}

export async function getLandlordLeaseRequests(token: string): Promise<LeaseRequestResponse[]> {
  const res = await apiFetch(`${BASE_URL}/lease-requests/landlord`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load lease requests.");
  return json;
}

export async function getLeaseRequestById(token: string, requestCode: string): Promise<LeaseRequestResponse> {
  const res = await apiFetch(`${BASE_URL}/lease-requests/${requestCode}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load lease request.");
  return json;
}

export async function updateLeaseRequestStatus(
  token: string,
  requestCode: string,
  request: LeaseStatusUpdateRequest
): Promise<LeaseRequestResponse> {
  const res = await apiFetch(`${BASE_URL}/lease-requests/${requestCode}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to update lease request status.");
  return json;
}

export async function acceptLeaseRequest(token: string, requestCode: string, remarks?: string): Promise<LeaseRequestResponse> {
  return updateLeaseRequestStatus(token, requestCode, { newStatus: "LANDLORD_APPROVED", remarks });
}

export async function declineLeaseRequest(token: string, requestCode: string, remarks?: string): Promise<LeaseRequestResponse> {
  return updateLeaseRequestStatus(token, requestCode, { newStatus: "REJECTED", remarks });
}

export async function cancelLeaseRequest(token: string, requestCode: string): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/lease-requests/${requestCode}/cancel`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to cancel lease request.");
}

export async function deleteLeaseRequest(token: string, requestCode: string): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/lease-requests/${requestCode}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to delete lease request.");
}

export async function signAgreementWithPassword(token: string, requestCode: string, password: string): Promise<LeaseRequestResponse> {
  const res = await apiFetch(`${BASE_URL}/lease-requests/${requestCode}/sign-password`, {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain"
    },
    body: password,
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to sign agreement with password.");
  return json;
}

export async function signAgreementWithOtp(token: string, requestCode: string, otp: string): Promise<LeaseRequestResponse> {
  const res = await apiFetch(`${BASE_URL}/lease-requests/${requestCode}/sign-otp`, {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain"
    },
    body: otp,
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to sign agreement with OTP.");
  return json;
}

export async function verifyLeaseRequest(token: string, requestCode: string): Promise<LeaseRequestResponse> {
  const res = await apiFetch(`${BASE_URL}/lease-requests/${requestCode}/verify`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to verify lease request.");
  return json;
}

export async function approveLeaseRequest(token: string, requestCode: string): Promise<LeaseRequestResponse> {
  const res = await apiFetch(`${BASE_URL}/lease-requests/${requestCode}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to approve lease request.");
  return json;
}

export async function getLeaseRequestsByStatus(token: string, status: string): Promise<LeaseRequestResponse[]> {
  const res = await apiFetch(`${BASE_URL}/lease-requests/status/${status}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to get lease requests by status.");
  return json;
}

// Notification API functions
export interface NotificationResponse {
  id: string;
  recipientUserId: string;
  type: "LEASE_REQUEST" | "LEASE_APPROVED" | "LEASE_REJECTED" | "LEASE_CANCELLED" | "PAYMENT" | "AGREEMENT" | "MAINTENANCE" | "SYSTEM";
  module: string;
  entityId: string;
  message: string;
  channel: "EMAIL" | "SMS" | "IN_APP" | "PUSH";
  read: boolean;
  createdAt: string;
}

export async function getNotifications(token: string, page: number = 0, size: number = 20): Promise<{ content: NotificationResponse[]; totalElements: number }> {
  const res = await apiFetch(`${BASE_URL}/notifications?page=${page}&size=${size}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.error || json.message || "Failed to load notifications.");
  return json;
}

export async function getUnreadNotificationCount(token: string): Promise<{ unreadCount: number }> {
  const res = await apiFetch(`${BASE_URL}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load unread count.");
  return json;
}

export async function markNotificationAsRead(token: string, id: string): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/notifications/${id}/read`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to mark notification as read.");
}

export async function markAllNotificationsAsRead(token: string): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/notifications/read-all`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to mark all notifications as read.");
}

export async function getPendingRequestsForProperty(
  token: string,
  propertyId: string
): Promise<LeaseRequestResponse[]> {
  const res = await apiFetch(`${BASE_URL}/lease-requests/property/${propertyId}/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load pending requests.");
  return json;
}

export async function getPendingRequestsForUnit(
  token: string,
  unitId: string
): Promise<LeaseRequestResponse[]> {
  const res = await apiFetch(`${BASE_URL}/lease-requests/unit/${unitId}/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load pending requests.");
  return json;
}

// Agreement Module API types & functions
export interface AgreementResponse {
  id: string;
  agreementNumber: string;
  requestCode: string;
  leaseRequestId: string;

  propertyId: string;
  propertyCode: string;
  propertyTitle: string;
  propertyType: string;
  propertySubCity?: string;
  propertyWoreda?: string;
  unitId?: string;
  unitCode?: string;
  unitNumber?: string;

  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  tenantSubCity?: string;
  tenantWoreda?: string;

  landlordId: string;
  landlordName: string;
  landlordEmail: string;
  landlordPhone: string;
  landlordSubCity?: string;
  landlordWoreda?: string;
  landlordPreferredPaymentMethod?: string;
  landlordBankName?: string;
  landlordAccountNumber?: string;
  landlordAccountHolderName?: string;
  landlordBankName2?: string;
  landlordAccountNumber2?: string;
  landlordAccountHolderName2?: string;
  landlordBankName3?: string;
  landlordAccountNumber3?: string;
  landlordAccountHolderName3?: string;

  monthlyRent: number;
  securityDeposit: number;
  advancePaymentMonths: number;
  leaseDurationMonths: number;
  contractDate: string;
  startDate?: string;
  endDate?: string;
  monthlyPaymentDueDay: number;
  utilitiesPaidBy: string;
  propertyCondition: string;
  propertyOwnershipType?: string;
  status: string;
  totalMonthsPaid?: number;
  paidThroughDate?: string;
  nextPaymentDueDate?: string;
  cancellationRequestedAt?: string;
  cancellationRequestedByLandlord?: boolean;

  landlordSigned: boolean;
  landlordSignedAt?: string;
  landlordSignature?: string;
  tenantSigned: boolean;
  tenantSignedAt?: string;
  tenantSignature?: string;
  officerVerified: boolean;
  officerVerifiedAt?: string;
  officerEmail?: string;
  supervisorApproved: boolean;
  supervisorApprovedAt?: string;
  supervisorEmail?: string;

  createdAt: string;
  updatedAt?: string;
}

export async function getMyAgreements(token: string): Promise<AgreementResponse[]> {
  const res = await apiFetch(`${BASE_URL}/agreements/my-agreements`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load agreements.");
  return json;
}

export async function getLandlordAgreements(token: string): Promise<AgreementResponse[]> {
  const res = await apiFetch(`${BASE_URL}/agreements/landlord`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load landlord agreements.");
  return json;
}

export async function getTenantAgreements(token: string): Promise<AgreementResponse[]> {
  const res = await apiFetch(`${BASE_URL}/agreements/tenant`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load tenant agreements.");
  return json;
}

export async function getAgreementByNumber(token: string, agreementNumber: string): Promise<AgreementResponse> {
  const res = await apiFetch(`${BASE_URL}/agreements/${agreementNumber}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load agreement.");
  return json;
}

export async function getAgreementByRequestCode(token: string, requestCode: string): Promise<AgreementResponse> {
  const res = await apiFetch(`${BASE_URL}/agreements/by-request/${requestCode}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load agreement.");
  return json;
}

export async function getAllActiveAgreements(token: string): Promise<AgreementResponse[]> {
  const res = await apiFetch(`${BASE_URL}/agreements/active`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load active agreements.");
  return json;
}

export async function renewAgreement(token: string, agreementNumber: string): Promise<{ message: string }> {
  const res = await apiFetch(`${BASE_URL}/agreements/${encodeURIComponent(agreementNumber)}/renew`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to renew agreement.");
  return json;
}

export async function requestAgreementCancellation(token: string, agreementNumber: string): Promise<{ message: string }> {
  const res = await apiFetch(`${BASE_URL}/agreements/${encodeURIComponent(agreementNumber)}/request-cancellation`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to request agreement cancellation.");
  return json;
}

export async function acceptAgreementCancellation(token: string, agreementNumber: string): Promise<{ message: string }> {
  const res = await apiFetch(`${BASE_URL}/agreements/${encodeURIComponent(agreementNumber)}/accept-cancellation`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to accept cancellation.");
  return json;
}

export async function tenantCancelAgreement(token: string, agreementNumber: string): Promise<{ message: string }> {
  const res = await apiFetch(`${BASE_URL}/agreements/${encodeURIComponent(agreementNumber)}/tenant-cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to cancel agreement.");
  return json;
}

export interface PayoutSettingsPayload {
  tinNumber?: string;
  bankName: string;
  accountNumber: string;
  accountHolderName?: string;
  preferredPaymentMethod?: string;
  bankName2?: string;
  accountNumber2?: string;
  accountHolderName2?: string;
  bankName3?: string;
  accountNumber3?: string;
  accountHolderName3?: string;
}

export async function updatePayoutSettings(
  token: string,
  data: PayoutSettingsPayload
): Promise<UserSummary> {
  const res = await apiFetch(`${BASE_URL}/users/payout-settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to update payout settings.");
  
  // Update local session user object if available
  const session = getSession();
  if (session && session.user) {
    if (data.tinNumber) {
      session.user.tinNumber = data.tinNumber;
    }
    session.user.bankName = data.bankName;
    session.user.accountNumber = data.accountNumber;
    session.user.accountHolderName = data.accountHolderName;
    session.user.preferredPaymentMethod = data.preferredPaymentMethod || data.bankName;
    session.user.bankName2 = data.bankName2;
    session.user.accountNumber2 = data.accountNumber2;
    session.user.accountHolderName2 = data.accountHolderName2;
    session.user.bankName3 = data.bankName3;
    session.user.accountNumber3 = data.accountNumber3;
    session.user.accountHolderName3 = data.accountHolderName3;
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(session.user));
    }
  }

  return json;
}

export interface UpdateUserProfilePayload {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  subCity?: string;
  woreda?: string;
  houseNumber?: string;
  worksOn?: string;
  tinNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export async function updateUserProfile(
  token: string,
  data: UpdateUserProfilePayload
): Promise<UserSummary> {
  const res = await apiFetch(`${BASE_URL}/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to update profile.");

  const session = getSession();
  if (session && session.user) {
    Object.assign(session.user, data);
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(session.user));
    }
  }
  return json;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export async function changePassword(
  token: string,
  data: ChangePasswordPayload
): Promise<{ message: string }> {
  const res = await apiFetch(`${BASE_URL}/users/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to change password.");
  return json;
}

export interface NotificationPreferenceDto {
  id?: string;
  userId: string;
  type: string;
  enabledChannels: string[];
}

export async function getNotificationPreferences(
  token: string
): Promise<NotificationPreferenceDto[]> {
  const res = await apiFetch(`${BASE_URL}/notifications/preferences`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load notification preferences.");
  return Array.isArray(json) ? json : [];
}

export async function updateNotificationPreference(
  token: string,
  data: { type: string; enabledChannels: string[] }
): Promise<NotificationPreferenceDto> {
  const res = await apiFetch(`${BASE_URL}/notifications/preferences`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to update notification preference.");
  return json;
}

// ── Payment API (Chapa Gateway) ──────────────────────────────────────────────

export interface PaymentInitiateRequest {
  requestCode: string;
  amount?: number;
  phoneNumber?: string;
  paymentMethod?: string;
  destinationBankName?: string;
  destinationAccountNumber?: string;
  destinationAccountHolderName?: string;
}

export interface PaymentInitiateResponse {
  txRef: string;
  checkoutUrl: string;
  amount: number;
  currency: string;
  status: string;
  requestCode: string;
  agreementNumber: string;
  propertyTitle: string;
  landlordName: string;
  landlordBankName: string;
  landlordAccountNumber: string;
  landlordAccountHolderName?: string;
  sandboxMode: boolean;
}

export interface PaymentResponseDto {
  id: string;
  txRef: string;
  chapaReference?: string;
  agreementId?: string;
  agreementNumber: string;
  requestCode: string;
  propertyTitle: string;
  tenantName: string;
  tenantEmail: string;
  landlordName: string;
  landlordEmail: string;
  landlordBankName: string;
  landlordAccountNumber: string;
  landlordAccountHolderName?: string;
  amount: number;
  taxAmount: number;
  netLandlordAmount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  paymentMethod?: string;
  checkoutUrl?: string;
  paymentDate?: string;
  createdAt: string;
}

export async function initializePayment(
  token: string,
  data: PaymentInitiateRequest
): Promise<PaymentInitiateResponse> {
  const res = await apiFetch(`${BASE_URL}/payments/initialize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to initialize payment.");
  return json;
}

export async function verifyPayment(
  token: string,
  txRef: string
): Promise<PaymentResponseDto> {
  const res = await apiFetch(`${BASE_URL}/payments/verify/${encodeURIComponent(txRef)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to verify payment.");
  return json;
}

export async function getPaymentsForAgreement(
  token: string,
  identifier: string
): Promise<PaymentResponseDto[]> {
  const res = await apiFetch(`${BASE_URL}/payments/agreement/${encodeURIComponent(identifier)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to fetch agreement payments.");
  return json;
}

export async function getMyPayments(
  token: string
): Promise<PaymentResponseDto[]> {
  const res = await apiFetch(`${BASE_URL}/payments/my-payments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to fetch user payments.");
  return Array.isArray(json) ? json : [];
}

// -------------------------------------------------------------
// Schedule B Rental Income Tax API
// -------------------------------------------------------------
export interface AgreementTaxBreakdown {
  agreementId: string;
  agreementNumber: string;
  requestCode: string;
  propertyCode: string;
  propertyTitle: string;
  tenantName: string;
  tenantTin: string;
  monthlyRent: number;
  monthsCounted: number;
  grossIncome: number;
  accruedTaxContribution: number;
  status: string;
}

export interface MonthlyTaxAccrual {
  ethiopianMonth: string;
  gregorianMonth: string;
  rentalIncome: number;
  accruedTax: number;
  isSummerSettlementMonth: boolean;
  isSettled: boolean;
}

export interface TaxSummaryResponse {
  fiscalYear: string;
  taxpayerName: string;
  tinNumber: string;
  totalGrossRentalIncome: number;
  totalEstimatedAnnualTax: number;
  effectiveTaxRate: number;
  netIncomeAfterTax: number;
  taxBracketPercentage: number;
  totalMonthsPaid: number;
  totalAgreementsCount?: number;
  totalContractedMonthlyRent?: number;
  projectedAnnualGrossIncome?: number;
  filingStatus: string;
  summerFilingDeadline: string;
  isSummerWindowOpen: boolean;
  clearanceCertificateNumber?: string;
  settledAt?: string;
  agreements: AgreementTaxBreakdown[];
  monthlyAccruals: MonthlyTaxAccrual[];
  legalProclamationNotice: string;
}

export interface TaxSettlementPayload {
  fiscalYear?: string;
  amount: number;
  paymentMethod?: string;
  payerPhoneNumber?: string;
  taxpayerTin?: string;
}

export interface TaxSettlementResponse {
  status: string;
  clearanceCertificateNumber: string;
  amountPaid: number;
  fiscalYear: string;
  taxpayerName: string;
  taxpayerTin: string;
  paymentMethod: string;
  settledAt: string;
  receiptPdfUrl: string;
  message: string;
}

export async function getRentalTaxSummary(token: string): Promise<TaxSummaryResponse> {
  const res = await apiFetch(`${BASE_URL}/tax/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.error || json.message || "Failed to load tax summary.");
  return json;
}

export async function settleAnnualRentalTax(token: string, payload: TaxSettlementPayload): Promise<TaxSettlementResponse> {
  const res = await apiFetch(`${BASE_URL}/tax/settle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.error || json.message || "Failed to settle annual tax.");
  return json;
}

