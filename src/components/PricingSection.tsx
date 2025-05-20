import React, { useState } from 'react';

interface PricingSectionProps {
  scrollProgress: number;
}

interface Feature {
  text: string;
  tooltip?: {
    title: string;
    items: string[];
  };
}

interface Plan {
  name: string;
  price: number;
  serverOnlyPrice: number;
  features: Feature[];
  serverFeatures: {
    cpu: string;
    ram: string;
  };
}

const plans: Plan[] = [
  {
    name: 'Basic',
    price: 5,
    serverOnlyPrice: 3,
    features: [
      { text: '1 Website', tooltip: {
        title: 'Landing page with:',
        items: ['User registration', 'Photo gallery', 'Navigation menu', 'Contact form']
      }},
      { text: '1 Bot' },
      { text: 'Basic Analytics' }
    ],
    serverFeatures: {
      cpu: '1 Cpu',
      ram: '512MB RAM'
    }
  },
  {
    name: 'Pro',
    price: 15,
    serverOnlyPrice: 8,
    features: [
      { text: '3 Websites', tooltip: {
        title: 'Website with:',
        items: [
          'Google authentication',
          'Database integration',
          'Performance optimization',
          'Visit analytics',
          'Contact forms',
          'Admin dashboard'
        ]
      }},
      { text: '1000 Mbps Channel' },
      { text: 'Database Included' },
      { text: '10 Bots' },
      { text: 'Advanced Analytics' },
      { text: 'Telegram User Search' }
    ],
    serverFeatures: {
      cpu: '2 Cpu',
      ram: '2GB RAM'
    }
  },
  {
    name: 'Premium',
    price: 30,
    serverOnlyPrice: 11,
    features: [
      { text: '5 Websites', tooltip: {
        title: 'Advanced website with:',
        items: [
          'Multi-site management',
          'Advanced security',
          'Custom integrations',
          'Advanced analytics',
          'API access',
          'Custom development'
        ]
      }},
      { text: '1000 Mbps Channel' },
      { text: 'Database Included' },
      { text: 'Anti-DDoS Protection' },
      { text: 'Advanced Logging' },
      { text: '30 Bots' },
      { text: 'Premium Analytics' },
      { text: 'Telegram User Search' },
      { text: 'Custom Scripts' },
      { text: 'Advertising Tools' },
      { text: 'SEO Optimization' },
      { text: 'Telegram Channel Promotion' }
    ],
    serverFeatures: {
      cpu: '8 Cpu',
      ram: '8GB RAM'
    }
  }
];

const FeatureIcon = ({ isServerOnly }: { isServerOnly: boolean }) => (
  <div className="relative w-4 h-4 mr-2">
    <svg
      className={`absolute inset-0 h-4 w-4 text-green-400 transition-all duration-300 transform ${
        isServerOnly ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
      }`}
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
    <svg
      className={`absolute inset-0 h-4 w-4 text-red-400 transition-all duration-300 transform ${
        isServerOnly ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
      }`}
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
  </div>
);

const ServerFeatureIcon = () => (
  <svg
    className='mr-2 h-4 w-4 text-green-400 transition-transform duration-300 group-hover:scale-110'
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
);

const TooltipIcon = () => (
  <svg
    className='h-4 w-4 cursor-help text-gray-500 transition-colors duration-300 group-hover/tooltip:text-blue-400'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    />
  </svg>
);

