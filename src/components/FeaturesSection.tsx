import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { SignIn, SignUp } from '@clerk/nextjs';
import { useState } from 'react';

interface FeaturesSectionProps {
  scrollProgress: number;
}

export function FeaturesSection({ scrollProgress }: FeaturesSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sign-in' | 'sign-up'>('sign-in');

  const getParallaxStyle = (factor: number) => ({
    transform: `translateY(${scrollProgress * 100 * factor}px)`,
    opacity: Math.min(1, 1.2 + scrollProgress * 0.2),
    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
  });

  return (
    <section className='relative flex h-auto min-h-[90vh] snap-start items-center justify-center bg-zinc-900 md:h-screen'>
      <div
        className='relative z-10 container mx-auto px-2 py-8 sm:px-4 sm:py-16'
        style={getParallaxStyle(-0.5)}
      >
        <h2 className='mb-6 bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-center text-2xl font-bold text-transparent drop-shadow-lg sm:mb-12 sm:text-4xl'>
          Key Features
        </h2>
        <div className='grid grid-cols-1 gap-4 sm:gap-8 md:grid-cols-3'>
          {/* Feature 1: FullStack Development */}
          <div className='group rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-1'>
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
            <h3 className='mb-2 text-center text-xl font-bold transition-colors duration-300 group-hover:text-blue-400'>
              FullStack Development
            </h3>
            <p className='text-center text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
              Building complex systems with modern stacks
            </p>
          </div>

          {/* Feature 2: Secure Hosting */}
          <div className='group rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-1'>
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
            <h3 className='mb-2 text-center text-xl font-bold transition-colors duration-300 group-hover:text-blue-400'>
              Secure Hosting
            </h3>
            <p className='text-center text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
              Your data is safe in a Tier III data center
            </p>
          </div>

          {/* Feature 3: Performance Optimization */}
          <div className='group rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-1'>
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
            <h3 className='mb-2 text-center text-xl font-bold transition-colors duration-300 group-hover:text-blue-400'>
              Performance Optimization
            </h3>
            <p className='text-center text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
              Boosting your systems 2-5x faster
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className='mt-16 text-center'>
          <h2 className='mb-6 text-4xl font-bold'>
            Ready to Transform Your Coding Experience?
          </h2>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                size='lg'
                className='rounded-full bg-blue-600 px-8 py-6 text-xl text-white shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-xl'
              >
                Get Started Now
              </Button>
            </DialogTrigger>
            <DialogContent className='flex w-[95vw] flex-col items-center justify-center bg-zinc-900 sm:max-w-md'>
              <DialogHeader>
                <DialogTitle className='mb-4 text-center text-xl'>
                  {activeTab === 'sign-in' ? 'Sign In' : 'Sign Up'}
                </DialogTitle>
                <DialogDescription className='text-center text-sm text-gray-400'>
                  {activeTab === 'sign-in' 
                    ? 'Sign in to your account to continue'
                    : 'Create a new account to get started'}
                </DialogDescription>
                <div className='mb-6 flex justify-center space-x-4'>
                  <Button
                    variant={activeTab === 'sign-in' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('sign-in')}
                    className='w-24'
                  >
                    Sign In
                  </Button>
                  <Button
                    variant={activeTab === 'sign-up' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('sign-up')}
                    className='w-24'
                  >
                    Sign Up
                  </Button>
                </div>
              </DialogHeader>
              <div>
                {activeTab === 'sign-in' ? (
                  <SignIn
                    routing='hash'
                    appearance={{
                      elements: {
                        formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
                        footerActionLink: 'text-blue-400 hover:text-blue-300'
                      }
                    }}
                  />
                ) : (
                  <SignUp
                    routing='hash'
                    appearance={{
                      elements: {
                        formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
                        footerActionLink: 'text-blue-400 hover:text-blue-300'
                      }
                    }}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Анимированные элементы фона */}
      <div
        className='absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]'
        style={{ opacity: Math.min(1, scrollProgress * 2) }}
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
      </div>
    </section>
  );
} 