import React, { useState } from 'react';
import ShinyText from '@/components/style/ShinyText';
import StarBorder from '@/components/style/StarBorder';
import ProfileCard from '@/components/style/ProfileCardComponent';

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
  yearlyPrice: number;
  features: Feature[];
  serverFeatures: {
    cpu: string;
    ram: string;
  };
  outOfStock?: boolean;
  hot?: boolean;
}

const plans: Plan[] = [
  {
    name: 'Basic',
    price: 3,
    yearlyPrice: 30,
    features: [
      {
        text: '2 month Free',
        tooltip: {
          title: 'Free Trial',
          items: [
            'Get 2 month free when you choose annual billing',
            'Full access to all features',
            'No credit card required'
          ]
        }
      },
      { text: 'Basic Analytics' },
      { text: '50 Mbps Channel' },
      { text: 'Telegram bots include' }
    ],
    serverFeatures: {
      cpu: '1 Cpu',
      ram: '1GB RAM'
    },
    hot: false
  },
  {
    name: 'Premium',
    price: 16,
    yearlyPrice: 160,
    features: [
      {
        text: '2 month Free',
        tooltip: {
          title: 'Free Trial',
          items: [
            'Get 2 month free when you choose annual billing',
            'Full access to all features',
            'No credit card required'
          ]
        }
      },
      {
        text: 'Enterprise Analytics',
        tooltip: {
          title: 'Enterprise Analytics includes:',
          items: [
            'Real-time monitoring',
            'Advanced security',
            'Custom integrations',
            'Advanced analytics',
            'API access',
            'Custom development'
          ]
        }
      },
      { text: '10000 Mbps Channel' },
      { text: 'Anti-DDoS Protection' },
      { text: 'Advanced Logging' },
      { text: 'Custom Scripts' },
      { text: 'Advertising Tools' },
      { text: 'Telegram bots include' }
    ],
    serverFeatures: {
      cpu: '8 Cpu',
      ram: '8GB RAM'
    },
    hot: true
  },
  {
    name: 'Pro',
    price: 6,
    yearlyPrice: 60,
    features: [
      {
        text: '2 month Free',
        tooltip: {
          title: 'Free Trial',
          items: [
            'Get 2 month free when you choose annual billing',
            'Full access to all features',
            'No credit card required'
          ]
        }
      },
      {
        text: 'Advanced Analytics',
        tooltip: {
          title: 'Advanced Analytics includes:',
          items: [
            'Real-time data tracking',
            'Advanced data visualization',
            'Custom reporting',
            'Performance monitoring',
            'Resource usage analytics'
          ]
        }
      },
      { text: '1000 Mbps Channel' },
      { text: 'Anti-DDoS Protection' },
      { text: 'Advanced Logging' },
      { text: 'Telegram bots include' }
    ],
    serverFeatures: {
      cpu: '2 Cpu',
      ram: '2GB RAM'
    }
  }
];

