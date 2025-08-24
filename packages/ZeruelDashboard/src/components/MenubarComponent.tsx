import React from 'react'
import { Menubar, MenubarContent, MenubarItem, MenubarSubContent, MenubarSubTrigger, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarTrigger } from '@zeruel/shared-ui/foundations/menubar'
import { BracketsWindowStyling, StandardWindowStyling } from '@zeruel/shared-ui/WindowStyling'
import { pushDialogStatic, useUIManagerAPI } from '@zeruel/shared-ui/UIManager/store'
import { DEBUG_NORMAL_dialog } from '@zeruel/shared-ui/dialogs/debug'

const LOG_MODULE = "VXMenubar"

const MenubarComponent = () => {
    return (
        <BracketsWindowStyling
            className='2xl:block hidden !fixed !w-fit left-1/2 -translate-x-1/2 top-4 z-10 px-3! py-0! text-white' 
            id="VXEngineMenubar"
        >
            <div className='my-auto-fit text-white! font-roboto-mono flex flex-row text-sm 2xl:flex'>
                <Menubar className=' h-auto'>
                    {/* <LogoButton /> */}
                    <FileButton />
                    <EditButton />
                    <SelectButton />
                    <DebugButton />
                    <ViewButton />
                    <SceneButton />
                </Menubar>
            </div>
        </BracketsWindowStyling>
    )
}

export default MenubarComponent

const LogoButton = () => {

    const pushDialog = useUIManagerAPI(state => state.pushDialog);

    return (
        <MenubarMenu>
            <MenubarTrigger className='my-0! py-0!'>
                <p>Zeruel Net</p>
            </MenubarTrigger>
        </MenubarMenu >
    )
}

const FileButton = () => {
    return (
        <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
                <MenubarItem>New</MenubarItem>
                <MenubarItem>Open</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Import</MenubarItem>
                <MenubarItem>Export</MenubarItem>

            </MenubarContent>
        </MenubarMenu>
    )
}

const EditButton = () => {
    return (
        <MenubarMenu>
            <MenubarTrigger><p className='font-roboto-mono'>Edit</p></MenubarTrigger>
            <MenubarContent>
                <MenubarItem>
                    Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>
                    Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem>
                    Settings
                </MenubarItem>
            </MenubarContent>
        </MenubarMenu>
    )
}

const SelectButton = React.memo(() => {

    return (
        <MenubarMenu>
            <MenubarTrigger><p className='font-roboto-mono'>Select</p></MenubarTrigger>
            <MenubarContent>

            </MenubarContent>
        </MenubarMenu>
    )
})

const DebugButton = () => {
    return (
        <MenubarMenu>
            <MenubarTrigger><p className='font-roboto-mono'>Debug</p></MenubarTrigger>
            <MenubarContent>
                <MenubarItem onClick={() => pushDialogStatic({
                    content: <DEBUG_NORMAL_dialog />,
                    type: "normal",
                })}>
                    Open Debug Dialog
                </MenubarItem>
            </MenubarContent>
        </MenubarMenu>
    )
}

const CheckVisualizer = ({ show }: { show: boolean }) => {
    if (show)
        return (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
        )
    else
        return null;
}

const handleOnClickViewButton = (id: string) => {
    const state = useUIManagerAPI.getState();
    if (state.vxWindows[id].isOpen)
        state.closeVXWindow(id);
    else
        state.openVXWindow(id);
}

const ViewButton = () => {
    const vxWindows = useUIManagerAPI(state => state.vxWindows)

    return (
        <MenubarMenu>
            <MenubarTrigger><p className='font-roboto-mono'>View</p></MenubarTrigger>
            <MenubarContent>
                {Object.entries(vxWindows).map(([id, vxwindow]) =>
                    <MenubarItem key={id} onClick={() => handleOnClickViewButton(id)}>
                        {vxwindow.title} <MenubarShortcut><CheckVisualizer show={vxwindow.isOpen} /></MenubarShortcut>
                    </MenubarItem>
                )}

            </MenubarContent>
        </MenubarMenu>
    )
}

const SceneButton = () => {
    return (
        <MenubarMenu>
            <MenubarTrigger><p className='font-roboto-mono'>Scene</p></MenubarTrigger>
            <MenubarContent>

            </MenubarContent>
        </MenubarMenu>
    )
}