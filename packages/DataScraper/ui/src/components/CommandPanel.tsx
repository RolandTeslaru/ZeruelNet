import React from 'react'
import CollapsiblePanel from '../ui/components/CollapsiblePanel'
import { Switch, Input, Button } from '../ui/foundations'

const CommandPanel = () => {
    return (
        <CollapsiblePanel title="Somethign">
            <form className='relative flex flex-col gap-2 font-roboto-mono text-xs text-white'>
                <div className='flex justify-between font-light'>
                    <p>Hashtag</p>
                    <Input className='max-w-1/2 text-xs'/>
                </div>
                <div className='flex justify-between font-light'>
                    <p>Refresh already saved media</p>
                    <Switch/>
                </div>
                <div className='flex justify-between font-light'>
                    <p>Max Videos</p>
                    <Input className='w-[60px] text-xs' type='number'/>
                </div>
                <Button variant='primary' className='relative text-xs' size='sm'>
                    Start
                </Button>
            </form>
        </CollapsiblePanel>
    )
}

export default CommandPanel