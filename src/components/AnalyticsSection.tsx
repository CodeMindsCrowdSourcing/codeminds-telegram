interface AnalyticsSectionProps {
  datacenters: any[];
}

export function AnalyticsSection({ datacenters }: AnalyticsSectionProps) {
  return (
    <section className='0 relative flex h-auto min-h-[100vh] snap-start items-center justify-center md:h-screen'>
      <div className='relative z-10 container mx-auto px-2 py-8 sm:px-4 sm:py-16'>
        <h2 className='mb-6 bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-center text-2xl font-bold text-transparent drop-shadow-lg sm:mb-12 sm:text-4xl'>
          Data Center Monitoring
        </h2>
        <div className='rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-2 backdrop-blur-sm sm:p-8'>
          <div className='mb-4 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-8 md:grid-cols-2'>
            {/* Server Load Chart */}
            <div className='group rounded-lg border border-zinc-700/60 bg-zinc-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'>
              <h3 className='mb-4 text-xl font-semibold transition-colors duration-300 group-hover:text-blue-400'>
                Server Load
              </h3>
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
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>24:00</span>
                </div>
              </div>
              <div className='mt-4 grid grid-cols-2 gap-4'>
                <div className='rounded-lg bg-zinc-800/50 p-3 transition-all duration-300 group-hover:bg-zinc-800/70'>
                  <div className='text-sm text-gray-400'>Peak Load</div>
                  <div className='text-2xl font-bold transition-colors duration-300 group-hover:text-blue-400'>
                    78%
                  </div>
                </div>
                <div className='rounded-lg bg-zinc-800/50 p-3 transition-all duration-300 group-hover:bg-zinc-800/70'>
                  <div className='text-sm text-gray-400'>Avg. Response</div>
                  <div className='text-2xl font-bold transition-colors duration-300 group-hover:text-blue-400'>
                    45ms
                  </div>
                </div>
              </div>
            </div>

            {/* Resource Usage */}
            <div className='group rounded-lg border border-zinc-700/60 bg-zinc-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'>
              <h3 className='mb-4 text-xl font-semibold transition-colors duration-300 group-hover:text-blue-400'>
                Resource Usage
              </h3>
              <div className='flex h-64 items-end justify-between gap-2'>
                {[65, 75, 82, 68, 72, 78].map((height, index) => (
                  <div
                    key={index}
                    className='w-12 rounded-t bg-blue-500/50 transition-all duration-300 group-hover:scale-110 hover:bg-blue-500/70'
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className='mt-4 grid grid-cols-2 gap-4'>
                <div className='rounded-lg bg-zinc-800/50 p-3 transition-all duration-300 group-hover:bg-zinc-800/70'>
                  <div className='text-sm text-gray-400'>CPU Usage</div>
                  <div className='text-2xl font-bold transition-colors duration-300 group-hover:text-blue-400'>
                    72%
                  </div>
                </div>
                <div className='rounded-lg bg-zinc-800/50 p-3 transition-all duration-300 group-hover:bg-zinc-800/70'>
                  <div className='text-sm text-gray-400'>Memory</div>
                  <div className='text-2xl font-bold transition-colors duration-300 group-hover:text-blue-400'>
                    4.8GB
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* New Analytics Blocks */}
          <div className='grid grid-cols-1 gap-4 sm:gap-8 md:grid-cols-3'>
            {/* Service Distribution */}
            <div className='group flex flex-col items-center rounded-lg border border-zinc-700/60 bg-zinc-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'>
              <h3 className='mb-4 text-xl font-semibold transition-colors duration-300 group-hover:text-blue-400'>
                Service Distribution
              </h3>
              <svg
                width='120'
                height='120'
                viewBox='0 0 32 32'
                className='transition-transform duration-300 group-hover:scale-110'
              >
                <circle r='16' cx='16' cy='16' fill='#222' />
                {/* Web Hosting: 45% */}
                <circle
                  r='16'
                  cx='16'
                  cy='16'
                  fill='transparent'
                  stroke='#3b82f6'
                  strokeWidth='8'
                  strokeDasharray='28.27 11.73'
                  strokeDashoffset='0'
                />
                {/* VPS: 35% */}
                <circle
                  r='16'
                  cx='16'
                  cy='16'
                  fill='transparent'
                  stroke='#10b981'
                  strokeWidth='8'
                  strokeDasharray='21.98 78.02'
                  strokeDashoffset='-28.27'
                />
                {/* Dedicated: 20% */}
                <circle
                  r='16'
                  cx='16'
                  cy='16'
                  fill='transparent'
                  stroke='#f59e42'
                  strokeWidth='8'
                  strokeDasharray='35.89 84.11'
                  strokeDashoffset='-50.25'
                />
              </svg>
              <div className='mt-4 flex justify-center gap-4 text-xs text-gray-400'>
                <span className='flex items-center transition-colors duration-300 group-hover:text-gray-300'>
                  <span className='mr-1 h-3 w-3 rounded-full bg-blue-500'></span>
                  Web Hosting
                </span>
                <span className='flex items-center transition-colors duration-300 group-hover:text-gray-300'>
                  <span className='mr-1 h-3 w-3 rounded-full bg-green-500'></span>
                  VPS
                </span>
                <span className='flex items-center transition-colors duration-300 group-hover:text-gray-300'>
                  <span className='mr-1 h-3 w-3 rounded-full bg-orange-400'></span>
                  Dedicated
                </span>
              </div>
            </div>

            {/* Data Center Locations */}
            <div className='group flex flex-col rounded-lg border border-zinc-700/60 bg-zinc-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'>
              <h3 className='mb-4 text-center text-xl font-semibold transition-colors duration-300 group-hover:text-blue-400'>
                Data Center Locations
              </h3>
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3'>
                {datacenters.map((dc) => (
                  <div
                    key={dc._id || dc.city}
                    className='group/dc flex flex-col items-center rounded-lg bg-zinc-800/60 p-2 transition-all duration-300 hover:scale-105 hover:bg-zinc-800/80'
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

            {/* System Health */}
            <div className='group flex flex-col gap-4 rounded-lg border border-zinc-700/60 bg-zinc-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'>
              <h3 className='mb-4 text-xl font-semibold transition-colors duration-300 group-hover:text-blue-400'>
                System Health
              </h3>
              <div className='flex flex-col gap-2'>
                <div className='flex justify-between text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                  <span>Uptime</span>
                  <span className='font-bold text-green-400 transition-colors duration-300 group-hover:text-green-300'>
                    99.99%
                  </span>
                </div>
                <div className='flex justify-between text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                  <span>Network Status</span>
                  <span className='font-bold text-green-400 transition-colors duration-300 group-hover:text-green-300'>
                    Optimal
                  </span>
                </div>
                <div className='flex justify-between text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                  <span>Security Status</span>
                  <span className='font-bold text-green-400 transition-colors duration-300 group-hover:text-green-300'>
                    Protected
                  </span>
                </div>
                <div className='flex justify-between text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                  <span>Backup Status</span>
                  <span className='font-bold text-green-400 transition-colors duration-300 group-hover:text-green-300'>
                    Up to date
                  </span>
                </div>
              </div>
              <div className='mt-4 text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-400'>
                Last check: 1 min ago
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
