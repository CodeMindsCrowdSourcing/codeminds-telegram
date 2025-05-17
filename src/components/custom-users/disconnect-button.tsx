'use client';

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function DisconnectButton() {
  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/telegram/update-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      toast.success('Successfully disconnected from Telegram');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to disconnect from Telegram');
    }
  };

  return (
    <Button variant="outline" onClick={handleDisconnect}>
      <LogOut className="mr-2 h-4 w-4" />
      Disconnect Telegram
    </Button>
  );
} 