import React from 'react';
import { ILayoutProps } from '@/types';
import { AppSidebar } from '../AppSidebar';
import { Header } from '../Header';
import { SidebarProvider } from '../ui/sidebar';

const Layout: React.FC<ILayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br flex">
      <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-col p-2 px-6 w-full transition-all duration-300">
          <Header/>
          {children}
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Layout;