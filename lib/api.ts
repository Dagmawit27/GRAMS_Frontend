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
  // Guard: only WOREDA_OFFICER or WOREDA_SUPERVISOR may use this portal
  const roles: string[] = (json.user?.roles ?? []).map((r: string) => r.toUpperCase());
  if (!roles.some((r) => r === "WOREDA_OFFICER" || r === "WOREDA_SUPERVISOR")) {
    throw new Error("Access denied. Only Woreda Officers and Supervisors may sign in here.");
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
  securityDepositMonths?: number;
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
  securityDepositMonths?: number;
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
  units: {
    id: string;
    unitCode: string;
    unitName: string;
    unitType: string;
    areaSqMeter: number;
    status: string;
    rentAmount: number;
    tenantName: string;
    floorLevel: string;
    category: string;
    shopNumber: string;
    submeter: boolean;
    waterSupply: boolean;
    frontage: string;
    description: string;
  }[];
  createdAt: string;
}

export interface PropertyUnitResponse {
  id: string;
  unitCode: string;
  unitName: string;
  unitType: string;
  areaSqMeter: number;
  status: string;
  rentAmount: number;
  tenantName: string;
  floorLevel: string;
  category: string;
  shopNumber: string;
  submeter: boolean;
  waterSupply: boolean;
  frontage: string;
  description: string;
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
  propertyId: string;
  propertyCode: string;
  propertyTitle: string;
  propertyType: string;
  propertyLocation: string;
  propertyImage: string;
  propertyImages: string[];
  unitId?: string;
  unitCode?: string;
  unitNumber?: string;
  area?: number;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  applicantNationalId?: string;
  applicantEmployment?: string;
  landlordId: string;
  landlordName: string;
  landlordEmail: string;
  proposedRent: number;
  securityDeposit: number;
  leaseDurationMonths: number;
  startDate: string;
  endDate: string;
  applicantNotes?: string;
  landlordRemarks?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "EXPIRED";
  createdAt: string;
  reviewedAt?: string;
  expiresAt?: string;
}

export interface LeaseStatusUpdateRequest {
  status: "APPROVED" | "REJECTED";
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

export async function getLeaseRequestById(token: string, id: string): Promise<LeaseRequestResponse> {
  const res = await apiFetch(`${BASE_URL}/lease-requests/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to load lease request.");
  return json;
}

export async function updateLeaseRequestStatus(
  token: string,
  id: string,
  request: LeaseStatusUpdateRequest
): Promise<LeaseRequestResponse> {
  const res = await apiFetch(`${BASE_URL}/lease-requests/${id}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const json = await parseResponse(res);
  if (!res.ok) throw new Error(json.message || "Failed to update lease request status.");
  return json;
}

export async function cancelLeaseRequest(token: string, id: string): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/lease-requests/${id}/cancel`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to cancel lease request.");
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
