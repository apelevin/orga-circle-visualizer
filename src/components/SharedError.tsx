
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, AlertTriangle } from "lucide-react";

interface SharedErrorProps {
  errorMessage: string | null;
}

const SharedError = ({ errorMessage }: SharedErrorProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center mb-8">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">
          {errorMessage || "This shared link has expired or doesn't exist"}
        </h1>
        <Alert variant="destructive" className="mb-6 text-left">
          <AlertDescription>
            {errorMessage || "The shared data could not be loaded. It may have expired or been created in a different browser."}
          </AlertDescription>
        </Alert>
        <p className="text-muted-foreground mb-8">
          Shared links are stored in your browser's local storage and may not be accessible across different devices or browsers.
        </p>
      </div>
      
      <div className="flex flex-col gap-3">
        <Button asChild className="px-8 py-6 text-lg rounded-full">
          <Link to="/" className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            <span>Go to Home</span>
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          You'll need to upload your data again or request a new share link.
        </p>
      </div>
    </div>
  );
};

export default SharedError;
