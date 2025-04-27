import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { CustomUserModel } from '@/models/custom-user';
import { UserModel } from '@/models/user';
import connectDB from '@/lib/mongodb';

let indexesCreated = false;

export async function POST(req: Request) {
  try {
    await connectDB();

    // Recreate indexes if not done yet
    if (!indexesCreated) {
      try {
        await CustomUserModel.collection.dropIndexes();
      } catch (e) {
        console.log('No indexes to drop or error dropping indexes:', e);
      }
      
      // Recreate indexes
      await CustomUserModel.syncIndexes();
      indexesCreated = true;
    }

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

    // Check if phone number already exists for this user
    const existingUser = await CustomUserModel.findOne({
      userId: user._id,
      phone: data.phone
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Phone number already exists' },
        { status: 400 }
      );
    }

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
    console.error('Error adding user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
