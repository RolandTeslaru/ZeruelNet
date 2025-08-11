import React, { createContext, useContext, useState, useMemo } from 'react';

interface TablesContextState {
  selectedTable: string;
  setSelectedTable: (table: string) => void;
}

const TablesContext = createContext<TablesContextState | undefined>(undefined);

export const TablesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedTable, setSelectedTable] = useState('videos');

  const value = useMemo(() => ({
    selectedTable,
    setSelectedTable,
  }), [selectedTable]);

  return (
    <TablesContext.Provider value={value}>
      {children}-
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