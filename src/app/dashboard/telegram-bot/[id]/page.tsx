'use client';

import { useEffect, useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { UserTable } from '@/features/telegram-bot/components/user-table';
import { TelegramUser } from '@/types/telegram-user';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { use } from 'react';

export default function BotUsersPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [users, setUsers] = useState<TelegramUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/telegram-bot/${resolvedParams.id}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      const transformedUsers = data.map((user: any) => ({
        _id: user._id,
        userId: user.userId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        languageCode: user.languageCode,
        isPremium: user.isPremium,
        clickedAt: new Date(user.clickedAt),
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      }));
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to fetch users');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full flex-col space-y-4 p-8 pt-6'>
      <div className='flex items-center justify-between'>
        <Heading
          title='Bot Users'
          description='View all users who have interacted with your bot'
        />
      </div>
      <Separator />
      <div className='flex-1 min-h-[400px]'>
        <UserTable data={users} />
      </div>
    </div>
  );
} 