import { ColumnDef } from '@tanstack/react-table';
import { CustomUser } from '@/types/custom-user';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

export const columns: ColumnDef<CustomUser>[] = [
  {
    accessorKey: 'phone',
    header: 'Phone Number',
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string;
      return <span className="font-mono">{phone}</span>;
    },
    size: 180
  },
  {
    accessorKey: 'username',
    header: 'Username',
    cell: ({ row }) => {
      const username = row.getValue('username') as string;
      return username ? `@${username}` : '-';
    },
    size: 150
  },
  {
    accessorKey: 'firstName',
    header: 'First Name',
    cell: ({ row }) => {
      const firstName = row.getValue('firstName') as string;
      return firstName || '-';
    },
    size: 150
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
    cell: ({ row }) => {
      const lastName = row.getValue('lastName') as string;
      return lastName || '-';
    },
    size: 150
  },
  {
    accessorKey: 'isFound',
    header: 'Status',
    cell: ({ row }) => {
      const isFound = row.getValue('isFound') as boolean;
      return (
        <div className="flex justify-center">
          <Badge variant={isFound ? 'default' : 'destructive'} className="w-24">
            {isFound ? (
              <CheckCircle2 className="mr-1 h-3 w-3" />
            ) : (
              <XCircle className="mr-1 h-3 w-3" />
            )}
            {isFound ? 'Found' : 'Not Found'}
          </Badge>
        </div>
      );
    },
    size: 120
  },
  {
    accessorKey: 'error',
    header: 'Error',
    cell: ({ row }) => {
      const error = row.getValue('error') as string;
      return <div className="truncate max-w-[300px]" title={error || '-'}>{error || '-'}</div>;
    },
    size: 300
  }
]; 