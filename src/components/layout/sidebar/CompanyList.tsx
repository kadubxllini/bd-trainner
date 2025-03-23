
import { Company, UrgencyLevel } from "@/types";
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import { Building, Clock } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Pencil, Trash } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface CompanyListProps {
  companies: Company[];
  activeCompany?: Company | null;
  onCompanySelect: (id: string) => void;
  onEditCompany: (company: Company) => void;
  onDeleteCompany: (company: Company) => void;
}

export function CompanyList({
  companies,
  activeCompany,
  onCompanySelect,
  onEditCompany,
  onDeleteCompany
}: CompanyListProps) {
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();

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

  const handleCompanySelect = (companyId: string) => {
    onCompanySelect(companyId);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenu className="max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
      {companies.map((company) => (
        <ContextMenu key={company.id}>
          <ContextMenuTrigger>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => handleCompanySelect(company.id)}
                className={`${
                  activeCompany?.id === company.id 
                    ? 'bg-primary/20 text-primary-foreground' 
                    : 'hover:bg-secondary'
                } transition-all duration-200`}
              >
                <div className="flex items-center w-full">
                  <Building className="w-5 h-5 mr-2 flex-shrink-0" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center">
                      <span className="truncate">{company.name}</span>
                      {company.inProgress && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span className="truncate">Decorrer</span>
                        </span>
                      )}
                    </div>
                    
                    {company.jobPositions && company.jobPositions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {company.jobPositions.map((position, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs py-0">
                            {position}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {company.urgency && (
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {getUrgencyIndicator(company.urgency)}
                        <span className="truncate">
                          Urgência: {company.urgency}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </ContextMenuTrigger>
          <ContextMenuContent>
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
  );
}
