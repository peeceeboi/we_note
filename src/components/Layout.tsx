import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950">
      {children}
    </div>
  );
};

export default Layout;
