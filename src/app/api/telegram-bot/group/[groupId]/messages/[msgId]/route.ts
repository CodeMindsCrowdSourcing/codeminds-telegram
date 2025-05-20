import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TelegramGroup from '@/models/telegram-group';

type RouteParams = {
  params: Promise<{
    groupId: string;
    msgId: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteParams) {
  await connectDB();
  const { groupId, msgId } = await context.params;
  const body = await request.json();

  // Обновляем только нужное сообщение по _id
  const setObj: any = {
    'messages.$.text': body.text,
    'messages.$.delay': body.delay,
    'messages.$.enabled': body.enabled
  };
  if (body.image !== undefined) setObj['messages.$.image'] = body.image;
  if (body.video !== undefined) setObj['messages.$.video'] = body.video;
  if (body.buttonText !== undefined) setObj['messages.$.buttonText'] = body.buttonText;
  if (body.buttonUrl !== undefined) setObj['messages.$.buttonUrl'] = body.buttonUrl;

  const group = await TelegramGroup.findOneAndUpdate(
    { _id: groupId, 'messages._id': msgId },
    { $set: setObj },
    { new: true }
  );

  if (!group) {
    return NextResponse.json({ error: 'Group or message not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, group });
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  await connectDB();
  const { groupId, msgId } = await context.params;
  const group = await TelegramGroup.findById(groupId);
  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  }
  group.messages = group.messages.filter((msg: any) => msg._id.toString() !== msgId);
  await group.save();
  return NextResponse.json({ success: true });
} 