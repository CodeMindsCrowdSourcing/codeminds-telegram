'use client';

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface CheckProgressProps {
  total: number;
  checked: number;
  found: number;
  isChecking: boolean;
}

export function CheckProgress({ total, checked, found, isChecking }: CheckProgressProps) {
  const progress = total > 0 ? (checked / total) * 100 : 0;

  return (
    <div className="space-y-2 my-4">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Badge variant="outline">{`Total: ${total}`}</Badge>
          <Badge variant="outline">{`Checked: ${checked}`}</Badge>
          <Badge variant="outline">{`Found: ${found}`}</Badge>
        </div>
        {isChecking && (
          <Badge variant="secondary" className="animate-pulse">
            Checking in progress...
          </Badge>
        )}
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-sm text-muted-foreground text-center">
        {isChecking 
          ? `Checking users... ${Math.round(progress)}%`
          : checked === total 
            ? 'Check completed'
            : 'Ready to check'}
      </p>
    </div>
  );
} 