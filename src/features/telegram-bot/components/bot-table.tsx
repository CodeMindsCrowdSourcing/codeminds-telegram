'use client';

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { format } from 'date-fns';
import { MoreHorizontal, PlayCircle, PowerOff, Trash2, Settings, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/ui/table/data-table';
import { TelegramBot } from '@/types/telegram-bot';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BotTableProps {
  data: TelegramBot[];
  onStartBot?: (botId: string) => Promise<void>;
  onStopBot?: (botId: string) => Promise<void>;
  onDeleteBot?: (botId: string) => Promise<void>;
  onUpdateBot?: (botId: string, data: Partial<TelegramBot>) => Promise<void>;
}

export const columns = ({
  onStartBot,
  onStopBot,
  onDeleteBot,
  onUpdateBot,
}: Pick<BotTableProps, 'onStartBot' | 'onStopBot' | 'onDeleteBot' | 'onUpdateBot'>): ColumnDef<TelegramBot>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      return <span className="font-medium">{name}</span>;
    },
  },
  {
    accessorKey: 'token',
    header: 'Token',
    cell: ({ row }) => {
      const token = row.getValue('token') as string;
      return <span className='font-mono'>{token.slice(0, 10)}...</span>;
    },
  },
  {
    accessorKey: 'isRunning',
    header: 'Status',
    cell: ({ row }) => {
      const isRunning = row.getValue('isRunning') as boolean;
      return (
        <div className='flex items-center gap-2'>
          {isRunning ? (
            <>
              <div className='h-2 w-2 rounded-full bg-green-500' />
              <span>Running</span>
            </>
          ) : (
            <>
              <div className='h-2 w-2 rounded-full bg-red-500' />
              <span>Stopped</span>
            </>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const date = row.getValue('createdAt');
      if (!(date instanceof Date) && !(typeof date === 'string')) return null;
      return format(new Date(date), 'PPP');
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Updated',
    cell: ({ row }) => {
      const date = row.getValue('updatedAt');
      if (!(date instanceof Date) && !(typeof date === 'string')) return null;
      return format(new Date(date), 'PPP');
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const bot = row.original;
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
      const [editData, setEditData] = useState({
        buttonText: bot.buttonText,
        infoText: bot.infoText,
        authorId: bot.authorId,
        linkImage: bot.linkImage,
      });
      const [isLoading, setIsLoading] = useState(false);
      const router = useRouter();

      // Update editData when dialog opens or bot data changes
      useEffect(() => {
        setEditData({
          buttonText: bot.buttonText,
          infoText: bot.infoText,
          authorId: bot.authorId,
          linkImage: bot.linkImage,
        });
      }, [isEditDialogOpen, bot]);

      const handleAction = async (
        action: () => Promise<void>,
        successMessage: string
      ) => {
        try {
          setIsLoading(true);
          await action();
          toast.success(successMessage);
        } catch (error) {
          console.error('Error performing action:', error);
        } finally {
          setIsLoading(false);
        }
      };

      const handleUpdate = async () => {
        if (!onUpdateBot || !onStopBot || !onStartBot) return;
        try {
          // Store the current running state
          const wasRunning = bot.isRunning;
          
          // If bot is running, stop it first
          if (wasRunning) {
            await onStopBot(bot.id);
          }

          // Update bot parameters
          await onUpdateBot(bot.id, editData);
          
          // If bot was running before, restart it
          if (wasRunning) {
            await onStartBot(bot.id);
          }

          toast.success('Bot parameters updated successfully');
          setIsEditDialogOpen(false);
        } catch (error) {
          toast.error('Failed to update bot parameters');
        }
      };

      return (
        <>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Bot Parameters</DialogTitle>
                <DialogDescription>
                  Update the bot's message and button settings
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Input
                    id="buttonText"
                    value={editData.buttonText}
                    onChange={(e) => setEditData({ ...editData, buttonText: e.target.value })}
                    placeholder="Enter button text"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="infoText">Info Text</Label>
                  <Input
                    id="infoText"
                    value={editData.infoText}
                    onChange={(e) => setEditData({ ...editData, infoText: e.target.value })}
                    placeholder="Enter info text"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authorId">Author ID</Label>
                  <Input
                    id="authorId"
                    value={editData.authorId}
                    onChange={(e) => setEditData({ ...editData, authorId: e.target.value })}
                    placeholder="Enter author ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkImage">Image URL</Label>
                  <Input
                    id="linkImage"
                    value={editData.linkImage}
                    onChange={(e) => setEditData({ ...editData, linkImage: e.target.value })}
                    placeholder="Enter image URL"
                  />
                </div>
                <Button onClick={handleUpdate} className="w-full">
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(bot.token);
                  toast.success('Token copied to clipboard');
                }}
              >
                Copy token
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Settings className='mr-2 h-4 w-4' />
                Edit Parameters
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/telegram-bot/${bot.id}`)}
              >
                <Users className='mr-2 h-4 w-4' />
                View Users
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  handleAction(
                    () => onStartBot?.(bot.id),
                    'Bot started successfully'
                  )
                }
                disabled={bot.isRunning || isLoading}
              >
                <PlayCircle className='mr-2 h-4 w-4' />
                Start
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handleAction(
                    () => onStopBot?.(bot.id),
                    'Bot stopped successfully'
                  )
                }
                disabled={!bot.isRunning || isLoading}
              >
                <PowerOff className='mr-2 h-4 w-4' />
                Stop
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handleAction(
                    () => onDeleteBot?.(bot.id),
                    'Bot deleted successfully'
                  )
                }
                disabled={isLoading}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
];

export function BotTable({ data, onStartBot, onStopBot, onDeleteBot, onUpdateBot }: BotTableProps) {
  const table = useReactTable({
    data,
    columns: columns({ onStartBot, onStopBot, onDeleteBot, onUpdateBot }),
    getCoreRowModel: getCoreRowModel(),
  });

  return <DataTable table={table} />;
} 