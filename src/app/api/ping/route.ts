import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import DataCenter from '@/models/DataCenter';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function measureLatency(host: string): Promise<number | null> {
  try {
    // Use system ping command
    const { stdout } = await execAsync(`ping -n 1 -w 5000 ${host}`);
    
    // Parse the output to get the time
    const timeMatch = stdout.match(/время=(\d+)мс/);
    if (timeMatch && timeMatch[1]) {
      return parseInt(timeMatch[1], 10);
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

export async function GET() {
  try {
    await connectDB();
    const datacenters = await DataCenter.find({}).lean();

    const pingResults = await Promise.all(
      datacenters.map(async (dc) => {
        try {
          // Use IP address for ping
          if (!dc.ip) {
            return {
              ...dc,
              ping: null
            };
          }

          const latency = await measureLatency(dc.ip);
          
          return {
            ...dc,
            ping: latency
          };
        } catch (error) {
          return {
            ...dc,
            ping: null
          };
        }
      })
    );

    return NextResponse.json({ datacenters: pingResults });
  } catch (error) {
    console.error('Failed to measure latency:', error);
    return NextResponse.json(
      { error: 'Failed to measure latency' },
      { status: 500 }
    );
  }
}
