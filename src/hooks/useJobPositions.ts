
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import * as jobPositionService from '@/services/jobPositionService';

export const useJobPositions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [jobPositions, setJobPositions] = useState<string[]>([]);

  useEffect(() => {
    const fetchJobPositions = async () => {
      if (!user) return;
      
      const positions = await jobPositionService.fetchJobPositions();
      setJobPositions(positions);
    };
    
    fetchJobPositions();
  }, [user]);

  const addJobPositionMutation = useMutation({
    mutationFn: jobPositionService.addJobPosition,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobPositions'] });
      if (data) {
        setJobPositions(data);
      }
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar vaga: ${error.message}`);
    }
  });

  const deleteJobPositionMutation = useMutation({
    mutationFn: jobPositionService.deleteJobPosition,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobPositions'] });
      if (data) {
        setJobPositions(data);
      }
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover vaga: ${error.message}`);
    }
  });

  const addJobPosition = async (title: string) => {
    if (!title.trim()) return;
    await addJobPositionMutation.mutateAsync(title);
  };

  const deleteJobPosition = async (title: string) => {
    await deleteJobPositionMutation.mutateAsync(title);
  };

  // Function to ensure the "Selecionadora" job position exists
  const ensureDefaultJobPositions = async () => {
    if (!jobPositions.includes("Selecionadora")) {
      await addJobPosition("Selecionadora");
    }
  };

  // Call this when the hook is initialized
  useEffect(() => {
    if (user && jobPositions.length > 0) {
      ensureDefaultJobPositions();
    }
  }, [user, jobPositions.length]);

  return {
    jobPositions,
    addJobPosition,
    deleteJobPosition
  };
};
