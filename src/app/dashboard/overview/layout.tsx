'use client';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
  CardContent
} from '@/components/ui/card';
import { IconTrendingUp, IconRobot, IconUsers, IconMessage2, IconClick, IconCrown } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { TelegramBot } from '@/types/telegram-bot';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActivityGraph } from '@/features/overview/components/bot-stats/activity-graph';
import { GrowthGraph } from '@/features/overview/components/bot-stats/growth-graph';
import { LanguageGraph } from '@/features/overview/components/bot-stats/language-graph';

interface DashboardStats {
  totalBots: number;
  activeBots: number;
  totalUsers: number;
  premiumUsers: number;
  totalInteractions: number;
  clickRate: number;
}

interface TelegramUser {
  _id: string;
  userId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  isPremium?: boolean;
  languageCode?: string;
  clickedAt?: Date;
}

export default function OverViewLayout() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBots: 0,
    activeBots: 0,
    totalUsers: 0,
    premiumUsers: 0,
    totalInteractions: 0,
    clickRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [bots, setBots] = useState<TelegramBot[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string>('');
  const [users, setUsers] = useState<TelegramUser[]>([]);
  const [userActivity, setUserActivity] = useState<{ name: string; users: number; interactions: number }[]>([]);
  const [languageData, setLanguageData] = useState<{ name: string; value: number }[]>([]);
  const [growthData, setGrowthData] = useState<{ name: string; users: number }[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch bots
        const botsResponse = await fetch('/api/telegram-bot');
        if (!botsResponse.ok) {
          console.error('Failed to fetch bots:', botsResponse.statusText);
          return;
        }
        const botsData = await botsResponse.json();
        
        if (!Array.isArray(botsData)) {
          console.error('Invalid bots data format:', botsData);
          return;
        }

        setBots(botsData);

        // Calculate stats
        const totalBots = botsData.length;
        const activeBots = botsData.filter(bot => bot?.isRunning).length;
        
        // Fetch users from all bots
        let totalUsers = 0;
        let premiumUsers = 0;
        let totalInteractions = 0;

        for (const bot of botsData) {
          if (!bot || !bot._id) {
            console.error('Invalid bot data:', bot);
            continue;
          }

          try {
            const usersResponse = await fetch(`/api/telegram-bot/${bot._id}/users`);
            if (!usersResponse.ok) {
              console.error(`Failed to fetch users for bot ${bot._id}:`, usersResponse.statusText);
              continue;
            }
            const usersData = await usersResponse.json();
            
            if (Array.isArray(usersData)) {
              totalUsers += usersData.length;
              premiumUsers += usersData.filter(user => user?.isPremium).length;
              totalInteractions += usersData.length;
            }
          } catch (error) {
            console.error(`Error fetching users for bot ${bot._id}:`, error);
          }
        }

        // Set first bot as selected if none selected
        if (!selectedBotId && botsData.length > 0) {
          setSelectedBotId(botsData[0]._id);
        }

        const clickRate = totalUsers > 0 ? (totalInteractions / totalUsers) * 100 : 0;

        setStats({
          totalBots,
          activeBots,
          totalUsers,
          premiumUsers,
          totalInteractions,
          clickRate
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [selectedBotId]);

  // Fetch users when bot selection changes
  useEffect(() => {
    const fetchUsers = async () => {
      if (!selectedBotId) return;

      try {
        const response = await fetch(`/api/telegram-bot/${selectedBotId}/users`);
        if (!response.ok) {
          console.error('Failed to fetch users');
          return;
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setUsers(data);

          // Подготовка данных для графиков
          // 1. Активность пользователей по дням
          const activityData = [];
          const today = new Date();
          for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            // Считаем пользователей и взаимодействия за этот день
            const dayUsers = data.filter(user => {
              const clickDate = user.clickedAt ? new Date(user.clickedAt) : null;
              return clickDate && 
                clickDate.getDate() === date.getDate() &&
                clickDate.getMonth() === date.getMonth() &&
                clickDate.getFullYear() === date.getFullYear();
            });

            activityData.push({
              name: dateStr,
              users: dayUsers.length,
              interactions: dayUsers.length * 2 // Примерное количество взаимодействий
            });
          }
          setUserActivity(activityData);

          // 2. Статистика по языкам
          const languages = data.reduce((acc: { [key: string]: number }, user) => {
            const lang = user.languageCode || 'unknown';
            acc[lang] = (acc[lang] || 0) + 1;
            return acc;
          }, {});

          setLanguageData(
            Object.entries(languages).map(([name, value]) => ({
              name: name.toUpperCase(),
              value
            }))
          );

          // 3. Рост пользователей (кумулятивный)
          let cumulative = 0;
          const growth = activityData.map(day => ({
            name: day.name,
            users: cumulative += day.users
          }));
          setGrowthData(growth);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [selectedBotId]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Telegram Bot Dashboard 🤖
          </h2>
          <Select value={selectedBotId} onValueChange={setSelectedBotId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a bot" />
            </SelectTrigger>
            <SelectContent>
              {bots.map((bot) => (
                <SelectItem key={bot._id} value={bot._id}>
                  {bot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Bots Status</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {stats.activeBots}/{stats.totalBots}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconRobot className="mr-1" />
                  Active
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Bot Management <IconRobot className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                {stats.activeBots} bots running
              </div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Users</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {stats.totalUsers}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconCrown className="mr-1" />
                  {stats.premiumUsers} Premium
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                User Statistics <IconUsers className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                {((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}% premium users
              </div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Interactions</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {stats.totalInteractions}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconMessage2 className="mr-1" />
                  Messages
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Engagement Stats <IconMessage2 className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                {(stats.totalInteractions / stats.totalUsers).toFixed(1)} per user
              </div>
            </CardFooter>
          </Card>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Click Rate</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {stats.clickRate.toFixed(1)}%
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconClick className="mr-1" />
                  Clicks
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Button Performance <IconClick className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                Average across all bots
              </div>
            </CardFooter>
          </Card>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>
            <ActivityGraph data={userActivity} />
          </div>
          <Card className='col-span-4 md:col-span-3'>
            <CardHeader>
              <CardTitle>Bot Users</CardTitle>
              <CardDescription>
                {users.length} users in selected bot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {users.map((user) => (
                  <div key={user._id} className="flex items-center space-x-4 mb-4">
                    <Avatar>
                      <AvatarFallback>
                        {user.firstName?.[0] || user.username?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName} {user.lastName}
                        {user.username && <span className="text-muted-foreground ml-2">@{user.username}</span>}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.languageCode && `Language: ${user.languageCode}`}
                        {user.isPremium && (
                          <Badge variant="secondary" className="ml-2">
                            <IconCrown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
          <div className='col-span-4'>
            <GrowthGraph data={growthData} />
          </div>
          <div className='col-span-4 md:col-span-3'>
            <LanguageGraph data={languageData} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
