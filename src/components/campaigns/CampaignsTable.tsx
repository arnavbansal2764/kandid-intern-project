"use client";

import { useCampaigns } from "@/hooks/useCampaigns";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800",
};

const statusLabels = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
};

type SortField = "name" | "status" | "totalLeads" | "responseRate" | "createdAt";
type SortOrder = "asc" | "desc";

function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="h-6 bg-gray-300 rounded w-1/4 animate-pulse"></div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[...Array(7)].map((_, i) => (
                <th key={i} className="px-6 py-3">
                  <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
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

export function CampaignsTable() {
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const {
    campaigns,
    isLoading,
    isError,
    error,
    updateCampaign,
    deleteCampaign,
    pauseCampaign,
    resumeCampaign,
    isUpdating,
    isDeleting,
    isPausing,
    isResuming,
    updateError,
    deleteError,
    pauseError,
    resumeError,
    refetch,
  } = useCampaigns();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleStatusUpdate = (campaignId: string, newStatus: string) => {
    updateCampaign({
      id: campaignId,
      updates: { status: newStatus as any },
    });
  };

  const handlePauseResume = (campaignId: string, currentStatus: string) => {
    if (currentStatus === "active") {
      pauseCampaign(campaignId);
    } else if (currentStatus === "paused") {
      resumeCampaign(campaignId);
    }
  };

  const handleDelete = (campaignId: string, campaignName: string) => {
    if (window.confirm(`Are you sure you want to delete "${campaignName}"? This action cannot be undone.`)) {
      deleteCampaign(campaignId);
    }
  };

  // Filter and sort campaigns
  const filteredAndSortedCampaigns = campaigns
    .filter(campaign => statusFilter === "all" || campaign.status === statusFilter)
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortOrder === "asc" 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      
      return 0;
    });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="text-red-600 mb-4">
          Error loading campaigns: {error?.message}
        </div>
        <div className="space-x-4">
          <Button onClick={() => refetch()}>Retry</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
        {(updateError || deleteError || pauseError || resumeError) && (
          <div className="text-red-500 text-sm mt-4 space-y-1">
            {updateError && <div>Update error: {updateError.message}</div>}
            {deleteError && <div>Delete error: {deleteError.message}</div>}
            {pauseError && <div>Pause error: {pauseError.message}</div>}
            {resumeError && <div>Resume error: {resumeError.message}</div>}
          </div>
        )}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
        <p className="text-gray-500 mb-6">Create your first campaign to start generating leads.</p>
        <Button>Create Campaign</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header with filters */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Campaigns ({filteredAndSortedCampaigns.length})
          </h3>
          <div className="flex items-center space-x-4">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
            
            {(isUpdating || isDeleting || isPausing || isResuming) && (
              <div className="text-sm text-blue-600">
                {isUpdating && "Updating..."}
                {isDeleting && "Deleting..."}
                {isPausing && "Pausing..."}
                {isResuming && "Resuming..."}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center space-x-1">
                  <span>Campaign Name</span>
                  {sortField === "name" && (
                    <span className="text-blue-500">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {sortField === "status" && (
                    <span className="text-blue-500">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("totalLeads")}
              >
                <div className="flex items-center space-x-1">
                  <span>Total Leads</span>
                  {sortField === "totalLeads" && (
                    <span className="text-blue-500">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Successful Leads
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("responseRate")}
              >
                <div className="flex items-center space-x-1">
                  <span>Response Rate</span>
                  {sortField === "responseRate" && (
                    <span className="text-blue-500">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedCampaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {campaign.name}
                    </div>
                    {campaign.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {campaign.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={campaign.status}
                    onChange={(e) => handleStatusUpdate(campaign.id, e.target.value)}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-0 ${
                      statusColors[campaign.status]
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {campaign.totalLeads.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {campaign.successfulLeads.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900 mr-2">
                      {campaign.responseRate}%
                    </div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          campaign.responseRate >= 80 ? 'bg-green-500' :
                          campaign.responseRate >= 50 ? 'bg-yellow-500' :
                          campaign.responseRate >= 20 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(campaign.responseRate, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(campaign.progressPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {campaign.progressPercentage}% complete
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {campaign.status === "active" && (
                      <button
                        onClick={() => handlePauseResume(campaign.id, campaign.status)}
                        disabled={isPausing}
                        className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                      >
                        Pause
                      </button>
                    )}
                    {campaign.status === "paused" && (
                      <button
                        onClick={() => handlePauseResume(campaign.id, campaign.status)}
                        disabled={isResuming}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        Resume
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(campaign.id, campaign.name)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
