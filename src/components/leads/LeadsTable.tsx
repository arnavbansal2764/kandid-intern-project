"use client";

import { useLeads } from "@/hooks/useLeads";
import { useLeadsStore } from "@/stores/leadsStore";
import { useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  contacted: "bg-blue-100 text-blue-800",
  responded: "bg-purple-100 text-purple-800",
  converted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const statusLabels = {
  pending: "Pending",
  contacted: "Contacted",
  responded: "Responded",
  converted: "Converted",
  rejected: "Rejected",
};

function LoadingSkeleton() {
  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[...Array(7)].map((_, i) => (
                <th key={i} className="px-6 py-3">
                  <div className="h-3 bg-gray-300 rounded animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(10)].map((_, i) => (
              <tr key={i}>
                {[...Array(7)].map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LeadsTable() {
  const {
    searchQuery,
    statusFilter,
    campaignFilter,
    sortBy,
    sortOrder,
    openLeadSheet,
  } = useLeadsStore();

  const {
    allLeads,
    totalCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    updateLead,
    deleteLead,
    isUpdating,
    isDeleting,
    updateError,
    deleteError,
    refetch,
  } = useLeads({
    search: searchQuery,
    status: statusFilter,
    campaign: campaignFilter,
    sortBy,
    sortOrder,
  });

  // Enhanced intersection observer for infinite scrolling
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastLeadElementRef = useCallback(
    (node: HTMLTableRowElement) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isLoading) {
            fetchNextPage();
          }
        },
        {
          rootMargin: "100px", // Load more content 100px before reaching the end
          threshold: 0.1,
        }
      );
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage, isLoading]
  );

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Handle status update with optimistic updates
  const handleStatusUpdate = useCallback(
    (leadId: string, newStatus: string) => {
      updateLead({
        id: leadId,
        updates: { status: newStatus as any },
      });
    },
    [updateLead]
  );

  // Handle lead deletion
  const handleDeleteLead = useCallback(
    (leadId: string) => {
      if (window.confirm("Are you sure you want to delete this lead?")) {
        deleteLead(leadId);
      }
    },
    [deleteLead]
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          Error loading leads: {error?.message}
        </div>
        <div className="space-x-4">
          <Button onClick={() => refetch()}>Retry</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
        {updateError && (
          <div className="text-red-500 text-sm mt-2">
            Update error: {updateError.message}
          </div>
        )}
        {deleteError && (
          <div className="text-red-500 text-sm mt-2">
            Delete error: {deleteError.message}
          </div>
        )}
      </div>
    );
  }

  if (allLeads.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">No leads found</div>
        <p className="text-sm text-gray-400 mb-4">
          Try adjusting your search or filter criteria
        </p>
        <Button onClick={() => refetch()}>Refresh</Button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      {/* Results summary */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {allLeads.length} of {totalCount} leads
          {hasNextPage && (
            <span className="ml-2 text-blue-600">
              (Loading more as you scroll...)
            </span>
          )}
        </p>
        {(isUpdating || isDeleting) && (
          <p className="text-xs text-blue-600 mt-1">
            {isUpdating && "Updating lead..."}
            {isDeleting && "Deleting lead..."}
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lead Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allLeads.map((lead, index) => {
              const isLast = index === allLeads.length - 1;
              return (
                <tr
                  key={lead.id}
                  ref={isLast ? lastLeadElementRef : undefined}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td 
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => openLeadSheet(lead.id)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.name}
                        </div>
                        {lead.position && (
                          <div className="text-sm text-gray-500">
                            {lead.position}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => openLeadSheet(lead.id)}
                  >
                    <div className="text-sm text-gray-900">{lead.email}</div>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => openLeadSheet(lead.id)}
                  >
                    <div className="text-sm text-gray-900">
                      {lead.company || "—"}
                    </div>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => openLeadSheet(lead.id)}
                  >
                    <div className="text-sm text-gray-900">{lead.campaignName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-0 ${
                        statusColors[lead.status]
                      } cursor-pointer`}
                      disabled={isUpdating}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
                    onClick={() => openLeadSheet(lead.id)}
                  >
                    {lead.lastContactDate
                      ? new Date(lead.lastContactDate).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openLeadSheet(lead.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Loading indicator for infinite scroll */}
      {isFetchingNextPage && (
        <div className="text-center py-4 border-t border-gray-200">
          <div className="inline-flex items-center text-sm text-gray-500">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading more leads...
          </div>
        </div>
      )}

      {/* End of results indicator */}
      {!hasNextPage && allLeads.length > 0 && (
        <div className="text-center py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            You've reached the end of the list
          </p>
        </div>
      )}
    </div>
  );
}
