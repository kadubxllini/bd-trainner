
import { useState } from 'react';
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarMenuAction
} from '@/components/ui/sidebar';
import { Folder, FolderOpen, ChevronDown, ChevronRight, Plus, Pencil, Trash } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu';
import { Folder as FolderType, Company } from '@/types';
import { Button } from '@/components/ui/button';
import { NewFolderForm } from './NewFolderForm';
import { FolderItem } from './FolderItem';

interface FolderListProps {
  folders: FolderType[];
  companies: Company[];
  activeCompany?: Company | null;
  onCompanySelect: (id: string) => void;
  onEditCompany: (company: Company) => void;
  onDeleteCompany: (company: Company) => void;
  onCreateFolder: (name: string, color: string) => Promise<void>;
  onEditFolder: (folder: FolderType) => void;
  onDeleteFolder: (folder: FolderType) => void;
  onMoveCompanyToFolder: (companyId: string, folderId: string | null) => Promise<void>;
  isFolderExpanded: (folderId: string) => boolean;
  toggleFolderExpanded: (folderId: string) => void;
}

export function FolderList({
  folders,
  companies,
  activeCompany,
  onCompanySelect,
  onEditCompany,
  onDeleteCompany,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onMoveCompanyToFolder,
  isFolderExpanded,
  toggleFolderExpanded
}: FolderListProps) {
  const [showNewFolderForm, setShowNewFolderForm] = useState(false);

  // Group companies by folder
  const companiesByFolder: Record<string, Company[]> = {};
  
  // Get companies without folder
  const unfolderedCompanies = companies.filter(company => !company.folderId);
  
  // Organize companies by folder
  folders.forEach(folder => {
    companiesByFolder[folder.id] = companies.filter(company => company.folderId === folder.id);
  });

  return (
    <div className="space-y-2">
      {/* Folders section */}
      <div className="px-2 py-1 flex justify-between items-center">
        <span className="text-xs font-medium text-muted-foreground">Pastas</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-5 w-5" 
          onClick={() => setShowNewFolderForm(true)}
        >
          <Plus className="h-3 w-3" />
          <span className="sr-only">Nova pasta</span>
        </Button>
      </div>

      {showNewFolderForm && (
        <NewFolderForm 
          onCreateFolder={onCreateFolder}
          onCancel={() => setShowNewFolderForm(false)}
        />
      )}

      <SidebarMenu>
        {folders.map(folder => (
          <FolderItem
            key={folder.id}
            folder={folder}
            companies={companiesByFolder[folder.id] || []}
            activeCompany={activeCompany}
            onCompanySelect={onCompanySelect}
            onEditCompany={onEditCompany}
            onDeleteCompany={onDeleteCompany}
            onEditFolder={() => onEditFolder(folder)}
            onDeleteFolder={() => onDeleteFolder(folder)}
            onMoveCompanyToFolder={onMoveCompanyToFolder}
            isExpanded={isFolderExpanded(folder.id)}
            toggleExpanded={() => toggleFolderExpanded(folder.id)}
            allFolders={folders}
          />
        ))}
      </SidebarMenu>

      {/* Unfiled Companies section */}
      <div className="px-2 py-1 mt-4">
        <span className="text-xs font-medium text-muted-foreground">Empresas sem pasta</span>
      </div>

      <SidebarMenu className="max-h-[calc(100vh-350px)] overflow-y-auto scrollbar-thin">
        {unfolderedCompanies.map((company) => (
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
                    <Building className="w-5 h-5 mr-2 flex-shrink-0" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate font-medium">{company.name}</span>
                        {company.inProgress && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center">
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
                  {folders.map(folder => (
                    <ContextMenuItem 
                      key={folder.id} 
                      onClick={() => onMoveCompanyToFolder(company.id, folder.id)}
                    >
                      <div 
                        className="h-2 w-2 rounded-full mr-2" 
                        style={{ backgroundColor: folder.color || '#8E9196' }} 
                      />
                      {folder.name}
                    </ContextMenuItem>
                  ))}
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
                disabled={companies.length <= 1}
              >
                <Trash className="h-4 w-4 mr-2" />
                Excluir empresa
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </SidebarMenu>
    </div>
  );
}

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

import { Building, Clock, X } from 'lucide-react';
import { UrgencyLevel } from '@/types';
