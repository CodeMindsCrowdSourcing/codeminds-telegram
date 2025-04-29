import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { CustomUser } from '@/types/custom-user';
import { connectDB } from '@/lib/mongodb';
import { CustomUserModel } from '@/models/custom-user';
import { UserModel } from '@/models/user';
import { auth } from "@clerk/nextjs/server";

function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // If number starts with 8, replace it with 7 (for Russian numbers)
  if (cleaned.startsWith('8')) {
    cleaned = '7' + cleaned.slice(1);
  }

  // Add + if not present
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
}

function isValidPhoneNumber(phone: string): boolean {
  // Basic validation for international phone numbers
  // Should start with + and have 10-15 digits
  const phoneRegex = /^\+\d{10,15}$/;
  return phoneRegex.test(phone);
}

export async function POST(request: Request) {
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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Read file content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const content = buffer.toString();

    // Parse CSV
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true
    });

    // Process phone numbers and create users
    const users = records.map((record: any) => {
      const rawPhone = record.phone?.toString().trim();
      if (!rawPhone) {
        return {
          phone: 'Invalid',
          isFound: false,
          error: 'No phone number provided'
        };
      }

      const phone = formatPhoneNumber(rawPhone);

      if (!isValidPhoneNumber(phone)) {
        return {
          phone,
          isFound: false,
          error: 'Invalid phone number format'
        };
      }

      return {
        phone,
        isFound: false,
        userId: user._id
      };
    });

    // Find existing users
    const existingUsers = await CustomUserModel.find({
      userId: user._id,
      phone: { $in: users.map((u: { phone: string }) => u.phone) }
    });

    const existingPhones = new Set(existingUsers.map((u: { phone: string }) => u.phone));
    const newUsers = users.filter((u: { phone: string }) => !existingPhones.has(u.phone));

    // Save only new users
    const savedUsers = await CustomUserModel.insertMany(newUsers, { ordered: false });

    return NextResponse.json({ 
      success: true,
      users: savedUsers.map(user => ({
        _id: user._id.toString(),
        phone: user.phone,
        isFound: user.isFound,
        error: user.error,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      })),
      stats: {
        total: users.length,
        new: savedUsers.length,
        duplicates: existingUsers.length
      }
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Error processing file' },
      { status: 500 }
    );
  }
}
