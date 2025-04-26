import { NextResponse } from 'next/server';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import { TelegramSessionModel } from '@/models/telegram-session';
import { connectDB } from '@/lib/db';

const apiId = process.env.TELEGRAM_API_ID;
const apiHash = process.env.TELEGRAM_API_HASH;

if (!apiId || !apiHash) {
  throw new Error('TELEGRAM_API_ID and TELEGRAM_API_HASH must be set');
}

const telegramApiId = parseInt(apiId);
const telegramApiHash = apiHash;

export async function POST(request: Request) {
  let client: TelegramClient | null = null;

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { code } = await request.json();
    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const phoneCodeHash = cookieStore.get('phoneCodeHash')?.value;
    const phone = cookieStore.get('verifyPhone')?.value;

    if (!phoneCodeHash || !phone) {
      return NextResponse.json(
        {
          error: 'Code expired, please request a new one',
          debug: {
            hasCodeHash: !!phoneCodeHash,
            hasPhone: !!phone,
            cookies: [...cookieStore.getAll()].map(c => c.name)
          }
        },
        { status: 400 }
      );
    }

    client = new TelegramClient(
      new StringSession(''),
      telegramApiId,
      telegramApiHash,
      {
        connectionRetries: 5,
        deviceModel: 'Desktop',
        systemVersion: 'Windows 10',
        appVersion: '1.0.0',
        systemLangCode: 'en',
        langCode: 'en',
        useWSS: false,
        timeout: 30000
      }
    );

    await client.connect();

    try {
      // Use raw API method for sign in
      const signInResult = await client.invoke({
        _: 'auth.signIn',
        phone_number: phone,
        phone_code_hash: phoneCodeHash,
        phone_code: code.toString()
      } as any);

      // Get the session string for future use
      const sessionString = client.session.save() as unknown as string;
      await client.disconnect();
      client = null;

      // Connect to DB and store the session
      await connectDB();
      await TelegramSessionModel.findOneAndUpdate(
        { userId },
        {
          userId,
          phone,
          sessionString,
        },
        { upsert: true, new: true }
      );

      // Only clear cookies on successful sign in
      cookieStore.delete('phoneCodeHash');
      cookieStore.delete('verifyPhone');

      return NextResponse.json({
        success: true,
        debug: {
          signInResult: signInResult?.className
        }
      });
    } catch (error: any) {
      if (error?.errorMessage === 'SESSION_PASSWORD_NEEDED') {
        return NextResponse.json(
          { error: '2FA is enabled. Please disable it in Telegram settings and try again.' },
          { status: 400 }
        );
      }
      if (error?.errorMessage === 'PHONE_CODE_EXPIRED') {
        // Clear cookies if code is expired
        cookieStore.delete('phoneCodeHash');
        cookieStore.delete('verifyPhone');
        return NextResponse.json(
          { error: 'Code expired. Please go back and request a new code.' },
          { status: 400 }
        );
      }
      if (error?.errorMessage === 'PHONE_CODE_INVALID') {
        return NextResponse.json(
          { error: 'Invalid code. Please check and try again.' },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.errorMessage || error?.message || 'Failed to verify code',
        details: error?.errorMessage
      },
      { status: error?.code || 500 }
    );
  } finally {
    if (client) {
      try {
        await client.disconnect();
      } catch (e) {
        console.error('Error disconnecting client:', e);
      }
    }
  }
}
