
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Home, AlertTriangle, ExternalLink } from "lucide-react";

interface SharedErrorProps {
  errorMessage: string | null;
  shareId?: string;
}

const SharedError = ({ errorMessage, shareId }: SharedErrorProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center mb-8">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">
          {errorMessage || "This shared link has expired or doesn't exist"}
        </h1>
        <Alert variant="destructive" className="mb-6 text-left">
          <AlertTitle>Share link error</AlertTitle>
          <AlertDescription>
            {errorMessage || "The shared data could not be loaded. It may have expired or been created in a different browser."}
            {shareId && (
              <div className="mt-2 font-mono text-xs bg-muted p-2 rounded">
                Share ID: {shareId}
              </div>
            )}
          </AlertDescription>
        </Alert>
        <div className="space-y-4 text-muted-foreground mb-6">
          <p>
            Shared links are stored in your browser's local storage and may not be accessible across different devices or browsers.
          </p>
          <p className="text-sm">
            For best results, open shared links in the same browser where they were created.
          </p>
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        <Button asChild className="px-8 py-6 text-lg rounded-full">
          <Link to="/" className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            <span>Go to Home</span>
          </Link>
        </Button>
        <Button 
          variant="outline" 
          asChild 
          className="px-8 py-6 text-lg rounded-full"
        >
          <a 
            href="https://docs.lovable.dev/user-guides/organization-visualizer" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-5 w-5" />
            <span>Learn about sharing</span>
          </a>
        </Button>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          You'll need to upload your data again or request a new share link.
        </p>
      </div>
    </div>
  );
};

export default SharedError;
