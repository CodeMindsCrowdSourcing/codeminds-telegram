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

    const data = await req.json();
    const newUser = new CustomUserModel({
      ...data,
      userId: user._id
    });

    await newUser.save();

    return NextResponse.json({
      success: true,
      user: {
        _id: newUser._id.toString(),
        phone: newUser.phone,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isFound: newUser.isFound,
        error: newUser.error,
        createdAt: newUser.createdAt.toISOString(),
        updatedAt: newUser.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error adding custom user:', error);
    return NextResponse.json(
      { error: 'Failed to add user' },
      { status: 500 }
    );
  }
}
