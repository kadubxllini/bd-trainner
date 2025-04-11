
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

interface SidebarHeaderProps {
  isMobile: boolean;
  children?: ReactNode;
}

export const SidebarHeader = ({ isMobile, children }: SidebarHeaderProps) => {
  const { setOpenMobile } = useSidebar();

  return (
    <div className="py-6 flex items-center justify-between">
      <div className="flex items-center gap-2 flex-1 justify-center">
        <img 
          src="/lovable-uploads/20d89d16-239d-4748-8775-b3a768f36471.png" 
          alt="Trainner RH Logo" 
          className="h-9 w-auto"
        />
        <h1 className="text-lg font-semibold text-center">{children || "Mensageiro"}</h1>
      </div>
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={() => setOpenMobile(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};
