import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { TelegramSessionModel } from '@/models/telegram-session';
import { auth } from '@clerk/nextjs/server';
import { UploadForm } from '@/components/custom-users/upload-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomUserModel } from '@/models/custom-user';
import { UserModel } from '@/models/user';
import { CustomUsersTable } from '@/features/custom-users/components/custom-users-table';
import connectDB from '@/lib/mongodb';
import { SettingsForm } from '@/components/custom-users/settings-form';
import { LogsViewer } from '@/components/custom-users/logs-viewer';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { DisconnectButton } from '@/components/custom-users/disconnect-button';

export default async function CustomUsersPage() {
  await connectDB();
  const { userId } = await auth();

  const session = userId
    ? await TelegramSessionModel.findOne({ userId })
    : null;

  const isConnected = !!session;

  const handleUpdateSession = async () => {
    'use server';
    try {
      const response = await fetch('/api/telegram/update-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update session');
      }

      window.location.reload();
    } catch (error) {
    }
  };

  // Get user's custom users
  const user = userId ? await UserModel.findOne({ clerkId: userId }) : null;
  const customUsers = user
    ? (
        await CustomUserModel.find({ userId: user._id }).sort({ createdAt: -1 })
      ).map((user) => ({
        _id: user._id.toString(),
        phone: user.phone,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isFound: user.isFound,
        error: user.error,
        checked: user.checked,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }))
    : [];

  const handleExportUsers = async (users: any[]) => {
    'use server';
    try {
      const csvContent = [
        ['Phone', 'Username', 'Name', 'Status', 'Created At'],
        ...users.map((user) => [
          user.phone,
          user.username || '',
          `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          user.isFound ? 'Found' : 'Not Found',
          new Date(user.createdAt).toLocaleDateString()
        ])
      ]
        .map((row) => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `custom-users-${new Date().toISOString()}.csv`;
      link.click();
    } catch (error) {
    }
  };

  return (
    <PageContainer>
      <div className='space-y-6 w-full px-4'>
        <div className="flex justify-between items-center">
          <h1 className='text-2xl font-bold'>Custom Users</h1>
          <div className="flex gap-2">
            {!isConnected && session && (
              <form action={handleUpdateSession}>
                <Button variant="outline" type="submit">
                  Update Session
                </Button>
              </form>
            )}
            {isConnected && (
              <DisconnectButton />
            )}
          </div>
        </div>

        {!isConnected && (
          <Alert>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Telegram Account Required</AlertTitle>
            <AlertDescription>
              To verify phone numbers, you need to connect your Telegram account
              first.{' '}
              <Link
                href='/dashboard/telegram-connect'
                className='font-medium underline'
              >
                Connect now
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue='users' className='space-y-4'>
          <TabsList className='w-full justify-start'>
            <TabsTrigger value='users'>Users List</TabsTrigger>
            <TabsTrigger value='add'>Add Users</TabsTrigger>
            <TabsTrigger value='settings'>Settings</TabsTrigger>
          </TabsList>

          {/* Users List Tab */}
          <TabsContent value='users'>
            <Card>
              <CardHeader>
                <CardTitle>Your Custom Users</CardTitle>
                <CardDescription>
                  List of all phone numbers youve checked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomUsersTable
                  data={customUsers}
                  onExportUsers={handleExportUsers}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Users Tab */}
          <TabsContent value='add'>
            <Card>
              <CardHeader>
                <CardTitle>Add Users</CardTitle>
                <CardDescription>
                  Upload users from CSV or add them manually
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div>
                  <h3 className='mb-2 text-lg font-medium'>Upload CSV</h3>
                  <p className='text-muted-foreground mb-4 text-sm'>
                    Upload a CSV file containing phone numbers. Recommended batch
                    size: 50-100 numbers.
                  </p>
                  <UploadForm isConnected={isConnected} />
                </div>

                <div>
                  <h3 className='mb-2 text-lg font-medium'>Safety Tips</h3>
                  <Alert>
                    <AlertCircle className='h-4 w-4' />
                    <AlertTitle>Important Information</AlertTitle>
                    <AlertDescription className='space-y-2'>
                      <p>• Wait at least 2 seconds between checks</p>
                      <p>• Maximum 100 checks per day</p>
                      <p>• Use proxy if available</p>
                      <p>• Avoid checking numbers in bulk</p>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value='settings'>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Settings</CardTitle>
                  <CardDescription>
                    Configure your verification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <SettingsForm />

                  <Alert>
                    <AlertCircle className='h-4 w-4' />
                    <AlertTitle>Safety Tips</AlertTitle>
                    <AlertDescription className='space-y-2'>
                      <p>• Wait at least 2 seconds between checks</p>
                      <p>• Maximum 100 checks per day</p>
                      <p>• Use proxy if available</p>
                      <p>• Avoid checking numbers in bulk</p>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Verification Logs</CardTitle>
                  <CardDescription>
                    View detailed logs of all verification attempts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LogsViewer />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
