'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { IconTrendingUp } from '@tabler/icons-react';

interface GrowthData {
  name: string;
  users: number;
}

interface GrowthGraphProps {
  data: GrowthData[];
}

export function GrowthGraph({ data }: GrowthGraphProps) {
  const lastValue = data[data.length - 1]?.users || 0;
  const prevValue = data[data.length - 2]?.users || 0;
  const growthPercent = prevValue
    ? ((lastValue - prevValue) / prevValue) * 100
    : 0;

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Cumulative users over the last 7 days
          </span>
          <span className='@[540px]/card:hidden'>User growth trend</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          className='aspect-auto h-[250px] w-full'
          config={{
            users: {
              label: 'Total Users',
              color: 'var(--primary)'
            }
          }}
        >
          <AreaChart
            width={685}
            height={250}
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id='colorUsers' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--primary)'
                  stopOpacity={0.8}
                />
                <stop offset='95%' stopColor='var(--primary)' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
            <XAxis
              dataKey='name'
              stroke='var(--muted-foreground)'
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke='var(--muted-foreground)'
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
            <Area
              type='monotone'
              dataKey='users'
              stroke='var(--primary)'
              fillOpacity={1}
              fill='url(#colorUsers)'
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <div className='flex w-full items-start gap-2 px-6 pb-6 text-sm'>
        <div className='grid gap-2'>
          <div className='flex items-center gap-2 leading-none font-medium'>
            {growthPercent > 0 ? 'Growing' : 'Declining'} by{' '}
            {Math.abs(growthPercent).toFixed(1)}% this period{' '}
            <IconTrendingUp className='h-4 w-4' />
          </div>
          <div className='text-muted-foreground flex items-center gap-2 leading-none'>
            Last 7 days trend
          </div>
        </div>
      </div>
    </Card>
  );
}
