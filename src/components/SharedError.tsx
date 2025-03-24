
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

interface SharedErrorProps {
  errorMessage: string | null;
}

const SharedError = ({ errorMessage }: SharedErrorProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <p className="text-xl font-semibold mb-2">
        {errorMessage || "This shared link has expired or doesn't exist"}
      </p>
      <p className="text-muted-foreground mb-6">The shared data could not be loaded.</p>
      <Button asChild className="px-8 py-6 text-lg rounded-full">
        <Link to="/" className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          <span>Go to Home</span>
        </Link>
      </Button>
    </div>
  );
};

export default SharedError;
