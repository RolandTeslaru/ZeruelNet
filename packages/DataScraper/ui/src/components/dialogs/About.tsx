import React from 'react'
import { DialogDescription, DialogTitle } from '@zeruel/shared-ui/foundations'
import dataHarvesterUIPackageJson from "../../../package.json"
import dataHarvesterServicePackageJson from "../../../../service/package.json"
import zeruelNetPackageJson from "../../../../../../package.json"
import VexrLogo from '@zeruel/shared-ui/VexrLogo';

export const DialogAbout = () => {
  return (
    <div className='w-[500px] my-2 flex flex-col gap-4'>
      <div>
        <DialogTitle className='w-full flex'>
          <VexrLogo className='h-16 mx-auto mb-2 text-white'/>
        </DialogTitle>

        <DialogDescription className='w-fit mx-auto mt-auto text-label-quaternary mb-3'>
          <div className='flex flex-col gap-1'>
            <div className='flex justify-between'>
              <span>DataScraper UI</span>
              &nbsp;
              <span>{dataHarvesterUIPackageJson.version}</span>
            </div>
            <div className='flex justify-between'>
              <span>DataScraper Service</span>
              &nbsp;
              <span>{dataHarvesterServicePackageJson.version}</span>
            </div>
            <div className='flex justify-between'>
              <span>Zeruel Net</span>
              <span>{zeruelNetPackageJson.version}</span>
            </div>
          </div>
        </DialogDescription>

        <DialogDescription className='text-center'>
          © 2025 VEXR Labs
        </DialogDescription>
      </div>
      <DialogDescription className='text-center'>
        VEXR Labs proprietary software.
      </DialogDescription>
    </div>
  )
}