const additionalPlans: Plan[] = [
  {
    name: 'Enterprise',
    price: 30,
    yearlyPrice: 300,
    features: [
      {
        text: '2 month Free',
        tooltip: {
          title: 'Free Trial',
          items: [
            'Get 2 month free when you choose annual billing',
            'Full access to all features',
            'No credit card required'
          ]
        }
      },
      { text: '10000 Mbps Channel' },
      { text: 'Anti-DDoS Protection' },
      { text: 'Advanced Logging' },
      { text: 'Custom Scripts' },
      { text: 'Advertising Tools' },
      { text: 'Telegram bots include' }
    ],
    serverFeatures: {
      cpu: '4 Cpu',
      ram: '16GB RAM'
    }
  },
  {
    name: 'Ultimate',
    price: 240,
    yearlyPrice: 2400,
    features: [
      {
        text: '2 month Free',
        tooltip: {
          title: 'Free Trial',
          items: [
            'Get 2 month free when you choose annual billing',
            'Full access to all features',
            'No credit card required'
          ]
        }
      },
      { text: '10000 Mbps Channel' },
      { text: 'Anti-DDoS Protection' },
      { text: 'Advanced Logging' },
      { text: 'Custom Scripts' },
      { text: 'Advertising Tools' },
      { text: 'Telegram bots include' }
    ],
    serverFeatures: {
      cpu: '24 Cpu',
      ram: '96GB RAM'
    },
    outOfStock: true
  },
  {
    name: 'Professional',
    price: 160,
    yearlyPrice: 1600,
    features: [
      {
        text: '2 month Free',
        tooltip: {
          title: 'Free Trial',
          items: [
            'Get 2 month free when you choose annual billing',
            'Full access to all features',
            'No credit card required'
          ]
        }
      },
      { text: '10000 Mbps Channel' },
      { text: 'Anti-DDoS Protection' },
      { text: 'Advanced Logging' },
      { text: 'Custom Scripts' },
      { text: 'Advertising Tools' },
      { text: 'Telegram bots include' }
    ],
    serverFeatures: {
      cpu: '16 Cpu',
      ram: '64GB RAM'
    },
    outOfStock: true
  }
];

