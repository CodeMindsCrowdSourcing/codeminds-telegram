export function ServicesSection() {
  return (
    <section className='relative flex h-auto min-h-[90vh] snap-start items-center justify-center md:h-[80vh]'>
      <div className='relative z-10 container mx-auto px-1 py-4 sm:px-2 sm:py-8'>
        <h2 className='mb-4 bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-center text-2xl font-bold text-transparent drop-shadow-lg sm:mb-8 sm:text-4xl'>
          Enterprise Infrastructure
        </h2>
        <div className='rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-2 backdrop-blur-sm sm:p-4'>
          <div className='mb-2 flex items-center gap-2'>
            <div className='h-2 w-2 rounded-full bg-red-500' />
            <div className='h-2 w-2 rounded-full bg-yellow-500' />
            <div className='h-2 w-2 rounded-full bg-green-500' />
          </div>
          <div className='mb-4 rounded-lg bg-zinc-900/50 p-2 font-mono text-xs sm:p-3'>
            {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
            <div className='text-gray-400'>// Enterprise Infrastructure</div>
            <div className='text-blue-400'>class</div>{' '}
            <span className='text-yellow-400'>DataCenter</span>{' '}
            <span className='text-gray-400'>{'{'}</span>
            {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
            <div className='pl-2 text-purple-400'>
              // Tier III, Redundancy, Security
            </div>
            <div className='pl-2 text-gray-400'>
              features = [
              <span className='text-orange-400'>
                &#39;99.9% Uptime&#39;, &#39;DDoS Protection&#39;,
                &#39;24/7 Monitoring&#39;, &#39;Auto Scaling&#39;
              </span>
              ]
            </div>
            <div className='pl-2 text-blue-400'>deploy()</div>{' '}
            <span className='text-gray-400'>{'{'}</span>{' '}
            <span className='text-green-400'>return</span>{' '}
            <span className='text-gray-400'>&#39;Enterprise Grade&#39;</span>{' '}
            <span className='text-gray-400'>{'}'}</span>
            <span className='text-gray-400'>{'}'}</span>
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
            {/* Dedicated Servers */}
            <div className='group flex flex-col items-center rounded-lg border border-zinc-700/60 bg-zinc-900/50 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'>
              <div className='mb-2 text-blue-400 transition-transform duration-300 group-hover:scale-110'>
                <svg className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01' />
                </svg>
              </div>
              <div className='mb-1 text-base font-bold transition-colors duration-300 group-hover:text-blue-400'>
                Dedicated Servers
              </div>
              <div className='text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                High-performance hardware, full control
              </div>
            </div>

            {/* Cloud Solutions */}
            <div className='group flex flex-col items-center rounded-lg border border-zinc-700/60 bg-zinc-900/50 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'>
              <div className='mb-2 text-green-400 transition-transform duration-300 group-hover:scale-110'>
                <svg className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 15a4 4 0 004 4h10a4 4 0 100-8 5.5 5.5 0 00-10.9 1.5' />
                </svg>
              </div>
              <div className='mb-1 text-base font-bold transition-colors duration-300 group-hover:text-green-400'>
                Cloud Solutions
              </div>
              <div className='text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                Flexible scaling, pay-as-you-go
              </div>
            </div>

            {/* DDoS Protection */}
            <div className='group flex flex-col items-center rounded-lg border border-zinc-700/60 bg-zinc-900/50 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'>
              <div className='mb-2 text-purple-400 transition-transform duration-300 group-hover:scale-110'>
                <svg className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                </svg>
              </div>
              <div className='mb-1 text-base font-bold transition-colors duration-300 group-hover:text-purple-400'>
                DDoS Protection
              </div>
              <div className='text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                Advanced threat mitigation
              </div>
            </div>

            {/* 24/7 Support */}
            <div className='group flex flex-col items-center rounded-lg border border-zinc-700/60 bg-zinc-900/50 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'>
              <div className='mb-2 text-yellow-400 transition-transform duration-300 group-hover:scale-110'>
                <svg className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <div className='mb-1 text-base font-bold transition-colors duration-300 group-hover:text-yellow-400'>
                24/7 Support
              </div>
              <div className='text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                Expert team, instant response
              </div>
            </div>

            {/* Data Backup */}
            <div className='group flex flex-col items-center rounded-lg border border-zinc-700/60 bg-zinc-900/50 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'>
              <div className='mb-2 text-pink-400 transition-transform duration-300 group-hover:scale-110'>
                <svg className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2' />
                </svg>
              </div>
              <div className='mb-1 text-base font-bold transition-colors duration-300 group-hover:text-pink-400'>
                Data Backup
              </div>
              <div className='text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                Automated, redundant storage
              </div>
            </div>

            {/* Network Solutions */}
            <div className='group flex flex-col items-center rounded-lg border border-zinc-700/60 bg-zinc-900/50 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'>
              <div className='mb-2 text-cyan-400 transition-transform duration-300 group-hover:scale-110'>
                <svg className='h-8 w-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
                </svg>
              </div>
              <div className='mb-1 text-base font-bold transition-colors duration-300 group-hover:text-cyan-400'>
                Network Solutions
              </div>
              <div className='text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                Global CDN, load balancing
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
