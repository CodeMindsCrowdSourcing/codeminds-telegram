export function ServicesSection() {
  return (
    <section className='relative flex h-auto min-h-[90vh] snap-start items-center justify-center md:h-[80vh]'>
      <div className='relative z-10 container mx-auto px-1 py-4 sm:px-2 sm:py-8'>
        <h2 className='mb-4 bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-center text-2xl font-bold text-transparent drop-shadow-lg sm:mb-8 sm:text-4xl'>
          Development Services
        </h2>
        <div className='rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-2 backdrop-blur-sm sm:p-4'>
          <div className='mb-2 flex items-center gap-2'>
            <div className='h-2 w-2 rounded-full bg-red-500' />
            <div className='h-2 w-2 rounded-full bg-yellow-500' />
            <div className='h-2 w-2 rounded-full bg-green-500' />
          </div>
          <div className='mb-4 rounded-lg bg-zinc-900/50 p-2 font-mono text-xs sm:p-3'>
            {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
            <div className='text-gray-400'>// Development Services</div>
            <div className='text-blue-400'>class</div>{' '}
            <span className='text-yellow-400'>Dev</span>{' '}
            <span className='text-gray-400'>{'{'}</span>
            {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
            <div className='pl-2 text-purple-400'>
              // Apps, Bots, Analytics, Automation
            </div>
            <div className='pl-2 text-gray-400'>
              languages = [
              <span className='text-orange-400'>
                &#39;PHP&#39;, &#39;Java&#39;, &#39;React&#39;,
                &#39;Node.js&#39;, &#39;Next.js&#39;
              </span>
              ]
            </div>
            <div className='pl-2 text-blue-400'>build()</div>{' '}
            <span className='text-gray-400'>{'{'}</span>{' '}
            <span className='text-green-400'>return</span>{' '}
            <span className='text-gray-400'>&#39;Solutions</span>{' '}
            <span className='text-gray-400'>{'}'}</span>
            <span className='text-gray-400'>{'}'}</span>
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
            {/* Web Development */}
            <div className='group flex flex-col items-center rounded-lg border border-zinc-700/60 bg-zinc-900/50 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'>
              <div className='mb-2 text-blue-400 transition-transform duration-300 group-hover:scale-110'>
                <svg
                  className='h-8 w-8'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M16 18l6-6-6-6M8 6l-6 6 6 6'
                  />
                </svg>
              </div>
              <div className='mb-1 text-base font-bold transition-colors duration-300 group-hover:text-blue-400'>
                Web Development
              </div>
              <div className='text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                Corporate websites, CRM, ERP
              </div>
            </div>
            {/* Hosting & Server Support */}
            <div className='group flex flex-col items-center rounded-lg border border-zinc-700/60 bg-zinc-900/50 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'>
              <div className='mb-2 text-green-400 transition-transform duration-300 group-hover:scale-110'>
                <svg
                  className='h-8 w-8'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <div className='mb-1 text-base font-bold transition-colors duration-300 group-hover:text-green-400'>
                Hosting & Server Support
              </div>
              <div className='text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                24/7 monitoring and maintenance
              </div>
            </div>
            {/* Cloud Migration */}
            <div className='group flex flex-col items-center rounded-lg border border-zinc-700/60 bg-zinc-900/50 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'>
              <div className='mb-2 text-purple-400 transition-transform duration-300 group-hover:scale-110'>
                <svg
                  className='h-8 w-8'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M3 15a4 4 0 004 4h10a4 4 0 100-8 5.5 5.5 0 00-10.9 1.5'
                  />
                </svg>
              </div>
              <div className='mb-1 text-base font-bold transition-colors duration-300 group-hover:text-purple-400'>
                Cloud Migration
              </div>
              <div className='text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                Private & Public Cloud solutions
              </div>
            </div>
            {/* Infrastructure Optimization */}
            <div className='group flex flex-col items-center rounded-lg border border-zinc-700/60 bg-zinc-900/50 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'>
              <div className='mb-2 text-yellow-400 transition-transform duration-300 group-hover:scale-110'>
                <svg
                  className='h-8 w-8'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M13 16h-1v-4h-1m4 4h1a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v7a2 2 0 002 2h1'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M12 20h.01'
                  />
                </svg>
              </div>
              <div className='mb-1 text-base font-bold transition-colors duration-300 group-hover:text-yellow-400'>
                Infrastructure Optimization
              </div>
              <div className='text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                Own data center, performance tuning
              </div>
            </div>
            {/* IT Consulting */}
            <div className='group flex flex-col items-center rounded-lg border border-zinc-700/60 bg-zinc-900/50 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'>
              <div className='mb-2 text-pink-400 transition-transform duration-300 group-hover:scale-110'>
                <svg
                  className='h-8 w-8'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
                  />
                </svg>
              </div>
              <div className='mb-1 text-base font-bold transition-colors duration-300 group-hover:text-pink-400'>
                IT Consulting
              </div>
              <div className='text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                Tech strategy & digital transformation
              </div>
            </div>
            {/* Automation & Integrations */}
            <div className='group flex flex-col items-center rounded-lg border border-zinc-700/60 bg-zinc-900/50 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'>
              <div className='mb-2 text-cyan-400 transition-transform duration-300 group-hover:scale-110'>
                <svg
                  className='h-8 w-8'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <div className='mb-1 text-base font-bold transition-colors duration-300 group-hover:text-cyan-400'>
                Automation & Integrations
              </div>
              <div className='text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                Business process automation, API integrations
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
