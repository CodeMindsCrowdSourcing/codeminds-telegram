import { NextResponse } from 'next/server';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { auth } from '@clerk/nextjs/server';
import { TelegramSessionModel } from '@/models/telegram-session';
import { ConnectionTCPFull } from 'telegram/network';
import { Api } from 'telegram';
import { connectDB, disconnectDB } from '@/lib/mongodb';
import { CheckLimitsService } from '@/services/check-limits';

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

    // Validate batch size
    const batchValidation = CheckLimitsService.validateBatchSize(phones.length);
    if (!batchValidation.isValid) {
      return NextResponse.json(
        { error: batchValidation.error },
        { status: 400 }
      );
    }

    // Check rate limits
    const checkResult = await CheckLimitsService.canCheck(userId);
    if (!checkResult.canCheck) {
      return NextResponse.json(
        {
          error: checkResult.error,
          timeToWait: checkResult.timeToWait
        },
        { status: 429 }
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
    const stringSession = new StringSession(session.sessionString);
    client = new TelegramClient(
      stringSession,
      Number(process.env.TELEGRAM_API_ID),
      process.env.TELEGRAM_API_HASH as string,
      {
        connectionRetries: 5,
        useWSS: true,
        testServers: session.isTestMode,
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

    // Process phones through the CheckLimitsService
    const processResult = await CheckLimitsService.processBatch(
      phones,
      userId,
      async (phoneBatch) => {
        return Promise.all(
          phoneBatch.map(async (phone) => {
            try {
              // Clean the phone number
              const cleanPhone = phone.replace(/\D/g, '');

              // Check if the phone number exists in Telegram
              const result = await client!.invoke(
                new Api.contacts.ResolvePhone({
                  phone: cleanPhone
                })
              );

              if (result?.users?.[0]) {
                const user = result.users[0] as Api.User;
                return {
                  phone,
                  isFound: true,
                  username: user.username || '',
                  firstName: user.firstName || '',
                  lastName: user.lastName || ''
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
      }
    );

    if (!processResult.success) {
      return NextResponse.json(
        { error: processResult.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ results: processResult.results });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check phones' },
      { status: 500 }
    );
  } finally {
    // Ensure both Telegram and MongoDB connections are closed
    try {
      if (client?.connected) {
        await client.destroy();
        client = null;
      }
      await disconnectDB();
    } catch (e) {
    }
  }
}
