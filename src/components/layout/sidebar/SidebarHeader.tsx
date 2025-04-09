
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
      <h1 className="text-lg font-semibold text-center flex-1">{children || "Mensageiro"}</h1>
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
