'use client';
import React, { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
interface ProvidersProps {
  children: ReactNode;
}
const queryClient = new QueryClient();

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
   
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
    
  );
};

export default Providers;
