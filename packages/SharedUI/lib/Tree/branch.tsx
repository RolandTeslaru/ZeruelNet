import { memo, useCallback } from "react";
import { BranchComponentProps } from "./types";
import { getTreeStore, useBranch, useTree } from "./context";


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
    const branch = useBranch(path)

    const branchCanBeLazyLoaded = loadBranchChildren && branch.canBeExpanded && !branch.children

    const onExpand = useCallback(async () => {
        if (branch.children || branch.isLoading) return;

        store.getState().setBranchLoading(path, true);

        try {
            const maybe = loadBranchChildren?.(branch, store.getState())
            const children = await Promise.resolve(maybe) // handles sync and async
            store.getState().attachLoadedChildren(children, path)
        } finally {
            store.getState().setBranchLoading(path, false)
            store.getState().setExpanded(true, path)
        }
    }, [branchCanBeLazyLoaded])


    const BranchTemplate = ({ children, className, listClassName, ...rest }) => (
        <li
            role="treeItem"
            aria-selected="false"
            aria-expanded={branch.isExpanded}
            aria-level={level}
            tabIndex={-1}
            className={listClassName + " relative w-full"}
        >
            <div
                className={` relative h-8 w-full flex items-center gap-2`}
                style={{
                    paddingLeft: `${level * 24}px`
                }}
                {...rest}
            >
                {branch.canBeExpanded ?
                    <BranchCollapseButton
                        isExpanded={branch.isExpanded}
                        onClick={() => {
                            if(branch.isExpanded)
                                store.getState().setExpanded(false, branch.currentPath)
                            else
                                onExpand()
                        }}
                        level={level}
                    />
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
 
    return renderBranch ? renderBranch(branch, BranchTemplate) : null

})


interface BranchCollapseButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    isExpanded: boolean
    level: number
    onClick: () => void
}

const BranchCollapseButton: React.FC<BranchCollapseButtonProps> = ({
    isExpanded,
    ...props
}) => {
    return (
        <button
            className="cursor-pointer"
            {...props}
            style={{
                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
            }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth={1} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" strokeWidth="0.5" />
                <path d="m10 8 4 4-4 4" />
            </svg>
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