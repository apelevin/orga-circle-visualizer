
import React from "react";

const SharedLoading = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="mt-4 text-muted-foreground">Loading shared organization data...</p>
    </div>
  );
};

export default SharedLoading;
