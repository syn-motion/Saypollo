import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { animate } from 'animejs';
import { 
  ArrowUpRight, 
  Menu, 
  X, 
  Activity, 
  Layers, 
  Zap, 
  Target 
} from 'lucide-react';
import { cn } from './lib/utils';

gsap.registerPlugin(ScrollTrigger);

// --- Components ---

const MagneticButton = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const moveBtn = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = btn.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      
      gsap.to(btn, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const resetBtn = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      });
    };

    btn.addEventListener('mousemove', moveBtn);
    btn.addEventListener('mouseleave', resetBtn);
    return () => {
      btn.removeEventListener('mousemove', moveBtn);
      btn.removeEventListener('mouseleave', resetBtn);
    };
  }, []);

  return (
    <button ref={btnRef} className={cn('magnetic-btn', className)}>
      {children}
    </button>
  );
};

const SectionHeader = ({ number, title }: { number: string; title: string }) => (
  <div className="infra-grid infra-border-b bg-bg-dark/80 backdrop-blur-sm sticky top-0 z-20">
    <div className="col-span-3 md:col-span-2 p-4 infra-border-r h-full flex items-center">
      <span className="data-terminal text-accent-pink">{number}</span>
    </div>
    <div className="col-span-9 md:col-span-10 p-4 flex items-center justify-between">
      <h2 className="font-mono text-[10px] md:text-xs uppercase tracking-widest font-bold truncate pr-4">{title}</h2>
      <ArrowUpRight className="w-4 h-4 opacity-50 shrink-0" />
    </div>
  </div>
);

