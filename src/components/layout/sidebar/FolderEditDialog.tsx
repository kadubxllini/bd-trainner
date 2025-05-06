
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder } from '@/types';
import { NewFolderForm } from './NewFolderForm';

interface FolderEditDialogProps {
  folder: Folder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Folder>) => Promise<void>;
}

export function FolderEditDialog({
  folder,
  isOpen,
  onClose,
  onUpdate
}: FolderEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleUpdate = async (name: string, color: string) => {
    if (!folder) return;
    
    try {
      setIsSubmitting(true);
      await onUpdate(folder.id, { name, color });
      onClose();
    } catch (error) {
      console.error('Error updating folder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!folder) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Pasta</DialogTitle>
        </DialogHeader>
        
        <NewFolderForm 
          onCreateFolder={handleUpdate}
          onCancel={onClose}
          initialName={folder.name}
          initialColor={folder.color}
          isEditing={true}
        />
      </DialogContent>
    </Dialog>
  );
}
