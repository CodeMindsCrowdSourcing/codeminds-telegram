import { NextResponse } from 'next/server';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { cookies } from 'next/headers';
import { auth } from "@clerk/nextjs/server";
import { Api } from 'telegram/tl';

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

    const { phone } = await request.json();
    const cleanPhone = phone.replace(/\D/g, '');

    if (!cleanPhone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    client = new TelegramClient(
      new StringSession(''),
      telegramApiId,
      telegramApiHash,
      { 
        connectionRetries: 10,
        deviceModel: 'Desktop',
        systemVersion: 'Windows 10',
        appVersion: '1.0.0',
        systemLangCode: 'en',
        langCode: 'en',
        useWSS: false,
        timeout: 60000, // 60 seconds
        retryDelay: 1000 // 1 second between retries
      }
    );

    await client.connect();

    // Try to force SMS verification
    const result = await client.sendCode(
      { apiId: telegramApiId, apiHash: telegramApiHash },
      cleanPhone,
      true // forceSMS
    );

    console.log('Send code result:', result);

    await client.disconnect();
    client = null;

    if (result?.phoneCodeHash) {
      const cookieStore = await cookies();

      // Clear any existing verification cookies first
      cookieStore.delete('phoneCodeHash');
      cookieStore.delete('verifyPhone');

      // Set new cookies with path and domain
      cookieStore.set('phoneCodeHash', result.phoneCodeHash, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 300 // 5 minutes
      });
      
      cookieStore.set('verifyPhone', cleanPhone, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 300 // 5 minutes
      });

      console.log('Stored code hash:', result.phoneCodeHash);
      console.log('Stored phone:', cleanPhone);

      return NextResponse.json({ 
        success: true,
        debug: {
          phoneCodeHash: result.phoneCodeHash,
          phone: cleanPhone,
          isCodeViaApp: result.isCodeViaApp
        }
      });
    } else {
      throw new Error('Failed to get phone code hash');
    }
  } catch (error: any) {
    console.error('Error sending code:', error);
    
    // Check for specific Telegram errors
    if (error?.errorMessage?.includes('PHONE_NUMBER_INVALID')) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please use international format (e.g., +79991234567)' },
        { status: 400 }
      );
    }

    if (error?.errorMessage?.includes('PHONE_NUMBER_BANNED')) {
      return NextResponse.json(
        { error: 'This phone number is banned from Telegram.' },
        { status: 400 }
      );
    }

    if (error?.errorMessage?.includes('PHONE_NUMBER_FLOOD')) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 400 }
      );
    }

    if (error?.errorMessage?.includes('SEND_CODE_UNAVAILABLE')) {
      return NextResponse.json(
        { 
          error: 'Unable to send code. This could be due to:',
          details: [
            'Your phone number might be temporarily blocked by Telegram',
            'Too many attempts to send codes in a short time',
            'Your phone number might be banned from Telegram',
            'Please try again in 24 hours or use a different phone number'
          ],
          code: error.code,
          errorMessage: error.errorMessage
        },
        { status: 406 }
      );
    }

    if (error?.errorMessage === 'FLOOD' && error?.seconds) {
      const hours = Math.ceil(error.seconds / 3600);
      return NextResponse.json(
        {
          error: 'Too many attempts. Please wait before trying again.',
          details: [
            `You need to wait ${hours} hours before trying again`,
            'This is a Telegram security measure to prevent abuse',
            'Please try again later or use a different phone number'
          ],
          waitTime: {
            seconds: error.seconds,
            hours: hours
          }
        },
        { status: 420 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error?.errorMessage || error?.message || 'Failed to send code',
        details: error?.errorMessage,
        code: error?.code
      },
      { status: 500 }
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