'use client';

import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus, Loader2, ExternalLink } from 'lucide-react';
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
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TelegramBotsPage() {
  const [bots, setBots] = useState<TelegramBot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingBot, setIsAddingBot] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [newBotToken, setNewBotToken] = useState('');
  const [newBotButtonText, setNewBotButtonText] = useState('');
  const [newBotInfoText, setNewBotInfoText] = useState('');
  const [newBotButtonPrivateMessage, setNewBotButtonPrivateMessage] =
    useState('');
  const [newBotMessagePrivateMessage, setNewBotMessagePrivateMessage] =
    useState('');
  const [newBotMessageOnClick, setNewBotMessageOnClick] = useState('');
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);

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
        buttonPrivateMessage: bot.buttonPrivateMessage,
        messagePrivateMessage: bot.messagePrivateMessage,
        messageOnClick: bot.messageOnClick,
        createdAt: new Date(bot.createdAt),
        updatedAt: new Date(bot.updatedAt)
      }));
      setBots(transformedBots);
    } catch (error) {
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
      setIsLoading(true);
      const response = await fetch(`/api/telegram-bot/${botId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isRunning: true })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to start bot');
      }

      // Get the updated bot data
      const updatedBot = await response.json();

      // Update the bot in the local state
      setBots((prevBots) =>
        prevBots.map((bot) =>
          bot.id === botId
            ? {
                ...bot,
                isRunning: updatedBot.isRunning,
                updatedAt: updatedBot.updatedAt // Remove Date constructor to match type
              }
            : bot
        )
      );

      toast.success('Bot started successfully');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to start bot');
      }
      // Refresh bots list to ensure correct status is shown
      await fetchBots();
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopBot = async (botId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/telegram-bot/${botId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isRunning: false })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to stop bot');
      }

      // Get the updated bot data
      const updatedBot = await response.json();
      // Update the bot in the local state
      setBots((prevBots) =>
        prevBots.map((bot) =>
          bot.id === botId
            ? {
                ...bot,
                isRunning: updatedBot.isRunning,
                updatedAt: updatedBot.updatedAt // Remove Date constructor
              }
            : bot
        )
      );

      toast.success('Bot stopped successfully');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to stop bot');
      }
      // Refresh bots list to ensure correct status is shown
      await fetchBots();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBot = async (botId: string) => {
    try {
      // Find the bot to check if it's running
      const bot = bots.find((b) => b.id === botId);
      if (!bot) {
        throw new Error('Bot not found');
      }

      // If bot is running, stop it first
      if (bot.isRunning) {
        await fetch(`/api/telegram-bot/${botId}/stop`, {
          method: 'POST'
        });
      }

      // Then delete the bot
      const response = await fetch(`/api/telegram-bot/${botId}`, {
        method: 'DELETE'
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
    }
  };

  const handleAddBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddingBot) return;

    try {
      setIsAddingBot(true);
      const response = await fetch('/api/telegram-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newBotName,
          token: newBotToken,
          isRunning: false,
          buttonText: newBotButtonText || 'להזמנות לחצו כאן',
          infoText: newBotInfoText || 'להזמנות לחצו כאן',
          authorId: '',
          linkImage: '/images/strange.jpg',
          buttonPrivateMessage: newBotButtonPrivateMessage || '👤 Open profile',
          messagePrivateMessage:
            newBotMessagePrivateMessage ||
            "Thank you for your interest! Click the button below to open the author's profile:",
          messageOnClick:
            newBotMessageOnClick ||
            'Thank you for clicking! Processing your request...'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create bot');
      }

      toast.success('Bot added successfully!');
      setIsDialogOpen(false);
      setIsInfoDialogOpen(true);
      setNewBotName('');
      setNewBotToken('');
      setNewBotButtonText('');
      setNewBotInfoText('');
      setNewBotButtonPrivateMessage('');
      setNewBotMessagePrivateMessage('');
      setNewBotMessageOnClick('');
      await fetchBots();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to add bot');
      }
    } finally {
      setIsAddingBot(false);
    }
  };

  const handleUpdateBot = async (botId: string, data: Partial<TelegramBot>) => {
    try {
      const response = await fetch(`/api/telegram-bot/${botId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update bot');
      }

      const updatedBot = await response.json();
      setBots((prevBots) =>
        prevBots.map((bot) =>
          bot.id === botId
            ? {
                ...bot,
                ...updatedBot,
                createdAt: new Date(updatedBot.createdAt),
                updatedAt: new Date(updatedBot.updatedAt)
              }
            : bot
        )
      );

      toast.success('Bot updated successfully');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update bot');
      }
    }
  };

  if (isLoading) {
    return (
      <div className='flex h-screen w-full items-center justify-center'>
        <div className='flex flex-col items-center gap-2'>
          <Loader2 className='text-primary h-8 w-8 animate-spin' />
          <p className='text-muted-foreground text-sm'>Loading bots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full flex-col space-y-4 p-8 pt-6'>
      <div className="flex items-center justify-between">
        <Heading
          title="Telegram Bots"
          description="Manage your Telegram bots"
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
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
            <form onSubmit={handleAddBot} className="space-y-4">
              <div className='space-y-2'>
                <Label htmlFor='name'>Bot Name</Label>
                <Input
                  id='name'
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  placeholder='Enter bot name'
                  required
                  disabled={isAddingBot}
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
                  disabled={isAddingBot}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='buttonText'>Button Text</Label>
                <Input
                  id='buttonText'
                  value={newBotButtonText}
                  onChange={(e) => setNewBotButtonText(e.target.value)}
                  placeholder='Enter button text'
                  disabled={isAddingBot}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='infoText'>Info Text</Label>
                <Input
                  id='infoText'
                  value={newBotInfoText}
                  onChange={(e) => setNewBotInfoText(e.target.value)}
                  placeholder='Enter info text'
                  disabled={isAddingBot}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='buttonPrivateMessage'>
                  Private Message Button Text
                </Label>
                <Input
                  id='buttonPrivateMessage'
                  value={newBotButtonPrivateMessage}
                  onChange={(e) =>
                    setNewBotButtonPrivateMessage(e.target.value)
                  }
                  placeholder='Enter private message button text'
                  disabled={isAddingBot}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='messagePrivateMessage'>
                  Private Message Text
                </Label>
                <Input
                  id='messagePrivateMessage'
                  value={newBotMessagePrivateMessage}
                  onChange={(e) =>
                    setNewBotMessagePrivateMessage(e.target.value)
                  }
                  placeholder='Enter private message text'
                  disabled={isAddingBot}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='messageOnClick'>Click Message</Label>
                <Input
                  id='messageOnClick'
                  value={newBotMessageOnClick}
                  onChange={(e) => setNewBotMessageOnClick(e.target.value)}
                  placeholder='Enter message to show on click'
                  disabled={isAddingBot}
                />
              </div>
              <Button type='submit' className='w-full' disabled={isAddingBot}>
                {isAddingBot ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Adding Bot...
                  </>
                ) : (
                  'Add Bot'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Separator />
      <div className="rounded-lg border bg-card">
        <div className="relative overflow-hidden">
          <div className="overflow-x-auto">
            <BotTable
              data={bots}
              onStartBot={handleStartBot}
              onStopBot={handleStopBot}
              onDeleteBot={handleDeleteBot}
              onUpdateBot={handleUpdateBot}
            />
          </div>
        </div>
      </div>

      <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Important Information</DialogTitle>
            <DialogDescription>
              Please follow these steps to ensure your bot works correctly:
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <h4 className='font-medium'>Step 1: Get Author ID</h4>
              <p className='text-muted-foreground text-sm'>
                Send the command{' '}
                <code className='bg-muted rounded px-1 py-0.5'>/start</code> to
                your bot in Telegram. The bot will respond with your Author ID.
                This ID is required for the button to work properly.
              </p>
            </div>
            <div className='space-y-2'>
              <h4 className='font-medium'>Step 2: Complete Bot Settings</h4>
              <p className='text-muted-foreground text-sm'>
                Make sure to fill in all the bot settings in the edit menu:
              </p>
              <ul className='text-muted-foreground list-inside list-disc space-y-1 text-sm'>
                <li>Button Text</li>
                <li>Info Text</li>
                <li>Author ID (from Step 1)</li>
                <li>Private Message Button Text</li>
                <li>Private Message Text</li>
                <li>Click Message</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsInfoDialogOpen(false)}>
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
