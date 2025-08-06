
import React from 'react'
import { shallow } from 'zustand/shallow';
import { Text, Tabs, TabsList, TabsTrigger } from "@zeruel/shared-ui/foundations"
import { useUIManagerAPI } from '@zeruel/shared-ui/UIManager/store';

export const SettingsAppearance = () => {
  const {theme, setTheme} = useUIManagerAPI(state => ({
    theme: state.theme,
    setTheme: state.setTheme
  }), shallow)
  return (
    <>
      <div className='flex flex-row justify-between'>
        <Text>theme</Text>
        <Tabs defaultValue={theme}>
          <TabsList>
            <TabsTrigger value="light" onClick={() => setTheme("light")} className="text-white text-xs font-roboto-mono">
              Light
            </TabsTrigger>
            <TabsTrigger value="dark" onClick={() => setTheme("dark")} className="text-white text-xs font-roboto-mono">
              dark
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </>
  )
}