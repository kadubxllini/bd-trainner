
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Folder } from '@/types';
import * as folderService from '@/services/folderService';

export const useFolders = (userId?: string) => {
  const queryClient = useQueryClient();
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  
  const {
    data: folders = [],
    isLoading: isLoadingFolders,
  } = useQuery({
    queryKey: ['folders', userId],
    queryFn: async () => {
      if (!userId) return [];
      return folderService.fetchUserFolders(userId);
    },
    enabled: !!userId,
  });

  const createFolderMutation = useMutation({
    mutationFn: async ({ name, color }: { name: string, color: string }) => {
      if (!userId) throw new Error("Usuário não autenticado");
      return folderService.createFolder(name, color, userId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success(`Pasta "${data.name}" criada`);
      
      // Automatically expand new folders
      setExpandedFolders(prev => ({
        ...prev,
        [data.id]: true
      }));
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar pasta: ${error.message}`);
    }
  });

  const updateFolderMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Folder> }) => {
      await folderService.updateFolder(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success('Pasta atualizada');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar pasta: ${error.message}`);
    }
  });

  const deleteFolderMutation = useMutation({
    mutationFn: folderService.deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Pasta removida');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover pasta: ${error.message}`);
    }
  });

  const moveCompanyMutation = useMutation({
    mutationFn: async ({ companyId, folderId }: { companyId: string, folderId: string | null }) => {
      await folderService.moveCompanyToFolder(companyId, folderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Empresa movida');
    },
    onError: (error: any) => {
      toast.error(`Erro ao mover empresa: ${error.message}`);
    }
  });

  const createFolder = async (name: string, color: string = '#8E9196') => {
    if (!name.trim()) return;
    return createFolderMutation.mutateAsync({ name, color });
  };

  const updateFolder = async (id: string, updates: Partial<Folder>) => {
    await updateFolderMutation.mutateAsync({ id, updates });
  };

  const deleteFolder = async (id: string) => {
    await deleteFolderMutation.mutateAsync(id);
  };

  const moveCompanyToFolder = async (companyId: string, folderId: string | null) => {
    await moveCompanyMutation.mutateAsync({ companyId, folderId });
  };

  const toggleFolderExpanded = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const isFolderExpanded = (folderId: string) => {
    return expandedFolders[folderId] || false;
  };

  return {
    folders,
    createFolder,
    updateFolder,
    deleteFolder,
    moveCompanyToFolder,
    isLoadingFolders,
    toggleFolderExpanded,
    isFolderExpanded,
    expandedFolders
  };
};
