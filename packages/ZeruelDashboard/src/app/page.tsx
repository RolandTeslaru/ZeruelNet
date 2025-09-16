"use client"
import Layout from "@/components/Layout";
import Enrichment from "@/components/pages/Enrichment";
import Scraper from "@/components/pages/Scraper";
import SysHealth from "@/components/pages/SysHealth";
import Tables from "@/components/pages/Tables";
import Trends from "@/components/pages/Trends";
import { usePageTransition } from "@/stores/usePageTransition";
import { useSystem } from "@/stores/useSystem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/next"

const queryClient = new QueryClient()

export default function Home() {

  const currentPage = useSystem(state => state.currentPage)

  useEffect(() => {
    usePageTransition.getState().transition({
      toPage: "trendsanalysis",
      enterAnimationDelay: false
    })
  }, [])

  return (
    <Layout>
      <Analytics/>
      <QueryClientProvider client={queryClient}>
        <div className="flex flex-row min-w-auto min-h-screen max-h-screen w-full px-7 pb-15 pt-20 ">
          <div className=' w-full relative '>

            {/* <TestChart1/>
              <TestChart2/> */}
            <Scraper show={currentPage === "scraper"} />
            <Enrichment show={currentPage === "enrichment"} />
            <Tables show={currentPage === "tables"} />
            <Trends show={currentPage === "trendsanalysis"} />
            <SysHealth show={currentPage === "health"} />
          </div>
        </div>
      </QueryClientProvider>
    </Layout>
  );
}
