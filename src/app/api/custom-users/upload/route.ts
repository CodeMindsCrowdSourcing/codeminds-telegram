import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { CustomUser } from '@/types/custom-user';

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

    // Process phone numbers
    const users: CustomUser[] = records.map((record: any) => {
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

      // If we get here, the phone number is valid
      return {
        phone,
        isFound: true
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error processing file' },
      { status: 500 }
    );
  }
}
