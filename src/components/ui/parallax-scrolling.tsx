'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { LayoutGrid, Sparkles, Layers } from 'lucide-react';

export function ParallaxComponent() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggerElement = parallaxRef.current?.querySelector('[data-parallax-layers]');
    const contentElement = parallaxRef.current?.querySelector('[data-parallax-content]');

    if (triggerElement) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0
        }
      });

      const layers = [
        { layer: "1", yPercent: 65, scale: 1.1 },
        { layer: "2", yPercent: 45, scale: 1.05 },
        { layer: "3", yPercent: 25, scale: 1.25, opacity: 0.2 },
        { layer: "4", yPercent: 10, scale: 1.0 }
      ];

      layers.forEach((layerObj, idx) => {
        tl.to(
          triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          {
            yPercent: layerObj.yPercent,
            scale: layerObj.scale,
            opacity: layerObj.opacity !== undefined ? layerObj.opacity : undefined,
            ease: "none"
          },
          idx === 0 ? undefined : "<"
        );
      });
    }

    // Scroll animation for content section below parallax
    if (contentElement) {
      gsap.fromTo(
        contentElement.children,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: contentElement,
            start: "top 85%",
            end: "top 35%",
            scrub: 0.5
          }
        }
      );
    }

    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
      if (triggerElement) gsap.killTweensOf(triggerElement);
      if (contentElement) gsap.killTweensOf(contentElement.children);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden" ref={parallaxRef}>
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="absolute inset-0 z-50 pointer-events-none"></div>
          <div data-parallax-layers className="relative w-full h-[120%] -top-[10%]">
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000" 
              loading="eager" 
              data-parallax-layer="1" 
              alt="Modern Office Architecture" 
              className="absolute top-0 left-0 w-full h-full object-cover z-0 filter brightness-50" 
            />
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2000" 
              loading="eager" 
              data-parallax-layer="2" 
              alt="Collaborative Workspace" 
              className="absolute top-0 left-0 w-full h-full object-cover z-10 opacity-70 mix-blend-screen" 
            />
            
            <div data-parallax-layer="3" className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-accent/20 text-accent-bright border border-accent/30 backdrop-blur-md mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Next-Gen Workspace
              </span>
              <h2 className="text-6xl md:text-9xl font-black text-white tracking-tight drop-shadow-2xl uppercase">
                WORKSPACE
              </h2>
              <p className="text-lg md:text-2xl text-slate-200 mt-4 max-w-xl font-medium drop-shadow-lg">
                Organize projects, tasks, and teams in one frictionless environment.
              </p>
            </div>
            
            <img 
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000" 
              loading="eager" 
              data-parallax-layer="4" 
              alt="Aesthetic Studio Workspace" 
              className="absolute top-0 left-0 w-full h-full object-cover z-30 opacity-40 mix-blend-overlay" 
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent z-40"></div>
        </div>
      </section>
      
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center bg-background text-foreground z-50 px-6 py-20 text-center border-t border-border/40">
        <div data-parallax-content className="flex flex-col items-center max-w-3xl mx-auto">
          <div className="p-4 rounded-2xl bg-accent/10 text-accent border border-accent/20 mb-6 shadow-xl">
            <LayoutGrid className="w-12 h-12" />
          </div>
          <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
            Unified Workspace Intelligence
          </h3>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
            Experience multi-layered productivity. Transform fragmented tools into a single dynamic operational hub designed for speed, clarity, and seamless team flow.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
              <Layers className="w-4 h-4 text-accent" /> Kanban & List Views
            </span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
              <Sparkles className="w-4 h-4 text-accent" /> Real-time Sync
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
