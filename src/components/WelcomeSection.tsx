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

interface WelcomeSectionProps {
  scrollProgress: number;
}

export function WelcomeSection({ scrollProgress }: WelcomeSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sign-in' | 'sign-up'>('sign-in');

  const getParallaxStyle = (factor: number) => ({
    transform: `translateY(${scrollProgress * 100 * factor}px)`,
    opacity: Math.min(1, 1.2 + scrollProgress * 0.2),
    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
  });

  return (
    <section className='relative flex min-h-[90vh] snap-start items-center justify-center overflow-hidden bg-gradient-to-b from-zinc-900 to-black md:h-screen'>
      <div
        className='relative z-10 px-2 text-center sm:px-4'
        style={getParallaxStyle(0.5)}
      >
        <h1 className='mb-4 bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent drop-shadow-lg sm:text-5xl'>
          Welcome to CodeMinds
        </h1>
        <p className='mb-8 text-base text-gray-300 sm:text-xl'>
          Your smart assistant for building a successful business.
        </p>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size='lg'
              className='rounded-full bg-blue-600 px-8 py-6 text-xl text-white shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-xl'
            >
              Connect
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

      {/* Анимированный фон */}
      <div
        className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"
        style={{ transform: `scale(${1 + scrollProgress * 0.2})` }}
      />
    </section>
  );
} 