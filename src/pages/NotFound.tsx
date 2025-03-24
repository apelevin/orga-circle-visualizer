
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const isSharedPath = location.pathname.startsWith('/shared');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <p className="text-2xl text-foreground mb-2">Oops! Page not found</p>
        
        {isSharedPath ? (
          <div className="mt-6 mb-8">
            <p className="text-muted-foreground mb-4">
              The shared organization data you're trying to access might have expired or was created in a different browser.
            </p>
            <p className="text-sm text-muted-foreground">
              Try asking for a new share link or create your own organization visualization.
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground mb-6">
            The page you are looking for does not exist or has been moved.
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Button asChild className="px-6 py-5 text-base rounded-full">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              <span>Go to Home</span>
            </Link>
          </Button>
          
          {isSharedPath && (
            <Button asChild variant="outline" className="px-6 py-5 text-base rounded-full">
              <Link to="/" className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                <span>Create New Organization</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
