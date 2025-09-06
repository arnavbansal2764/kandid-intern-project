"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "active" | "paused" | "completed";
  totalLeads: number;
  successfulLeads: number;
  responseRate: number;
  progressPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UpdateCampaignPayload {
  id: string;
  updates: Partial<Pick<Campaign, 'name' | 'description' | 'status'>>;
}

async function fetchCampaigns(): Promise<Campaign[]> {
  const response = await fetch("/api/campaigns");
  if (!response.ok) {
    throw new Error("Failed to fetch campaigns");
  }
  const data = await response.json();
  return data.campaigns;
}

async function updateCampaign({ id, updates }: UpdateCampaignPayload): Promise<Campaign> {
  const response = await fetch(`/api/campaigns/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error("Failed to update campaign");
  }

  return response.json();
}

async function deleteCampaign(id: string): Promise<void> {
  const response = await fetch(`/api/campaigns/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete campaign");
  }
}

async function pauseCampaign(id: string): Promise<Campaign> {
  return updateCampaign({ id, updates: { status: "paused" } });
}

async function resumeCampaign(id: string): Promise<Campaign> {
  return updateCampaign({ id, updates: { status: "active" } });
}

export function useCampaigns() {
  const queryClient = useQueryClient();

  const campaignsQuery = useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const updateCampaignMutation = useMutation({
    mutationFn: updateCampaign,
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["campaigns"] });

      const previousCampaigns = queryClient.getQueryData(["campaigns"]);

      // Optimistically update
      queryClient.setQueryData(["campaigns"], (old: Campaign[] | undefined) => {
        if (!old) return old;
        return old.map((campaign) =>
          campaign.id === id
            ? { ...campaign, ...updates, updatedAt: new Date() }
            : campaign
        );
      });

      return { previousCampaigns };
    },
    onError: (err, variables, context) => {
      if (context?.previousCampaigns) {
        queryClient.setQueryData(["campaigns"], context.previousCampaigns);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: deleteCampaign,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["campaigns"] });

      const previousCampaigns = queryClient.getQueryData(["campaigns"]);

      // Optimistically remove
      queryClient.setQueryData(["campaigns"], (old: Campaign[] | undefined) => {
        if (!old) return old;
        return old.filter((campaign) => campaign.id !== id);
      });

      return { previousCampaigns };
    },
    onError: (err, variables, context) => {
      if (context?.previousCampaigns) {
        queryClient.setQueryData(["campaigns"], context.previousCampaigns);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] }); // Refetch leads as they might be affected
    },
  });

  const pauseCampaignMutation = useMutation({
    mutationFn: pauseCampaign,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["campaigns"] });

      const previousCampaigns = queryClient.getQueryData(["campaigns"]);

      queryClient.setQueryData(["campaigns"], (old: Campaign[] | undefined) => {
        if (!old) return old;
        return old.map((campaign) =>
          campaign.id === id
            ? { ...campaign, status: "paused" as const, updatedAt: new Date() }
            : campaign
        );
      });

      return { previousCampaigns };
    },
    onError: (err, variables, context) => {
      if (context?.previousCampaigns) {
        queryClient.setQueryData(["campaigns"], context.previousCampaigns);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });

  const resumeCampaignMutation = useMutation({
    mutationFn: resumeCampaign,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["campaigns"] });

      const previousCampaigns = queryClient.getQueryData(["campaigns"]);

      queryClient.setQueryData(["campaigns"], (old: Campaign[] | undefined) => {
        if (!old) return old;
        return old.map((campaign) =>
          campaign.id === id
            ? { ...campaign, status: "active" as const, updatedAt: new Date() }
            : campaign
        );
      });

      return { previousCampaigns };
    },
    onError: (err, variables, context) => {
      if (context?.previousCampaigns) {
        queryClient.setQueryData(["campaigns"], context.previousCampaigns);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });

  return {
    ...campaignsQuery,
    campaigns: campaignsQuery.data ?? [],
    updateCampaign: updateCampaignMutation.mutate,
    deleteCampaign: deleteCampaignMutation.mutate,
    pauseCampaign: pauseCampaignMutation.mutate,
    resumeCampaign: resumeCampaignMutation.mutate,
    isUpdating: updateCampaignMutation.isPending,
    isDeleting: deleteCampaignMutation.isPending,
    isPausing: pauseCampaignMutation.isPending,
    isResuming: resumeCampaignMutation.isPending,
    updateError: updateCampaignMutation.error,
    deleteError: deleteCampaignMutation.error,
    pauseError: pauseCampaignMutation.error,
    resumeError: resumeCampaignMutation.error,
  };
}

export type { Campaign, UpdateCampaignPayload };
