"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLeadsStore } from "@/stores/leadsStore";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";

interface LeadDetails {
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
  campaignDescription?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  interactions: LeadInteraction[];
}

interface LeadInteraction {
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

const statusOptions = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "contacted", label: "Contacted", color: "bg-blue-100 text-blue-800" },
  { value: "responded", label: "Responded", color: "bg-purple-100 text-purple-800" },
  { value: "converted", label: "Converted", color: "bg-green-100 text-green-800" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
];

const interactionTypeIcons = {
  email: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  call: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  meeting: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  note: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
};

async function fetchLeadDetails(leadId: string): Promise<LeadDetails> {
  const response = await fetch(`/api/leads/${leadId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch lead details");
  }
  const data = await response.json();
  
  // Convert date strings to Date objects
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    lastContactDate: data.lastContactDate ? new Date(data.lastContactDate) : null,
    interactions: data.interactions.map((interaction: any) => ({
      ...interaction,
      createdAt: new Date(interaction.createdAt),
      updatedAt: new Date(interaction.updatedAt),
      scheduledAt: interaction.scheduledAt ? new Date(interaction.scheduledAt) : null,
      completedAt: interaction.completedAt ? new Date(interaction.completedAt) : null,
    })),
  };
}

async function updateLeadStatus(leadId: string, status: string) {
  const response = await fetch(`/api/leads/${leadId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update lead status");
  }
  
  return response.json();
}

export function LeadDetailSheet() {
  const { selectedLeadId, isLeadSheetOpen, closeLeadSheet } = useLeadsStore();
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: leadDetails, isLoading, isError, error } = useQuery({
    queryKey: ["lead-details", selectedLeadId],
    queryFn: () => fetchLeadDetails(selectedLeadId!),
    enabled: !!selectedLeadId,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateLeadStatus(selectedLeadId!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-details", selectedLeadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  useEffect(() => {
    if (leadDetails) {
      setSelectedStatus(leadDetails.status);
    }
  }, [leadDetails]);

  // Handle ESC key and body scroll lock
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isLeadSheetOpen) {
        closeLeadSheet();
      }
    };

    if (isLeadSheetOpen) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      document.addEventListener("keydown", handleEscKey);
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isLeadSheetOpen, closeLeadSheet]);

  const handleStatusUpdate = () => {
    if (selectedStatus !== leadDetails?.status) {
      statusMutation.mutate(selectedStatus);
    }
  };

  const handleContact = () => {
    // In a real app, this would open an email client or communication tool
    if (leadDetails?.email) {
      window.open(`mailto:${leadDetails.email}`, '_blank');
    }
  };

  return (
    <div className="relative">
      {/* Backdrop with blur animation - covers entire viewport */}
      <div
        className={`fixed inset-0 transition-all duration-300 ease-out ${
          isLeadSheetOpen ? 'backdrop-blur-md bg-black/40 z-[9998] opacity-100' : 'backdrop-blur-none bg-transparent z-[9998] opacity-0 pointer-events-none'
        }`}
        onClick={isLeadSheetOpen ? closeLeadSheet : undefined}
      />

      {/* Side Sheet with slide animation - always rendered for smooth animation */}
      <div 
        className={`fixed inset-y-0 right-0 bg-white shadow-2xl z-[9999] transition-transform duration-500 ease-out ${
          isLeadSheetOpen ? 'w-full max-w-2xl translate-x-0' : 'w-full max-w-2xl translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Lead Details</h2>
            <button
              onClick={closeLeadSheet}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scroll-smooth">
            {!selectedLeadId ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">Select a lead to view details</p>
              </div>
            ) : (
              <>
                {isLoading && (
                  <div className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                )}

                {isError && (
                  <div className="p-6 text-center">
                    <div className="text-red-600 mb-4">
                      Error loading lead details: {error?.message}
                    </div>
                    <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["lead-details", selectedLeadId] })}>
                      Try Again
                    </Button>
                  </div>
                )}

                {leadDetails && (
              <div className="p-6 space-y-6 transition-all duration-200 ease-in-out">
                {/* Lead Info */}
                <div>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {leadDetails.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{leadDetails.name}</h3>
                      {leadDetails.position && (
                        <p className="text-gray-600">{leadDetails.position}</p>
                      )}
                      <p className="text-lg text-gray-800">{leadDetails.company}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                      <a
                        href={`mailto:${leadDetails.email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {leadDetails.email}
                      </a>
                    </div>
                    {leadDetails.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                        <a
                          href={`tel:${leadDetails.phone}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {leadDetails.phone}
                        </a>
                      </div>
                    )}
                    {leadDetails.linkedinUrl && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">LinkedIn</label>
                        <a
                          href={leadDetails.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Profile
                        </a>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Last Contact</label>
                      <p className="text-gray-900">
                        {leadDetails.lastContactDate
                          ? leadDetails.lastContactDate.toLocaleDateString()
                          : "Never"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Campaign Info */}
                <div className="bg-gray-50 rounded-lg p-4 transition-all duration-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Campaign</h4>
                  <p className="text-lg text-gray-800 font-medium">{leadDetails.campaignName}</p>
                  {leadDetails.campaignDescription && (
                    <p className="text-gray-600 mt-2 leading-relaxed text-sm whitespace-pre-wrap break-words">
                      {leadDetails.campaignDescription}
                    </p>
                  )}
                </div>

                {/* Status Management */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-3">Status Management</h4>
                  <div className="flex items-center gap-3 mb-4">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={handleStatusUpdate}
                      disabled={selectedStatus === leadDetails.status || statusMutation.isPending}
                      isLoading={statusMutation.isPending}
                    >
                      Update
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Current Status:</span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusOptions.find(opt => opt.value === leadDetails.status)?.color
                      }`}
                    >
                      {statusOptions.find(opt => opt.value === leadDetails.status)?.label}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {leadDetails.notes && (
                  <div className="transition-all duration-200 ease-in-out">
                    <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 transition-colors hover:bg-gray-100">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                        {leadDetails.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Interaction History */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Interaction History</h4>
                  <div className="space-y-4">
                    {leadDetails.interactions.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No interactions yet</p>
                    ) : (
                      leadDetails.interactions.map((interaction) => (
                        <div key={interaction.id} className="border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:shadow-sm hover:border-gray-300">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                              {interactionTypeIcons[interaction.type]}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900">
                                  {interaction.subject || `${interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)} Interaction`}
                                </h5>
                                <span className="text-sm text-gray-500">
                                  {interaction.completedAt?.toLocaleDateString()}
                                </span>
                              </div>
                              {interaction.content && (
                                <p className="text-gray-700 mb-2 leading-relaxed whitespace-pre-wrap break-words">
                                  {interaction.content}
                                </p>
                              )}
                              {interaction.outcome && (
                                <p className="text-sm text-green-600 font-medium leading-relaxed whitespace-pre-wrap break-words">
                                  Outcome: {interaction.outcome}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          {leadDetails && selectedLeadId && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex gap-3">
                <Button onClick={handleContact} className="flex-1">
                  Contact Lead
                </Button>
                <Button variant="outline" onClick={closeLeadSheet}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
