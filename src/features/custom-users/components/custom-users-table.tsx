'use client';

import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { MoreHorizontal, Trash2, Download, Plus, MessageSquare, Send, Search } from 'lucide-react';
import { useState } from 'react';

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

interface CustomUser {
  _id: string;
  phone: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isFound: boolean;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CustomUsersTableProps {
  data: CustomUser[];
  onExportUsers?: (users: CustomUser[]) => Promise<void>;
}

function AddUserDialog({ onUserAdded }: { onUserAdded: (user: CustomUser) => void }) {
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add user');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('User added successfully');
        setIsOpen(false);
        setFormData({
          phone: '',
          username: '',
          firstName: '',
          lastName: '',
          isFound: false
        });
        // Add new user to the table
        onUserAdded(data.user);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Enter the users details below
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Enter username"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Enter first name"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Enter last name"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
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
  user,
  isOpen,
  onOpenChange
}: {
  user: CustomUser;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendMessage = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/custom-users/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          message
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Message sent successfully');
        onOpenChange(false);
        setMessage('');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
          <DialogDescription>
            Send a message to {user.username || user.phone}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            className="w-full"
            disabled={isLoading || !message.trim()}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Sending...
              </>
            ) : (
              'Send Message'
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
  onUserUpdated
}: {
  user: CustomUser;
  onUserDeleted: (userId: string) => void;
  onUserUpdated: (user: CustomUser) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSendMessageOpen, setIsSendMessageOpen] = useState(false);

  const handleShowChat = () => {
    if (user.username) {
      window.open(`https://t.me/${user.username}`, '_blank');
    }
  };

  const handleSendMessage = () => {
    setIsSendMessageOpen(true);
  };

  const handleCheck = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/custom-users/check/${user._id}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to check user');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('User checked successfully');
        onUserUpdated(data.user);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to check user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/custom-users/${user._id}`, {
        method: 'DELETE',
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
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
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
          <DropdownMenuItem
            onClick={handleCheck}
            disabled={isLoading}
          >
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
          <DropdownMenuItem
            onClick={handleDelete}
            disabled={isLoading}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            {isLoading ? 'Deleting...' : 'Delete'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SendMessageDialog
        user={user}
        isOpen={isSendMessageOpen}
        onOpenChange={setIsSendMessageOpen}
      />
    </>
  );
}

export const columns = ({
  onUserDeleted,
  onUserUpdated
}: {
  onUserDeleted: (userId: string) => void;
  onUserUpdated: (user: CustomUser) => void;
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
      return (
        <Badge variant={isFound ? 'default' : 'destructive'}>
          {isFound ? 'Found' : 'Not Found'}
        </Badge>
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
    id: 'actions',
    cell: ({ row }) => (
      <ActionCell user={row.original} onUserDeleted={onUserDeleted} onUserUpdated={onUserUpdated} />
    )
  }
];

export function CustomUsersTable({
  data: initialData,
  onExportUsers
}: CustomUsersTableProps) {
  const [data, setData] = useState(initialData);

  const handleUserAdded = (user: CustomUser) => {
    setData(prev => [user, ...prev]);
  };

  const handleUserDeleted = (userId: string) => {
    setData(prev => prev.filter(user => user._id !== userId));
  };

  const handleUserUpdated = (updatedUser: CustomUser) => {
    setData(prev => prev.map(user =>
      user._id === updatedUser._id ? updatedUser : user
    ));
  };

  const tableColumns = columns({
    onUserDeleted: handleUserDeleted,
    onUserUpdated: handleUserUpdated
  });
  const table = useReactTable<CustomUser>({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <AddUserDialog onUserAdded={handleUserAdded} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const selectedRows = table.getSelectedRowModel().rows;
            const selectedUsers = selectedRows.map(row => row.original);
            if (onExportUsers) {
              onExportUsers(selectedUsers);
            }
          }}
          disabled={table.getSelectedRowModel().rows.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Selected
        </Button>
      </div>
      <DataTable<CustomUser> table={table} />
    </div>
  );
}
