'use client';

import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  MoreHorizontal,
  PlayCircle,
  PowerOff,
  Trash2,
  Settings,
  Users
} from 'lucide-react';
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
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/ui/table/data-table';
import { TelegramBot } from '@/types/telegram-bot';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface BotTableProps {
  data: TelegramBot[];
  onStartBot?: (botId: string) => Promise<void>;
  onStopBot?: (botId: string) => Promise<void>;
  onDeleteBot?: (botId: string) => Promise<void>;
  onUpdateBot?: (botId: string, data: Partial<TelegramBot>) => Promise<void>;
}

interface ActionCellProps {
  bot: TelegramBot;
  onStartBot?: (botId: string) => Promise<void>;
  onStopBot?: (botId: string) => Promise<void>;
  onDeleteBot?: (botId: string) => Promise<void>;
  onUpdateBot?: (botId: string, data: Partial<TelegramBot>) => Promise<void>;
}

function ActionCell({
  bot,
  onStartBot,
  onStopBot,
  onDeleteBot,
  onUpdateBot
}: ActionCellProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    buttonText: bot.buttonText,
    infoText: bot.infoText,
    authorId: bot.authorId,
    linkImage: bot.linkImage,
    buttonPrivateMessage: bot.buttonPrivateMessage,
    messagePrivateMessage: bot.messagePrivateMessage,
    messageOnClick: bot.messageOnClick,
    token: bot.token,
    mediaType: 'image' as 'image' | 'video'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setEditData({
      buttonText: bot.buttonText,
      infoText: bot.infoText,
      authorId: bot.authorId,
      linkImage: bot.linkImage,
      buttonPrivateMessage: bot.buttonPrivateMessage,
      messagePrivateMessage: bot.messagePrivateMessage,
      messageOnClick: bot.messageOnClick,
      token: bot.token,
      mediaType: bot.linkImage?.endsWith('.mp4') ? 'video' : 'image'
    });
    setPreviewUrl(bot.linkImage || null);
  }, [isEditDialogOpen, bot]);

  const handleAction = async (
    action: () => Promise<void>,
  ) => {
    try {
      setIsLoading(true);
      await action();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!onUpdateBot || !onStopBot || !onStartBot) return;
    try {
      setIsSaving(true);
      const wasRunning = bot.isRunning;

      if (wasRunning) {
        await onStopBot(bot.id);
      }

      await onUpdateBot(bot.id, editData);

      if (wasRunning) {
        await onStartBot(bot.id);
      }
      setIsEditDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update bot parameters');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error('No URL returned from upload');
      }

      setEditData(prev => ({ ...prev, linkImage: data.url }));
      setPreviewUrl(data.url);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Bot Parameters</DialogTitle>
            <DialogDescription>
              Update the bots message and button settings
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='token'>Bot Token</Label>
              <Input
                id='token'
                value={editData.token}
                onChange={(e) =>
                  setEditData({ ...editData, token: e.target.value })
                }
                placeholder='Enter bot token'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='buttonText'>Button Text</Label>
              <Input
                id='buttonText'
                value={editData.buttonText}
                onChange={(e) =>
                  setEditData({ ...editData, buttonText: e.target.value })
                }
                placeholder='Enter button text'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='infoText'>Info Text</Label>
              <Input
                id='infoText'
                value={editData.infoText}
                onChange={(e) =>
                  setEditData({ ...editData, infoText: e.target.value })
                }
                placeholder='Enter info text'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='authorId'>Author ID</Label>
              <Input
                id='authorId'
                value={editData.authorId}
                onChange={(e) =>
                  setEditData({ ...editData, authorId: e.target.value })
                }
                placeholder='Enter author ID'
              />
            </div>
            <div className='space-y-2'>
              <Label>Media Type</Label>
              <RadioGroup
                value={editData.mediaType}
                onValueChange={(value: 'image' | 'video') =>
                  setEditData({ ...editData, mediaType: value })
                }
                className="flex space-x-4"
                disabled={isUploading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image" id="image" />
                  <Label htmlFor="image">Image</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="video" id="video" />
                  <Label htmlFor="video">Video</Label>
                </div>
              </RadioGroup>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='media'>Upload Media</Label>
              <Input
                id='media'
                type='file'
                accept={editData.mediaType === 'image' ? 'image/*' : 'video/*'}
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </div>

            {isUploading && (
              <div className="flex items-center justify-center py-4">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                <span className="ml-2">Uploading...</span>
              </div>
            )}

            {previewUrl && (
              <div className='space-y-2'>
                <Label>Preview</Label>
                <div className='relative aspect-video w-full overflow-hidden rounded-lg border'>
                  {editData.mediaType === 'image' ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='buttonPrivateMessage'>
                Private Message Button Text
              </Label>
              <Input
                id='buttonPrivateMessage'
                value={editData.buttonPrivateMessage}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    buttonPrivateMessage: e.target.value
                  })
                }
                placeholder='Enter private message button text'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='messagePrivateMessage'>
                Private Message Text
              </Label>
              <Input
                id='messagePrivateMessage'
                value={editData.messagePrivateMessage}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    messagePrivateMessage: e.target.value
                  })
                }
                placeholder='Enter private message text'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='messageOnClick'>Click Message</Label>
              <Input
                id='messageOnClick'
                value={editData.messageOnClick}
                onChange={(e) =>
                  setEditData({ ...editData, messageOnClick: e.target.value })
                }
                placeholder='Enter click message'
              />
            </div>

            <Button
              onClick={handleUpdate}
              className='w-full'
              disabled={isSaving || isUploading}
            >
              {isSaving ? 'Saving...' : isUploading ? 'Uploading...' : 'Save Changes'}
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
              handleAction(async () => {
                if (onStartBot) {
                  await onStartBot(bot.id);
                }
              })
            }
            disabled={bot.isRunning || isLoading}
          >
            <PlayCircle className='mr-2 h-4 w-4' />
            Start
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              handleAction(async () => {
                if (onStopBot) {
                  await onStopBot(bot.id);
                }
              })
            }
            disabled={!bot.isRunning || isLoading}
          >
            <PowerOff className='mr-2 h-4 w-4' />
            Stop
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              handleAction(async () => {
                if (onDeleteBot) {
                  await onDeleteBot(bot.id);
                }
              })
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
}

