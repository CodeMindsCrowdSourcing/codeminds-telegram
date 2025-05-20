import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import DataCenter from '@/models/DataCenter';
import ping from 'ping';

export async function GET() {
  try {
    await connectDB();
    const datacenters = await DataCenter.find({}).lean();

    // Measure ping for each datacenter
    const pingResults = await Promise.all(
      datacenters.map(async (dc) => {
        try {
          const result = await ping.promise.probe(dc.host || dc.ip, {
            timeout: 2,
            extra: ['-c', '1']
          });

          return {
            ...dc,
            ping: result.alive ? Math.round(Number(result.time)) : null
          };
        } catch (error) {
          console.error(`Error pinging ${dc.city}:`, error);
          return {
            ...dc,
            ping: null
          };
        }
      })
    );

    return NextResponse.json({ datacenters: pingResults });
  } catch (error) {
    console.error('Error in ping route:', error);
    return NextResponse.json(
      { error: 'Failed to measure ping' },
      { status: 500 }
    );
  }
}
