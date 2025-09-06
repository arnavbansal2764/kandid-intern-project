"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { CampaignsStatistics } from "@/components/campaigns/CampaignsStatistics";
import { CampaignsTable } from "@/components/campaigns/CampaignsTable";

export default function CampaignsPage() {
  return (
    <ProtectedRoute>
      <AppLayout
        title="Campaigns"
        subtitle="Manage your marketing campaigns"
        actions={
          <div className="flex space-x-3">
            <Button variant="outline">
              Template Library
            </Button>
            <Button variant="primary">
              Create Campaign
            </Button>
          </div>
        }
      >
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Campaign Statistics */}
            <CampaignsStatistics />
            
            {/* Campaigns Table */}
            <CampaignsTable />
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
