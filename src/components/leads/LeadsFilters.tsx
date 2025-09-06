"use client";

import { useCampaigns } from "@/hooks/useCampaigns";
import { useLeadsStore } from "@/stores/leadsStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "contacted", label: "Contacted" },
  { value: "responded", label: "Responded" },
  { value: "converted", label: "Converted" },
  { value: "rejected", label: "Rejected" },
];

const sortOptions = [
  { value: "createdAt", label: "Created Date" },
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "company", label: "Company" },
  { value: "lastContactDate", label: "Last Contact" },
];

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
  const { campaigns, isLoading: campaignsLoading } = useCampaigns();

  const campaignOptions = [
    { value: "", label: "All Campaigns" },
    ...campaigns.map(campaign => ({
      value: campaign.id,
      label: campaign.name,
    })),
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleSearchClear = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  const handleSortChange = (field: string) => {
    if (field === sortBy) {
      // Toggle sort order if same field
      setSorting(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new field with default ascending order
      setSorting(field, "asc");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search leads..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="primary">
              Search
            </Button>
            {searchQuery && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSearchClear}
              >
                Clear
              </Button>
            )}
          </form>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Campaign Filter */}
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            disabled={campaignsLoading}
          >
            {campaignsLoading ? (
              <option>Loading campaigns...</option>
            ) : (
              campaignOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            )}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} {sortBy === option.value && (sortOrder === "asc" ? "↑" : "↓")}
              </option>
            ))}
          </select>

          {/* Sort Order Toggle */}
          <Button
            variant="outline"
            onClick={() => setSorting(sortBy, sortOrder === "asc" ? "desc" : "asc")}
            className="px-3"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>

          {/* Reset Filters */}
          <Button
            variant="outline"
            onClick={() => {
              resetFilters();
              setSearchInput("");
            }}
            className="text-red-600 hover:text-red-700"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchQuery || statusFilter || campaignFilter) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{searchQuery}"
              <button
                onClick={handleSearchClear}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {statusFilter && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Status: {statusOptions.find(s => s.value === statusFilter)?.label}
              <button
                onClick={() => setStatusFilter("")}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {campaignFilter && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Campaign: {campaignOptions.find(c => c.value === campaignFilter)?.label}
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
