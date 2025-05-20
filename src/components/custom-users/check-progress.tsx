'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

interface CheckProgressProps {
  total: number;
  checked: number;
  found: number;
  isChecking: boolean;
  timeUntilNextBatch?: number;
}

export function CheckProgress({
  total,
  checked,
  found,
  isChecking,
  timeUntilNextBatch
}: CheckProgressProps) {
  const progress = total > 0 ? Math.round((checked / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Progress</CardTitle>
        <CardDescription>
          {isChecking
            ? `Checking users... ${checked}/${total} (${progress}%)`
            : 'Verification completed'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className='h-2 w-full rounded-full bg-secondary'>
            <div
              className='h-full rounded-full bg-primary transition-all'
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className='flex items-center justify-between text-sm'>
          <span>Found Users</span>
          <span>
            {found > 0 ? found : <span className='text-muted-foreground'>No users found yet</span>}
          </span>
        </div>
          {isChecking && timeUntilNextBatch !== undefined && timeUntilNextBatch > 0 && (
            <div className='flex items-center justify-between text-sm text-muted-foreground'>
              <span>Next batch in</span>
              <span>{timeUntilNextBatch} seconds</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 