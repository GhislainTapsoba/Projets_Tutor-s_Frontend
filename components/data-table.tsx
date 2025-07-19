import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ReactNode } from "react"

interface DataTableProps<T> {
  data: T[]
  columns: { key: keyof T | string; header: string; render?: (item: T) => ReactNode }[]
  caption?: string
  emptyMessage?: string
}

export function DataTable<T>({ data, columns, caption, emptyMessage = "No data found." }: DataTableProps<T>) {
  return (
    <div className="rounded-md border overflow-auto">
      <Table>
        {caption && <caption className="p-4 text-sm text-muted-foreground">{caption}</caption>}
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={column.key.toString() || index}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item: T, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell key={column.key.toString() + colIndex}>
                    {column.render ? column.render(item) : (item as any)[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
