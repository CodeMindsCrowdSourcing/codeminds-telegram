import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { TelegramCheckLogModel } from '@/models/telegram-check-log';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's MongoDB _id
    const user = await mongoose.model('User').findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const phone = searchParams.get('phone') || '';
    const isFound = searchParams.get('isFound');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: any = { userId: user._id };

    if (phone) {
      query.$or = [
        { phone: { $regex: phone, $options: 'i' } },
        { cleanPhone: { $regex: phone, $options: 'i' } }
      ];
    }

    if (isFound !== null) {
      query.isFound = isFound === 'true';
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await TelegramCheckLogModel.countDocuments(query);
    const logs = await TelegramCheckLogModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      logs: logs.map(log => ({
        ...log.toObject(),
        _id: log._id.toString(),
        userId: log.userId.toString(),
        createdAt: log.createdAt.toISOString()
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch logs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 