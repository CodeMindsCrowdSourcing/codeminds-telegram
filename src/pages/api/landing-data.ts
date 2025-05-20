import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb';
import DataCenter from '@/models/DataCenter';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectDB();
    const datacenters = await DataCenter.find({}).lean();
    res.status(200).json({ datacenters });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
