import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { TelegramBotModel } from '@/models/telegram-bot';
import { UserModel } from '@/models/user';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get or create user
    let user = await UserModel.findOne({ clerkId: userId });

    if (!user) {
      // Get user data from Clerk
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json(
          { error: 'User data not found' },
          { status: 404 }
        );
      }

      // Create new user
      user = await UserModel.create({
        clerkId: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
        bots: []
      });
    }

    const bots = await TelegramBotModel.find({ owner: user._id });
    return NextResponse.json(bots);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch bots' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    await connectToDatabase();

    // Get or create user
    let user = await UserModel.findOne({ clerkId: userId });

    if (!user) {
      // Get user data from Clerk
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json(
          { error: 'User data not found' },
          { status: 404 }
        );
      }

      // Create new user
      user = await UserModel.create({
        clerkId: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
        bots: []
      });
    }

    // Create bot with all fields
    const bot = new TelegramBotModel({
      name: data.name,
      token: data.token,
      isRunning: data.isRunning,
      owner: user._id,
      buttonText: data.buttonText,
      infoText: data.infoText,
      authorId: data.authorId,
      linkImage: data.linkImage,
      buttonPrivateMessage: data.buttonPrivateMessage,
      messagePrivateMessage: data.messagePrivateMessage,
      messageOnClick: data.messageOnClick,
      users: []
    });

    await bot.save();

    // Update user's bots array
    user.bots.push(bot._id);
    await user.save();

    return NextResponse.json(bot);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create bot' },
      { status: 500 }
    );
  }
}
