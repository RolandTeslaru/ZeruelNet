import './App.css'
import Layout from './components/Layout'
import 'react18-json-view/src/style.css'
import { useSystem } from './stores/useSystem'
import Scraper from './pages/Scraper'
import Tables from './pages/Tables'
import Trends from './pages/Trends'
import SysHealth from './pages/SysHealth'

function App() {

  const currentPage = useSystem(state => state.currentPage)
  
  return (
    <Layout>
      <div className="flex flex-row min-w-auto min-h-screen max-h-screen w-full px-7 pb-15 pt-24 ">
        <div className=' w-full  '>

          {/* <TestChart1/>
          <TestChart2/> */}
          <Scraper show={currentPage === "scraper"}/>
          <Tables show={currentPage === "tables"}/>
          <Trends show={currentPage === "trendsanalysis"}/>
          <SysHealth show={currentPage === "health"}/>
        </div>
      </div>
    </Layout>
  )
}

export default App
