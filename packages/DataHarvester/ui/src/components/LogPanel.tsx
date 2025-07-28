import { useLogMessages } from "../stores/useLogMessages";
import { Server } from "../ui/icons";

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
    const messages = useLogMessages(state => state.messages);

    return (
        <div className=" h-[100px] rounded-lg shadow-inner overflow-hidden">
            <div className="flex">
                <Server className="!text-white/70 h-4 mt-1"/>
            <h3 className="text-md font-medium text-white/70 mb-2 font-roboto-mono">Server Log</h3>
            </div>
            <div className="h-full overflow-y-auto">
                {messages.map((log: LogMessage, index: number) => (
                    <p key={index} className={`!text-xs font-mono ${levelColorMap[log.level] || 'text-gray-400'}`}>
                        <span className="text-gray-600 mr-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        {log.message}
                    </p>
                ))}
            </div>
        </div>
    );
}; 


