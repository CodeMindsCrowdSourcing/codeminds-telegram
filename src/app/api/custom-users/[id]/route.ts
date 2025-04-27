import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import connectDB from '@/lib/mongodb';
import { CustomUserModel } from '@/models/custom-user';
import { UserModel } from '@/models/user';

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = await context.params; // <-- обязательно await здесь!

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
    console.error('Error deleting custom user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
