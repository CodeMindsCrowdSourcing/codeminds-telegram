import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TelegramGroup from '@/models/telegram-group';

type RouteParams = {
  params: Promise<{
    groupId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteParams) {
  await connectDB();
  const { groupId } = await context.params;
  const body = await request.json();

  if (!body.text || !body.delay) {
    return NextResponse.json({ error: 'Text and delay are required' }, { status: 400 });
  }

  const message = {
    text: body.text,
    delay: body.delay,
    enabled: body.enabled ?? true,
    image: body.image || undefined,
    video: body.video || undefined,
    lastSentAt: null,
    buttonText: body.buttonText,
    buttonUrl: body.buttonUrl
  };

  const group = await TelegramGroup.findByIdAndUpdate(
    groupId,
    { $push: { messages: message } },
    { new: true }
  );

  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, group });
} 