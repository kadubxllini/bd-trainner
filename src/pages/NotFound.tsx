
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background page-transition p-6">
      <div className="text-center glass-morphism p-10 rounded-2xl max-w-md animate-scale-in">
        <h1 className="text-5xl font-bold mb-6 text-primary">404</h1>
        <h2 className="text-2xl font-medium mb-4">Página não encontrada</h2>
        <p className="text-muted-foreground mb-8">
          Parece que você tentou acessar uma página que não existe.
        </p>
        <Button asChild className="bg-primary/80 hover:bg-primary">
          <a href="/">Voltar para Início</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