const PortfolioItem = ({ title, category, videoUrl }: { title: string; category: string; videoUrl: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="col-span-12 md:col-span-6 lg:col-span-4 aspect-square infra-border-r infra-border-b relative group overflow-hidden cursor-none"
    >
      <div className="absolute inset-0 bg-neutral-900 overflow-hidden">
        <video 
          src={videoUrl}
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
        />
      </div>
      <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-bg-dark to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="data-terminal mb-2 font-mono text-accent-pink">{category}</p>
        <h3 className="text-2xl font-black uppercase tracking-tight">{title}</h3>
      </div>
    </motion.div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  desc: string;
  index: number;
  key?: React.Key;
}

const StatCard = ({ label, value, desc, index }: StatCardProps) => {
  const numRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!numRef.current) return;
    
    // Extract number from string (e.g., "$500K" -> 500)
    const match = value.match(/(\d+)/);
    if (!match) return;
    
    const targetValue = parseInt(match[0], 10);
    const prefix = value.split(match[0])[0];
    const suffix = value.split(match[0])[1];

    ScrollTrigger.create({
      trigger: numRef.current,
      start: 'top 80%',
      onEnter: () => {
        const obj = { val: 0 };
        animate(obj, {
          val: targetValue,
          ease: 'outQuart',
          duration: 2000,
          delay: index * 200,
          onUpdate: () => {
            if (numRef.current) {
              numRef.current.innerHTML = `${prefix}${Math.round(obj.val)}${suffix}`;
            }
          }
        });
      }
    });
  }, [value, index]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="col-span-12 sm:col-span-6 lg:col-span-3 p-12 infra-border-r infra-border-b space-y-6 hover:bg-white/[0.02] transition-colors group relative"
    >
      <div className="absolute top-4 right-4 text-[8px] font-mono opacity-20 group-hover:opacity-80 transition-opacity">SYS_STATUS: ACTIVE</div>
      <span className="data-terminal text-accent-yellow">{label}</span>
      <div className="space-y-2">
        <h4 ref={numRef} className="text-4xl font-mono font-bold group-hover:text-accent-yellow transition-colors tracking-tighter">
          {value}
        </h4>
        <p className="text-xs uppercase tracking-widest opacity-40 font-mono">{desc}</p>
      </div>
      <div className="pt-8 flex gap-1">
        {[...Array(12)].map((_, j) => (
          <motion.div 
            key={j} 
            initial={{ scaleY: 0.1 }}
            whileInView={{ scaleY: 1 }}
            className={cn("flex-1 h-2 bg-white/10 origin-bottom", j < (4 + index * 2) && "bg-accent-yellow")} 
            style={{ transitionDelay: `${j * 50}ms` }}
          />
        ))}
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-bg-dark text-white selection:bg-accent-pink overflow-hidden selection:text-white antialiased">
      {/* Infrastructure Lines Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]">
        <div className="infra-grid h-full">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-full infra-border-r last:border-r-0" />
          ))}
        </div>
      </div>

      <nav className="fixed top-0 w-full z-[100] infra-border-b bg-bg-dark/90 backdrop-blur-xl transition-all duration-300">
        <div className="infra-grid">
          {/* Main Bar: Logo & Hamburger */}
          <div className="col-span-6 md:col-span-2 p-4 md:p-6 infra-border-r flex items-center justify-start md:justify-center overflow-hidden">
            <span className="font-black text-xl tracking-tighter uppercase italic whitespace-nowrap">Saypollo</span>
          </div>
          
          {/* Desktop Nav Links */}
          <div className="hidden md:flex md:col-span-8 p-6 items-center justify-between px-12">
            <div className="flex gap-12 font-mono text-[10px] uppercase tracking-widest font-bold">
              <a href="#work" className="hover:text-accent-pink transition-colors">Work</a>
              <a href="#diagnosis" className="hover:text-accent-pink transition-colors">Diagnosis</a>
              <a href="#stats" className="hover:text-accent-pink transition-colors">Performance</a>
              <a href="#contact" className="hover:text-accent-pink transition-colors">Contact</a>
            </div>
          </div>

          <div className="col-span-6 md:col-span-2 p-4 md:p-6 md:infra-border-l flex items-center justify-end md:justify-center pointer-events-auto">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2">
              <span className="data-terminal md:block hidden">System Menu</span>
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Navigation Strip (Visible on mobile only when not in menu) */}
          <div className="col-span-12 md:hidden infra-border-t p-3 bg-white/5 overflow-x-auto">
            <div className="flex justify-between px-2 gap-6 font-mono text-[9px] uppercase tracking-wider font-bold whitespace-nowrap scrollbar-hide">
              <a href="#work" className="hover:text-accent-pink py-1">Work</a>
              <a href="#diagnosis" className="hover:text-accent-pink py-1">Diagnosis</a>
              <a href="#stats" className="hover:text-accent-pink py-1">Performance</a>
              <a href="#contact" className="hover:text-accent-pink py-1">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      <main ref={scrollRef}>
        {/* HERO SECTION */}
        <section className="min-h-screen flex flex-col justify-center pt-32">
          <div className="infra-grid infra-border-b">
            <div className="col-span-12 pt-20 pb-40 px-6 md:px-20">
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-[1px] bg-accent-blue" />
                  <span className="data-terminal text-accent-blue">Saypollo / MOTION INTRASTRUCTURE</span>
                </div>
                <h1 className="text-huge font-black uppercase text-white mb-20 leading-[0.85]">
                  MOTION <br />
                  <span className="text-accent-blue italic">DRIVES</span> <br />
                  SALES.
                </h1>
                
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
                  <div className="max-w-md">
                    <p className="text-xl md:text-2xl text-neutral-400 font-medium leading-tight font-sans">
                      We dismantle the gap between creative expression and performance metrics. 
                      Clinical motion design for modern high-growth brands.
                    </p>
                  </div>
                  <div className="relative group">
                    <a href="https://cal.com/sayanhldr/visual-consultation" target="_blank" rel="noopener noreferrer">
                      <MagneticButton className="bg-accent-pink hover:bg-accent-pink/90 text-white border-none shadow-2xl shadow-accent-pink/20">
                        Start Diagnosis
                      </MagneticButton>
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          <div className="infra-grid infra-border-b py-8 md:py-12 px-6 md:px-20 bg-accent-yellow text-black overflow-hidden whitespace-nowrap">
            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
              className="flex gap-20 items-center font-black text-xl md:text-4xl italic uppercase"
            >
              {[...Array(30)].map((_, i) => (
                <span key={i} className="flex items-center gap-4 flex-shrink-0">
                  PERFORMANCE DRIVEN <Target className="w-6 h-6 md:w-8 md:h-8" /> MOTION DESIGN <Activity className="w-6 h-6 md:w-8 md:h-8" />
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* DIAGNOSIS SECTION (The Gap) */}
        <section id="diagnosis" className="bg-neutral-900/50">
          <SectionHeader number="01" title="The Diagnosis Grid" />
          <div className="infra-grid min-h-screen">
            {/* Left: What they say */}
            <div className="col-span-12 md:col-span-6 infra-border-r p-12 md:p-24 space-y-24">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-accent-orange animate-pulse" />
                  <span className="data-terminal text-accent-orange">Diagnostic: Clinical Sickness</span>
                </div>
                <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-accent-orange leading-none">
                  "WE JUST NEED <br /> BETTER BEAUTY"
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-12">
                {[
                  "Static images aren't converting",
                  "Video ads feel like templates",
                  "Our creative isn't stopping the scroll",
                  "High reach, zero intent"
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.8 }}
                    className="flex items-center gap-6 p-6 infra-border-b border-white/10 group hover:bg-white/5 transition-colors"
                  >
                    <span className="data-terminal text-white/30 font-mono">0{i+1}</span>
                    <p className="font-mono text-sm opacity-60 group-hover:opacity-100 transition-opacity uppercase tracking-wider">{item}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Reality */}
            <div className="col-span-12 md:col-span-6 p-12 md:p-24 space-y-24 bg-white text-black relative overflow-hidden">
               {/* Visual Noise Background */}
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-3 h-3 text-black/40" />
                  <span className="data-terminal text-black/50">Treatment: Kinetic Protocol</span>
                </div>
                <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none font-sans">
                  THE REALITY / <br /> KINETIC INTENT
                </h3>
              </div>
              <div className="space-y-12 relative z-10">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="p-10 border-[0.5px] border-black/20 rounded-2xl space-y-8 bg-neutral-50/50 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4">
                    <Layers className="w-12 h-12 text-accent-blue" />
                    <div className="h-[1px] flex-1 bg-black/10" />
                  </div>
                  <p className="text-2xl md:text-3xl font-black leading-[1.1] uppercase tracking-tight">
                    Your motion must be algorithmic. 
                    Every frame must combat inertia.
                  </p>
                  <p className="text-neutral-500 font-medium leading-relaxed">
                    We don't make videos; we engineer scroll-stopping assets that direct dopamine toward your checkout button.
                  </p>
                </motion.div>
                <div className="flex gap-4 h-48 items-end">
                  {[...Array(8)].map((_, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ height: 0 }}
                      whileInView={{ height: `${20 + Math.random() * 80}%` }}
                      transition={{ duration: 1, delay: i * 0.05, ease: 'circOut' }}
                      className="flex-1 bg-accent-blue/10 flex items-end relative overflow-hidden"
                    >
                       <div className="w-full bg-accent-pink absolute bottom-0 transition-all duration-1000" style={{ height: '40%' }} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PORTFOLIO GRID */}
        <section id="work">
          <SectionHeader number="02" title="The window-pane vault" />
          <div className="infra-grid">
            <PortfolioItem 
              title="AER / STRATOS" 
              category="3D MOTION / PRODUCT" 
              videoUrl="https://assets.mixkit.co/videos/preview/mixkit-abstract-cubes-forming-a-smooth-landscape-32688-large.mp4" 
            />
            <PortfolioItem 
              title="NEON / FLUX" 
              category="DYNAMIC UI / WEB" 
              videoUrl="https://assets.mixkit.co/videos/preview/mixkit-futuristic-digital-background-with-lines-and-dots-in-blue-24011-large.mp4" 
            />
            <PortfolioItem 
              title="KINETIC / CORE" 
              category="SOCIAL / AD-TECH" 
              videoUrl="https://assets.mixkit.co/videos/preview/mixkit-colorful-moving-waves-of-colored-smoke-2342-large.mp4" 
            />
            <PortfolioItem 
              title="VOX / ENGINE" 
              category="IDENTITY / BRAND" 
              videoUrl="https://assets.mixkit.co/videos/preview/mixkit-abstract-geometric-shimmering-background-40010-large.mp4" 
            />
            <PortfolioItem 
              title="HEX / GRID" 
              category="INFRASTRUCTURE / B2B" 
              videoUrl="https://assets.mixkit.co/videos/preview/mixkit-digital-data-screen-with-numbers-and-lines-27083-large.mp4" 
            />
             <PortfolioItem 
              title="PULSE / ZERO" 
              category="FINTECH / CRYPTO" 
              videoUrl="https://assets.mixkit.co/videos/preview/mixkit-liquid-motion-graphics-background-2349-large.mp4" 
            />
          </div>
        </section>

        {/* ECONOMIC PROFILES / STATS */}
        <section id="stats" className="bg-neutral-950">
          <SectionHeader number="03" title="Economic Profiles" />
          <div className="infra-grid">
            {([
              { label: "Target Alpha", value: "$500K", desc: "Starting Ad Spend Range" },
              { label: "LTV Optimization", value: "320%", desc: "Average Performance Lift" },
              { label: "Velocity", value: "72 Hours", desc: "Concept to Production" },
              { label: "Retention", value: "98%", desc: "Quarterly Client Loyalty" }
            ] as const).map((stat, i) => (
              <StatCard 
                key={`stat-${i}`} 
                label={stat.label} 
                value={stat.value} 
                desc={stat.desc} 
                index={i} 
              />
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer id="contact" className="py-40 bg-bg-dark border-t border-white/5 relative overflow-hidden">
          {/* Background Text Grid */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.015] flex items-center justify-center">
            <h2 className="text-[50vw] font-black uppercase tracking-tighter whitespace-nowrap">Saypollo</h2>
          </div>

          <div className="container mx-auto px-6 md:px-20 relative z-10">
            <div className="space-y-24 mb-40">
              <div className="col-span-12">
                <h2 className="text-huge font-black uppercase leading-[0.85] tracking-tighter">
                  READY TO <br />
                  <span className="text-accent-pink italic">CONVERT?</span>
                </h2>
              </div>
              
              <div className="grid grid-cols-12 gap-y-20 lg:gap-y-0 pt-12">
                <div className="col-span-12 lg:col-span-7">
                  <div className="flex flex-wrap gap-8 items-center">
                    <a href="https://cal.com/sayanhldr/visual-consultation" target="_blank" rel="noopener noreferrer">
                      <MagneticButton className="bg-white text-black text-xl px-12 py-6 border-none">Talk to us</MagneticButton>
                    </a>
                    <div className="space-y-1">
                      <p className="font-mono text-[10px] opacity-40 max-w-[240px] uppercase leading-relaxed">Join the 12% of brands that actually understand vertical video. Limited slots available for Q3_26.</p>
                      <div className="h-[1px] w-full bg-white/10" />
                      <p className="data-terminal text-[8px] text-accent-pink">Availability: 2 slots left</p>
                    </div>
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-5 lg:infra-border-l lg:pl-20 flex flex-col justify-end space-y-16">
                  <div className="space-y-6">
                    <span className="data-terminal text-white/40 font-mono">Saypollo Headquarters</span>
                    <div className="space-y-2">
                      <p className="text-2xl font-black uppercase leading-tight italic">London / <br /> LDN_SYSTEM_01</p>
                      <p className="text-neutral-500 font-mono text-xs leading-relaxed opacity-60">
                        Silicon Roundabout, EX1 <br />
                        51.5236° N, 0.0850° W
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-8 gap-y-4 font-mono text-[10px] uppercase tracking-widest font-bold">
                    <a href="https://www.instagram.com/saypollo_/" target="_blank" rel="noopener noreferrer" className="hover:text-accent-pink transition-colors underline decoration-white/20 underline-offset-4">Instagram</a>
                    <a href="https://www.facebook.com/profile.php?id=61570999231401" target="_blank" rel="noopener noreferrer" className="hover:text-accent-pink transition-colors underline decoration-white/20 underline-offset-4">Facebook</a>
                    <a href="https://www.linkedin.com/company/saypollo/" target="_blank" rel="noopener noreferrer" className="hover:text-accent-pink transition-colors underline decoration-white/20 underline-offset-4">LinkedIn</a>
                    <a href="https://www.reddit.com/user/Saypollo/" target="_blank" rel="noopener noreferrer" className="hover:text-accent-pink transition-colors underline decoration-white/20 underline-offset-4">Reddit</a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center pt-20 infra-border-t border-white/10 group">
              <p className="data-terminal text-[8px] opacity-40">©2026 Saypollo PERFORMANCE AGENCY / ALL RIGHTS RESERVED / INFRA_VERSION_2.0.4</p>
              <div className="flex items-center gap-2 group-hover:text-accent-pink transition-all duration-500">
                <Zap className="w-4 h-4 fill-current text-white/20 group-hover:text-accent-pink" />
                <span className="data-terminal text-[8px] opacity-40 group-hover:opacity-100">KINETIC_AUTHORITY_VERIFIED</span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[200] bg-accent-blue text-white p-8 md:p-24 overflow-y-auto"
          >
             <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 p-4 hover:bg-black/10 rounded-full transition-colors z-[210]">
              <X size={40} strokeWidth={3} />
            </button>
            <div className="flex flex-col min-h-full justify-between gap-20">
              <div className="space-y-12">
                <span className="data-terminal text-white/60 font-mono">System Directory</span>
                <nav className="flex flex-col gap-4 md:gap-6">
                  {['Work', 'Diagnosis', 'Approach', 'Case Studies', 'Performance', 'Contact'].map((item, i) => (
                    <motion.a 
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      onClick={() => setIsMenuOpen(false)}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.8 }}
                      className="text-6xl md:text-9xl font-black uppercase tracking-tighter hover:italic transition-all inline-block leading-none hover:text-bg-dark"
                    >
                      {item}
                    </motion.a>
                  ))}
                </nav>
              </div>
              
              <div className="infra-grid infra-border-t border-white/20 pt-12 items-end">
                <div className="col-span-12 md:col-span-6 space-y-4">
                  <span className="data-terminal text-white/60">Digital Inquiries</span>
                  <p className="text-3xl font-black uppercase italic tracking-tight">hello@saypollo.com</p>
                </div>
                <div className="col-span-12 md:col-span-6 infra-border-l border-white/20 pl-8 mt-12 md:mt-0 flex flex-col items-end">
                  <p className="max-w-xs text-sm font-bold leading-tight uppercase text-right">
                    Optimizing motion for the world's most aggressive direct-to-consumer organizations.
                  </p>
                  <div className="mt-8 flex gap-4">
                    <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                    <span className="data-terminal animate-pulse">System Online</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
