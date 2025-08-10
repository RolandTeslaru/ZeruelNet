import { useState } from 'react'
import './App.css'
import Layout from './components/Layout'
import { TestChart1, TestChart2 } from './components/TestChart'
import { DataTable } from './components/Table/DataTable'
import { Transaction } from "@/data/schema"
import { transactions } from "@/data/transactions"
import { Row } from '@tanstack/react-table'
import { getColumns } from './components/Table/Columns'
import { DataTableDrawer } from './components/Table/DataTableDrawer'
import VideosTable from './components/VideosTable'
import { VXWindow } from '@zeruel/shared-ui/VXWindow'
import { BracketsWindowStyling } from '@zeruel/shared-ui/WindowStyling'
import 'react18-json-view/src/style.css'
import { Tabs, TabsList, TabsTrigger } from '@zeruel/shared-ui/foundations'

function App() {

  const [row, setRow] = useState<Row<Transaction> | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const datas = row?.original

  const columns = getColumns({
    onEditClick: (row) => {
      setRow(row)
      setIsOpen(true)
    },
  })

  const [currentPage, setCurrentPage] = useState<"scraper" | "tables" | "trendsanalysis" | "health">("scraper")

  return (
    <Layout>
      <div className="flex flex-row gap-4 min-w-auto min-h-screen max-h-screen w-full px-7 pb-6 pt-[70px] ">
        {/* <TestChart1/>
        <TestChart2/> */}
        <VXWindow
          vxWindowId='ZNDashboardVideosPanel'
          title='ZereulNet DataHarvester: Scraped Videos Panel'
          windowClasses=''
          StylingComponent={
            <BracketsWindowStyling
              className='!relative w-[500px]  max-h-[700px] p-1'
              detachedClassName=''
            />
          }
          >
          <VideosTable />
        </VXWindow>
        {/* <DataTable
          data={transactions}
          columns={columns}
          onRowClick={(row) => {
            setRow(row)
            setIsOpen(true)
          }}
        />
                <DataTableDrawer open={isOpen} onOpenChange={setIsOpen} datas={datas} /> */}
      </div>
    </Layout>
  )
}

export default App
