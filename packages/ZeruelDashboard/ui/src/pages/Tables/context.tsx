import React, { createContext, useContext, useState, useMemo } from 'react';

interface TablesContextState {
  selectedTable: string;
  setSelectedTable: (table: string) => void;
  // Stores the last submitted query parameters for the selected table
  queryParams: Record<string, any> | undefined;
  setQueryParams: (params: Record<string, any>) => void;
}

const TablesContext = createContext<TablesContextState | undefined>(undefined);

export const TablesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedTable, setSelectedTable] = useState('videos');
  const [queryParams, setQueryParams] = useState<Record<string, any> | undefined>(undefined);

  const value = useMemo(() => ({
    selectedTable,
    setSelectedTable,
    queryParams,
    setQueryParams,
  }), [selectedTable, queryParams]);

  return (
    <TablesContext.Provider value={value}>
      {children}
    </TablesContext.Provider>
  );
};

export const useTablesContext = () => {
    const context = useContext(TablesContext);
    if (context === undefined) {
      throw new Error('useTablesContext must be used within a TablesProvider');
    }
    return context;
  };