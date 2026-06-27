import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Network, Battery, WifiOff, CloudLightning, ShieldCheck, Activity } from "lucide-react";

export function FeaturesPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <div className="w-full px-4 md:px-8 max-w-[1400px] mx-auto pb-24 relative" ref={containerRef}>
      {/* Hero Section */}
      <div className="text-center mt-20 mb-20 md:mb-32 relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-[var(--text-primary)] mb-6 drop-shadow-sm"
        >
          Everything you need. <br />
          <span className="text-[var(--text-tertiary)]">Nothing you don't.</span>
        </motion.h1>
      </div>

      {/* Bento Box Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-auto md:auto-rows-[340px] relative z-10">
        {/* Box 1: Large Square */}
        <motion.div 
          style={{ y: y1 }}
          className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[40px] glass bg-black/[0.03] dark:bg-black/0 p-8 md:p-12 flex flex-col justify-end min-h-[400px] md:min-h-0 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1777589019384-9aa6c16e353d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW1pJTIwdHJ1Y2slMjBkYXJrJTIwbW9vZHl8ZW58MXx8fHwxNzgxMTU2MzMyfDA&ixlib=rb-4.1.0&q=80&w=1080" 
              alt="3D Simulation of a Truck"
              className="w-full h-full object-cover opacity-10 dark:opacity-30 transition-transform duration-700 group-hover:scale-105 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/50 to-transparent" />
          </div>
          
          <div className="relative z-10">
            <div className="bg-[#007AFF]/10 dark:bg-[#007AFF]/20 w-14 h-14 rounded-full flex items-center justify-center mb-6 border border-[#007AFF]/20 shadow-sm">
              <WifiOff className="w-6 h-6 text-[#007AFF]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[var(--text-primary)]">Offline 5G Deadzone Syncing</h2>
            <p className="text-[var(--text-secondary)] font-medium text-lg max-w-md">
              Continuous operations even in zero-connectivity areas. Our local cache syncs the millisecond your fleet reconnects to a tower.
            </p>
          </div>
        </motion.div>

        {/* Box 2: Tall Rectangle */}
        <motion.div 
          style={{ y: y2 }}
          className="md:col-span-1 md:row-span-2 relative group overflow-hidden rounded-[40px] glass bg-black/[0.03] dark:bg-black/0 p-8 flex flex-col justify-between min-h-[400px] md:min-h-0 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1517026575980-3e1e2dedeab4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNlJTIwZGFzaGJvYXJkJTIwZGFya3xlbnwxfHx8fDE3ODExNTYzMzR8MA&ixlib=rb-4.1.0&q=80&w=1080" 
              alt="Financial Dashboard"
              className="w-full h-full object-cover opacity-[0.05] dark:opacity-20 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/20 via-[var(--bg-primary)]/60 to-[var(--bg-primary)]" />
          </div>
          
          <div className="relative z-10 mt-auto">
            <div className="flex items-center space-x-2 mb-4 bg-[#34C759]/10 w-fit px-3 py-1.5 rounded-full border border-[#34C759]/20">
              <span className="flex h-2 w-2 rounded-full bg-[#34C759] animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#34C759]">Live ROI Tracker</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-[var(--text-primary)]">Financial Overview</h2>
            <p className="text-[var(--text-secondary)] font-medium text-base">
              Predictive cost modeling combined with real-time fuel efficiency data.
            </p>
          </div>
        </motion.div>

        {/* Box 3: Wide Rectangle */}
        <motion.div 
          className="md:col-span-2 md:row-span-1 relative overflow-hidden rounded-[40px] glass bg-black/[0.03] dark:bg-black/0 p-8 flex flex-col md:flex-row items-center gap-8 min-h-[300px] md:min-h-0 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1557264337-e8a93017fe92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhdGElMjB2aXN1YWxpemF0aW9uJTIwZGFya3xlbnwxfHx8fDE3ODExNTYzMzd8MA&ixlib=rb-4.1.0&q=80&w=1080" 
              alt="AI Matrix"
              className="w-full h-full object-cover opacity-[0.03] dark:opacity-10 mix-blend-overlay"
            />
          </div>

          <div className="flex-1 relative z-10">
            <div className="bg-[var(--fill-secondary)] w-12 h-12 rounded-full flex items-center justify-center mb-4 border border-[var(--separator)] shadow-sm">
              <Network className="w-6 h-6 text-[var(--text-primary)]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-[var(--text-primary)]">AI Decision Matrix</h2>
            <p className="text-[var(--text-secondary)] font-medium">
              Machine learning models analyze over 100 data points per second to reroute fleets and optimize loads dynamically.
            </p>
          </div>
          <div className="flex-1 w-full relative z-10">
             <div className="bg-[var(--fill-secondary)] border border-[var(--separator)] rounded-2xl p-4 backdrop-blur-xl shadow-lg">
               <div className="flex justify-between items-center mb-3 border-b border-[var(--separator)] pb-3">
                 <span className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider">CONFIDENCE SCORE</span>
                 <span className="text-sm text-[#34C759] font-bold">99.8%</span>
               </div>
               <div className="space-y-3">
                 <div className="h-2 w-full bg-[var(--fill-tertiary)] rounded-full overflow-hidden shadow-inner">
                   <motion.div initial={{ width: 0 }} whileInView={{ width: "85%" }} className="h-full bg-[#007AFF] rounded-full" />
                 </div>
                 <div className="h-2 w-full bg-[var(--fill-tertiary)] rounded-full overflow-hidden shadow-inner">
                   <motion.div initial={{ width: 0 }} whileInView={{ width: "62%" }} className="h-full bg-[#34C759] rounded-full" />
                 </div>
                 <div className="h-2 w-full bg-[var(--fill-tertiary)] rounded-full overflow-hidden shadow-inner">
                   <motion.div initial={{ width: 0 }} whileInView={{ width: "93%" }} className="h-full bg-purple-500 rounded-full" />
                 </div>
               </div>
             </div>
          </div>
        </motion.div>

        {/* Box 4: Small */}
        <motion.div 
          className="md:col-span-1 md:row-span-1 relative overflow-hidden rounded-[40px] glass bg-black/[0.03] dark:bg-black/0 p-8 flex flex-col justify-between min-h-[300px] md:min-h-0 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="bg-[var(--fill-secondary)] w-12 h-12 rounded-full flex items-center justify-center mb-4 border border-[var(--separator)] shadow-sm">
            <ShieldCheck className="w-6 h-6 text-[var(--text-primary)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2 text-[var(--text-primary)]">Military-Grade Security</h2>
            <p className="text-[var(--text-secondary)] font-medium text-sm">
              End-to-end encryption for all manifest and telemetry data.
            </p>
          </div>
        </motion.div>

        {/* Box 5: Full Width */}
        <motion.div 
          className="md:col-span-3 md:row-span-1 relative overflow-hidden rounded-[40px] glass bg-black/[0.03] dark:bg-black/0 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 min-h-[200px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-[var(--text-primary)]">Automated Compliance</h2>
            <p className="text-[var(--text-secondary)] font-medium">
              Instantly generate digital logs, weight station documents, and border-crossing manifests.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--fill-secondary)] border border-[var(--separator)] flex items-center justify-center shadow-sm">
              <CloudLightning className="w-8 h-8 text-[#007AFF]" />
            </div>
            <div className="w-16 h-16 rounded-full bg-[var(--fill-secondary)] border border-[var(--separator)] flex items-center justify-center shadow-sm">
              <Activity className="w-8 h-8 text-[#34C759]" />
            </div>
            <div className="w-16 h-16 rounded-full bg-[var(--fill-secondary)] border border-[var(--separator)] flex items-center justify-center shadow-sm">
              <Battery className="w-8 h-8 text-[var(--text-primary)]" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
