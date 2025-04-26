import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { TelegramSessionModel } from "@/models/telegram-session";
import { auth } from "@clerk/nextjs/server";
import { UploadForm } from "@/components/custom-users/upload-form";
import { connectDB } from "@/lib/db";

export default async function CustomUsersPage() {
  await connectDB();
  const { userId } = await auth();
  const session = userId ? await TelegramSessionModel.findOne({ userId }) : null;
  const isConnected = !!session;

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

      <Card>
        <CardHeader>
          <CardTitle>Upload Users</CardTitle>
          <CardDescription>
            Upload a CSV file containing phone numbers to verify their Telegram accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadForm isConnected={isConnected} />
        </CardContent>
      </Card>
    </div>
  );
} 