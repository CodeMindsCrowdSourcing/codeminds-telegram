'use client';

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { format } from 'date-fns';
import { DataTable } from '@/components/ui/table/data-table';
import { TelegramUser } from '@/types/telegram-user';

interface UserTableProps {
  data: TelegramUser[];
}

const columns: ColumnDef<TelegramUser>[] = [
  {
    accessorKey: 'userId',
    header: 'User ID',
    cell: ({ row }) => {
      const userId = row.getValue('userId') as number;
      return <span className="font-mono">{userId}</span>;
    },
  },
  {
    accessorKey: 'username',
    header: 'Username',
    cell: ({ row }) => {
      const username = row.getValue('username') as string;
      return username ? <span>@{username}</span> : '-';
    },
  },
  {
    accessorKey: 'firstName',
    header: 'First Name',
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
    cell: ({ row }) => {
      const lastName = row.getValue('lastName') as string;
      return lastName || '-';
    },
  },
  {
    accessorKey: 'languageCode',
    header: 'Language',
    cell: ({ row }) => {
      const lang = row.getValue('languageCode') as string;
      return lang ? lang.toUpperCase() : '-';
    },
  },
  {
    accessorKey: 'isPremium',
    header: 'Premium',
    cell: ({ row }) => {
      const isPremium = row.getValue('isPremium') as boolean;
      return (
        <div className="flex items-center">
          {isPremium ? (
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
          ) : (
            <div className="h-2 w-2 rounded-full bg-gray-300" />
          )}
          <span className="ml-2">{isPremium ? 'Yes' : 'No'}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'clickedAt',
    header: 'Last Click',
    cell: ({ row }) => {
      const date = row.getValue('clickedAt');
      if (!(date instanceof Date) && !(typeof date === 'string')) return null;
      return format(new Date(date), 'PPP');
    },
  },
];

export function UserTable({ data }: UserTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <DataTable table={table} />;
} 