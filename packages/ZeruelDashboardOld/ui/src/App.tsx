import './App.css'
import Layout from './components/Layout'
import 'react18-json-view/src/style.css'
import { useSystem } from './stores/useSystem'
import Scraper from './pages/Scraper'
import Tables from './pages/Tables'
import Trends from './pages/Trends'
import SysHealth from './pages/SysHealth'
import { useEffect } from 'react'
import { usePageTransition } from './stores/usePageTransition'
import { useGatewayService } from './stores/useGatewayService'
import Enrichment from './pages/Enrichment'

useGatewayService.getState().connect()

function App() {

  const currentPage = useSystem(state => state.currentPage)

  useEffect(() => {
    usePageTransition.getState().transition({
      toPage: "scraper",
      enterAnimationDelay: false
    })
  }, [])
  
  return (
    <Layout>
      <div className="flex flex-row min-w-auto min-h-screen max-h-screen w-full px-7 pb-15 pt-24 ">
        <div className=' w-full relative '>

          {/* <TestChart1/>
          <TestChart2/> */}
          <Scraper show={currentPage === "scraper"}/>
          <Enrichment show={currentPage === "enrichment"}/>
          <Tables show={currentPage === "tables"}/>
          <Trends show={currentPage === "trendsanalysis"}/>
          <SysHealth show={currentPage === "health"}/>
        </div>
      </div>
    </Layout>
  )
}

export default App
