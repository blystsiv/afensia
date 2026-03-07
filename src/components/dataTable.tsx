import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cx } from '../lib/format'

interface DataTableProps<TData extends RowData> {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  getRowId?: (originalRow: TData, index: number, parent?: { id: string }) => string
  emptyState?: ReactNode
  summary?: ReactNode
  tableClassName?: string
  dense?: boolean
}

function SortIcon({ direction, sortable }: { direction: false | 'asc' | 'desc'; sortable: boolean }) {
  if (direction === 'asc') {
    return <ChevronUp size={14} />
  }

  if (direction === 'desc') {
    return <ChevronDown size={14} />
  }

  if (!sortable) {
    return null
  }

  return <ArrowUpDown size={14} />
}

export function DataTable<TData extends RowData>({
  data,
  columns,
  getRowId,
  emptyState,
  summary,
  tableClassName,
  dense = false,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])

  // TanStack Table relies on runtime-generated handlers here.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const rows = table.getRowModel().rows

  return (
    <div className="data-table-shell">
      {summary ? <div className="data-table-summary">{summary}</div> : null}
      <div className="table-wrap table-wrap-refined">
        <table className={cx('data-table', 'data-table-refined', dense && 'data-table-dense', tableClassName)}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortable = header.column.getCanSort()
                  const sortDirection = header.column.getIsSorted()

                  return (
                    <th key={header.id} style={{ width: header.getSize() === 150 ? undefined : header.getSize() }}>
                      {header.isPlaceholder ? null : sortable ? (
                        <button type="button" className="table-header-button" onClick={header.column.getToggleSortingHandler()}>
                          <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                          <SortIcon direction={sortDirection} sortable={sortable} />
                        </button>
                      ) : (
                        <div className="table-header-label">{flexRender(header.column.columnDef.header, header.getContext())}</div>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <div className="table-empty-cell">{emptyState}</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
