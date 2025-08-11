import { useTablesContext } from '../context'
import CollapsiblePanel from '@zeruel/shared-ui/CollapsiblePanel'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@zeruel/shared-ui/foundations'

const DATA_TABLES = [
    "videos",
    "comments",
    "video_features"
]

const DatabaseQueryPanel = () => {
    const { selectedTable, setSelectedTable } = useTablesContext()

    return (
        <CollapsiblePanel
            title='Query Tool'
        >
            <Select
                defaultValue={selectedTable}
                onValueChange={(value) => {
                    setSelectedTable(value)
                }}
            >
                <SelectTrigger className="w-[180px] h-7 my-auto focus:outline-hidden text-xs! text-white">
                    <SelectValue placeholder="Select a Table" />
                </SelectTrigger>
                <SelectContent>
                    {DATA_TABLES.map((key) => (
                        <SelectItem key={key} value={key}>
                            {key}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </CollapsiblePanel>
    )
}

export default DatabaseQueryPanel