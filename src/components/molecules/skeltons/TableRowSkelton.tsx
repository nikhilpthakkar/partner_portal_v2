import Skeleton from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';

type TableRowSkeltonProps = {
  index: number;
};

export default function TableRowSkelton({ index }: TableRowSkeltonProps) {
  return (
    <TableRow
      key={`claims-row-skeleton-${index}`}
      className="border-claims-table-border h-claims-table-row-height"
    >
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
    </TableRow>
  );
}
