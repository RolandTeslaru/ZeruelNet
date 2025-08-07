import { useState } from 'react'
import './App.css'
import Layout from './components/Layout'
import TestChart from './components/TestChart'

function App() {
  return (
    <Layout>
      <div className="flex flex-row gap-4 min-w-auto min-h-screen w-full px-7 pb-6 pt-[150px]">
        <TestChart/>
      </div>
    </Layout>
  )
}

export default App
