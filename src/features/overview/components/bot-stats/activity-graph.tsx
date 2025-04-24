'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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

interface ActivityData {
  name: string;
  users: number;
  interactions: number;
}

interface ActivityGraphProps {
  data: ActivityData[];
}

export function ActivityGraph({ data }: ActivityGraphProps) {
  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>User Activity</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Daily users and interactions for the last 7 days
          </span>
          <span className='@[540px]/card:hidden'>Last 7 days activity</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          className='aspect-auto h-[250px] w-full'
          config={{
            users: { label: 'Users', color: 'var(--primary)' },
            interactions: {
              label: 'Interactions',
              color: 'var(--primary-light)'
            }
          }}
        >
          <BarChart
            width={685}
            height={250}
            data={data}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis
              dataKey='name'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey='users'
              fill='var(--primary)'
              radius={[4, 4, 0, 0]}
              name='Users'
            />
            <Bar
              dataKey='interactions'
              fill='var(--primary-light)'
              radius={[4, 4, 0, 0]}
              name='Interactions'
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
