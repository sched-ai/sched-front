import React from 'react';
import { ILayoutProps } from '@/types';

const Layout: React.FC<ILayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      {children}
    </div>
  );
};

export default Layout; 