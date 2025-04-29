import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { connectDB } from '@/lib/mongodb';
import { TelegramSessionModel } from '@/models/telegram-session';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumber, phoneCode, phoneCodeHash, sessionString } = await req.json();
    if (!phoneNumber || !phoneCode || !phoneCodeHash || !sessionString) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a new client with the saved session
    const client = new TelegramClient(
      new StringSession(sessionString),
      Number(process.env.TELEGRAM_API_ID),
      process.env.TELEGRAM_API_HASH as string,
      {
        connectionRetries: 5,
        useWSS: true,
        testServers: true
      }
    );

    try {
      await client.connect();
      
      // Start the client with the verification code
      await client.start({
        phoneNumber: async () => phoneNumber,
        password: async () => '',
        phoneCode: async () => phoneCode,
        onError: async (err) => {
          console.error('Start error:', err);
          return Promise.resolve(false);
        }
      });

      // Get the new session string after successful auth
      const newSessionString = client.session.save();

      // Connect to MongoDB and save session
      await connectDB();
      await TelegramSessionModel.findOneAndUpdate(
        { userId },
        {
          userId,
          phone: phoneNumber,
          sessionString: newSessionString,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );

      return NextResponse.json({
        success: true,
        message: 'Successfully signed in'
      });
    } finally {
      if (client.connected) {
        await client.destroy();
      }
    }
  } catch (error: any) {
    console.error('Error verifying code:', error);

    // Handle specific errors
    if (error.errorMessage?.includes('PHONE_CODE_INVALID')) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    if (error.errorMessage?.includes('PHONE_CODE_EXPIRED')) {
      return NextResponse.json(
        { error: 'Verification code expired' },
        { status: 400 }
      );
    }

    if (error.code === 420) {
      return NextResponse.json({
        error: 'FLOOD_WAIT',
        waitTime: error.seconds,
        message: `Please wait ${error.seconds} seconds before trying again`
      }, { status: 429 });
    }

    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
