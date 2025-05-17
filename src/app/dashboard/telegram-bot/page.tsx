import { auth } from '@clerk/nextjs/server';
import { TelegramSessionModel } from '@/models/telegram-session';
import connectToDatabase from '@/lib/mongodb';
import { TelegramBotsClient } from '@/app/dashboard/telegram-bot/telegram-bots-client';

export default async function TelegramBotsPage() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  await connectToDatabase();
  const session = userId
    ? await TelegramSessionModel.findOne({ userId })
    : null;

  return <TelegramBotsClient isConnected={!!session} />;
}
