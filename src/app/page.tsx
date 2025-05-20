'use client';

import { useState, useEffect, useRef } from 'react';
import { Navigation } from '@/components/Navigation';
import { WelcomeSection } from '@/components/WelcomeSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { AnalyticsSection } from '@/components/AnalyticsSection';
import { ServicesSection } from '@/components/ServicesSection';
import { PricingSection } from '@/components/PricingSection';

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('welcome');
  const [datacenters, setDatacenters] = useState<any[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Section refs for scrollspy
  const sectionRefs = {
    welcome: useRef<HTMLDivElement>(null),
    features: useRef<HTMLDivElement>(null),
    analytics: useRef<HTMLDivElement>(null),
    services: useRef<HTMLDivElement>(null),
    pricing: useRef<HTMLDivElement>(null)
  };

  // Оптимизированный обработчик скролла с throttle
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking && containerRef.current) {
        window.requestAnimationFrame(() => {
          const { scrollTop, scrollHeight, clientHeight } = containerRef.current!;
          const progress = scrollTop / (scrollHeight - clientHeight);
          setScrollProgress(progress);

          // Улучшенная логика определения активной секции
          const containerRect = containerRef.current!.getBoundingClientRect();
          const containerTop = containerRect.top;
          const viewportMiddle = clientHeight / 2;

          const offsets = Object.entries(sectionRefs).map(([key, ref]) => {
            if (ref.current) {
              const rect = ref.current.getBoundingClientRect();
              const sectionTop = rect.top - containerTop;
              const sectionBottom = rect.bottom - containerTop;

              return {
                key,
                top: sectionTop,
                bottom: sectionBottom,
                distance: Math.abs(sectionTop - viewportMiddle)
              };
            }
            return { key, top: Infinity, bottom: -Infinity, distance: Infinity };
          });

          // Находим секцию, которая находится ближе всего к центру viewport
          const visible = offsets.filter(
            (o) => o.top <= viewportMiddle && o.bottom >= viewportMiddle
          );

          if (visible.length > 0) {
            // Выбираем секцию, которая ближе всего к центру
            const closest = visible.reduce((prev, curr) =>
              curr.distance < prev.distance ? curr : prev
            );
            setActiveSection(closest.key);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [sectionRefs]);

  // Оптимизированный обработчик движения мыши с throttle
  useEffect(() => {
    let ticking = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking && containerRef.current) {
        window.requestAnimationFrame(() => {
          const rect = containerRef.current!.getBoundingClientRect();
          setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
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
      }
    };

    fetchDatacenters();
    // Refresh ping every 30 seconds
    const interval = setInterval(fetchDatacenters, 30000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to section with smooth behavior
  const scrollToSection = (key: keyof typeof sectionRefs) => {
    sectionRefs[key].current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="relative min-h-screen">
      {/* Футуристический фон */}
      <div className='fixed inset-0 z-0 overflow-hidden pointer-events-none'>
        {/* Сетка */}
        <div
          className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"
          style={{
            transform: `scale(${1 + scrollProgress * 0.2})`,
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />

        {/* Интерактивные частицы - уменьшено количество */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.12) 0%, transparent 18%)`,
            opacity: isHovering ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />

        {/* Анимированные линии - оптимизированы */}
        <div className="absolute inset-0">
          <div
            className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
            style={{
              top: '20%',
              transform: `translateX(${mousePosition.x * 0.05}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          />
          <div
            className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
            style={{
              top: '80%',
              transform: `translateX(${-mousePosition.x * 0.05}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          />
        </div>

        {/* Светящиеся точки - уменьшено количество */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-blue-500/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `pulse ${2 + Math.random() * 2}s infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Маска для градиента */}
        <div className='absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]' />
      </div>

      {/* Фиксированное навигационное меню */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navigation activeSection={activeSection} scrollToSection={scrollToSection} />
      </div>

      <div
        ref={containerRef}
        className='relative z-10 h-screen snap-y snap-mandatory overflow-y-scroll scroll-smooth hide-scrollbar pt-16'
        style={{
          scrollBehavior: 'smooth',
          scrollSnapType: 'y proximity',
          scrollSnapStop: 'always',
          scrollPadding: '0',
          scrollSnapPointsY: 'repeat(100vh)',
          WebkitOverflowScrolling: 'touch',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div ref={sectionRefs.welcome} className="relative">
          <WelcomeSection scrollProgress={scrollProgress} />
        </div>

        <div ref={sectionRefs.features} className="relative">
          <FeaturesSection scrollProgress={scrollProgress} />
        </div>

        <div ref={sectionRefs.analytics} className="relative">
          <AnalyticsSection scrollProgress={scrollProgress} datacenters={datacenters} />
        </div>

        <div ref={sectionRefs.services} className="relative">
          <ServicesSection scrollProgress={scrollProgress} />
        </div>

        <div ref={sectionRefs.pricing} className="relative">
          <PricingSection scrollProgress={scrollProgress} />
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }

        /* Убираем фон у секций */
        section {
          background: transparent !important;
        }

        /* Оптимизация производительности */
        * {
          will-change: transform;
          backface-visibility: hidden;
        }

        /* Отключаем анимации для пользователей, предпочитающих уменьшенное движение */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
