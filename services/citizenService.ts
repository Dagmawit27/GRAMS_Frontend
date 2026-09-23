import { Property, RentalAgreement, Invoice, Receipt, LeaseRequest } from "@/types";
import {
  INITIAL_PROPERTIES,
  INITIAL_AGREEMENTS,
  INITIAL_INVOICES,
  INITIAL_LEASE_REQUESTS,
} from "@/data/mockData";

export const CitizenService = {
  getProperties: async (): Promise<Property[]> => {
    return Promise.resolve(INITIAL_PROPERTIES);
  },

  getAgreements: async (): Promise<RentalAgreement[]> => {
    return Promise.resolve(INITIAL_AGREEMENTS);
  },

  getInvoices: async (): Promise<Invoice[]> => {
    return Promise.resolve(INITIAL_INVOICES);
  },

  getReceipts: async (): Promise<Receipt[]> => {
    return Promise.resolve([]);
  },

  getLeaseRequests: async (): Promise<LeaseRequest[]> => {
    return Promise.resolve(INITIAL_LEASE_REQUESTS);
  },
};