const FeatureItem = ({ text, tooltip, isServerOnly }: Feature & { isServerOnly: boolean }) => (
  <li className='flex items-center transition-colors duration-300 group-hover:text-gray-300'>
    <FeatureIcon isServerOnly={isServerOnly} />
    {text}
    {tooltip && (
      <div className='group/tooltip relative ml-1'>
        <TooltipIcon />
        <div className='invisible absolute bottom-full left-1/2 mb-2 -translate-x-1/2 min-w-[200px] max-w-[280px] rounded-lg bg-zinc-800/95 p-4 text-xs text-gray-300 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover/tooltip:visible group-hover/tooltip:opacity-100'>
          <div className='mb-3 border-b border-zinc-700/50 pb-2 font-medium text-blue-400'>{tooltip.title}</div>
          <div className='space-y-2'>
            {tooltip.items.map((item, index) => (
              <div key={index} className='flex items-start gap-2'>
                <span className='mt-0.5 text-blue-400'>•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className='absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-zinc-800/95'></div>
        </div>
      </div>
    )}
  </li>
);

const ServerFeatureItem = ({ text }: { text: string }) => (
  <li className='flex items-center transition-colors duration-300 group-hover:text-gray-300'>
    <ServerFeatureIcon />
    {text}
  </li>
);

export function PricingSection({ scrollProgress }: PricingSectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const getParallaxStyle = (factor: number) => ({
    transform: `translateY(${scrollProgress * 100 * factor}px)`,
    opacity: Math.min(1, 1.2 + scrollProgress * 0.2),
    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
  });

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan === selectedPlan ? null : plan);
  };

  return (
    <section className='relative flex h-auto min-h-[90vh] snap-start items-center justify-center bg-zinc-900 md:h-[80vh]'>
      <div
        className='relative z-10 container mx-auto px-1 py-4 sm:px-2 sm:py-8'
        style={getParallaxStyle(-0.5)}
      >
        <h2 className='mb-4 bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-center text-2xl font-bold text-transparent drop-shadow-lg sm:mb-8 sm:text-4xl'>
          Pricing Plans
        </h2>
        <div className='rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-2 backdrop-blur-sm sm:p-4'>
          <div className='mb-2 flex items-center gap-2'>
            <div className='h-2 w-2 rounded-full bg-red-500' />
            <div className='h-2 w-2 rounded-full bg-yellow-500' />
            <div className='h-2 w-2 rounded-full bg-green-500' />
          </div>
          <div className='mb-4 rounded-lg bg-zinc-900/50 p-2 font-mono text-xs sm:p-3'>
            <div className='text-gray-400'>// Pricing Plans</div>
            <div className='text-blue-400'>class</div>{' '}
            <span className='text-yellow-400'>Pricing</span>{' '}
            <span className='text-gray-400'>{'{'}</span>
            <div className='pl-2 text-purple-400'>// Basic, Pro, Premium</div>
            <div className='pl-2 text-gray-400'>
              plans = [
              <span className='text-orange-400'>
                &#39;Basic&#39;, &#39;Pro&#39;, &#39;Premium&#39;
              </span>
              ]
            </div>
            <div className='pl-2 text-blue-400'>getPrice()</div>{' '}
            <span className='text-gray-400'>{'{'}</span>{' '}
            <span className='text-green-400'>return</span>{' '}
            <span className='text-gray-400'>&#39;Affordable</span>{' '}
            <span className='text-gray-400'>{'}'}</span>
            <span className='text-gray-400'>{'}'}</span>
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            {plans.map((plan) => (
              <div key={plan.name} className='group flex flex-col rounded-lg bg-zinc-900/50 p-4 border border-zinc-700/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-1'>
                <div className='mb-2 flex items-center justify-between'>
                  <div className='text-base font-bold transition-colors duration-300 group-hover:text-blue-400'>{plan.name}</div>
                  <label className='flex items-center gap-2 text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                    <input
                      type='checkbox'
                      checked={selectedPlan === plan.name.toLowerCase()}
                      onChange={() => handlePlanSelect(plan.name.toLowerCase())}
                      className='h-4 w-4 rounded border-gray-600 bg-zinc-800 text-blue-500 focus:ring-blue-500 transition-colors duration-300 group-hover:border-blue-500'
                    />
                    Only Server
                  </label>
                </div>
                <div className='mb-4 text-2xl font-bold transition-colors duration-300 group-hover:text-blue-400'>
                  <div className="flex items-center min-h-[2.5rem]">
                    {/* Normal price */}
                    <span className={`transition-all duration-300 flex items-baseline ${
                      selectedPlan === plan.name.toLowerCase() ? 'opacity-0 scale-90 -translate-y-2 absolute pointer-events-none' : 'opacity-100 scale-100 translate-y-0 relative'
                    }`}>
                      ${plan.price}
                      <span className='ml-1 text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>/month</span>
                    </span>
                    {/* Discounted price */}
                    <span className={`transition-all duration-300 flex items-baseline ${
                      selectedPlan === plan.name.toLowerCase() ? 'opacity-100 scale-100 translate-y-0 relative' : 'opacity-0 scale-90 -translate-y-2 absolute pointer-events-none'
                    }`}>
                      <span className='line-through text-gray-500 mr-2'>${plan.price}</span>
                      <span>${plan.serverOnlyPrice}</span>
                      <span className='ml-1 text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>/month</span>
                    </span>
                  </div>
                </div>
                <div className='mb-4 text-sm text-green-400 transition-colors duration-300 group-hover:text-green-300'>
                  Save 30% with annual billing
                </div>
                <ul className='mb-4 space-y-2 text-sm text-gray-400'>
                  {plan.features.map((feature, index) => (
                    <FeatureItem
                      key={index}
                      {...feature}
                      isServerOnly={selectedPlan === plan.name.toLowerCase()}
                    />
                  ))}
                  <ServerFeatureItem text={`Server: ${plan.serverFeatures.cpu}`} />
                  <ServerFeatureItem text={`Server: ${plan.serverFeatures.ram}`} />
                </ul>
                <button className='mt-auto rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-600 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:-translate-y-0.5'>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 