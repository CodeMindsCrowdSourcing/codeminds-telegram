'use client';

import { SignIn, SignUp } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sign-in' | 'sign-up'>('sign-in');
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('welcome');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [datacenters, setDatacenters] = useState<any[]>([]);

  // Section refs for scrollspy
  const sectionRefs = {
    welcome: useRef<HTMLDivElement>(null),
    features: useRef<HTMLDivElement>(null),
    analytics: useRef<HTMLDivElement>(null),
    services: useRef<HTMLDivElement>(null),
    pricing: useRef<HTMLDivElement>(null)
  };

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const progress = scrollTop / (scrollHeight - clientHeight);
        setScrollProgress(progress);

        // Scrollspy logic
        const offsets = Object.entries(sectionRefs).map(([key, ref]) => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            return { key, top: rect.top };
          }
          return { key, top: Infinity };
        });
        const visible = offsets.filter(
          (o) =>
            o.top < window.innerHeight / 2 && o.top > -window.innerHeight / 2
        );
        if (visible.length > 0) {
          setActiveSection(visible[0].key);
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Separate useEffect for fetching datacenters with ping
  useEffect(() => {
    const fetchDatacenters = async () => {
      try {
        const response = await fetch('/api/ping');
        const data = await response.json();
        setDatacenters(data.datacenters || []);
      } catch (error) {
        console.error('Error fetching datacenters:', error);
      }
    };

    fetchDatacenters();
    // Refresh ping every 30 seconds
    const interval = setInterval(fetchDatacenters, 30000);
    return () => clearInterval(interval);
  }, []);

  // Параллакс-эффект для элементов
  const getParallaxStyle = (factor: number) => ({
    transform: `translateY(${scrollProgress * 100 * factor}px)`,
    opacity: Math.min(1, 1.2 + scrollProgress * 0.2),
    transition:
      'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
  });

  // Scroll to section
  const scrollToSection = (key: keyof typeof sectionRefs) => {
    sectionRefs[key].current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    setMobileNavOpen(false); // close mobile nav on click
  };

  return (
    <div
      ref={containerRef}
      className='h-screen snap-y snap-mandatory overflow-y-scroll scroll-smooth'
      style={{
        scrollBehavior: 'smooth',
        scrollSnapType: 'y mandatory',
        scrollSnapStop: 'always',
        scrollPadding: '0',
        scrollSnapPointsY: 'repeat(100vh)'
      }}
    >
      {/* Floating Navigation */}
      {/* Desktop floating nav */}
      <nav className='fixed top-1/2 left-6 z-50 hidden -translate-y-1/2 flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-xl md:flex'>
        {[
          { key: 'welcome', label: 'Welcome' },
          { key: 'features', label: 'Features' },
          { key: 'analytics', label: 'Analytics' },
          { key: 'services', label: 'Services' },
          { key: 'pricing', label: 'Pricing' }
        ].map((item) => (
          <button
            key={item.key}
            onClick={() =>
              scrollToSection(item.key as keyof typeof sectionRefs)
            }
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${activeSection === item.key ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-zinc-800'}`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      {/* Mobile hamburger nav */}
      <button
        className='fixed top-4 left-4 z-50 rounded-lg border border-zinc-800 bg-zinc-900/90 p-2 shadow-lg md:hidden'
        onClick={() => setMobileNavOpen(true)}
        aria-label='Open navigation menu'
      >
        <svg
          width='28'
          height='28'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          className='text-gray-200'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M4 6h16M4 12h16M4 18h16'
          />
        </svg>
      </button>
      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className='fixed inset-0 z-50 flex md:hidden'>
          {/* Overlay */}
          <div
            className='absolute inset-0 bg-black/60 backdrop-blur-sm'
            onClick={() => setMobileNavOpen(false)}
          />
          {/* Drawer */}
          <div className='animate-slide-in-left relative flex h-full w-64 flex-col gap-2 border-r border-zinc-800 bg-zinc-900 p-6 shadow-2xl'>
            <button
              className='absolute top-4 right-4 text-gray-400 hover:text-white'
              onClick={() => setMobileNavOpen(false)}
              aria-label='Close navigation menu'
            >
              <svg
                width='24'
                height='24'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
            <div className='mt-8 flex flex-col gap-2'>
              {[
                { key: 'welcome', label: 'Welcome' },
                { key: 'features', label: 'Features' },
                { key: 'analytics', label: 'Analytics' },
                { key: 'services', label: 'Services' },
                { key: 'pricing', label: 'Pricing' }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() =>
                    scrollToSection(item.key as keyof typeof sectionRefs)
                  }
                  className={`w-full rounded-lg px-4 py-3 text-left text-base font-semibold transition-all duration-200 ${activeSection === item.key ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-zinc-800'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Верхний блок (Hero Section) */}
      <section
        ref={sectionRefs.welcome}
        className='relative flex min-h-[90vh] snap-start items-center justify-center overflow-hidden bg-gradient-to-b from-zinc-900 to-black md:h-screen'
      >
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

      {/* Нижний блок (Information Section) */}
      <section
        ref={sectionRefs.features}
        className='relative flex h-auto min-h-[90vh] snap-start items-center justify-center bg-zinc-900 md:h-screen'
      >
        <div
          className='relative z-10 container mx-auto px-2 py-8 sm:px-4 sm:py-16'
          style={getParallaxStyle(-0.5)}
        >
          <h2 className='mb-6 bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-center text-2xl font-bold text-transparent drop-shadow-lg sm:mb-12 sm:text-4xl'>
            Key Features
          </h2>
          <div className='grid grid-cols-1 gap-4 sm:gap-8 md:grid-cols-3'>
            {/* Feature 1: FullStack Development */}
            <div className='rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50'>
              <div className='mb-4 flex justify-center text-blue-500'>
                {/* Code/Stack Icon */}
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
              <h3 className='mb-2 text-center text-xl font-bold'>
                FullStack Development
              </h3>
              <p className='text-center text-gray-400'>
                Building complex systems with modern stacks
              </p>
            </div>

            {/* Feature 2: Secure Hosting */}
            <div className='rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50'>
              <div className='mb-4 flex justify-center text-blue-500'>
                {/* Shield/Security Icon */}
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
              <h3 className='mb-2 text-center text-xl font-bold'>
                Secure Hosting
              </h3>
              <p className='text-center text-gray-400'>
                Your data is safe in a Tier III data center
              </p>
            </div>

            {/* Feature 3: Performance Optimization */}
            <div className='rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50'>
              <div className='mb-4 flex justify-center text-blue-500'>
                {/* Speed/Performance Icon */}
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
              <h3 className='mb-2 text-center text-xl font-bold'>
                Performance Optimization
              </h3>
              <p className='text-center text-gray-400'>
                Boosting your systems 2-5x faster
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className='mt-16 text-center'>
            <h2 className='mb-6 text-4xl font-bold'>
              Ready to Transform Your Coding Experience?
            </h2>
            <Button
              size='lg'
              className='rounded-full bg-blue-600 px-8 py-6 text-xl text-white shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-xl'
              onClick={() => setIsOpen(true)}
            >
              Get Started Now
            </Button>
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

      {/* Analytics Dashboard Block */}
      <section
        ref={sectionRefs.analytics}
        className='relative flex h-auto min-h-[100vh] snap-start items-center justify-center bg-zinc-900 md:h-screen'
      >
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
              <div className='rounded-lg bg-zinc-900/50 p-6'>
                <h3 className='mb-4 text-xl font-semibold'>Code Activity</h3>
                <div className='relative h-64'>
                  <svg className='h-full w-full' viewBox='0 0 400 200'>
                    <path
                      d='M0,150 Q50,100 100,120 T200,80 T300,100 T400,50'
                      fill='none'
                      stroke='url(#gradient)'
                      strokeWidth='3'
                      className='animate-draw'
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
                  <div className='rounded-lg bg-zinc-800/50 p-3'>
                    <div className='text-sm text-gray-400'>Total Commits</div>
                    <div className='text-2xl font-bold'>1,234</div>
                  </div>
                  <div className='rounded-lg bg-zinc-800/50 p-3'>
                    <div className='text-sm text-gray-400'>Active Hours</div>
                    <div className='text-2xl font-bold'>42.5h</div>
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className='rounded-lg bg-zinc-900/50 p-6'>
                <h3 className='mb-4 text-xl font-semibold'>
                  Performance Metrics
                </h3>
                <div className='flex h-64 items-end justify-between gap-2'>
                  {[40, 60, 80, 45, 70, 90].map((height, index) => (
                    <div
                      key={index}
                      className='w-12 rounded-t bg-blue-500/50 transition-all duration-300 hover:bg-blue-500/70'
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <div className='mt-4 grid grid-cols-2 gap-4'>
                  <div className='rounded-lg bg-zinc-800/50 p-3'>
                    <div className='text-sm text-gray-400'>CPU Usage</div>
                    <div className='text-2xl font-bold'>32%</div>
                  </div>
                  <div className='rounded-lg bg-zinc-800/50 p-3'>
                    <div className='text-sm text-gray-400'>Memory</div>
                    <div className='text-2xl font-bold'>1.2GB</div>
                  </div>
                </div>
              </div>
            </div>

            {/* New Analytics Blocks */}
            <div className='grid grid-cols-1 gap-4 sm:gap-8 md:grid-cols-3'>
              {/* Pie Chart */}
              <div className='flex flex-col items-center rounded-lg bg-zinc-900/50 p-6'>
                <h3 className='mb-4 text-xl font-semibold'>
                  Task Distribution
                </h3>
                <svg width='120' height='120' viewBox='0 0 32 32'>
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
                  <span className='flex items-center'>
                    <span className='mr-1 h-3 w-3 rounded-full bg-blue-500'></span>
                    Web
                  </span>
                  <span className='flex items-center'>
                    <span className='mr-1 h-3 w-3 rounded-full bg-green-500'></span>
                    Bots
                  </span>
                  <span className='flex items-center'>
                    <span className='mr-1 h-3 w-3 rounded-full bg-orange-400'></span>
                    Analytics
                  </span>
                </div>
              </div>

              {/* Data Center Locations */}
              <div className='flex flex-col rounded-lg bg-zinc-900/50 p-6'>
                <h3 className='mb-4 text-center text-xl font-semibold'>
                  Data Center Locations
                </h3>
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3'>
                  {datacenters.map((dc) => (
                    <div
                      key={dc._id || dc.city}
                      className='flex flex-col items-center rounded-lg bg-zinc-800/60 p-2'
                    >
                      <svg
                        className={`mb-1 h-6 w-6 ${dc.color || 'text-blue-400'}`}
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
                      <div className='text-xs font-semibold text-gray-200'>
                        {dc.city}
                      </div>
                      <div className='text-[10px] text-gray-400'>
                        {dc.country ? dc.country : ''}
                      </div>
                      {dc.ping !== null && (
                        <div
                          className={`mt-1 text-[10px] ${
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
              <div className='flex flex-col gap-4 rounded-lg bg-zinc-900/50 p-6'>
                <h3 className='mb-4 text-xl font-semibold'>Quick Stats</h3>
                <div className='flex flex-col gap-2'>
                  <div className='flex justify-between text-sm text-gray-400'>
                    <span>Active Users</span>
                    <span className='font-bold text-blue-400'>1,024</span>
                  </div>
                  <div className='flex justify-between text-sm text-gray-400'>
                    <span>Deploys</span>
                    <span className='font-bold text-green-400'>12</span>
                  </div>
                  <div className='flex justify-between text-sm text-gray-400'>
                    <span>Errors</span>
                    <span className='font-bold text-red-400'>2</span>
                  </div>
                  <div className='flex justify-between text-sm text-gray-400'>
                    <span>Avg. Response</span>
                    <span className='font-bold text-yellow-400'>120ms</span>
                  </div>
                </div>
                <div className='mt-4 text-xs text-gray-500'>
                  Last update: 2 min ago
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Code Editor Preview */}
      <section
        ref={sectionRefs.services}
        className='relative flex h-auto min-h-[90vh] snap-start items-center justify-center bg-zinc-900 md:h-[80vh]'
      >
        <div
          className='relative z-10 container mx-auto px-1 py-4 sm:px-2 sm:py-8'
          style={getParallaxStyle(-0.5)}
        >
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
              <span className='text-gray-400'>'Solutions</span>{' '}
              <span className='text-gray-400'>{'}'}</span>
              <span className='text-gray-400'>{'}'}</span>
            </div>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
              {/* Web Development */}
              <div className='flex flex-col items-center rounded-lg bg-zinc-900/50 p-4 text-center'>
                <div className='mb-2 text-blue-400'>
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
                <div className='mb-1 text-base font-bold'>Web Development</div>
                <div className='text-xs text-gray-400'>
                  Corporate websites, CRM, ERP
                </div>
              </div>
              {/* Hosting & Server Support */}
              <div className='flex flex-col items-center rounded-lg bg-zinc-900/50 p-4 text-center'>
                <div className='mb-2 text-green-400'>
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
                <div className='mb-1 text-base font-bold'>
                  Hosting & Server Support
                </div>
                <div className='text-xs text-gray-400'>
                  24/7 monitoring and maintenance
                </div>
              </div>
              {/* Cloud Migration */}
              <div className='flex flex-col items-center rounded-lg bg-zinc-900/50 p-4 text-center'>
                <div className='mb-2 text-purple-400'>
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
                <div className='mb-1 text-base font-bold'>Cloud Migration</div>
                <div className='text-xs text-gray-400'>
                  Private & Public Cloud solutions
                </div>
              </div>
              {/* Infrastructure Optimization */}
              <div className='flex flex-col items-center rounded-lg bg-zinc-900/50 p-4 text-center'>
                <div className='mb-2 text-yellow-400'>
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
                <div className='mb-1 text-base font-bold'>
                  Infrastructure Optimization
                </div>
                <div className='text-xs text-gray-400'>
                  Own data center, performance tuning
                </div>
              </div>
              {/* IT Consulting */}
              <div className='flex flex-col items-center rounded-lg bg-zinc-900/50 p-4 text-center'>
                <div className='mb-2 text-pink-400'>
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
                <div className='mb-1 text-base font-bold'>IT Consulting</div>
                <div className='text-xs text-gray-400'>
                  Tech strategy & digital transformation
                </div>
              </div>
              {/* Automation & Integrations */}
              <div className='flex flex-col items-center rounded-lg bg-zinc-900/50 p-4 text-center'>
                <div className='mb-2 text-cyan-400'>
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
                <div className='mb-1 text-base font-bold'>
                  Automation & Integrations
                </div>
                <div className='text-xs text-gray-400'>
                  Business process automation, API integrations
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section
        ref={sectionRefs.pricing}
        className='relative flex h-auto min-h-[90vh] snap-start items-center justify-center bg-zinc-900 md:h-screen'
      >
        <div
          className='relative z-10 container mx-auto px-2 py-8 sm:px-4 sm:py-16'
          style={getParallaxStyle(-0.5)}
        >
          <h2 className='mb-6 bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-center text-2xl font-bold text-transparent drop-shadow-lg sm:mb-12 sm:text-4xl'>
            Pricing Plans
          </h2>
          <div className='mb-6 text-center sm:mb-12'>
            <h2 className='mb-2 text-2xl font-bold sm:mb-4 sm:text-4xl'>
              Choose Your Plan
            </h2>
            <p className='text-base text-gray-400 sm:text-lg'>
              Select the perfect plan for your needs
            </p>
          </div>
          <div className='grid grid-cols-1 gap-4 sm:gap-8 md:grid-cols-3'>
            {/* Free Plan */}
            <div className='rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50'>
              <div className='mb-8 text-center'>
                <h3 className='mb-2 text-2xl font-bold'>Free</h3>
                <div className='mb-2 text-4xl font-bold'>
                  $0<span className='text-lg text-gray-400'>/mo</span>
                </div>
                <p className='text-gray-400'>Perfect for getting started</p>
              </div>
              <ul className='mb-8 space-y-4'>
                <li className='flex items-center text-gray-300'>
                  <svg
                    className='mr-2 h-5 w-5 text-green-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  Basic AI suggestions
                </li>
                <li className='flex items-center text-gray-300'>
                  <svg
                    className='mr-2 h-5 w-5 text-green-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  Up to 3 projects
                </li>
                <li className='flex items-center text-gray-300'>
                  <svg
                    className='mr-2 h-5 w-5 text-green-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  Community support
                </li>
              </ul>
              <Button className='w-full bg-zinc-700 hover:bg-zinc-600'>
                Get Started
              </Button>
            </div>

            {/* Dev Plan */}
            <div className='scale-105 transform rounded-xl border border-blue-500/50 bg-zinc-800/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-blue-500'>
              <div className='mb-8 text-center'>
                <h3 className='mb-2 text-2xl font-bold'>Dev</h3>
                <div className='mb-2 text-4xl font-bold'>
                  $1<span className='text-lg text-gray-400'>/mo</span>
                </div>
                <p className='text-gray-400'>For individual developers</p>
              </div>
              <ul className='mb-8 space-y-4'>
                <li className='flex items-center text-gray-300'>
                  <svg
                    className='mr-2 h-5 w-5 text-green-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  Advanced AI features
                </li>
                <li className='flex items-center text-gray-300'>
                  <svg
                    className='mr-2 h-5 w-5 text-green-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  Unlimited projects
                </li>
                <li className='flex items-center text-gray-300'>
                  <svg
                    className='mr-2 h-5 w-5 text-green-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  Priority support
                </li>
                <li className='flex items-center text-gray-300'>
                  <svg
                    className='mr-2 h-5 w-5 text-green-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  Custom integrations
                </li>
              </ul>
              <Button className='w-full bg-blue-600 hover:bg-blue-700'>
                Get Started
              </Button>
            </div>

            {/* Pro Plan */}
            <div className='rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50'>
              <div className='mb-8 text-center'>
                <h3 className='mb-2 text-2xl font-bold'>Pro</h3>
                <div className='mb-2 text-4xl font-bold'>
                  $2<span className='text-lg text-gray-400'>/mo</span>
                </div>
                <p className='text-gray-400'>For professional teams</p>
              </div>
              <ul className='mb-8 space-y-4'>
                <li className='flex items-center text-gray-300'>
                  <svg
                    className='mr-2 h-5 w-5 text-green-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  Enterprise AI features
                </li>
                <li className='flex items-center text-gray-300'>
                  <svg
                    className='mr-2 h-5 w-5 text-green-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  Team collaboration
                </li>
                <li className='flex items-center text-gray-300'>
                  <svg
                    className='mr-2 h-5 w-5 text-green-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  24/7 support
                </li>
                <li className='flex items-center text-gray-300'>
                  <svg
                    className='mr-2 h-5 w-5 text-green-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  Advanced analytics
                </li>
              </ul>
              <Button className='w-full bg-zinc-700 hover:bg-zinc-600'>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
