
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import * as selectorService from '@/services/selectorService';

export const useSelectors = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectors, setSelectors] = useState<string[]>([]);

  useEffect(() => {
    const fetchSelectors = async () => {
      if (!user) return;
      
      const availableSelectors = await selectorService.fetchSelectors();
      setSelectors(availableSelectors);
    };
    
    fetchSelectors();
  }, [user]);

  const addSelectorMutation = useMutation({
    mutationFn: selectorService.addSelector,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['selectors'] });
      if (data) {
        setSelectors(data);
      }
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar selecionadora: ${error.message}`);
    }
  });

  const deleteSelectorMutation = useMutation({
    mutationFn: selectorService.deleteSelector,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['selectors'] });
      if (data) {
        setSelectors(data);
      }
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover selecionadora: ${error.message}`);
    }
  });

  const addSelector = async (name: string) => {
    if (!name.trim()) return;
    await addSelectorMutation.mutateAsync(name);
  };

  const deleteSelector = async (name: string) => {
    await deleteSelectorMutation.mutateAsync(name);
  };

  return {
    selectors,
    addSelector,
    deleteSelector
  };
};
