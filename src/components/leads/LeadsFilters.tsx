"use client";

import { useLeadsStore } from "@/stores/leadsStore";
import { Button } from "@/components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface Campaign {
  id: string;
  name: string;
  status: string;
  totalLeads: number;
  successfulLeads: number;
  responseRate: number;
}

interface CampaignsResponse {
  campaigns: Campaign[];
}

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "contacted", label: "Contacted" },
  { value: "responded", label: "Responded" },
  { value: "converted", label: "Converted" },
  { value: "rejected", label: "Rejected" },
];

const sortOptions = [
  { value: "createdAt", label: "Created Date" },
  { value: "name", label: "Name" },
  { value: "status", label: "Status" },
  { value: "lastContactDate", label: "Last Contact" },
  { value: "campaignName", label: "Campaign" },
];

async function fetchCampaigns(): Promise<CampaignsResponse> {
  const response = await fetch("/api/campaigns");
  if (!response.ok) {
    throw new Error("Failed to fetch campaigns");
  }
  return response.json();
}

export function LeadsFilters() {
  const {
    searchQuery,
    statusFilter,
    campaignFilter,
    sortBy,
    sortOrder,
    setSearchQuery,
    setStatusFilter,
    setCampaignFilter,
    setSorting,
    resetFilters,
  } = useLeadsStore();

  const [searchInput, setSearchInput] = useState(searchQuery);

  const { data: campaignsData, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, setSearchQuery]);

  const handleSortChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      // Toggle sort order if same field
      setSorting(sortBy, sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new field with default desc order
      setSorting(newSortBy, "desc");
    }
  };

  const activeFiltersCount = [
    searchQuery,
    statusFilter,
    campaignFilter,
  ].filter(Boolean).length;

  const campaignOptions = [
    { value: "", label: "All Campaigns" },
    ...(campaignsData?.campaigns.map(campaign => ({
      value: campaign.id,
      label: campaign.name,
    })) || []),
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4 lg:items-center">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search leads by name, email, or company..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Campaign Filter */}
        <div>
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            disabled={isLoadingCampaigns}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-gray-900"
          >
            {campaignOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setSorting(sortBy, sortOrder === "asc" ? "desc" : "asc")}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
          >
            <svg
              className={`w-4 h-4 transition-transform ${
                sortOrder === "desc" ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>

        {/* Reset Filters */}
        {activeFiltersCount > 0 && (
          <div>
            <Button
              variant="outline"
              onClick={() => {
                resetFilters();
                setSearchInput("");
              }}
            >
              Clear Filters ({activeFiltersCount})
            </Button>
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchQuery && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              Search: "{searchQuery}"
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchInput("");
                }}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {statusFilter && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              Status: {statusOptions.find(opt => opt.value === statusFilter)?.label}
              <button
                onClick={() => setStatusFilter("")}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {campaignFilter && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
              Campaign: {campaignOptions.find(opt => opt.value === campaignFilter)?.label}
              <button
                onClick={() => setCampaignFilter("")}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
