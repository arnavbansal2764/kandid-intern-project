"use client";

import { useCampaigns } from "@/hooks/useCampaigns";

export function CampaignsStatistics() {
  const { campaigns, isLoading, error } = useCampaigns();

  // Debug: Log the campaigns data to console
  console.log('Campaigns data:', campaigns);

  // Calculate overall statistics
  const stats = campaigns.reduce(
    (acc, campaign) => {
      acc.totalCampaigns += 1;
      acc.totalLeads += campaign.totalLeads || 0;
      acc.totalSuccessfulLeads += campaign.successfulLeads || 0;
      
      switch (campaign.status) {
        case "active":
          acc.activeCampaigns += 1;
          break;
        case "completed":
          acc.completedCampaigns += 1;
          break;
        case "paused":
          acc.pausedCampaigns += 1;
          break;
        case "draft":
          acc.draftCampaigns += 1;
          break;
      }
      
      return acc;
    },
    {
      totalCampaigns: 0,
      activeCampaigns: 0,
      completedCampaigns: 0,
      pausedCampaigns: 0,
      draftCampaigns: 0,
      totalLeads: 0,
      totalSuccessfulLeads: 0,
    }
  );

  const overallResponseRate = stats.totalLeads > 0 
    ? Math.round((stats.totalSuccessfulLeads / stats.totalLeads) * 100)
    : 0;

  // Calculate average campaign performance
  const activeCampaignsWithLeads = campaigns.filter(c => c.status === 'active' && c.totalLeads > 0);
  const avgResponseRate = activeCampaignsWithLeads.length > 0
    ? Math.round(activeCampaignsWithLeads.reduce((sum, c) => sum + (c.responseRate || 0), 0) / activeCampaignsWithLeads.length)
    : 0;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-800">Failed to load campaign statistics. Please try again.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show empty state if no campaigns
  if (campaigns.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
        <p className="text-gray-500 mb-6">Create your first campaign to start generating leads and tracking performance.</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Create Your First Campaign
        </button>
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Total Campaigns",
      value: stats.totalCampaigns.toLocaleString(),
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: "blue",
      subtext: stats.activeCampaigns > 0 ? `${stats.activeCampaigns} active` : "No active campaigns",
    },
    {
      title: "Total Leads",
      value: stats.totalLeads.toLocaleString(),
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "green",
      subtext: stats.totalLeads > 0 ? "across all campaigns" : "No leads yet",
    },
    {
      title: "Successful Leads",
      value: stats.totalSuccessfulLeads.toLocaleString(),
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "purple",
      subtext: stats.totalSuccessfulLeads > 0 ? "converted or responded" : "No conversions yet",
    },
    {
      title: "Overall Response Rate",
      value: `${overallResponseRate}%`,
      icon: (
        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: "yellow",
      subtext: stats.totalLeads > 0 ? `${activeCampaignsWithLeads.length} campaigns with leads` : "No data available",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.subtext}</p>
              </div>
              <div className={`p-3 rounded-full bg-${card.color}-100`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign Status Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Campaign Status Distribution</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-green-600">{stats.activeCampaigns}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Active</p>
            <p className="text-xs text-gray-500">Running campaigns</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-blue-600">{stats.completedCampaigns}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Completed</p>
            <p className="text-xs text-gray-500">Finished campaigns</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-yellow-600">{stats.pausedCampaigns}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Paused</p>
            <p className="text-xs text-gray-500">Temporarily stopped</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-gray-600">{stats.draftCampaigns}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Draft</p>
            <p className="text-xs text-gray-500">Not yet launched</p>
          </div>
        </div>
      </div>

      {/* Top Performing Campaigns */}
      {campaigns.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Campaigns</h3>
          {campaigns.filter(campaign => (campaign.totalLeads || 0) > 0).length > 0 ? (
            <div className="space-y-4">
              {campaigns
                .filter(campaign => (campaign.totalLeads || 0) > 0)
                .sort((a, b) => (b.responseRate || 0) - (a.responseRate || 0))
                .slice(0, 5)
                .map((campaign, index) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-yellow-600' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                        <p className="text-sm text-gray-600">
                          {campaign.successfulLeads || 0}/{campaign.totalLeads || 0} leads
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{campaign.responseRate || 0}%</p>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(campaign.responseRate || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-500">No campaign performance data available yet.</p>
              <p className="text-sm text-gray-400 mt-1">Start adding leads to your campaigns to see performance metrics.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
