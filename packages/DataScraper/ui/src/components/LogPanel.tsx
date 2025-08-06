import { useCallback, useEffect, useRef, useState } from "react";
import { useLogMessages } from "../stores/useLogMessages";
// import { Server } from "../ui/icons";
import { Server } from "@zeruel/shared-ui/icons"
import classNames from "classnames";
import { Virtuoso } from 'react-virtuoso'

type LogLevel = 'info' | 'error' | 'warn' | 'success' | 'debug';

interface LogMessage {
    level: LogLevel;
    message: string;
    timestamp: string;
}

const levelColorMap: Record<LogLevel, string> = {
    info: 'text-blue-400',
    error: 'text-red-500',
    warn: 'text-yellow-400',
    success: 'text-green-400',
    debug: 'text-gray-500',
};

export const LogPanel = () => {
    const scrollerRef = useRef<HTMLElement | null>(null);
    const messages = useLogMessages(state => state.messages);

    const handleScrollerRef = useCallback((ref) => {
        scrollerRef.current = ref;
    }, []);

    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (scrollerRef.current)
            scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight
    }, [messages, expanded])




    return (
        <div className="w-[500px] rounded-lg shadow-inner overflow-hidden">
            <div className="flex">
                <Server className="!text-white/70 h-3 mt-1" />
                <h3 className="text-sm font-medium text-white/70 mb-2 font-roboto-mono">Server Log</h3>

            </div>

            <button className="absolute right-1 top-1 rounded-md opacity-50 cursor-pointer"
                onClick={() => setExpanded(value => !value)}
            >
                <svg className="text-label-primary" width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 3.04999C11.7485 3.04999 11.95 3.25146 11.95 3.49999V7.49999C11.95 7.74852 11.7485 7.94999 11.5 7.94999C11.2515 7.94999 11.05 7.74852 11.05 7.49999V4.58639L4.58638 11.05H7.49999C7.74852 11.05 7.94999 11.2515 7.94999 11.5C7.94999 11.7485 7.74852 11.95 7.49999 11.95L3.49999 11.95C3.38064 11.95 3.26618 11.9026 3.18179 11.8182C3.0974 11.7338 3.04999 11.6193 3.04999 11.5L3.04999 7.49999C3.04999 7.25146 3.25146 7.04999 3.49999 7.04999C3.74852 7.04999 3.94999 7.25146 3.94999 7.49999L3.94999 10.4136L10.4136 3.94999L7.49999 3.94999C7.25146 3.94999 7.04999 3.74852 7.04999 3.49999C7.04999 3.25146 7.25146 3.04999 7.49999 3.04999L11.5 3.04999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            </button>

            <Virtuoso
                scrollerRef={handleScrollerRef}
                style={{ height: "120px" }}
                data={messages}
                followOutput="auto"
                className="scroll-smooth"
                itemContent={(index, log) => (
                    <p key={index} className={`!text-xs font-mono px-2 ${levelColorMap[log.level] || 'text-gray-400'}`}>
                        <span className="text-gray-600 mr-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        {log.message}
                    </p>
                )}
            />
        </div>
    );
};