const FeatureIcon = ({ isServerOnly }: { isServerOnly: boolean }) => (
  <div className='relative mr-2 h-4 w-4'>
    <svg
      className={`absolute inset-0 h-4 w-4 transform text-green-400 transition-all duration-300 ${
        isServerOnly
          ? 'scale-0 rotate-90 opacity-0'
          : 'scale-100 rotate-0 opacity-100'
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
      className={`absolute inset-0 h-4 w-4 transform text-red-400 transition-all duration-300 ${
        isServerOnly
          ? 'scale-100 rotate-0 opacity-100'
          : 'scale-0 -rotate-90 opacity-0'
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

const FeatureItem = ({
  text,
  tooltip,
  isServerOnly
}: Feature & { isServerOnly: boolean }) => (
  <li className='flex items-center transition-colors duration-300 group-hover:text-gray-300'>
    {text === '2 month Free' ? (
      <FeatureIcon isServerOnly={!isServerOnly} />
    ) : (
      <ServerFeatureIcon />
    )}
    {text}
    {tooltip && (
      <div className='group/tooltip relative ml-1'>
        <TooltipIcon />
        <div className='invisible absolute bottom-full left-1/2 mb-2 max-w-[280px] min-w-[200px] -translate-x-1/2 rounded-lg bg-zinc-800/95 p-4 text-xs text-gray-300 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover/tooltip:visible group-hover/tooltip:opacity-100'>
          <div className='mb-3 border-b border-zinc-700/50 pb-2 font-medium text-blue-400'>
            {tooltip.title}
          </div>
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

const HotBadge = () => (
  <div className='absolute -top-2 -right-2'>
    <div className='relative'>
      <div className='absolute -inset-1 animate-pulse rounded-full bg-red-500/20'></div>
      <div className='relative rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg'>
        HOT
      </div>
    </div>
  </div>
);

const Modal = ({
  isOpen,
  onClose,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />
      <div className='relative z-10 max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-xl border border-zinc-700/50 bg-zinc-800/95 p-6 shadow-2xl backdrop-blur-sm'>
        <div className='absolute top-2 right-2'>
          <button
            onClick={onClose}
            className='flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-colors duration-300 hover:bg-zinc-700/50 hover:text-gray-200'
          >
            <svg
              className='h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export function PricingSection() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan === selectedPlan ? null : plan);
  };

  const calculateDiscount = (price: number, yearlyPrice: number) => {
    const regularYearly = price * 12;
    const discount = ((regularYearly - yearlyPrice) / regularYearly) * 100;
    return Math.round(discount);
  };

  return (
    <section className='relative flex h-auto min-h-[90vh] snap-start items-center justify-center md:h-[80vh]'>
      <div className='relative z-10 container mx-auto px-1 py-4 sm:px-2 sm:py-8'>
        <h2 className='mb-4 bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-center text-2xl font-bold text-transparent drop-shadow-lg sm:mb-8 sm:text-4xl'>
          Pricing Plans
        </h2>
        <div className='rounded-xl border p-2 backdrop-blur-sm sm:p-4'>
          <div className='mb-2 flex items-center gap-2'>
            <div className='h-2 w-2 rounded-full bg-red-500' />
            <div className='h-2 w-2 rounded-full bg-yellow-500' />
            <div className='h-2 w-2 rounded-full bg-green-500' />
          </div>
          <div className='mb-4 rounded-lg bg-zinc-900/50 p-2 font-mono text-xs sm:p-3'>
            {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
            <div className='text-gray-400'>// Pricing Plans</div>
            <div className='text-blue-400'>class</div>{' '}
            <span className='text-yellow-400'>Pricing</span>{' '}
            <span className='text-gray-400'>{'{'}</span>
            {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
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
              <div
                key={plan.name}
                className={`group relative flex flex-col rounded-lg border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] ${
                  plan.name === 'Premium'
                    ? 'scale-105 border-blue-500/30 bg-zinc-800/80'
                    : 'scale-95 border-zinc-700/60 bg-zinc-900/50'
                }`}
              >
                {plan.hot && <HotBadge />}
                <div className='mb-2 flex items-center justify-between'>
                  <div className='text-base font-bold transition-colors duration-300 group-hover:text-blue-400'>
                    {plan.name}
                  </div>
                  <label className='flex items-center gap-2 text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                    <input
                      type='checkbox'
                      checked={selectedPlan === plan.name.toLowerCase()}
                      onChange={() => handlePlanSelect(plan.name.toLowerCase())}
                      className='h-4 w-4 rounded border-gray-600 bg-zinc-800 text-blue-500 transition-colors duration-300 group-hover:border-blue-500 focus:ring-blue-500'
                    />
                    Annual Billing
                  </label>
                </div>
                <div className='mb-4 text-2xl font-bold transition-colors duration-300 group-hover:text-blue-400'>
                  <div className='flex min-h-[2.5rem] items-center'>
                    {/* Normal price */}
                    <span
                      className={`flex items-baseline transition-all duration-300 ${
                        selectedPlan === plan.name.toLowerCase()
                          ? 'pointer-events-none absolute -translate-y-2 scale-90 opacity-0'
                          : 'relative translate-y-0 scale-100 opacity-100'
                      }`}
                    >
                      ${plan.price}
                      <span className='ml-1 text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                        /month
                      </span>
                    </span>
                    {/* Yearly price */}
                    <span
                      className={`flex items-baseline transition-all duration-300 ${
                        selectedPlan === plan.name.toLowerCase()
                          ? 'relative translate-y-0 scale-100 opacity-100'
                          : 'pointer-events-none absolute -translate-y-2 scale-90 opacity-0'
                      }`}
                    >
                      <span className='mr-2 text-gray-500 line-through'>
                        ${plan.price * 12}
                      </span>
                      <span>${plan.yearlyPrice}</span>
                      <span className='ml-1 text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                        /year
                      </span>
                    </span>
                  </div>
                </div>
                <div className='mb-4 text-sm text-green-400 transition-colors duration-300 group-hover:text-green-300'>
                  Save {calculateDiscount(plan.price, plan.yearlyPrice)}% with
                  annual billing
                </div>
                <ul className='mb-4 space-y-2 text-sm text-gray-400'>
                  {plan.features.map((feature, index) => (
                    <FeatureItem
                      key={index}
                      {...feature}
                      isServerOnly={selectedPlan === plan.name.toLowerCase()}
                    />
                  ))}
                  <ServerFeatureItem
                    text={`Server: ${plan.serverFeatures.cpu}`}
                  />
                  <ServerFeatureItem
                    text={`Server: ${plan.serverFeatures.ram}`}
                  />
                </ul>
                <StarBorder as='button' color='cyan' speed='5s'>
                  <ShinyText
                    text={plan.outOfStock ? 'Out of Stock' : 'Get Started'}
                    disabled={!plan.outOfStock}
                    speed={3}
                  />
                </StarBorder>
              </div>
            ))}
          </div>
          <div className='mt-8 flex justify-center'>
            <button
              onClick={() => setShowMore(true)}
              className='rounded-lg bg-blue-500/10 px-6 py-2 text-sm font-semibold text-blue-400 transition-all duration-300 hover:bg-blue-500/20 hover:text-blue-300'
            >
              See more
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={showMore} onClose={() => setShowMore(false)}>
        <div className='space-y-6'>
          <h3 className='text-2xl font-bold text-white'>
            Additional Server Plans
          </h3>
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
            {additionalPlans.map((plan) => (
              <div
                key={plan.name}
                className='group relative flex flex-col rounded-lg border border-zinc-700/60 bg-zinc-900/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'
              >
                {plan.hot && <HotBadge />}
                <div className='mb-2 flex items-center justify-between'>
                  <div className='text-base font-bold transition-colors duration-300 group-hover:text-blue-400'>
                    {plan.name}
                  </div>
                  <label className='flex items-center gap-2 text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                    <input
                      type='checkbox'
                      checked={selectedPlan === plan.name.toLowerCase()}
                      onChange={() => handlePlanSelect(plan.name.toLowerCase())}
                      className='h-4 w-4 rounded border-gray-600 bg-zinc-800 text-blue-500 transition-colors duration-300 group-hover:border-blue-500 focus:ring-blue-500'
                    />
                    Annual Billing
                  </label>
                </div>
                <div className='mb-4 text-2xl font-bold transition-colors duration-300 group-hover:text-blue-400'>
                  <div className='flex min-h-[2.5rem] items-center'>
                    <span
                      className={`flex items-baseline transition-all duration-300 ${
                        selectedPlan === plan.name.toLowerCase()
                          ? 'pointer-events-none absolute -translate-y-2 scale-90 opacity-0'
                          : 'relative translate-y-0 scale-100 opacity-100'
                      }`}
                    >
                      ${plan.price}
                      <span className='ml-1 text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                        /month
                      </span>
                    </span>
                    <span
                      className={`flex items-baseline transition-all duration-300 ${
                        selectedPlan === plan.name.toLowerCase()
                          ? 'relative translate-y-0 scale-100 opacity-100'
                          : 'pointer-events-none absolute -translate-y-2 scale-90 opacity-0'
                      }`}
                    >
                      <span className='mr-2 text-gray-500 line-through'>
                        ${plan.price * 12}
                      </span>
                      <span>${plan.yearlyPrice}</span>
                      <span className='ml-1 text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300'>
                        /year
                      </span>
                    </span>
                  </div>
                </div>
                <div className='mb-4 text-sm text-green-400 transition-colors duration-300 group-hover:text-green-300'>
                  Save {calculateDiscount(plan.price, plan.yearlyPrice)}% with
                  annual billing
                </div>
                <ul className='mb-4 space-y-2 text-sm text-gray-400'>
                  {plan.features.map((feature, index) => (
                    <FeatureItem
                      key={index}
                      {...feature}
                      isServerOnly={selectedPlan === plan.name.toLowerCase()}
                    />
                  ))}
                  <ServerFeatureItem
                    text={`Server: ${plan.serverFeatures.cpu}`}
                  />
                  <ServerFeatureItem
                    text={`Server: ${plan.serverFeatures.ram}`}
                  />
                </ul>
                <StarBorder as='button' color='cyan' speed='5s'>
                  <ShinyText
                    text={plan.outOfStock ? 'Out of Stock' : 'Get Started'}
                    disabled={false}
                    speed={3}
                  />
                </StarBorder>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </section>
  );
}
