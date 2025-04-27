import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { TelegramSessionModel } from "@/models/telegram-session";
import { auth } from "@clerk/nextjs/server";
import { UploadForm } from "@/components/custom-users/upload-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomUserModel } from "@/models/custom-user";
import { UserModel } from "@/models/user";
import { CustomUsersTable } from "@/features/custom-users/components/custom-users-table";
import { toast } from "sonner";
import connectDB from '@/lib/mongodb';

export default async function CustomUsersPage() {
  await connectDB();
  const { userId } = await auth();
  const session = userId ? await TelegramSessionModel.findOne({ userId }) : null;
  const isConnected = !!session;

  // Get user's custom users
  const user = userId ? await UserModel.findOne({ clerkId: userId }) : null;
  const customUsers = user
    ? (await CustomUserModel.find({ userId: user._id }).sort({ createdAt: -1 }))
        .map(user => ({
          _id: user._id.toString(),
          phone: user.phone,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          isFound: user.isFound,
          error: user.error,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        }))
    : [];

  const handleExportUsers = async (users: any[]) => {
    'use server';
    try {
      const csvContent = [
        ['Phone', 'Username', 'Name', 'Status', 'Created At'],
        ...users.map(user => [
          user.phone,
          user.username || '',
          `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          user.isFound ? 'Found' : 'Not Found',
          new Date(user.createdAt).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `custom-users-${new Date().toISOString()}.csv`;
      link.click();
    } catch (error) {
      toast.error('Failed to export users');
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Custom Users</h1>
      {!isConnected && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Telegram Account Required</AlertTitle>
          <AlertDescription>
            To verify phone numbers, you need to connect your Telegram account first.{" "}
            <Link href="/dashboard/telegram-connect" className="font-medium underline">
              Connect now
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload CSV</TabsTrigger>
          <TabsTrigger value="manual">Manual Check</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Users</CardTitle>
              <CardDescription>
                Upload a CSV file containing phone numbers to verify their Telegram accounts.
                Recommended batch size: 50-100 numbers per upload.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadForm isConnected={isConnected} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Manual Phone Check</CardTitle>
              <CardDescription>
                Check individual phone numbers manually. This method is slower but safer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Safety Tips</AlertTitle>
                  <AlertDescription>
                    - Wait at least 2 seconds between checks
                    - Maximum 100 checks per day
                    - Use proxy if available
                    - Avoid checking numbers in bulk
                  </AlertDescription>
                </Alert>
                {/* Add manual check form here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Verification Settings</CardTitle>
              <CardDescription>
                Configure your verification preferences and safety measures.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Current Settings</AlertTitle>
                  <AlertDescription>
                    - Delay between checks: 2 seconds
                    - Daily limit: 100 numbers
                    - Batch size: 50 numbers
                    - Proxy enabled: No
                  </AlertDescription>
                </Alert>
                {/* Add settings form here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Custom Users Table */}
      <Card className="mt-8">
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
    </div>
  );
}
