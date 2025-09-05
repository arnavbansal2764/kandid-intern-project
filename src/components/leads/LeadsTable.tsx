"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useLeadsStore } from "@/stores/leadsStore";
import { useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  position?: string;
  phone?: string;
  status: "pending" | "contacted" | "responded" | "converted" | "rejected";
  lastContactDate?: Date | null;
  campaignName: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LeadsResponse {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

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

async function fetchLeads({
  pageParam = 1,
  search,
  status,
  campaign,
  sortBy,
  sortOrder,
}: {
  pageParam?: number;
  search: string;
  status: string;
  campaign: string;
  sortBy: string;
  sortOrder: string;
}): Promise<LeadsResponse> {
  const params = new URLSearchParams({
    page: pageParam.toString(),
    limit: "20",
    ...(search && { search }),
    ...(status && { status }),
    ...(campaign && { campaign }),
    sortBy,
    sortOrder,
  });

  const response = await fetch(`/api/leads?${params}`);
  if (!response.ok) {
    throw new Error("Failed to fetch leads");
  }
  return response.json();
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
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["leads", searchQuery, statusFilter, campaignFilter, sortBy, sortOrder],
    queryFn: ({ pageParam }) =>
      fetchLeads({
        pageParam,
        search: searchQuery,
        status: statusFilter,
        campaign: campaignFilter,
        sortBy,
        sortOrder,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastLeadElementRef = useCallback(
    (node: HTMLTableRowElement) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const allLeads = data?.pages.flatMap((page) => page.leads) ?? [];

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          Error loading leads: {error?.message}
        </div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (allLeads.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">No leads found</div>
        <p className="text-sm text-gray-400">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allLeads.map((lead, index) => {
              const isLast = index === allLeads.length - 1;
              return (
                <tr
                  key={lead.id}
                  ref={isLast ? lastLeadElementRef : undefined}
                  onClick={() => openLeadSheet(lead.id)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.company}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {lead.campaignName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[lead.status]
                      }`}
                    >
                      {statusLabels[lead.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.lastContactDate
                      ? new Date(lead.lastContactDate).toLocaleDateString()
                      : "Never"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isFetchingNextPage && (
        <div className="px-6 py-4 border-t border-gray-200">
          <LoadingRow />
        </div>
      )}

      {!hasNextPage && allLeads.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 text-center text-sm text-gray-500">
          No more leads to load
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: 10 }).map((_, index) => (
              <LoadingRow key={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoadingRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
          </div>
          <div className="ml-4">
            <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-32"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-28"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-24"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 bg-gray-300 rounded-full w-16"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-300 rounded w-20"></div>
      </td>
    </tr>
  );
}
