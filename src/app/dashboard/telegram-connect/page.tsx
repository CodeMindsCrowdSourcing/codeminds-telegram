'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function TelegramConnectPage() {
  const router = useRouter();
  const [step, setStep] = useState<'initial' | 'phone' | 'code'>('initial');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/telegram/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: phone }),
      });

      if (response.ok) {
        setStep('code');
        toast.success('Code sent successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send code');
      }
    } catch (error) {
      toast.error('Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/telegram/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code }),
      });

      if (response.ok) {
        toast.success('Successfully connected Telegram account!');
        router.push('/dashboard');
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to verify code');
        if (error.error === 'PHONE_CODE_INVALID') {
          setCode('');
        }
      }
    } catch (error) {
      toast.error('Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Connect Telegram Account</CardTitle>
          <CardDescription>
            Connect your Telegram account to verify phone numbers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'initial' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To use phone number verification, you need to connect your Telegram account.
                This will allow the system to check phone numbers using your account.
              </p>
              <Button 
                onClick={() => setStep('phone')}
                className="w-full"
              >
                Start Connection
              </Button>
            </div>
          )}

          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Your Telegram Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+79991234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Sending Code...' : 'Send Code'}
              </Button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Enter Code from Telegram</Label>
                <Input
                  id="code"
                  placeholder="12345"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={loading}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Enter the code you received in Telegram
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 