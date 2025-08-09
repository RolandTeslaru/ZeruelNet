import { useState } from 'react'
import './App.css'
import Layout from './components/Layout'
import {TestChart1, TestChart2} from './components/TestChart'
import { DataTable } from './components/Table/DataTable'
import { Transaction } from "@/data/schema"
import { transactions } from "@/data/transactions"
import { Row } from '@tanstack/react-table'
import { getColumns } from './components/Table/Columns'
import { DataTableDrawer } from './components/Table/DataTableDrawer'

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

  return (
    <Layout>
      <div className="flex flex-row gap-4 min-w-auto min-h-screen w-full px-7 pb-6 pt-[150px]">
        {/* <TestChart1/>
        <TestChart2/> */}
        <DataTable
          data={transactions}
          columns={columns}
          onRowClick={(row) => {
            setRow(row)
            setIsOpen(true)
          }}
        />
                <DataTableDrawer open={isOpen} onOpenChange={setIsOpen} datas={datas} />
      </div>
    </Layout>
  )
}

export default App
