import { NextResponse } from 'next/server';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { auth } from "@clerk/nextjs/server";
import { TelegramSessionModel } from '@/models/telegram-session';

const apiId = process.env.TELEGRAM_API_ID;
const apiHash = process.env.TELEGRAM_API_HASH;

if (!apiId || !apiHash) {
  throw new Error('TELEGRAM_API_ID and TELEGRAM_API_HASH must be set');
}

// Type assertion since we've verified these exist
const telegramApiId = apiId as string;
const telegramApiHash = apiHash as string;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { phones } = await request.json();
    if (!Array.isArray(phones)) {
      return NextResponse.json(
        { error: 'Phones must be an array' },
        { status: 400 }
      );
    }

    // Get the user's Telegram session
    const session = await TelegramSessionModel.findOne({ userId });
    if (!session) {
      return NextResponse.json(
        { error: 'Telegram session not found. Please connect your account first.' },
        { status: 400 }
      );
    }

    // Initialize Telegram client with the saved session
    const client = new TelegramClient(
      new StringSession(session.sessionString),
      parseInt(telegramApiId),
      telegramApiHash,
      { connectionRetries: 5 }
    );

    await client.connect();

    // Check each phone number
    const results = await Promise.all(
      phones.map(async (phone) => {
        try {
          const result = await client.invoke({
            _: 'contacts.resolvePhone',
            phone: phone.replace(/\D/g, '')
          } as any) as { users?: { username?: string; firstName?: string; lastName?: string; }[] };

          if (result?.users?.[0]) {
            const user = result.users[0];
            return {
              phone,
              isFound: true,
              username: user.username || null,
              firstName: user.firstName || null,
              lastName: user.lastName || null
            };
          }

          return {
            phone,
            isFound: false,
            error: 'User not found'
          };
        } catch (error) {
          return {
            phone,
            isFound: false,
            error: (error as Error).message || 'Failed to check phone'
          };
        }
      })
    );

    await client.disconnect();
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check phones' },
      { status: 500 }
    );
  }
}
