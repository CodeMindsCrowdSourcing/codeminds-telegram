import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { CustomUserModel } from '@/models/custom-user';
import { UserModel } from '@/models/user';
import connectDB from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { userIds } = await req.json();
    if (!Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'Invalid user IDs' },
        { status: 400 }
      );
    }

    const result = await CustomUserModel.deleteMany({
      _id: { $in: userIds },
      userId: user._id
    });

    return NextResponse.json({
      success: true,
      message: 'Users deleted successfully',
      deleted: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting users:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 