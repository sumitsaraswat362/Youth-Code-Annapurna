import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { AlertTriangle, MapPin, Activity } from "lucide-react";

export function TrackingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const pathLength = useTransform(scrollYProgress, [0, 0.8], [0, 1]);
  const yParallax1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const yParallax2 = useTransform(scrollYProgress, [0, 1], [100, -50]);

  return (
    <div 
      className="relative w-full h-[150vh] overflow-hidden"
      ref={containerRef}
    >
      {/* Hero Text */}
      <div className="absolute top-24 left-0 w-full text-center z-30 pointer-events-none px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-[var(--text-primary)] drop-shadow-sm"
        >
          Unprecedented <span className="text-[#007AFF]">Visibility.</span>
        </motion.h1>
      </div>

      {/* Cinematic Map Background */}
      <div className="sticky top-0 left-0 w-full h-screen z-0 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1544411047-c491e34a24e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwbWFwJTIwbmlnaHQlMjB2aWV3fGVufDF8fHx8MTc4MTE1NjM2M3ww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Dark Map"
          className="w-full h-full object-cover opacity-10 dark:opacity-40 mix-blend-screen scale-110 [mask-image:linear-gradient(to_bottom,transparent_0%,black_20%,black_80%,transparent_100%)]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)] pointer-events-none" />
        
        {/* Glowing Route Line (SVG) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <svg className="w-full h-full max-w-5xl" viewBox="0 0 800 600" fill="none" preserveAspectRatio="xMidYMid meet">
            {/* Base faded line */}
            <path 
              d="M100,500 Q300,450 400,300 T700,100" 
              stroke="rgba(0, 122, 255, 0.1)" 
              strokeWidth="4" 
              strokeLinecap="round" 
              fill="none" 
            />
            {/* Animated glowing line */}
            <motion.path 
              d="M100,500 Q300,450 400,300 T700,100" 
              stroke="#007AFF" 
              strokeWidth="6" 
              strokeLinecap="round" 
              fill="none" 
              style={{ pathLength }}
              className="drop-shadow-[0_0_15px_rgba(0,122,255,0.5)] dark:drop-shadow-[0_0_15px_rgba(0,122,255,0.8)]"
            />
            {/* Start & End Points */}
            <circle cx="100" cy="500" r="8" fill="#007AFF" className="drop-shadow-[0_0_10px_rgba(0,122,255,1)]" />
            <circle cx="700" cy="100" r="8" fill="#34C759" className="drop-shadow-[0_0_10px_rgba(52,199,89,1)]" />
          </svg>
        </div>

        {/* 3D Parallax UI Widgets */}
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center max-w-[1200px] mx-auto">
          
          {/* Cargo Health Monitor */}
          <motion.div 
            style={{ y: yParallax1 }}
            className="absolute left-[5%] md:left-[20%] top-[30%] md:top-[40%] glass rounded-[32px] p-6 w-[240px] md:w-[280px] pointer-events-auto shadow-[0_20px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[var(--text-primary)] font-bold text-base md:text-lg">Cargo Health</span>
              <Activity className="text-[#34C759] w-4 h-4 md:w-5 md:h-5" />
            </div>
            
            <div className="relative flex items-center justify-center py-4">
              {/* Ring Chart */}
              <svg className="w-28 h-28 md:w-32 md:h-32 transform -rotate-90">
                <circle cx="50%" cy="50%" r="45%" stroke="var(--separator)" strokeWidth="10" fill="none" />
                <motion.circle 
                  cx="50%" cy="50%" r="45%" 
                  stroke="#34C759" 
                  strokeWidth="10" 
                  fill="none" 
                  strokeDasharray="351.85" 
                  strokeDashoffset="351.85"
                  animate={{ strokeDashoffset: 351.85 * 0.02 }} // 98%
                  transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                  className="drop-shadow-[0_0_10px_rgba(52,199,89,0.3)] dark:drop-shadow-[0_0_10px_rgba(52,199,89,0.6)] stroke-round"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)]">98%</span>
                <span className="text-[10px] md:text-xs font-bold uppercase text-[var(--text-tertiary)]">Active</span>
              </div>
            </div>
          </motion.div>

          {/* Temperature Alert Card */}
          <motion.div 
            style={{ y: yParallax2 }}
            className="absolute right-[5%] md:right-[20%] top-[65%] md:top-[60%] glass border border-[#FF3B30]/30 rounded-[32px] p-5 md:p-6 w-[220px] md:w-[260px] pointer-events-auto shadow-[0_20px_40px_rgba(255,59,48,0.05)] dark:shadow-[0_20px_40px_rgba(255,59,48,0.2)] bg-[#FF3B30]/5"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-[#FF3B30]/20 p-2 rounded-full border border-[#FF3B30]/30 flex items-center justify-center">
                <AlertTriangle className="text-[#FF3B30] w-5 h-5" />
              </div>
              <span className="text-[#FF3B30] font-bold text-sm tracking-wide uppercase">Warning</span>
            </div>
            <h3 className="text-[var(--text-primary)] text-xl font-bold mt-3 mb-1">Temp Anomaly</h3>
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">18.5</span>
              <span className="text-[var(--text-secondary)] font-bold text-lg">°C</span>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--separator)] flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)] font-medium">Unit 04 - Reefer</span>
              <span className="text-[var(--text-primary)] font-bold font-mono bg-[var(--fill-secondary)] px-2 py-1 rounded">Action Req</span>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
