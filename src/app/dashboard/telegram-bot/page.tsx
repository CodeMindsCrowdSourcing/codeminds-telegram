'use client';

import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus, Loader2 } from 'lucide-react';
import { BotTable } from '@/features/telegram-bot/components/bot-table';
import { TelegramBot } from '@/types/telegram-bot';
import { useState, useEffect } from 'react';
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

export default function TelegramBotsPage() {
  const [bots, setBots] = useState<TelegramBot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [newBotToken, setNewBotToken] = useState('');

  const fetchBots = async () => {
    try {
      const response = await fetch('/api/telegram-bot');
      if (!response.ok) {
        throw new Error('Failed to fetch bots');
      }
      const data = await response.json();
      const transformedBots = data.map((bot: any) => ({
        id: bot._id,
        name: bot.name,
        token: bot.token,
        isRunning: bot.isRunning,
        buttonText: bot.buttonText,
        infoText: bot.infoText,
        authorId: bot.authorId,
        linkImage: bot.linkImage,
        createdAt: new Date(bot.createdAt),
        updatedAt: new Date(bot.updatedAt)
      }));
      setBots(transformedBots);
    } catch (error) {
      console.error('Error fetching bots:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to fetch bots');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  const handleStartBot = async (botId: string) => {
    try {
      const response = await fetch(`/api/telegram-bot/${botId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRunning: true }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start bot');
      }
      
      await fetchBots();
      toast.success('Bot started successfully');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to start bot');
      }
      throw error;
    }
  };

  const handleStopBot = async (botId: string) => {
    try {
      const response = await fetch(`/api/telegram-bot/${botId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRunning: false }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to stop bot');
      }
      
      await fetchBots();
      toast.success('Bot stopped successfully');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to stop bot');
      }
      throw error;
    }
  };

  const handleDeleteBot = async (botId: string) => {
    try {
      const response = await fetch(`/api/telegram-bot/${botId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete bot');
      }
      
      await fetchBots();
      toast.success('Bot deleted successfully');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete bot');
      }
      throw error;
    }
  };

  const handleAddBot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/telegram-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newBotName,
          token: newBotToken,
          isRunning: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create bot');
      }

      toast.success('Bot added successfully!');
      setIsDialogOpen(false);
      setNewBotName('');
      setNewBotToken('');
      await fetchBots();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to add bot');
      }
    }
  };

  const handleUpdateBot = async (botId: string, data: Partial<TelegramBot>) => {
    try {
      const response = await fetch(`/api/telegram-bot/${botId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update bot');
      }
      
      await fetchBots();
      toast.success('Bot updated successfully');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update bot');
      }
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading bots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full flex-col space-y-4 p-8 pt-6'>
      <div className='flex items-center justify-between'>
        <Heading
          title='Telegram Bots'
          description='Manage your Telegram bots'
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add New Bot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Bot</DialogTitle>
              <DialogDescription>
                Enter your Telegram bot details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddBot} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Bot Name</Label>
                <Input
                  id='name'
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  placeholder='Enter bot name'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='token'>Bot Token</Label>
                <Input
                  id='token'
                  value={newBotToken}
                  onChange={(e) => setNewBotToken(e.target.value)}
                  placeholder='Enter bot token'
                  required
                />
              </div>
              <Button type='submit' className='w-full'>
                Add Bot
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Separator />
      <div className='flex-1 min-h-[400px]'>
        <BotTable 
          data={bots} 
          onStartBot={handleStartBot}
          onStopBot={handleStopBot}
          onDeleteBot={handleDeleteBot}
          onUpdateBot={handleUpdateBot}
        />
      </div>
    </div>
  );
} 