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

    const { users } = await req.json();
    if (!Array.isArray(users)) {
      return NextResponse.json(
        { error: 'Invalid users data' },
        { status: 400 }
      );
    }

    // Filter out users that are already in the database
    const existingUsers = await CustomUserModel.find({
      userId: user._id,
      phone: { $in: users.map(u => u.phone) }
    });

    const existingPhones = new Set(existingUsers.map(u => u.phone));
    const newUsers = users.filter(u => !existingPhones.has(u.phone));

    if (newUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new users to save',
        saved: 0,
        skipped: existingUsers.length
      });
    }

    // Save new users
    const savedUsers = await CustomUserModel.insertMany(
      newUsers.map(u => ({
        ...u,
        userId: user._id
      }))
    );

    return NextResponse.json({
      success: true,
      message: 'Users saved successfully',
      saved: savedUsers.length,
      skipped: existingUsers.length
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to save users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
