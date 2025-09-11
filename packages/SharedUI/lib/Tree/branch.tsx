import { memo, useCallback } from "react";
import { BranchComponentProps } from "./types";
import { getTreeStore, useBranch, useTree } from "./context";
import { Spinner } from "../foundations";
import { AlertTriangle } from "../icons";


const BranchComponent: React.FC<BranchComponentProps> = memo(({
    path,
    level,
    siblingsLen,
    indexToParent,
    renderBranch,
    loadBranchChildren
}) => {
    const isFinalSibling = siblingsLen - 1 === indexToParent
    const store = getTreeStore();
    const branch = useTree(s => s.branchesFlatMap.get(path))
    // const branch = useBranch(path)

    const branchCanBeLazyLoaded = loadBranchChildren && branch.canBeExpanded && !branch.children

    if(!branch)
        return (
            <div className="flex flex-row text-red-600 gap-2 animate-pulse">
                <AlertTriangle size={35} className=""/>
                <p className="text-red-600">{`BRANCH '${path}' DOES NOT EXIST IN FLAT MAP TREE CONTEXT`}</p>
            </div>
        )

    const onExpandButtonClick = useCallback(async () => {
        if (branch.isExpanded)
            store.getState().setExpanded(false, branch.currentPath)
        else {
            if (branch.children || branch.isLoading)
                store.getState().setExpanded(true, branch.currentPath)
            else {
                store.getState().setBranchLoading(path, true);
                try {
                    const maybe = loadBranchChildren?.(branch, store.getState())
                    const children = await Promise.resolve(maybe) // handles sync and async
                    store.getState().attachLoadedChildren(children, path)
                } finally {
                    store.getState().setBranchLoading(path, false)
                    store.getState().setExpanded(true, path)
                }
            }
        }
    }, [branch.isExpanded, branch.children, branch.isLoading])

    if(branch.isMounted === false)
        return null

    const BranchTemplate = ({ children, className, listClassName, ...rest }) => (
        <li
            role="treeItem"
            aria-selected="false"
            aria-expanded={branch.isExpanded}
            aria-level={level}
            tabIndex={-1}
            className={listClassName + " relative min-w-full w-fit"}
        >
            <div className={`${className} relative min-h-8 h-fit min-w-full flex items-center gap-2`}
                style={{ paddingLeft: `${level * 24}px` }}
                {...rest}
            >
                {branch.canBeExpanded ?
                    <>
                        <div className={`content-[""] absolute top-0 min-w-[1px] bg-neutral-500  h-[calc(50%_-_6px)] ml-[7.5px]`} />
                        <BranchExpandButton
                            isExpanded={branch.isExpanded}
                            isLoading={branch.isLoading}
                            onClick={onExpandButtonClick}
                            level={level}
                        />
                        {!branch.isExpanded && !isFinalSibling && (
                            <div className={`content-[""] absolute bottom-0 min-w-[1px] h-[calc(50%_-_6px)] bg-neutral-500  ml-[7.5px]`} />
                        )}
                    </>
                    : <>
                        {isFinalSibling ?
                            <TreeLineCorner level={level} />
                            :
                            <TreeLine level={level} />
                        }
                        <TreeLineConnect />
                    </>
                }
                {children}
            </div>
            {branch.isExpanded && branch.canBeExpanded && (
                <ul role="group" className='m-0 p-0'>
                    {!!branch.children && Array.from(branch.children).map(([childKey, childBranch], i) =>
                        <BranchComponent
                            key={`tree-${branch.key}-${i}`}
                            path={childBranch.currentPath}
                            siblingsLen={branch.children.size}
                            indexToParent={i}
                            level={level + 1}
                            renderBranch={renderBranch}
                            loadBranchChildren={loadBranchChildren}
                        />
                    )}
                </ul>
            )}
        </li>
    )

    if (branch.overrideRenderBranch)
        return branch.overrideRenderBranch({branch, BranchTemplate})
    else if (renderBranch)
        return renderBranch({branch, BranchTemplate})

    return null
})


interface BranchExpandButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    isExpanded: boolean
    isLoading: boolean
    level: number
    onClick: () => void
}

const BranchExpandButton: React.FC<BranchExpandButtonProps> = ({
    isExpanded,
    isLoading,
    ...props
}) => {
    return (
        <button
            className="!cursor-pointer transition-transform duration-200"
            {...props}
        >
            {isLoading
                ? <Spinner className="w-4" />
                : <svg
                    className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth={1} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" strokeWidth="0.5" />
                    <path d="m10 8 4 4-4 4" />
                </svg>
            }


        </button>
    )
}



export const TreeLine = memo(({ level }: { level: number }) => {
    return <div className={`content-[""] absolute top-0 w-[1px] min-w-[1px] h-full
                            ml-[7.5px]  bg-neutral-500 left-[${level * 16 + 4}px ]`}
    />
})


interface TreeLineCornerProps {
    level: number;
    size: "sm" | "md";
}


export const TreeLineCorner = memo(({ level }: { level: number }) => {
    return <div className={`content-[""] absolute top-0 w-[1px] min-[1px]
                            ml-[7.5px] h-1/2!  bg-neutral-500  left-[${level * 16 + 4}px ]`}></div>
})

export const TreeLineConnect = memo(() => {
    return <div className={`ml-2 w-2 min-w-2 h-[1px] content-[" "] bg-neutral-500`}></div>
})



export default BranchComponent