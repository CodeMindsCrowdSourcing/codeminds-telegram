interface AnalyticsSectionProps {
  scrollProgress: number;
  datacenters: any[];
}

export function AnalyticsSection({ scrollProgress, datacenters }: AnalyticsSectionProps) {
  const getParallaxStyle = (factor: number) => ({
    transform: `translateY(${scrollProgress * 100 * factor}px)`,
    opacity: Math.min(1, 1.2 + scrollProgress * 0.2),
    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
  });

  return (
    <section className='relative flex h-auto min-h-[100vh] snap-start items-center justify-center bg-zinc-900 md:h-screen'>
      <div
        className='relative z-10 container mx-auto px-2 py-8 sm:px-4 sm:py-16'
        style={getParallaxStyle(-0.5)}
      >
        <h2 className='mb-6 bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-center text-2xl font-bold text-transparent drop-shadow-lg sm:mb-12 sm:text-4xl'>
          Analytics Dashboard
        </h2>
        <div className='rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-2 backdrop-blur-sm sm:p-8'>
          <div className='mb-4 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-8 md:grid-cols-2'>
            {/* Line Chart */}
            <div className='group rounded-lg bg-zinc-900/50 p-6 border border-zinc-700/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-1'>
              <h3 className='mb-4 text-xl font-semibold transition-colors duration-300 group-hover:text-blue-400'>Code Activity</h3>
              <div className='relative h-64'>
                <svg className='h-full w-full' viewBox='0 0 400 200'>
                  <path
                    d='M0,150 Q50,100 100,120 T200,80 T300,100 T400,50'
                    fill='none'
                    stroke='url(#gradient)'
                    strokeWidth='3'
                    className='animate-draw transition-all duration-300 group-hover:stroke-[4]'
                  />
                  <defs>
                    <linearGradient
                      id='gradient'
                      x1='0%'
                      y1='0%'
                      x2='100%'
                      y2='0%'
                    >
                      <stop offset='0%' stopColor='#3b82f6' />
                      <stop offset='100%' stopColor='#60a5fa' />
                    </linearGradient>
                  </defs>
                </svg>
                <div className='absolute right-0 bottom-0 left-0 flex justify-between text-xs text-gray-400'>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
              <div className='mt-4 grid grid-cols-2 gap-4'>
                <div className='rounded-lg bg-zinc-800/50 p-3 transition-all duration-300 group-hover:bg-zinc-800/70'>
                  <div className='text-sm text-gray-400'>Total Commits</div>
                  <div className='text-2xl font-bold transition-colors duration-300 group-hover:text-blue-400'>1,234</div>
                </div>
                <div className='rounded-lg bg-zinc-800/50 p-3 transition-all duration-300 group-hover:bg-zinc-800/70'>
                  <div className='text-sm text-gray-400'>Active Hours</div>
                  <div className='text-2xl font-bold transition-colors duration-300 group-hover:text-blue-400'>42.5h</div>
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className='group rounded-lg bg-zinc-900/50 p-6 border border-zinc-700/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-1'>
              <h3 className='mb-4 text-xl font-semibold transition-colors duration-300 group-hover:text-blue-400'>
                Performance Metrics
              </h3>
              <div className='flex h-64 items-end justify-between gap-2'>
                {[40, 60, 80, 45, 70, 90].map((height, index) => (
                  <div
                    key={index}
                    className='w-12 rounded-t bg-blue-500/50 transition-all duration-300 hover:bg-blue-500/70 group-hover:scale-110'
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className='mt-4 grid grid-cols-2 gap-4'>
                <div className='rounded-lg bg-zinc-800/50 p-3 transition-all duration-300 group-hover:bg-zinc-800/70'>
                  <div className='text-sm text-gray-400'>CPU Usage</div>
                  <div className='text-2xl font-bold transition-colors duration-300 group-hover:text-blue-400'>32%</div>
                </div>
                <div className='rounded-lg bg-zinc-800/50 p-3 transition-all duration-300 group-hover:bg-zinc-800/70'>
                  <div className='text-sm text-gray-400'>Memory</div>
                  <div className='text-2xl font-bold transition-colors duration-300 group-hover:text-blue-400'>1.2GB</div>
                </div>
              </div>
            </div>
          </div>

          {/* New Analytics Blocks */}
          <div className='grid grid-cols-1 gap-4 sm:gap-8 md:grid-cols-3'>
            {/* Pie Chart */}
            <div className='group flex flex-col items-center rounded-lg bg-zinc-900/50 p-6 border border-zinc-700/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-1'>
              <h3 className='mb-4 text-xl font-semibold transition-colors duration-300 group-hover:text-blue-400'>
                Task Distribution
              </h3>
              <svg width='120' height='120' viewBox='0 0 32 32' className='transition-transform duration-300 group-hover:scale-110'>
                <circle r='16' cx='16' cy='16' fill='#222' />
                {/* Web: 40% */}
                <circle
                  r='16'
                  cx='16'
                  cy='16'
                  fill='transparent'
                  stroke='#3b82f6'
                  strokeWidth='8'
                  strokeDasharray='25.13 14.87'
                  strokeDashoffset='0'
                />
                {/* Bots: 35% */}
                <circle
                  r='16'
                  cx='16'
                  cy='16'
                  fill='transparent'
                  stroke='#10b981'
                  strokeWidth='8'
                  strokeDasharray='21.98 78.02'
                  strokeDashoffset='-25.13'
                />
                {/* Analytics: 25% */}
                <circle
                  r='16'
                  cx='16'
                  cy='16'
                  fill='transparent'
                  stroke='#f59e42'
                  strokeWidth='8'
                  strokeDasharray='35.89 84.11'
                  strokeDashoffset='-47.11'
                />
              </svg>
              <div className='mt-4 flex justify-center gap-4 text-xs text-gray-400'>
                <span className='flex items-center transition-colors duration-300 group-hover:text-gray-300'>
                  <span className='mr-1 h-3 w-3 rounded-full bg-blue-500'></span>
                  Web
                </span>
                <span className='flex items-center transition-colors duration-300 group-hover:text-gray-300'>
                  <span className='mr-1 h-3 w-3 rounded-full bg-green-500'></span>
                  Bots
                </span>
                <span className='flex items-center transition-colors duration-300 group-hover:text-gray-300'>
                  <span className='mr-1 h-3 w-3 rounded-full bg-orange-400'></span>
                  Analytics
                </span>
              </div>
            </div>

            {/* Data Center Locations */}
            <div className='group flex flex-col rounded-lg bg-zinc-900/50 p-6 border border-zinc-700/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-1'>
              <h3 className='mb-4 text-center text-xl font-semibold transition-colors duration-300 group-hover:text-blue-400'>
                Data Center Locations
              </h3>
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3'>
                {datacenters.map((dc) => (
                  <div
                    key={dc._id || dc.city}
                    className='group/dc flex flex-col items-center rounded-lg bg-zinc-800/60 p-2 transition-all duration-300 hover:bg-zinc-800/80 hover:scale-105'
                  >
                    <svg
                      className={`mb-1 h-6 w-6 transition-transform duration-300 group-hover/dc:scale-110 ${dc.color || 'text-blue-400'}`}
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <rect
                        x='4'
                        y='4'
                        width='16'
                        height='16'
                        rx='3'
                        strokeWidth='2'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M8 8h8M8 12h8M8 16h4'
                      />
                    </svg>
                    <div className='text-xs font-semibold text-gray-200 transition-colors duration-300 group-hover/dc:text-blue-400'>
                      {dc.city}
                    </div>
                    <div className='text-[10px] text-gray-400 transition-colors duration-300 group-hover/dc:text-gray-300'>
                      {dc.country ? dc.country : ''}
                    </div>
                    {dc.ping !== null && (
                      <div
                        className={`mt-1 text-[10px] transition-colors duration-300 ${
                          dc.ping < 50
                            ? 'text-green-400'
                            : dc.ping < 100
                              ? 'text-yellow-400'
                              : 'text-red-400'
                        }`}
                      >
                        {dc.ping}ms
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Numeric Analytics Cards */}
            <div className='group flex flex-col gap-4 rounded-lg bg-zinc-900/50 p-6 border border-zinc-700/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-1'>
              <h3 className='mb-4 text-xl font-semibold transition-colors duration-300 group-hover:text-blue-400'>Quick Stats</h3>
              <div className='flex flex-col gap-2'>
                <div className='flex justify-between text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                  <span>Active Users</span>
                  <span className='font-bold text-blue-400 transition-colors duration-300 group-hover:text-blue-300'>1,024</span>
                </div>
                <div className='flex justify-between text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                  <span>Deploys</span>
                  <span className='font-bold text-green-400 transition-colors duration-300 group-hover:text-green-300'>12</span>
                </div>
                <div className='flex justify-between text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                  <span>Errors</span>
                  <span className='font-bold text-red-400 transition-colors duration-300 group-hover:text-red-300'>2</span>
                </div>
                <div className='flex justify-between text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                  <span>Avg. Response</span>
                  <span className='font-bold text-yellow-400 transition-colors duration-300 group-hover:text-yellow-300'>120ms</span>
                </div>
              </div>
              <div className='mt-4 text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-400'>
                Last update: 2 min ago
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 