export const columns = ({
  onStartBot,
  onStopBot,
  onDeleteBot,
  onUpdateBot
}: Pick<
  BotTableProps,
  'onStartBot' | 'onStopBot' | 'onDeleteBot' | 'onUpdateBot'
>): ColumnDef<TelegramBot>[] => [
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
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      return <span className='font-medium'>{name}</span>;
    }
  },
  {
    accessorKey: 'token',
    header: 'Token',
    cell: ({ row }) => {
      const token = row.getValue('token') as string;
      return <span className='font-mono'>{token.slice(0, 10)}...</span>;
    }
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
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const date = row.getValue('createdAt');
      if (!(date instanceof Date) && !(typeof date === 'string')) return null;
      return format(new Date(date), 'PPP');
    }
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Updated',
    cell: ({ row }) => {
      const date = row.getValue('updatedAt');
      if (!(date instanceof Date) && !(typeof date === 'string')) return null;
      return format(new Date(date), 'PPP');
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <ActionCell
        bot={row.original}
        onStartBot={onStartBot}
        onStopBot={onStopBot}
        onDeleteBot={onDeleteBot}
        onUpdateBot={onUpdateBot}
      />
    )
  }
];

export function BotTable({
  data,
  onStartBot,
  onStopBot,
  onDeleteBot,
  onUpdateBot
}: BotTableProps) {
  const tableColumns = columns({ onStartBot, onStopBot, onDeleteBot, onUpdateBot });
  const table = useReactTable<TelegramBot>({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  return <DataTable<TelegramBot> table={table} />;
}
