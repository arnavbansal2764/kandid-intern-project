import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  position?: string;
  status: 'pending' | 'contacted' | 'responded' | 'converted' | 'rejected';
  campaignId: string;
  campaignName: string;
  lastContactDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface LeadsResponse {
  leads: Lead[];
  totalCount: number;
  hasNextPage: boolean;
  nextPage?: number;
}

interface UseLeadsOptions {
  search?: string;
  status?: string;
  campaign?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UpdateLeadParams {
  id: string;
  updates: Partial<Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'campaignId' | 'campaignName'>>;
}

async function fetchLeads({ 
  pageParam = 1, 
  search, 
  status, 
  campaign, 
  sortBy = 'createdAt', 
  sortOrder = 'desc' 
}: { 
  pageParam?: number;
  search?: string;
  status?: string;
  campaign?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<LeadsResponse> {
  const params = new URLSearchParams({
    page: pageParam.toString(),
    limit: '20',
    sortBy,
    sortOrder,
  });

  if (search) params.append('search', search);
  if (status && status !== 'all') params.append('status', status);
  if (campaign && campaign !== 'all') params.append('campaign', campaign);

  const response = await fetch(`/api/leads?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch leads: ${response.statusText}`);
  }
  
  return response.json();
}

async function updateLead({ id, updates }: UpdateLeadParams): Promise<Lead> {
  const response = await fetch(`/api/leads/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update lead: ${response.statusText}`);
  }

  return response.json();
}

async function deleteLead(id: string): Promise<void> {
  const response = await fetch(`/api/leads/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete lead: ${response.statusText}`);
  }
}

export function useLeads(options: UseLeadsOptions = {}) {
  const queryClient = useQueryClient();
  const { search, status, campaign, sortBy, sortOrder } = options;

  // Create a query key that includes all filter parameters
  const queryKey = ['leads', { search, status, campaign, sortBy, sortOrder }];

  // Infinite query for leads with pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchLeads({ 
      pageParam, 
      search, 
      status, 
      campaign, 
      sortBy, 
      sortOrder 
    }),
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.nextPage : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Flatten all pages into a single array
  const allLeads = useMemo(() => {
    return data?.pages.flatMap(page => page.leads) ?? [];
  }, [data]);

  // Get total count from the first page
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  // Update lead mutation with optimistic updates
  const updateMutation = useMutation({
    mutationFn: updateLead,
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update the cache
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            leads: page.leads.map((lead: Lead) =>
              lead.id === id 
                ? { ...lead, ...updates, updatedAt: new Date().toISOString() }
                : lead
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Delete lead mutation with optimistic updates
  const deleteMutation = useMutation({
    mutationFn: deleteLead,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically remove from cache
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            leads: page.leads.filter((lead: Lead) => lead.id !== id),
            totalCount: page.totalCount - 1,
          })),
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    // Data
    allLeads,
    totalCount,
    
    // Pagination
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    
    // Loading states
    isLoading,
    isError,
    error,
    refetch,
    
    // Mutations
    updateLead: updateMutation.mutate,
    deleteLead: deleteMutation.mutate,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
}
