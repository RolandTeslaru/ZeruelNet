import { useState } from 'react'
import './App.css'
import Layout from './components/Layout'
import {TestChart1, TestChart2} from './components/TestChart'

function App() {
  return (
    <Layout>
      <div className="flex flex-row gap-4 min-w-auto min-h-screen w-full px-7 pb-6 pt-[150px]">
        <TestChart1/>
        <TestChart2/>
      </div>
    </Layout>
  )
}

export default App
