'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';

interface Log {
  _id: string;
  phone: string;
  cleanPhone: string;
  clientConnected: boolean;
  clientAuthorized: boolean;
  isFound: boolean;
  error?: string;
  createdAt: string;
  telegramResponse?: any;
  telegramUser?: any;
}

export function LogsViewer() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isFound, setIsFound] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(search && { phone: search }),
        ...(isFound !== null && { isFound: isFound.toString() }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetch(`/api/telegram-check-logs?${params}`);
      const data = await response.json();

      if (response.ok) {
        setLogs(data.logs);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      // Error handling - logs are already empty by default
    }
  }, [page, search, isFound, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap gap-4'>
        <div className='flex-1'>
          <Input
            placeholder='Search by phone...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full'
          />
        </div>
        <Select
          value={isFound?.toString() || undefined}
          onValueChange={(value) => {
            if (value === 'all') {
              setIsFound(null);
            } else {
              setIsFound(value);
            }
          }}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All</SelectItem>
            <SelectItem value='true'>Found</SelectItem>
            <SelectItem value='false'>Not Found</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type='date'
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className='w-[180px]'
        />
        <Input
          type='date'
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className='w-[180px]'
        />
        <Button onClick={() => fetchLogs()} variant='outline' size='icon'>
          <RefreshCw className='h-4 w-4' />
        </Button>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Client State</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log._id}>
                <TableCell>
                  {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                </TableCell>
                <TableCell>{log.phone}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      log.isFound
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {log.isFound ? 'Found' : 'Not Found'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className='space-y-1'>
                    <div
                      className={`text-xs ${
                        log.clientConnected ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      Connected: {log.clientConnected ? 'Yes' : 'No'}
                    </div>
                    <div
                      className={`text-xs ${
                        log.clientAuthorized ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      Authorized: {log.clientAuthorized ? 'Yes' : 'No'}
                    </div>
                  </div>
                </TableCell>
                <TableCell className='max-w-[300px] truncate'>
                  {log.error || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between'>
        <div className='text-muted-foreground text-sm'>
          Page {page} of {totalPages}
        </div>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
