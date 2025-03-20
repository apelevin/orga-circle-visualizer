
import React from 'react';

const Header = () => {
  return (
    <header className="w-full pb-6 md:pb-8 pt-8 px-6 animate-fade-in">
      <div className="max-w-screen-xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          <span className="inline-block">Organizational Structure</span>
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Visualize your organization's circles and roles using interactive hierarchical circle packing
        </p>
      </div>
    </header>
  );
};

export default Header;
