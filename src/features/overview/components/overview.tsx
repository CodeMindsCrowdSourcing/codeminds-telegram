import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IconRobot, IconUsers, IconMessage2, IconClick } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ActivityGraph } from './bot-stats/activity-graph'
import { GrowthGraph } from './bot-stats/growth-graph'
import { ScrollArea } from '@/components/ui/scroll-area'

const mockActivityData = [
  { name: 'Fri', users: 0, interactions: 0 },
  { name: 'Sat', users: 0, interactions: 0 },
  { name: 'Sun', users: 0, interactions: 0 },
  { name: 'Mon', users: 0, interactions: 0 },
  { name: 'Tue', users: 0, interactions: 0 },
  { name: 'Wed', users: 1, interactions: 2 },
  { name: 'Thu', users: 1, interactions: 2 },
]

const mockGrowthData = [
  { name: 'Fri', users: 0 },
  { name: 'Sat', users: 0 },
  { name: 'Sun', users: 0 },
  { name: 'Mon', users: 0 },
  { name: 'Tue', users: 0 },
  { name: 'Wed', users: 1 },
  { name: 'Thu', users: 2 },
]

export function Overview() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Telegram Bot Dashboard 🤖</h2>
        <Button variant="outline" size="sm">
          Export Stats
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
            <IconRobot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">1/1</div>
              <Badge variant="secondary" className="text-xs">All Active</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All bots operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">2</div>
              <Badge variant="secondary" className="text-xs">+1 Premium</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              50.0% premium users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <IconMessage2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">2</div>
              <Badge variant="default" className="text-xs">1.0 per user</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average across all bots
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <IconClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">100.0%</div>
              <Badge variant="secondary" className="text-xs">High</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Button performance
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <div className="col-span-4">
          <ActivityGraph data={mockActivityData} />
        </div>
        <div className="col-span-3">
        <Card>
            <CardHeader>
              <CardTitle>Language Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-[220px] items-center justify-center">
                <div className="relative aspect-square w-full max-w-[200px]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl font-bold">100%</div>
                      <div className="text-xs text-muted-foreground">RU</div>
                    </div>
                  </div>
                  <svg className="h-full w-full -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="10%"
                      strokeDasharray="100 0"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
         
        </div>
        <div className="col-span-4">
          <GrowthGraph data={mockGrowthData} />
        </div>
        <div className="col-span-3">
        <Card>
            <CardHeader>
              <CardTitle>Bot Users</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[220px]">
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Ghost Creator',
                      username: '@rtezianec',
                      language: 'ru',
                      isPremium: false,
                    },
                    {
                      name: 'Dmitriy Shetko',
                      username: '@dm_usha',
                      language: 'ru',
                      isPremium: true,
                    },
                  ].map((user, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                        {user.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{user.name}</div>
                          {user.isPremium && (
                            <Badge variant="secondary" className="text-[10px]">Premium</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.username} • Language: {user.language.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}
