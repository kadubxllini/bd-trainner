
import { SidebarMenuItem, SidebarMenuButton, SidebarMenuSub } from '@/components/ui/sidebar';
import { Folder as FolderIcon, ChevronDown, ChevronRight, Pencil, Trash, Building, Clock, X, FolderOpen } from 'lucide-react';
import { Folder, Company, UrgencyLevel } from '@/types';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu';

interface FolderItemProps {
  folder: Folder;
  companies: Company[];
  activeCompany?: Company | null;
  onCompanySelect: (id: string) => void;
  onEditCompany: (company: Company) => void;
  onDeleteCompany: (company: Company) => void;
  onEditFolder: () => void;
  onDeleteFolder: () => void;
  onMoveCompanyToFolder: (companyId: string, folderId: string | null) => Promise<void>;
  isExpanded: boolean;
  toggleExpanded: () => void;
  allFolders: Folder[];
}

export function FolderItem({
  folder,
  companies,
  activeCompany,
  onCompanySelect,
  onEditCompany,
  onDeleteCompany,
  onEditFolder,
  onDeleteFolder,
  onMoveCompanyToFolder,
  isExpanded,
  toggleExpanded,
  allFolders
}: FolderItemProps) {
  const getUrgencyIndicator = (urgency?: UrgencyLevel) => {
    switch(urgency) {
      case 'Baixa': 
      case 'low':
        return <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>;
      case 'Média':
      case 'medium':
        return <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>;
      case 'Alta':
      case 'high':
        return <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>;
      default: 
        return null;
    }
  };

  // Ordenar as empresas por ordem alfabética
  const sortedCompanies = [...companies].sort((a, b) => 
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="folder-container">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleExpanded}
              className="flex items-center justify-between hover:bg-secondary transition-all duration-200"
            >
              <div className="flex items-center flex-1">
                <div 
                  className="h-3 w-3 rounded-full mr-2"
                  style={{ backgroundColor: folder.color || '#8E9196' }}
                />
                <FolderIcon 
                  className="w-4 h-4 mr-2 flex-shrink-0"
                  style={{ color: folder.color || '#8E9196' }}
                />
                <span className="truncate font-medium">{folder.name}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-muted-foreground mr-2">{companies.length}</span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {isExpanded && (
            <SidebarMenuSub>
              {sortedCompanies.map((company) => (
                <ContextMenu key={company.id}>
                  <ContextMenuTrigger asChild>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => onCompanySelect(company.id)}
                        className={`${
                          activeCompany?.id === company.id 
                            ? 'bg-primary/20 text-primary-foreground' 
                            : 'hover:bg-secondary'
                        } transition-all duration-200`}
                      >
                        <div className="flex items-center w-full">
                          <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate font-medium text-sm">{company.name}</span>
                              {company.inProgress && (
                                <span className="ml-2 px-1 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                </span>
                              )}
                            </div>
                            
                            {company.urgency && (
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                {getUrgencyIndicator(company.urgency)}
                              </div>
                            )}
                          </div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuSub>
                      <ContextMenuSubTrigger>
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Mover para pasta
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent className="w-48">
                        {allFolders
                          .filter(f => f.id !== folder.id)
                          .map(otherFolder => (
                            <ContextMenuItem 
                              key={otherFolder.id} 
                              onClick={() => onMoveCompanyToFolder(company.id, otherFolder.id)}
                            >
                              <div 
                                className="h-2 w-2 rounded-full mr-2" 
                                style={{ backgroundColor: otherFolder.color || '#8E9196' }} 
                              />
                              {otherFolder.name}
                            </ContextMenuItem>
                          ))
                        }
                        <ContextMenuItem 
                          onClick={() => onMoveCompanyToFolder(company.id, null)}
                          className="border-t mt-1 pt-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remover da pasta
                        </ContextMenuItem>
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                    <ContextMenuItem onClick={() => onEditCompany(company)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar empresa
                    </ContextMenuItem>
                    <ContextMenuItem 
                      onClick={() => onDeleteCompany(company)} 
                      className="text-destructive"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Excluir empresa
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </SidebarMenuSub>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onEditFolder}>
          <Pencil className="h-4 w-4 mr-2" />
          Editar pasta
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={onDeleteFolder} 
          className="text-destructive"
        >
          <Trash className="h-4 w-4 mr-2" />
          Excluir pasta
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
