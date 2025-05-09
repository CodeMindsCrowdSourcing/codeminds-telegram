import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { CustomUserModel } from '@/models/custom-user';
import { UserModel } from '@/models/user';
import { TelegramSessionModel } from '@/models/telegram-session';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Api } from 'telegram/tl';

// Store active verification processes
const activeVerifications = new Map<string, {
  isRunning: boolean;
  total: number;
  checked: number;
  found: number;
  lastUpdate: Date;
  client: TelegramClient | null;
  nextBatchTime: Date | null;
}>();

async function processBatch(users: any[], client: TelegramClient) {
  const results = [];

  for (const user of users) {
    try {
      const result = await client.invoke(
        new Api.contacts.ResolvePhone({
          phone: user.phone.replace(/\D/g, '')
        })
      );

      const isFound = result?.users?.[0] ? true : false;
      const telegramUser = isFound ? result.users[0] : null;

      let username, firstName, lastName;

      if (isFound && telegramUser) {
        if ('username' in telegramUser && telegramUser.username) {
          username = telegramUser.username;
        }
        if ('firstName' in telegramUser && telegramUser.firstName) {
          firstName = telegramUser.firstName;
        }
        if ('lastName' in telegramUser && telegramUser.lastName) {
          lastName = telegramUser.lastName;
        }

        if (telegramUser instanceof Api.User) {
          if (telegramUser.username) username = telegramUser.username;
          if (telegramUser.firstName) firstName = telegramUser.firstName;
          if (telegramUser.lastName) lastName = telegramUser.lastName;
        }
      }

      const updateData: any = {
        isFound,
        error: isFound ? undefined : 'User not found in Telegram',
        checked: true
      };

      if (username) updateData.username = username;
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;

      results.push({
        userId: user._id,
        ...updateData
      });
    } catch (error: any) {
      if (error.errorMessage === 'PHONE_NOT_OCCUPIED') {
        results.push({
          userId: user._id,
          isFound: false,
          error: 'This phone number is not registered on Telegram',
          checked: true
        });
      } else {
        results.push({
          userId: user._id,
          isFound: false,
          error: error.message || 'Unknown error occurred',
          checked: true
        });
      }
    }
  }

  return results;
}

async function startVerificationProcess(userId: string, user: any, session: any, batchSize: number, delayTime: number) {
  let client: TelegramClient | null = null;
  
  try {
    client = new TelegramClient(
      new StringSession(session.sessionString),
      Number(process.env.TELEGRAM_API_ID),
      process.env.TELEGRAM_API_HASH as string,
      {
        connectionRetries: 5,
        useWSS: true,
        testServers: true
      }
    );

    await client.connect();

    // Update the verification status with the client
    const currentStatus = activeVerifications.get(userId);
    if (currentStatus) {
      activeVerifications.set(userId, {
        ...currentStatus,
        client,
        nextBatchTime: null
      });
    }

    let processedCount = 0;
    const total = currentStatus?.total || 0;

    while (processedCount < total && activeVerifications.get(userId)?.isRunning) {
      try {
        const now = new Date();
        const currentStatus = activeVerifications.get(userId);
        
        // Check if we need to wait
        if (currentStatus?.nextBatchTime && now < currentStatus.nextBatchTime) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Check every second
          continue;
        }

        const uncheckedUsers = await CustomUserModel.find({
          userId: user._id,
          checked: { $ne: true }
        }).limit(batchSize);

        if (uncheckedUsers.length === 0) {
          break;
        }

        const results = await processBatch(uncheckedUsers, client);

        // Update users in database
        const updatePromises = results.map((result) =>
          CustomUserModel.findByIdAndUpdate(
            result.userId,
            {
              isFound: result.isFound,
              error: result.error,
              username: result.username,
              firstName: result.firstName,
              lastName: result.lastName,
              checked: true
            },
            { new: true }
          )
        );

        await Promise.all(updatePromises);

        // Update progress
        processedCount += results.length;
        const foundCount = results.filter(r => r.isFound).length;
        const nextBatchTime = new Date(now.getTime() + delayTime * 1000);
        
        if (currentStatus) {
          activeVerifications.set(userId, {
            ...currentStatus,
            checked: processedCount,
            found: (currentStatus.found || 0) + foundCount,
            lastUpdate: now,
            nextBatchTime: processedCount < total ? nextBatchTime : null
          });
        }

        if (processedCount < total) {
        }
      } catch (error) {
        // Continue with next batch even if current one failed
      }
    }

  } catch (error) {
    throw error;
  } finally {
    if (client?.connected) {
      await client.destroy();
    }
    activeVerifications.delete(userId);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const session = await TelegramSessionModel.findOne({
      userId: userId.toString()
    });
    if (!session) {
      return NextResponse.json(
        { error: 'Telegram session not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { action, batchSize = 30, delayTime = 180 } = body;

    if (action === 'start') {
      // Check if verification is already running
      if (activeVerifications.get(userId)) {
        return NextResponse.json(
          { error: 'Verification is already running' },
          { status: 400 }
        );
      }

      // Get total count of unchecked users first
      const uncheckedCount = await CustomUserModel.countDocuments({
        userId: user._id,
        checked: { $ne: true }
      });

      if (uncheckedCount === 0) {
        return NextResponse.json(
          { error: 'No users to check' },
          { status: 400 }
        );
      }

      // Initialize verification process
      activeVerifications.set(userId, {
        isRunning: true,
        total: uncheckedCount,
        checked: 0,
        found: 0,
        lastUpdate: new Date(),
        client: null,
        nextBatchTime: null
      });

      // Start verification process in background
      startVerificationProcess(userId, user, session, batchSize, delayTime).catch(error => {
        const currentStatus = activeVerifications.get(userId);
        if (currentStatus?.client?.connected) {
          currentStatus.client.destroy().catch(console.error);
        }
        activeVerifications.delete(userId);
      });

      return NextResponse.json({
        success: true,
        message: 'Verification started',
        total: uncheckedCount
      });
    } else if (action === 'stop') {
      const verification = activeVerifications.get(userId);
      if (!verification) {
        return NextResponse.json(
          { error: 'No active verification found' },
          { status: 404 }
        );
      }

      verification.isRunning = false;
      if (verification.client?.connected) {
        await verification.client.destroy();
      }
      activeVerifications.delete(userId);

      return NextResponse.json({
        success: true,
        message: 'Verification stopped'
      });
    } else if (action === 'status') {
      const verification = activeVerifications.get(userId);
      if (!verification) {
        return NextResponse.json({
          isRunning: false,
          message: 'No active verification'
        });
      }

      const now = new Date();
      const timeUntilNextBatch = verification.nextBatchTime 
        ? Math.max(0, Math.floor((verification.nextBatchTime.getTime() - now.getTime()) / 1000))
        : 0;

      return NextResponse.json({
        isRunning: verification.isRunning,
        total: verification.total,
        checked: verification.checked,
        found: verification.found,
        lastUpdate: verification.lastUpdate,
        nextBatchTime: verification.nextBatchTime,
        timeUntilNextBatch
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to process verification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 