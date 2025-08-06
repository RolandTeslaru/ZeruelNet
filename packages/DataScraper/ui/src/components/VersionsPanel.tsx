import CollapsiblePanel from '@zeruel/shared-ui/CollapsiblePanel'
import React from 'react'
import dataHarvesterUIPackageJson from "../../package.json"
import dataHarvesterServicePackageJson from "../../../service/package.json"
import zeruelNetPackageJson from "../../../../../package.json"

const VersionsPanel = () => {
    return (
        <CollapsiblePanel title='Package versions' defaultOpen={false} className='font-mono'>
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
        </CollapsiblePanel>
    )
}

export default VersionsPanel