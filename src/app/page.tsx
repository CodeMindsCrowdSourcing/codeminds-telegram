'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { WelcomeSection } from '@/components/WelcomeSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { AnalyticsSection } from '@/components/AnalyticsSection';
import { ServicesSection } from '@/components/ServicesSection';
import { PricingSection } from '@/components/PricingSection';

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('welcome');
  const [datacenters, setDatacenters] = useState<any[]>([]);

  // Create refs separately
  const welcomeRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const analyticsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  // Combine refs into an object using useMemo
  const sectionRefs = useMemo(
    () => ({
      welcome: welcomeRef,
      features: featuresRef,
      analytics: analyticsRef,
      services: servicesRef,
      pricing: pricingRef
    }),
    []
  ); // Empty dependency array since refs don't need to be recreated

  // Add intersection observer for section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = Object.keys(sectionRefs).find(
              (key) =>
                sectionRefs[key as keyof typeof sectionRefs].current ===
                entry.target
            );
            if (sectionId) {
              setActiveSection(sectionId);
            }
          }
        });
      },
      {
        threshold: 0.5, // Trigger when section is 50% visible
        rootMargin: '-10% 0px -10% 0px' // Add some margin to make it more precise
      }
    );

    // Observe all sections
    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, [sectionRefs]);

  // Separate useEffect for fetching datacenters with ping
  useEffect(() => {
    const fetchDatacenters = async () => {
      try {
        const response = await fetch('/api/ping');
        const data = await response.json();
        setDatacenters(data.datacenters || []);
      } catch (error) {}
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
    <div className='relative min-h-screen'>
      {/*<SplashCursor/>*/}
      {/* Футуристический фон */}
      <div className='pointer-events-none fixed inset-0 z-0 overflow-hidden'>
        {/*Сетка*/}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

        {/* Анимированные линии - оптимизированы */}
        <div className='absolute inset-0'>
          <div
            className='absolute h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent'
            style={{
              top: '20%',
              transition: 'transform 0.1s ease-out'
            }}
          />
          <div
            className='absolute h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent'
            style={{
              top: '80%',
              transition: 'transform 0.1s ease-out'
            }}
          />
        </div>

        {/* Светящиеся точки - уменьшено количество */}
        <div className='absolute inset-0'>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className='absolute h-1 w-1 rounded-full bg-blue-500/30'
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
        {/*<div className='absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]' />*/}
      </div>

      {/* Фиксированное навигационное меню */}
      <div className='fixed top-0 right-0 left-0 z-50'>
        <Navigation
          activeSection={activeSection}
          scrollToSection={scrollToSection}
        />
      </div>

      <div
        ref={containerRef}
        className='hide-scrollbar relative z-10 h-screen snap-y snap-mandatory overflow-y-scroll scroll-smooth pt-16'
        style={{
          scrollBehavior: 'smooth',
          scrollSnapType: 'y proximity',
          scrollSnapStop: 'always',
          scrollPadding: '0',
          scrollSnapPointsY: 'repeat(100vh)',
          WebkitOverflowScrolling: 'touch',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div ref={sectionRefs.welcome} className='relative'>
          <WelcomeSection />
        </div>

        <div ref={sectionRefs.features} className='relative'>
          <FeaturesSection />
        </div>

        <div ref={sectionRefs.analytics} className='relative'>
          <AnalyticsSection datacenters={datacenters} />
        </div>

        <div ref={sectionRefs.services} className='relative'>
          <ServicesSection />
        </div>

        <div ref={sectionRefs.pricing} className='relative'>
          <PricingSection />
        </div>
      </div>
    </div>
  );
}
