import { useTablesContext } from '@/pages/Tables/context'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@zeruel/shared-ui/foundations'
import { TABLES_MAP } from '../lib'

const CurrentTableSelector = ({ form }: { form: any }) => {
    const { selectedTable, setSelectedTable, setQueryParams } = useTablesContext()

    return (
        <Select
            defaultValue={selectedTable}
            onValueChange={(value) => {
                setSelectedTable(value)
                form.reset() // Reset form when table changes
                setQueryParams({}) // Clear previous filters
            }}
        >
            <SelectTrigger className="w-[180px] h-7 my-auto focus:outline-hidden text-xs! text-white">
                <SelectValue placeholder="Select a Table" />
            </SelectTrigger>
            <SelectContent>
                {Object.keys(TABLES_MAP).map((key) => (
                    <SelectItem key={key} value={key}>
                        {key}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export default CurrentTableSelector