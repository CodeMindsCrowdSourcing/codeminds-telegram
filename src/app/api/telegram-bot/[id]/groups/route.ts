import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TelegramGroup from '@/models/telegram-group';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteParams) {
  await connectDB();
  const { id } = await context.params;
  const groups = await TelegramGroup.find({ botId: id });
  return NextResponse.json(groups);
} 