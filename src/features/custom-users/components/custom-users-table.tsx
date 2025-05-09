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
  Trash2,
  Download,
  Plus,
  MessageSquare,
  Send,
  Search
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTablePagination } from '@/components/ui/table/data-table-pagination';
import { CheckProgress } from '@/components/custom-users/check-progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface CustomUser {
  _id: string;
  phone: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isFound: boolean;
  error?: string;
  checked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CustomUsersTableProps {
  data: CustomUser[];
  onExportUsers?: (users: CustomUser[]) => Promise<void>;
}

function AddUserDialog({
  onUserAdded
}: {
  onUserAdded: (user: CustomUser) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    username: '',
    firstName: '',
    lastName: '',
    isFound: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await fetch('/api/custom-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          toast.error(data.error || 'Validation error');
        } else {
          toast.error('Failed to add user. Please try again.');
        }
        return;
      }

      toast.success('User added successfully');
      setIsOpen(false);
      setFormData({
        phone: '',
        username: '',
        firstName: '',
        lastName: '',
        isFound: false
      });
      onUserAdded(data.user);
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>Enter the users details below</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='phone'>Phone Number</Label>
            <Input
              id='phone'
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder='Enter phone number'
              required
              disabled={isLoading}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='username'>Username</Label>
            <Input
              id='username'
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder='Enter username'
              disabled={isLoading}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='firstName'>First Name</Label>
            <Input
              id='firstName'
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              placeholder='Enter first name'
              disabled={isLoading}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='lastName'>Last Name</Label>
            <Input
              id='lastName'
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              placeholder='Enter last name'
              disabled={isLoading}
            />
          </div>
          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? (
              <>
                <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                Adding...
              </>
            ) : (
              'Add User'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SendMessageDialog({
  users,
  isOpen,
  onOpenChange
}: {
  users: CustomUser[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const validUsers = users.filter((user) => user.username);

  const handleSendMessage = async () => {
    try {
      setIsLoading(true);
      const results = await Promise.all(
        validUsers.map((user) =>
          fetch('/api/custom-users/send-message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: user._id,
              message
            })
          })
        )
      );

      const errors = [];
      for (let i = 0; i < results.length; i++) {
        const response = results[i];
        const user = validUsers[i];
        if (!response.ok) {
          const error = await response.json();
          errors.push(
            `Failed to send message to ${user.username}: ${error.error}`
          );
        }
      }

      if (errors.length > 0) {
        toast.error(`Some messages failed to send:\n${errors.join('\n')}`);
      } else {
        toast.success(
          `Messages sent successfully to ${validUsers.length} users`
        );
        onOpenChange(false);
        setMessage('');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to send messages'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Message to Multiple Users</DialogTitle>
          <div className='mt-2'>
            <div className='text-muted-foreground text-sm'>
              Sending message to {validUsers.length} users with Telegram
              usernames:
            </div>
            <div className='mt-2 text-sm'>
              {validUsers.map((user) => (
                <Badge key={user._id} variant='secondary' className='mr-2 mb-2'>
                  @{user.username}
                </Badge>
              ))}
            </div>
            {users.length !== validUsers.length && (
              <div className='mt-2 text-yellow-500'>
                Note: {users.length - validUsers.length} selected users without
                usernames will be skipped
              </div>
            )}
          </div>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='message'>Message</Label>
            <textarea
              id='message'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='Enter your message'
              className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            className='w-full'
            disabled={isLoading || !message.trim() || validUsers.length === 0}
          >
            {isLoading ? (
              <>
                <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                Sending...
              </>
            ) : (
              `Send Message to ${validUsers.length} Users`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActionCell({
  user,
  onUserDeleted,
  onUserUpdated,
  onSendMessage
}: {
  user: CustomUser;
  onUserDeleted: (userId: string) => void;
  onUserUpdated: (user: CustomUser) => void;
  onSendMessage: (users: CustomUser[]) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSendMessageOpen, setIsSendMessageOpen] = useState(false);

  const handleShowChat = () => {
    if (user.username) {
      window.open(`https://t.me/${user.username}`, '_blank');
    }
  };

  const handleSendMessage = () => {
    onSendMessage([user]);
  };

  const handleCheck = async () => {
    try {
      setIsLoading(true);

      // Проверяем, был ли пользователь уже проверен
      if (user.checked) {
        toast.error('This user has already been checked');
        return;
      }

      const response = await fetch(`/api/custom-users/check/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check user');
      }

      toast.success('User checked successfully');
      onUserUpdated(data.user);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to check user'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/custom-users/${user._id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('User deleted successfully');
        onUserDeleted(user._id);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete user'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleCheck} disabled={isLoading}>
            <Search className='mr-2 h-4 w-4' />
            {isLoading ? 'Checking...' : 'Check'}
          </DropdownMenuItem>
          {user.username && (
            <DropdownMenuItem onClick={handleShowChat}>
              <MessageSquare className='mr-2 h-4 w-4' />
              Show Chat
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleSendMessage}>
            <Send className='mr-2 h-4 w-4' />
            Send Message
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(user.phone);
              toast.success('Phone number copied to clipboard');
            }}
          >
            Copy phone
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} disabled={isLoading}>
            <Trash2 className='mr-2 h-4 w-4' />
            {isLoading ? 'Deleting...' : 'Delete'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SendMessageDialog
        users={user ? [user] : []}
        isOpen={isSendMessageOpen}
        onOpenChange={setIsSendMessageOpen}
      />
    </>
  );
}

function DeleteConfirmationDialog({
  isOpen,
  onOpenChange,
  selectedCount,
  onConfirm,
  isLoading
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Users</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {selectedCount} users? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className='flex justify-end space-x-2'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                Deleting...
              </>
            ) : (
              'Delete Users'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const columns = ({
  onUserDeleted,
  onUserUpdated,
  onSendMessage
}: {
  onUserDeleted: (userId: string) => void;
  onUserUpdated: (user: CustomUser) => void;
  onSendMessage: (users: CustomUser[]) => void;
}): ColumnDef<CustomUser>[] => [
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
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string;
      return <span className='font-medium'>{phone}</span>;
    }
  },
  {
    accessorKey: 'username',
    header: 'Username',
    cell: ({ row }) => {
      const username = row.getValue('username') as string;
      return <span>{username || '-'}</span>;
    }
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const firstName = row.original.firstName;
      const lastName = row.original.lastName;
      return (
        <span>
          {firstName || lastName
            ? `${firstName || ''} ${lastName || ''}`.trim()
            : '-'}
        </span>
      );
    }
  },
  {
    accessorKey: 'isFound',
    header: 'Status',
    cell: ({ row }) => {
      const isFound = row.getValue('isFound') as boolean;
      const checked = row.original.checked;

      if (!checked) {
        return <Badge variant='secondary'>Not Checked</Badge>;
      }

      return (
        <Badge variant={isFound ? 'default' : 'destructive'}>
          {isFound ? 'Found' : 'Not Found'}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'checked',
    header: 'Checked',
    cell: ({ row }) => {
      const checked = row.getValue('checked') as boolean;
      return (
        <Badge variant={checked ? 'default' : 'secondary'}>
          {checked ? 'Yes' : 'No'}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'error',
    header: 'Error',
    cell: ({ row }) => {
      const error = row.getValue('error') as string;
      if (!error) return '-';

      // Сокращаем ошибку до первых 20 символов
      const shortError =
        error.length > 20 ? error.substring(0, 20) + '...' : error;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className='flex items-center gap-1'>
              <span className='text-destructive text-sm'>{shortError}</span>
              <Info className='text-muted-foreground h-4 w-4' />
            </TooltipTrigger>
            <TooltipContent>
              <p className='max-w-[300px] whitespace-normal'>{error}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const date = row.getValue('createdAt');
      if (!(date instanceof Date) && !(typeof date === 'string')) return null;
      return format(new Date(date), 'PP');
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <ActionCell
        user={row.original}
        onUserDeleted={onUserDeleted}
        onUserUpdated={onUserUpdated}
        onSendMessage={onSendMessage}
      />
    )
  }
];

const BATCH_DELAY = 180000; // 3 minutes in milliseconds

export function CustomUsersTable({
  data: initialData,
  onExportUsers
}: CustomUsersTableProps) {
  const [data, setData] = useState(initialData);
  const [isSendMessageOpen, setIsSendMessageOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<CustomUser[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [checkProgress, setCheckProgress] = useState({
    total: 0,
    checked: 0,
    found: 0
  });
  const [shouldContinueChecking, setShouldContinueChecking] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [waitTimeLeft, setWaitTimeLeft] = useState<number | null>(null);

  const getBatchSize = () => {
    if (typeof window !== 'undefined') {
      const savedSize = localStorage.getItem('verificationBatchSize');
      return savedSize ? parseInt(savedSize) : 30;
    }
    return 30;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const savedState = localStorage.getItem('checkingState');
    if (savedState) {
      const state = JSON.parse(savedState);
      if (state.isChecking) {
        localStorage.removeItem('checkingState');
        setIsChecking(false);
        setCheckProgress({
          total: 0,
          checked: 0,
          found: 0
        });
      }
    }
  }, []);

  useEffect(() => {
    if (isChecking && shouldContinueChecking) {
      localStorage.setItem(
        'checkingState',
        JSON.stringify({
          isChecking,
          progress: checkProgress
        })
      );
    } else {
      localStorage.removeItem('checkingState');
    }
  }, [isChecking, checkProgress, shouldContinueChecking]);

  const handleUserAdded = (user: CustomUser) => {
    setData((prev) => [user, ...prev]);
  };

  const handleUserDeleted = (userId: string) => {
    setData((prev) => prev.filter((user) => user._id !== userId));
  };

  const handleUserUpdated = (updatedUser: CustomUser) => {
    setData((prev) =>
      prev.map((user) => (user._id === updatedUser._id ? updatedUser : user))
    );
  };

  const handleSendMessage = (users: CustomUser[]) => {
    setSelectedUsers(users);
    setIsSendMessageOpen(true);
  };

  const handleCheckNotFound = async () => {
    const notFoundUsers = data.filter((user) => !user.isFound && !user.checked);
    if (notFoundUsers.length === 0) {
      toast.error('No users to check');
      return;
    }

    setShouldContinueChecking(true);
    setIsChecking(true);
    setCheckProgress({
      total: notFoundUsers.length,
      checked: 0,
      found: 0
    });

    try {
      const batchSize = getBatchSize();
      const batches = [];
      for (let i = 0; i < notFoundUsers.length; i += batchSize) {
        batches.push(notFoundUsers.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        if (!shouldContinueChecking) {
          setWaitTimeLeft(null);
          localStorage.removeItem('checkingState');
          break;
        }

        try {
          // Use the first user's ID as the endpoint parameter
          const response = await fetch(
            `/api/custom-users/check/${batch[0]._id}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ batchSize: batch.length })
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to check users');
          }

          // Update the UI with the results
          if (data.users) {
            data.users.forEach((user: CustomUser) => {
              handleUserUpdated(user);
              if (user.isFound) {
                setCheckProgress((prev) => ({
                  ...prev,
                  found: prev.found + 1
                }));
              }
            });
          }

          setCheckProgress((prev) => ({
            ...prev,
            checked: prev.checked + batch.length
          }));

          if (
            batches.indexOf(batch) < batches.length - 1 &&
            shouldContinueChecking
          ) {
            const delaySeconds = Math.ceil(BATCH_DELAY / 1000);
            setWaitTimeLeft(delaySeconds);
            toast.info(`Waiting ${delaySeconds} seconds before next batch...`);

            let waitStartTime = Date.now();
            while (Date.now() - waitStartTime < BATCH_DELAY) {
              if (!shouldContinueChecking) {
                setWaitTimeLeft(null);
                localStorage.removeItem('checkingState');
                break;
              }
              const timeLeft = Math.ceil(
                (BATCH_DELAY - (Date.now() - waitStartTime)) / 1000
              );
              setWaitTimeLeft(timeLeft);
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            setWaitTimeLeft(null);
          }
        } catch (error) {
          setWaitTimeLeft(null);
          if (
            error instanceof Error &&
            error.message === 'Check stopped by user'
          ) {
            localStorage.removeItem('checkingState');
            break;
          }
          throw error;
        }
      }
    } catch (error) {
      setWaitTimeLeft(null);
      console.error('Check process error:', error);
      toast.error('Error in check process');
    } finally {
      setWaitTimeLeft(null);
      setIsChecking(false);
      setShouldContinueChecking(false);
      abortControllerRef.current = null;
      localStorage.removeItem('checkingState');
    }
  };

  const handleStopChecking = () => {
    setShouldContinueChecking(false);
    setWaitTimeLeft(null);
    abortControllerRef.current?.abort();
    setIsChecking(false);
    setCheckProgress({
      total: 0,
      checked: 0,
      found: 0
    });
    localStorage.removeItem('checkingState');
    toast.info('Check stopped');
  };

  const handleDeleteSelected = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedUsers = selectedRows.map((row) => row.original);

    if (selectedUsers.length === 0) {
      toast.error('No users selected');
      return;
    }

    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedUsers = selectedRows.map((row) => row.original);

    try {
      setIsDeleting(true);
      const response = await fetch('/api/custom-users/delete-many', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: selectedUsers.map((user) => user._id)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete users');
      }

      const data = await response.json();
      setData((prev) =>
        prev.filter(
          (user) => !selectedUsers.some((selected) => selected._id === user._id)
        )
      );
      table.toggleAllPageRowsSelected(false);
      toast.success(`Successfully deleted ${data.deleted} users`);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete users'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCheckedNotFound = async () => {
    const checkedNotFoundUsers = data.filter(
      (user) => user.checked && !user.isFound
    );
    if (checkedNotFoundUsers.length === 0) {
      toast.error('No checked and not found users to delete');
      return;
    }

    try {
      const response = await fetch('/api/custom-users/delete-many', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: checkedNotFoundUsers.map((user) => user._id)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete users');
      }

      const data = await response.json();
      setData((prev) =>
        prev.filter(
          (user) =>
            !checkedNotFoundUsers.some((selected) => selected._id === user._id)
        )
      );
      toast.success(`Successfully deleted ${data.deleted} users`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete users'
      );
    }
  };

  const tableColumns = columns({
    onUserDeleted: handleUserDeleted,
    onUserUpdated: handleUserUpdated,
    onSendMessage: handleSendMessage
  });
  const table = useReactTable<CustomUser>({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  });

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap gap-4'>
        <div className='flex items-center gap-2'>
          <AddUserDialog onUserAdded={handleUserAdded} />
          {isChecking ? (
            <div className='flex items-center gap-2'>
              <Button variant='destructive' onClick={handleStopChecking}>
                <Search className='mr-2 h-4 w-4' />
                Stop Checking
              </Button>
              {waitTimeLeft !== null && (
                <span className='text-muted-foreground text-sm'>
                  Waiting: {formatTime(waitTimeLeft)}
                </span>
              )}
            </div>
          ) : (
            <>
              <Button
                variant='outline'
                onClick={handleCheckNotFound}
                disabled={!data.some((user) => !user.isFound && !user.checked)}
              >
                <Search className='mr-2 h-4 w-4' />
                Check Not Found
              </Button>
              <Button
                variant='destructive'
                onClick={handleDeleteCheckedNotFound}
                disabled={!data.some((user) => user.checked && !user.isFound)}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete Checked Not Found
              </Button>
            </>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='secondary'
            onClick={() => {
              const selectedRows = table.getSelectedRowModel().rows;
              const selectedUsers = selectedRows.map((row) => row.original);
              handleSendMessage(selectedUsers);
            }}
            disabled={table.getSelectedRowModel().rows.length === 0}
          >
            <Send className='mr-2 h-4 w-4' />
            Message Selected ({table.getSelectedRowModel().rows.length})
          </Button>
          <Button
            variant='destructive'
            onClick={handleDeleteSelected}
            disabled={table.getSelectedRowModel().rows.length === 0}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            Delete Selected ({table.getSelectedRowModel().rows.length})
          </Button>
        </div>

        <div className='ml-auto flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={() => {
              const selectedRows = table.getSelectedRowModel().rows;
              const selectedUsers = selectedRows.map((row) => row.original);
              if (onExportUsers) {
                onExportUsers(selectedUsers);
              }
            }}
            disabled={table.getSelectedRowModel().rows.length === 0}
          >
            <Download className='mr-2 h-4 w-4' />
            Export Selected ({table.getSelectedRowModel().rows.length})
          </Button>
        </div>
      </div>

      {(isChecking || checkProgress.checked > 0) && (
        <CheckProgress
          total={checkProgress.total}
          checked={checkProgress.checked}
          found={checkProgress.found}
          isChecking={isChecking}
        />
      )}

      <div className='rounded-md border'>
        <div className='h-[500px] overflow-auto'>
          <DataTable<CustomUser> table={table} />
        </div>
        <div className='border-t p-4'>
          <DataTablePagination table={table} />
        </div>
      </div>

      <SendMessageDialog
        users={selectedUsers}
        isOpen={isSendMessageOpen}
        onOpenChange={setIsSendMessageOpen}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedCount={table.getSelectedRowModel().rows.length}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
