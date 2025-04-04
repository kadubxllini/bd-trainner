
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import * as inProgressService from '@/services/inProgressService';

export const useInProgressStates = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [inProgressStates, setInProgressStates] = useState<string[]>([]);

  const { 
    data: inProgressStatesData = [],
    isLoading: isLoadingInProgressStates,
    refetch: refetchInProgressStates
  } = useQuery({
    queryKey: ['inProgressStates'],
    queryFn: inProgressService.fetchInProgressStates,
    enabled: !!user
  });

  useEffect(() => {
    if (inProgressStatesData.length > 0) {
      setInProgressStates(inProgressStatesData);
    }
  }, [inProgressStatesData]);

  const addInProgressStateMutation = useMutation({
    mutationFn: async (state: string) => {
      const { data, error } = await inProgressService.addInProgressStateToDatabase(state);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      console.log("Successfully added in-progress state");
      queryClient.invalidateQueries({ queryKey: ['inProgressStates'] });
      refetchInProgressStates();
    },
    onError: (error: any) => {
      console.error("Error in addInProgressStateMutation:", error);
      toast.error(`Erro ao adicionar estado: ${error.message}`);
    }
  });
  
  const deleteInProgressStateMutation = useMutation({
    mutationFn: inProgressService.deleteInProgressState,
    onSuccess: () => {
      console.log("Successfully deleted in-progress state");
      queryClient.invalidateQueries({ queryKey: ['inProgressStates'] });
      refetchInProgressStates();
    },
    onError: (error: any) => {
      console.error("Error in deleteInProgressStateMutation:", error);
      toast.error(`Erro ao remover estado: ${error.message}`);
    }
  });

  const refreshInProgressStates = async () => {
    console.log("Refreshing in-progress states...");
    if (!user) return;
    
    try {
      const states = await inProgressService.fetchInProgressStates();
      setInProgressStates(states);
    } catch (err) {
      console.error("Error refreshing in-progress states:", err);
    }
  };

  const addInProgressState = async (state: string) => {
    if (!state.trim()) {
      toast.error("Digite um estado para adicionar");
      return;
    }
    
    console.log("Adding in-progress state:", state);
    try {
      await addInProgressStateMutation.mutateAsync(state);
      await refreshInProgressStates();
    } catch (error) {
      console.error("Error in addInProgressState:", error);
      toast.error(`Erro ao adicionar estado: ${error instanceof Error ? error.message : 'Desconhecido'}`);
    }
  };

  const deleteInProgressState = async (state: string) => {
    console.log("Deleting in-progress state:", state);
    try {
      await deleteInProgressStateMutation.mutateAsync(state);
      await refreshInProgressStates();
    } catch (error) {
      console.error("Error in deleteInProgressState:", error);
      toast.error(`Erro ao remover estado: ${error instanceof Error ? error.message : 'Desconhecido'}`);
    }
  };

  return {
    inProgressStates,
    addInProgressState,
    deleteInProgressState,
    refreshInProgressStates,
    isLoadingInProgressStates
  };
};
