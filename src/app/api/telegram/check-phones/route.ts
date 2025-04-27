import { NextResponse } from 'next/server';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { auth } from '@clerk/nextjs/server';
import { TelegramSessionModel } from '@/models/telegram-session';
import { ConnectionTCPFull } from 'telegram/network';
import { Api } from 'telegram';
import { connectDB, disconnectDB } from '@/lib/mongodb';

if (!process.env.TELEGRAM_API_ID || !process.env.TELEGRAM_API_HASH) {
  throw new Error('TELEGRAM_API_ID and TELEGRAM_API_HASH must be set');
}

export async function POST(request: Request) {
  let client: TelegramClient | null = null;

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phones } = await request.json();
    if (!Array.isArray(phones)) {
      return NextResponse.json(
        { error: 'Phones must be an array' },
        { status: 400 }
      );
    }

    // Get the user's Telegram session
    await connectDB();
    const session = await TelegramSessionModel.findOne({ userId });
    if (!session) {
      await disconnectDB();
      return NextResponse.json(
        {
          error:
            'Telegram session not found. Please connect your account first.'
        },
        { status: 400 }
      );
    }

    // Initialize Telegram client with the saved session
    client = new TelegramClient(
      new StringSession(session.sessionString),
      Number(process.env.TELEGRAM_API_ID),
      process.env.TELEGRAM_API_HASH as string,
      {
        connectionRetries: 5,
        useWSS: true,
        testServers: true,
        connection: ConnectionTCPFull,
        deviceModel: 'Desktop',
        systemVersion: 'Windows 10',
        appVersion: '1.0.0',
        systemLangCode: 'en',
        langCode: 'en',
        timeout: 30000
      }
    );

    // Ensure client is connected
    if (!client.connected) {
      await client.connect();
    }

    // Check each phone number
    const results = await Promise.all(
      phones.map(async (phone) => {
        try {
          // Clean the phone number
          const cleanPhone = phone.replace(/\D/g, '');
          console.log('Checking phone:', cleanPhone); // Debug log

          // Check if the phone number exists in Telegram
          const result = await client!.invoke(
            new Api.contacts.ResolvePhone({
              phone: cleanPhone
            })
          );

          if (result?.users?.[0]) {
            const user = result.users[0] as Api.User;
            console.log('Found user:', user); // Debug log
            return {
              phone,
              isFound: true,
              username: user.username || '',
              firstName: user.firstName || '',
              lastName: user.lastName || ''
            };
          }

          console.log('User not found for phone:', cleanPhone); // Debug log
          return {
            phone,
            isFound: false,
            error: 'User not found'
          };
        } catch (error) {
          console.error(`Error checking phone ${phone}:`, error);
          return {
            phone,
            isFound: false,
            error: (error as Error).message || 'Failed to check phone'
          };
        }
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in check-phones:', error);
    return NextResponse.json(
      { error: 'Failed to check phones' },
      { status: 500 }
    );
  } finally {
    // Ensure both Telegram and MongoDB connections are closed
    try {
      if (client?.connected) {
        await client.disconnect();
        client = null;
      }
      await disconnectDB();
    } catch (e) {
      console.error('Error during cleanup:', e);
    }
  }
}
