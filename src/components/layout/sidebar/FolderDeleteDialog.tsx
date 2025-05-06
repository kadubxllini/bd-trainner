
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Folder } from '@/types';

interface FolderDeleteDialogProps {
  folderToDelete: Folder | null;
  setFolderToDelete: (folder: Folder | null) => void;
  onConfirmDelete: (id: string) => void;
}

export function FolderDeleteDialog({
  folderToDelete,
  setFolderToDelete,
  onConfirmDelete,
}: FolderDeleteDialogProps) {
  const handleDelete = () => {
    if (folderToDelete) {
      onConfirmDelete(folderToDelete.id);
      setFolderToDelete(null);
    }
  };

  return (
    <AlertDialog 
      open={!!folderToDelete} 
      onOpenChange={(isOpen) => !isOpen && setFolderToDelete(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir pasta</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a pasta "{folderToDelete?.name}"?
            <br /><br />
            <strong>As empresas não serão excluídas</strong>, apenas removidas desta pasta.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-destructive hover:bg-destructive/90" 
            onClick={handleDelete}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
