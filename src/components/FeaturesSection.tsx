import RotatingText from '@/components/style/RotatingText';
import ScrollVelocity from '@/components/style/ScrollVelocity';
import Magnet from '@/components/style/Magnet';

export function FeaturesSection() {
  return (
    <section className='relative flex h-auto min-h-[90vh] snap-start items-center justify-center md:h-screen'>
      <div className='relative z-10 container mx-auto px-2 py-8 sm:px-4 sm:py-16'>
        <RotatingText
          texts={['Hosting', 'Bots', 'Analytics', 'Security', 'Billing', 'SEO']}
          mainClassName='px-2 sm:px-2 md:px-3 bg-blue-500 text-white overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg'
          staggerFrom={'last'}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-120%' }}
          staggerDuration={0.1}
          splitLevelClassName='overflow-hidden pb-0.5 sm:pb-1 md:pb-1'
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          rotationInterval={5000}
        />
        <div className='grid grid-cols-1 gap-4 sm:gap-8 md:grid-cols-3'>
          {/* Feature 1: FullStack Development */}
          <Magnet padding={50} disabled={false} magnetStrength={50}>
            <div className='group rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'>
              <div className='mb-4 flex justify-center text-blue-500 transition-transform duration-300 group-hover:scale-110'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-12 w-12'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M16 18l6-6-6-6M8 6l-6 6 6 6'
                  />
                </svg>
              </div>
              <div className='text-center text-xl font-bold'>
                <p className='font-light'>FullStack Development</p>
                <p className='pt-5'>
                  Building complex systems with modern stacks
                </p>
              </div>
            </div>
          </Magnet>

          {/* Feature 2: Secure Hosting */}
          <Magnet padding={50} disabled={false} magnetStrength={50}>
            <div className='group rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'>
              <div className='mb-4 flex justify-center text-blue-500 transition-transform duration-300 group-hover:scale-110'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-12 w-12'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4v16m8-8H4'
                  />
                  <circle
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='2'
                    fill='none'
                  />
                </svg>
              </div>
              <div className='text-center text-xl font-bold'>
                <p className='font-light'>Secure Hosting</p>
                <p className='pt-5'>
                  Your data is safe in a Tier III data center
                </p>
              </div>
            </div>
          </Magnet>

          {/* Feature 3: Performance Optimization */}
          <Magnet padding={50} disabled={false} magnetStrength={50}>
            <div className='group rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'>
              <div className='mb-4 flex justify-center text-blue-500 transition-transform duration-300 group-hover:scale-110'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-12 w-12'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 16h-1v-4h-1m4 4h1a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v7a2 2 0 002 2h1'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 20h.01'
                  />
                </svg>
              </div>
              <div className='text-center text-xl font-bold'>
                <p className='font-light'>Performance Optimization</p>
                <p className='pt-5'>Boosting your systems 2-5x faster</p>
              </div>
            </div>
          </Magnet>
        </div>

        {/* CTA Section */}
        <div className='mt-16 flex content-center items-center justify-center text-center'>
          <ScrollVelocity
            texts={['Reliable Infrastructure', 'Powering Your Business 24/7']}
            velocity={50}
            className='custom-scroll-text'
          />
        </div>
      </div>

      {/* Анимированные элементы фона */}
      <div className='absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]'>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
      </div>
    </section>
  );
}
