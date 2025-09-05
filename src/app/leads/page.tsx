"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadsFilters } from "@/components/leads/LeadsFilters";
import { LeadDetailSheet } from "@/components/leads/LeadDetailSheet";

export default function LeadsPage() {
  return (
    <ProtectedRoute>
      <AppLayout
        title="Leads"
        subtitle="Manage and track your leads"
        actions={
          <div className="flex space-x-3">
            <Button variant="outline">
              Import Leads
            </Button>
            <Button variant="primary">
              Add New Lead
            </Button>
          </div>
        }
      >
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <LeadsFilters />
            <LeadsTable />
          </div>
        </div>
      </AppLayout>
      {/* Render LeadDetailSheet outside AppLayout for full-screen coverage */}
      <LeadDetailSheet />
    </ProtectedRoute>
  );
}
