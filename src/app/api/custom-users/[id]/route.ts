import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import connectDB from '@/lib/mongodb';
import { CustomUserModel } from '@/models/custom-user';
import { UserModel } from '@/models/user';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
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

    const customUser = await CustomUserModel.findOne({
      _id: id,
      userId: user._id
    });

    if (!customUser) {
      return NextResponse.json(
        { error: 'Custom user not found' },
        { status: 404 }
      );
    }

    await CustomUserModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
