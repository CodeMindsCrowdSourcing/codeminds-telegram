import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UserModel } from '@/models/user';
import connectDB from '@/lib/mongodb';

export async function GET() {
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

    return NextResponse.json({
      balance: user.balance ?? 0,
      discount: user.discount ?? 0
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
