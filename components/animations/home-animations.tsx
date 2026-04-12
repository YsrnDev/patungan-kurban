'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface HomeAnimationsProps {
  children: React.ReactNode;
}

export function HomeAnimations({ children }: HomeAnimationsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
          gsap.set(
            ['.hero-animate', '.stat-card', '.group-card', '.step-card', '.section-heading-animate', '.cta-animate'],
            { clearProps: 'all', opacity: 1 }
          );
          gsap.set('.progress-bar-fill', { clearProps: 'all' });
          return;
        }

        const heroElements = gsap.utils.toArray<HTMLElement>('.hero-animate');
        gsap.fromTo(
          heroElements,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.72,
            stagger: 0.08,
            ease: 'power3.out',
            willChange: 'transform, opacity',
          }
        );

        const statCards = gsap.utils.toArray<HTMLElement>('.stat-card');
        statCards.forEach((card, i) => {
          gsap.fromTo(
            card,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.55,
              delay: 0.18 + i * 0.08,
              ease: 'power2.out',
              willChange: 'transform, opacity',
            }
          );
        });

        const groupCards = gsap.utils.toArray<HTMLElement>('.group-card');
        groupCards.forEach((card, i) => {
          gsap.fromTo(
            card,
            { opacity: 0, y: 36 },
            {
              opacity: 1,
              y: 0,
              duration: 0.58,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 88%',
                toggleActions: 'play none none none',
                once: true,
              },
              delay: (i % 3) * 0.06,
              willChange: 'transform, opacity',
            }
          );
        });

        const steps = gsap.utils.toArray<HTMLElement>('.step-card');
        steps.forEach((step, i) => {
          gsap.fromTo(
            step,
            { opacity: 0, y: 32 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: step,
                start: 'top 85%',
                toggleActions: 'play none none none',
                once: true,
              },
              delay: i * 0.08,
              willChange: 'transform, opacity',
            }
          );
        });

        const sectionHeadings = gsap.utils.toArray<HTMLElement>('.section-heading-animate');
        sectionHeadings.forEach((heading) => {
          gsap.fromTo(
            heading,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: heading,
                start: 'top 85%',
                toggleActions: 'play none none none',
                once: true,
              },
              willChange: 'transform, opacity',
            }
          );
        });

        const urgentBadges = gsap.utils.toArray<HTMLElement>('.urgent-badge');
        urgentBadges.forEach((badge) => {
          gsap.to(badge, {
            y: -2,
            duration: 1.8,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
            willChange: 'transform',
          });
        });

        const ctaButtons = gsap.utils.toArray<HTMLElement>('.cta-animate');
        gsap.fromTo(
          ctaButtons,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.48,
            stagger: 0.08,
            delay: 0.38,
            ease: 'power2.out',
            willChange: 'transform, opacity',
          }
        );

        const progressBars = gsap.utils.toArray<HTMLElement>('.progress-bar-fill');
        progressBars.forEach((bar) => {
          const width = bar.style.width;
          gsap.fromTo(
            bar,
            { width: '0%' },
            {
              width: width || '0%',
              duration: 0.9,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: bar,
                start: 'top 90%',
                toggleActions: 'play none none none',
                once: true,
              },
              willChange: 'width',
            }
          );
        });
      }, containerRef);

      return () => ctx.revert();
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="will-change-auto">
      {children}
    </div>
  );
}
