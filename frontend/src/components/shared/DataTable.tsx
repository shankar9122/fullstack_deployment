import type { ReactNode } from 'react';

export interface Column<T> {
  /** Unique id for the column, used as the React key */
  key: string;
  header: string;
  /** Renders the cell. Return JSX or text; formatting and fallbacks (like "-") belong here */
  cell: (row: T) => ReactNode;
  /** Optional extra classes for the header and cells, e.g. "w-24" */
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  /** Renders the last "Actions" column. Leave it undefined to hide the column completely */
  renderActions?: (row: T) => ReactNode;
  /** Describes the table for screen readers (visually hidden) */
  caption?: string;
}

export function DataTable<T>({ columns, rows, getRowKey, renderActions, caption }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}

        <thead>
          <tr className="border-b">
            {columns.map((column) => (
              <th key={column.key} scope="col" className={`p-2 ${column.className ?? ''}`}>
                {column.header}
              </th>
            ))}
            {renderActions && (
              <th scope="col" className="p-2">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="border-b">
              {columns.map((column) => (
                <td key={column.key} className={`p-2 ${column.className ?? ''}`}>
                  {column.cell(row)}
                </td>
              ))}
              {renderActions && <td className="p-2">{renderActions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
