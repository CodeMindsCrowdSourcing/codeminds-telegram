'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function SettingsForm() {
  const [batchSize, setBatchSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('verificationBatchSize') || '30';
    }
    return '30';
  });
  const [delayTime, setDelayTime] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('verificationDelayTime') || '180';
    }
    return '180';
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const size = parseInt(batchSize);
      const delay = parseInt(delayTime);

      if (isNaN(size) || size < 1) {
        toast.error('Please enter a valid batch size');
        return;
      }

      if (size > 100) {
        toast.error('Batch size cannot exceed 100');
        return;
      }

      if (isNaN(delay) || delay < 1) {
        toast.error('Please enter a valid delay time');
        return;
      }

      if (delay > 3600) {
        toast.error('Delay time cannot exceed 3600 seconds (1 hour)');
        return;
      }

      localStorage.setItem('verificationBatchSize', batchSize);
      localStorage.setItem('verificationDelayTime', delayTime);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='batchSize'>Batch Size</Label>
        <div className='flex gap-2'>
          <Input
            id='batchSize'
            type='number'
            min='1'
            max='100'
            value={batchSize}
            onChange={(e) => setBatchSize(e.target.value)}
            placeholder='Enter batch size'
            className='max-w-[200px]'
          />
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
        <p className='text-muted-foreground text-sm'>
          Number of users to check in each batch (1-100)
        </p>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='delayTime'>Delay Time (seconds)</Label>
        <div className='flex gap-2'>
          <Input
            id='delayTime'
            type='number'
            min='1'
            max='3600'
            value={delayTime}
            onChange={(e) => setDelayTime(e.target.value)}
            placeholder='Enter delay time in seconds'
            className='max-w-[200px]'
          />
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
        <p className='text-muted-foreground text-sm'>
          Time to wait between batches in seconds (1-3600)
        </p>
      </div>
    </div>
  );
}
