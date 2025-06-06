'use client';

import { useState, useEffect } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
import { useTonConnectUI } from '@tonconnect/ui-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    tonConnectUI: {
      openModal: () => void;
    };
  }
}

export default function WalletPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<{
    balance: number;
    discount: number;
  } | null>(null);

  useEffect(() => {
    setIsConnected(tonConnectUI.connected);
  }, [tonConnectUI.connected]);

  useEffect(() => {
    // Получаем пользователя с API
    fetch('/api/user')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.balance !== undefined && data.discount !== undefined) {
          setUser({ balance: data.balance, discount: data.discount });
        }
      });
  }, []);

  const RECIPIENT_ADDRESS = 'UQCziv0RCs8IH-o3ts_ifD-dFO6y3NrJ8yas4erEATXW0S_N';

  const handleAddFunds = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!tonConnectUI.account?.address) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      setIsLoading(true);

      // Convert amount to nanoTON (1 TON = 1,000,000,000 nanoTON)
      const amountInNano = Math.floor(Number(amount) * 1_000_000_000);

      // Create transaction
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [
          {
            address: RECIPIENT_ADDRESS,
            amount: amountInNano.toString()
          }
        ]
      };

      // Send transaction
      await tonConnectUI.sendTransaction(transaction);
      toast.success(`Transfer of ${amount} TON initiated`);
      setIsDialogOpen(false);
      setAmount('');
    } catch (error) {
      toast.error('Failed to transfer funds');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex h-full flex-col space-y-2 p-2 pt-4 sm:space-y-4 sm:p-8 sm:pt-6'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
        <Heading
          title='Wallet'
          description='Manage your TON wallet and funds'
        />
        <div className='flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-4'>
          {isConnected ? (
            <>
              <Button variant='outline' className='w-full sm:w-auto'>
                {tonConnectUI.account?.address.slice(0, 6)}...
                {tonConnectUI.account?.address.slice(-4)}
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className='w-full sm:w-auto'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Funds
                  </Button>
                </DialogTrigger>
                <DialogContent className='max-w-xs sm:max-w-lg'>
                  <DialogHeader>
                    <DialogTitle>Add Funds</DialogTitle>
                    <DialogDescription>
                      Enter the amount of TON you want to send
                    </DialogDescription>
                  </DialogHeader>
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='amount'>Amount (TON)</Label>
                      <Input
                        id='amount'
                        type='number'
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder='Enter amount'
                        disabled={isLoading}
                        className='w-full'
                      />
                    </div>
                    <Button
                      onClick={handleAddFunds}
                      className='w-full'
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Send'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <Button
              onClick={() => tonConnectUI.openModal()}
              className='w-full sm:w-auto'
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
      <Separator />
      <div className='flex-1'>
        {isConnected ? (
          <div className='space-y-4'>
            <div className='rounded-lg border p-2 sm:p-4'>
              <h3 className='text-lg font-medium'>Wallet Info</h3>
              <p className='text-muted-foreground text-sm break-all'>
                Address: {tonConnectUI.account?.address}
              </p>
              <div className='mt-2 space-y-1'>
                <div className='text-sm'>
                  Balance:{' '}
                  <span className='font-mono'>{user?.balance ?? 0}</span>
                </div>
                <div className='text-sm'>
                  Discount:{' '}
                  <span className='font-mono'>{user?.discount ?? 0}%</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center space-y-4 py-8 text-center sm:py-0'>
            <h3 className='text-lg font-medium'>Connect Your Wallet</h3>
            <p className='text-muted-foreground max-w-[600px] text-sm'>
              Connect your TON wallet to manage your funds and make
              transactions.
            </p>
            <Button
              onClick={() => tonConnectUI.openModal()}
              className='w-full max-w-xs sm:w-auto'
            >
              Connect Wallet
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
