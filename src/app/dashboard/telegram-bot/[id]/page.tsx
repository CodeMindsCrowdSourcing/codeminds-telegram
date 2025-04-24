'use client';

import { useEffect, useState, useCallback } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { UserTable } from '@/features/telegram-bot/components/user-table';
import { TelegramUser } from '@/types/telegram-user';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { use } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function BotUsersPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [users, setUsers] = useState<TelegramUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/telegram-bot/${resolvedParams.id}/users`
      );
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
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to fetch users');
      }
    } finally {
      setIsLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (isLoading) {
    return (
      <div className='flex h-screen w-full items-center justify-center'>
        <div className='flex flex-col items-center gap-2'>
          <Loader2 className='text-primary h-8 w-8 animate-spin' />
          <p className='text-muted-foreground text-sm'>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full flex-col space-y-4 p-8 pt-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='h-8 w-8 p-0'
          >
            <ArrowLeft className='h-4 w-4' />
            <span className='sr-only'>Back</span>
          </Button>
          <Heading
            title='Bot Users'
            description='View all users who have interacted with your bot'
          />
        </div>
      </div>
      <Separator />
      <div className='min-h-[400px] flex-1'>
        <UserTable data={users} />
      </div>
    </div>
  );
}
