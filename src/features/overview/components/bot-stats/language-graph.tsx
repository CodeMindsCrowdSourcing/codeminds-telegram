'use client';

import { Pie, PieChart, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LanguageData {
  name: string;
  value: number;
}

interface LanguageGraphProps {
  data: LanguageData[];
}

const COLORS = ['var(--primary)', 'var(--primary-light)', 'var(--primary-lighter)', 'var(--primary-dark)', 'var(--primary-darker)'];

export function LanguageGraph({ data }: LanguageGraphProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Language Distribution</CardTitle>
        <CardDescription>User language preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <PieChart width={400} height={300}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="var(--primary)"
              dataKey="value"
              label={({ name, value }) => `${name} (${((value / total) * 100).toFixed(0)}%)`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, 'Users']} />
            <Legend />
          </PieChart>
        </div>
      </CardContent>
    </Card>
  );
} 