import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import Skeleton from '@/components/ui/skeleton';

type PolicyManagementTableSkeltonProps = {
  rowCount?: number;
};

export default function PolicyManagementTableSkelton({
  rowCount = 8,
}: PolicyManagementTableSkeltonProps) {
  const rows = Array.from({ length: rowCount }, (_, index) => index);

  return (
    <Table className="table-fixed w-full">
      <TableBody>
        {rows.map((index) => (
          <TableRow
            key={`policy-row-skeleton-${index}`}
            className="border-claims-management-table-border"
          >
            <TableCell>
              <Skeleton className="h-3 w-28" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-3 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-3 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-3 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-3 w-16" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-3 w-16" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
