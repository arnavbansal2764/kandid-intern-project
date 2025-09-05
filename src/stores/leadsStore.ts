import { create } from "zustand";

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  position?: string;
  phone?: string;
  linkedinUrl?: string;
  status: "pending" | "contacted" | "responded" | "converted" | "rejected";
  notes?: string;
  lastContactDate?: Date | null;
  campaignId: string;
  campaignName: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadInteraction {
  id: string;
  leadId: string;
  type: "email" | "call" | "meeting" | "note";
  subject?: string;
  content?: string;
  outcome?: string;
  scheduledAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadDetails extends Lead {
  campaignDescription?: string;
  interactions: LeadInteraction[];
}

interface LeadsStore {
  // Side sheet state
  selectedLeadId: string | null;
  isLeadSheetOpen: boolean;
  
  // Filters and search
  searchQuery: string;
  statusFilter: string;
  campaignFilter: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  
  // Actions
  openLeadSheet: (leadId: string) => void;
  closeLeadSheet: () => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setCampaignFilter: (campaign: string) => void;
  setSorting: (sortBy: string, sortOrder: "asc" | "desc") => void;
  resetFilters: () => void;
}

export const useLeadsStore = create<LeadsStore>((set) => ({
  // Initial state
  selectedLeadId: null,
  isLeadSheetOpen: false,
  searchQuery: "",
  statusFilter: "",
  campaignFilter: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  
  // Actions
  openLeadSheet: (leadId) =>
    set({ selectedLeadId: leadId, isLeadSheetOpen: true }),
  
  closeLeadSheet: () =>
    set({ selectedLeadId: null, isLeadSheetOpen: false }),
  
  setSearchQuery: (query) =>
    set({ searchQuery: query }),
  
  setStatusFilter: (status) =>
    set({ statusFilter: status }),
  
  setCampaignFilter: (campaign) =>
    set({ campaignFilter: campaign }),
  
  setSorting: (sortBy, sortOrder) =>
    set({ sortBy, sortOrder }),
  
  resetFilters: () =>
    set({
      searchQuery: "",
      statusFilter: "",
      campaignFilter: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
}));
