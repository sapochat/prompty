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
    <div className="min-h-screen flex-center bg-background">
      <div className="editorial-card-elevated p-12 text-center max-w-md">
        <h1 className="heading-display gradient-text mb-6">404</h1>
        <p className="text-xl text-foreground-muted mb-4">
          Page not found
        </p>
        <p className="text-sm text-foreground-subtle mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button className="btn-primary" asChild>
          <a href="/">Return Home</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
