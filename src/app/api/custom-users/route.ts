import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { CustomUserModel } from '@/models/custom-user';
import { UserModel } from '@/models/user';
import connectDB from '@/lib/mongodb';
import { NextRequest } from 'next/server';

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

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    // If action is 'count-unchecked', return only the count
    if (action === 'count-unchecked') {
      const uncheckedCount = await CustomUserModel.countDocuments({
        userId: user._id,
        checked: { $ne: true }
      });
      return NextResponse.json({ count: uncheckedCount });
    }

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Calculate skip value for pagination
    const skip = (page - 1) * pageSize;

    // Get total count for pagination
    const total = await CustomUserModel.countDocuments({ userId: user._id });

    // Get paginated users
    const users = await CustomUserModel.find({ userId: user._id })
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(pageSize);

    return NextResponse.json({
      users: users.map(user => ({
        _id: user._id.toString(),
        phone: user.phone,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isFound: user.isFound,
        error: user.error,
        checked: user.checked,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      })),
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
