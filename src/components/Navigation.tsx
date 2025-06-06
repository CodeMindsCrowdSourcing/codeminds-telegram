import React, { useState } from 'react';
import ShinyText from '@/components/style/ShinyText';
import StarBorder from '@/components/style/StarBorder';
import Dock from '@/components/style/Dock';

type SectionKey = 'welcome' | 'features' | 'analytics' | 'services' | 'pricing';

interface NavigationProps {
  activeSection: string;
  scrollToSection: (key: SectionKey) => void;
}

export function Navigation({
  activeSection,
  scrollToSection
}: NavigationProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const items = [
    // { icon: <VscHome size={18} />, label: 'Home', onClick: () => alert('Home!') },
    // { icon: <VscArchive size={18} />, label: 'Archive', onClick: () => alert('Archive!') },
    // { icon: <VscAccount size={18} />, label: 'Profile', onClick: () => alert('Profile!') },
    // { icon: <VscSettingsGear size={18} />, label: 'Settings', onClick: () => alert('Settings!') },
  ];
  const navItems = [
    { key: 'welcome' as SectionKey, label: 'Welcome' },
    { key: 'features' as SectionKey, label: 'Features' },
    { key: 'analytics' as SectionKey, label: 'Analytics' },
    { key: 'services' as SectionKey, label: 'Services' },
    { key: 'pricing' as SectionKey, label: 'Pricing' }
  ];

  return (
    <>
      {/* Desktop floating nav */}
      <nav className='fixed top-6 left-1/2 z-50 hidden -translate-x-1/2 flex-row gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-xl md:flex'>
        {navItems.map((item) => (
          <StarBorder
            key={item.key}
            as='button'
            onClick={() => scrollToSection(item.key)}
            color='green'
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              activeSection === item.key
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-zinc-800'
            }`}
            speed='5s'
          >
            <ShinyText text={item.label} speed={3} />
          </StarBorder>
          // <button
          //   key={item.key}
          //   onClick={() => scrollToSection(item.key)}
          //   className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
          //     activeSection === item.key
          //       ? 'bg-blue-600 text-white shadow-lg'
          //       : 'text-gray-300 hover:bg-zinc-800'
          //   }`}
          // >
          //   {item.label}
          // </button>
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
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    scrollToSection(item.key);
                    setMobileNavOpen(false);
                  }}
                  className={`w-full rounded-lg px-4 py-3 text-left text-base font-semibold transition-all duration-200 ${
                    activeSection === item.key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-zinc-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <Dock
        items={items}
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
    </>
  );
}
