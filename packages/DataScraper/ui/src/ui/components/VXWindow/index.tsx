import React, { useEffect, useMemo, useRef, createContext, useContext, useState, FC, memo, useCallback, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { DetachableWindowProps, useWindowContext, VXEngineWindowProps, WindowContextProps, WindowStylingProps } from './useWindowContext';
import { WindowControlDots } from './WindowControlDots';
import { useUIManagerAPI } from '../../UIManager/store';
import { DotPattern } from '../DotPattern';

export const WindowContext = createContext<WindowContextProps>({
    vxWindowId: "",
    externalContainer: null,
    setExternalContainer: (element) => { }
});

export const VXWindow: FC<VXEngineWindowProps> = memo((props) => {
    const { children, title = "VXWindow", windowClasses, vxWindowId, showControls = true,
        StylingComponent, } = props;

    const [theme, registerWindow, vxWindow, isStoreHydrated, attachVXWindow] = useUIManagerAPI(state => [
        state.theme, state.registerWindow, state.vxWindows[vxWindowId], state.hydrated, state.attachVXWindow
    ])

    const isRegistered = useRef(false);
    if (!isRegistered.current) {
        registerWindow(vxWindowId, title);
        isRegistered.current = true;
    }

    const [externalContainer, setExternalContainer] = useState<HTMLElement | null>(null);

    const handleAttach = () => attachVXWindow(vxWindowId)

    const Content = useMemo(() => {
        if (StylingComponent) {
            return React.cloneElement(StylingComponent, {
                isDetached: !vxWindow.isAttached,
                children: (
                    <>
                        {showControls && <WindowControlDots />}
                        {children}
                    </>
                )
            });
        }
        else
            return (
                <>
                    {showControls && <WindowControlDots />}
                    {children}
                </>
            )
    }, [StylingComponent, children, vxWindow.isAttached, showControls])


    // const Content = () => {
    //     if (noStyling) {
    //         return <>{children}</>;
    //     } else {
    //         return (
    //             <StandardWindowStyling
    //                 className={className + ` ${theme}`}
    //                 detachedClassName={detachedClassName}
    //                 isDetached={!vxWindow.isAttached}
    //             >
    //                 <WindowControlDots />
    //                 {children}
    //             </StandardWindowStyling>
    //         );
    //     }
    // }

    if (isStoreHydrated === false) return null;

    if (vxWindow.isOpen === false) return null;

    return (
        <WindowContext.Provider value={{ externalContainer, setExternalContainer, vxWindowId }}>
            {vxWindow.isAttached ? (
                Content
            ) : (
                <DetachableWindow vxWindowId={vxWindowId} onClose={handleAttach} title={title} windowClasses={windowClasses}>
                    {Content}
                </DetachableWindow>
            )
            }
        </WindowContext.Provider>
    )
});



export const CrossesWindowStyling: React.FC<WindowStylingProps & { crossesClassName?: string }> = ({
    className, style, children, isDetached = false, detachedClassName, detachedStyling, crossesClassName, ...rest
}) => {
    return (
        <div
            className={classNames(
                isDetached && ['rounded-none', detachedClassName],
                'p-2 flex flex-col gap-2 border border-white/20',
                className,
                { "rounded-none": isDetached },
            )}
            style={{
                ...(isDetached ? detachedStyling : {}),
                ...style,
            }}
            {...rest}
        >
            {isDetached && <DotPattern />}
            <Icon className={classNames("absolute h-4 w-4 top-0 left-0 transform -translate-x-1/2 -translate-y-1/2", crossesClassName)} />
            <Icon className={classNames("absolute h-4 w-4 top-0 right-0 transform translate-x-1/2 -translate-y-1/2", crossesClassName)} />
            <Icon className={classNames("absolute h-4 w-4 bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2", crossesClassName)} />
            <Icon className={classNames("absolute h-4 w-4 bottom-0 right-0 transform translate-x-1/2 translate-y-1/2", crossesClassName)} />
            {children}
        </div>
    )
}


export const Icon = ({ className, ...rest }: any) => {
    return (
        <div
            className={className}
            {...rest}
        >
            <div className="absolute w-full border-t !border-white top-1/2 left-0 -translate-y-1/2" />
            <div className="absolute h-full border-l !border-white left-1/2 top-0 -translate-x-1/2" />
        </div>
    );
};

export const BracketsWindowStyling: React.FC<WindowStylingProps & { bracketsClassName?: string }> = ({
    className, style, children, isDetached = false, detachedClassName, detachedStyling, bracketsClassName, ...rest
}) => {
    return (
        <div
            className={classNames(
                isDetached && ['rounded-none', detachedClassName],
                'relative p-2 flex flex-col gap-2 border border-white/20 h-fit',
                className,
                { "rounded-none": isDetached },
            )}
            style={{
                ...(isDetached ? detachedStyling : {}),
                ...style,
            }}
            {...rest}
        >
            {isDetached && <DotPattern />}
            <div className={`absolute -top-1 -left-1 w-3 h-3 border-white border-l border-t`} />
            <div className={`absolute -top-1 -right-1 w-3 h-3 border-white border-r border-t`} />
            <div className={`absolute -bottom-1 -left-1 w-3 h-3 border-white border-l border-b`} />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-white border-r border-b`} />
            {children}
        </div>
    )
}

export const StandardWindowStyling = (props: WindowStylingProps) => {
    const { children, className, isDetached, style, detachedStyling, detachedClassName, ...rest } = props

    return (
        <div
            className={classNames(
                isDetached && ['rounded-none', detachedClassName],
                'p-2 backdrop-blur-md bg-background  border-border-background border-[1px] rounded-2xl flex flex-col gap-2',
                className,
                { "rounded-none": isDetached },
            )}
            style={{
                ...(isDetached ? detachedStyling : {}),
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.6), 0 1px 6px -4px rgb(0 0 0 / 0.6", ...style,
            }}
            {...rest}
        >
            {children}
        </div>
    )
}



export const ResizableWindowStyling = (props: WindowStylingProps) => {
    const { children, className, isDetached, style, detachedStyling, detachedClassName, ...rest } = props

    return (
        <div
            className={classNames(
                isDetached && ['rounded-none', detachedClassName],
                'p-2 backdrop-blur-md bg-background border-border-background border-[1px] rounded-2xl flex flex-col gap-2',
                className,
                { "rounded-none": isDetached },
            )}
            style={{
                ...(isDetached ? detachedStyling : {}),
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.6), 0 1px 6px -4px rgb(0 0 0 / 0.6", ...style,
            }}
            {...rest}
        >
            {children}
        </div>
    )
}


const DetachableWindow: React.FC<DetachableWindowProps> = (props) => {
    const { children, onClose, vxWindowId, windowClasses, title } = props;
    const { setExternalContainer } = useWindowContext();
    const containerRef = useRef<HTMLDivElement>(document.createElement('div'));
    const externalWindow = useRef<Window | null>(null);

    // A hacky way to stop infinite window creation during detachment
    const effectTriggerCountRef = useRef(0);

    const handleOnClose = useCallback(() => {
        if (externalWindow.current) {
            console.log(`Window "${title}" is closing`);
            setExternalContainer(null);
            onClose?.();
        }
    }, [setExternalContainer, onClose, title]);


    useEffect(() => {
        // This useEffect must run at least twice to get a working window
        // if it runs only once, it opens and then closes the window immediately
        effectTriggerCountRef.current++;
        if (effectTriggerCountRef.current > 2)
            return
        // if(openedOnceRef.current) return;
        // openedOnceRef.current = true;
        const htmlContent = '<html><head><title>' + title + '</title></head><body></body></html>';
        externalWindow.current = window.open('', '', windowClasses);

        if (!externalWindow.current) {
            console.error("VXEngineWindow: Failed to open new Window");
            return;
        }

        const extDocument = externalWindow.current.document;
        if (title)
            extDocument.title = title;
        extDocument.body.style.width = '100vw';
        extDocument.body.style.height = '100vh';
        extDocument.body.style.margin = '0';
        extDocument.body.style.overflow = 'hidden';
        extDocument.body.appendChild(containerRef.current);

        // Copy styles
        document.querySelectorAll('link[rel="stylesheet"], style').forEach((link) => {
            extDocument.head.appendChild(link.cloneNode(true));
        });

        console.log(`Window "${props.title}" has been created`)

        // IMPORTANT: update the context with the external container
        setExternalContainer(extDocument.body);

        const curWindow = externalWindow.current;
        curWindow.addEventListener('beforeunload', handleOnClose);


        return () => {
            curWindow.removeEventListener('beforeunload', handleOnClose);
            curWindow.close();
        };
    }, []); // Dependencies should remain stable

    return ReactDOM.createPortal(children, containerRef.current);
};
