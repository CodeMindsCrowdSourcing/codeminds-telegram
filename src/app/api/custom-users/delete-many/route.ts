import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CustomUserModel } from '@/models/custom-user';

export async function POST(request: Request) {
  try {
    const { userIds } = await request.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid user IDs provided' },
        { status: 400 }
      );
    }

    await connectDB();
    const result = await CustomUserModel.deleteMany({
      _id: { $in: userIds }
    });

    return NextResponse.json({
      deleted: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting users:', error);
    return NextResponse.json(
      { error: 'Failed to delete users' },
      { status: 500 }
    );
  }
}
