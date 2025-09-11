import React from 'react'
import JsonView from 'react18-json-view'
import { JsonViewProps } from 'react18-json-view';

type DataViewerWrapperProps = { children?: React.ReactNode, title?: string, stripFunctions?: boolean } & JsonViewProps

const DataViewerWrapper: React.FC<DataViewerWrapperProps> = ({ children, title = "Data", src, stripFunctions = false, ...rest }) => {
    return (
        <div className='w-72 flex flex-col'>
            <p className='font-roboto-mono text-xs font-semibold text-center text-label-primary'>{title}</p>
            <div className='max-h-[70vh] overflow-y-scroll flex flex-col w-full mt-2 text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <JsonView 
                    src={sanitize(src, stripFunctions)}
                    collapsed={({ depth }) => depth > 1}
                    {...rest}
                />
            </div>
            {children}
        </div>
    )
}

export default DataViewerWrapper

// recursively clone object and optionally remove function values
function sanitize(value: any, stripFunctions: boolean): any {
    const recurse = (val: any): any => {
        if (val === null) return 'null';
        if (typeof val === 'undefined') return 'undefined';

        if (val instanceof Map) {
            const o: any = {};
            val.forEach((v: any, k: any) => {
                const key = typeof k === 'string' ? k : JSON.stringify(k);
                o[key] = recurse(v);
            });
            return o;
        }

        if (val instanceof Set) {
            return Array.from(val).map(recurse);
        }

        if (Array.isArray(val)) {
            return val.map(recurse);
        }

        if (val && typeof val === 'object') {
            const o: any = {};
            Object.entries(val).forEach(([k, v]) => {
                if (typeof v !== 'function' || !stripFunctions) {
                    o[k] = recurse(v);
                }
            });
            return o;
        }

        return val;
    };

    return recurse(value);
}
