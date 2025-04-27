import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumber } = await req.json();
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Create a new client
    const client = new TelegramClient(
      new StringSession(''),
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

      // Send verification code
      const { phoneCodeHash } = await client.sendCode(
        {
          apiId: Number(process.env.TELEGRAM_API_ID),
          apiHash: process.env.TELEGRAM_API_HASH as string
        },
        phoneNumber
      );

      // Get session string
      const sessionString = client.session.save();

      return NextResponse.json({
        success: true,
        phoneCodeHash,
        sessionString
      });
    } finally {
      await client.disconnect();
    }
  } catch (error: any) {
    // Handle flood wait error
    if (error.code === 420) {
      return NextResponse.json({
        error: 'FLOOD_WAIT',
        waitTime: error.seconds,
        message: `Please wait ${error.seconds} seconds before trying again`
      }, { status: 429 });
    }

    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
