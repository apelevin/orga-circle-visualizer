
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

interface SharedHeaderProps {
  orgName: string;
}

const SharedHeader = ({ orgName }: SharedHeaderProps) => {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{orgName}</h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </Button>
      </div>
    </header>
  );
};

export default SharedHeader;
