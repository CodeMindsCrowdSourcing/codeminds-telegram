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
import SplitText from '@/components/style/SplitText';
import BlurText from '@/components/style/BlurText';
import ShinyText from '@/components/style/ShinyText';
import GlitchText from '@/components/style/GlitchText';
import StarBorder from '@/components/style/StarBorder';

export function WelcomeSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sign-in' | 'sign-up'>('sign-in');

  return (
    <section className='relative flex min-h-[90vh] snap-start items-center justify-center overflow-hidden md:h-screen'>
      <div className='relative z-10 px-2 text-center sm:px-4'>
        <SplitText
          text='Welcome to'
          className='text-center text-2xl font-semibold'
          delay={100}
          duration={0.6}
          ease='power3.out'
          splitType='chars'
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin='-100px'
          textAlign='center'
        />
        <GlitchText
          speed={2}
          enableShadows={true}
          enableOnHover={true}
          className='custom-class'
        >
          CodeMinds
        </GlitchText>
        <BlurText
          text='Built for performance. Ready for anything.'
          delay={150}
          animateBy='words'
          direction='top'
          className='mb-8 text-2xl'
        />

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <StarBorder as='button' color='cyan' speed='5s'>
              <ShinyText text='Connect' disabled={false} speed={3} />
            </StarBorder>
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
      {/*Анимированный фон*/}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
    </section>
  );
}
