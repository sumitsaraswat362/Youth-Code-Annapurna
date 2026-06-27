import { motion } from "motion/react";
import { MouseEvent, useState } from "react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Globe, ShieldAlert, Cpu, Leaf } from "lucide-react";

export function BentoGrid() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <section className="relative py-24 md:py-32 px-6 w-full max-w-7xl mx-auto z-20" id="features">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[var(--text-primary)] mb-4">
          Everything you need. <br/> <span className="text-[var(--text-tertiary)]">Nothing you don't.</span>
        </h2>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 relative"
        onMouseMove={handleMouseMove}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        style={
          {
            "--mouse-x": `${mousePos.x}px`,
            "--mouse-y": `${mousePos.y}px`,
          } as React.CSSProperties
        }
      >
        {/* Spotlight Effect overlay for the whole grid - simplified for React */}
        
        {/* Box 1: Wholesaler Bidding */}
        <motion.div 
          variants={itemVariants}
          className="col-span-1 md:col-span-2 row-span-2 glass bg-black/[0.03] dark:bg-black/0 rounded-[2rem] p-8 relative overflow-hidden group min-h-[400px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
               style={{
                 background: "radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(100,100,100,0.1), transparent 40%)"
               }} 
          />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="max-w-sm">
              <div className="w-12 h-12 bg-[var(--fill-secondary)] rounded-xl flex items-center justify-center mb-6 border border-[var(--separator)] shadow-sm">
                <Globe className="text-[var(--text-primary)] w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Wholesaler Bidding</h3>
              <p className="text-[var(--text-secondary)] font-medium">Connect with local wholesalers. Automated bidding ensures you get the best price for your excess inventory before it spoils.</p>
            </div>
            
            <div className="mt-8 flex gap-4">
              <div className="bg-[var(--fill-secondary)] p-4 rounded-2xl border border-[var(--separator)] backdrop-blur-sm flex-1 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Current Bid</div>
                <div className="text-xl font-bold text-[#34C759]">$4,250.00</div>
              </div>
              <div className="bg-[var(--fill-secondary)] p-4 rounded-2xl border border-[var(--separator)] backdrop-blur-sm flex-1 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Time Left</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">04:12:00</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Box 2: Emergency SOS */}
        <motion.div 
          variants={itemVariants}
          className="col-span-1 glass bg-black/[0.03] dark:bg-black/0 rounded-[2rem] p-8 relative overflow-hidden group min-h-[300px] shadow-[0_20px_50px_rgba(255,59,48,0.05)] dark:shadow-[0_20px_50px_rgba(255,59,48,0.1)]"
        >
           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
               style={{
                 background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,59,48,0.08), transparent 40%)"
               }} 
          />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-[#FF3B30]/10 rounded-xl flex items-center justify-center mb-6 border border-[#FF3B30]/20 shadow-sm">
              <ShieldAlert className="text-[#FF3B30] w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Emergency SOS</h3>
            <p className="text-[var(--text-secondary)] font-medium text-sm">Instant dispatch of backup refrigeration units if your primary system fails mid-transit.</p>
          </div>
        </motion.div>

        {/* Box 3: AI Optimization */}
        <motion.div 
          variants={itemVariants}
          className="col-span-1 glass bg-black/[0.03] dark:bg-black/0 rounded-[2rem] p-8 relative overflow-hidden group min-h-[300px] shadow-[0_20px_50px_rgba(0,122,255,0.05)] dark:shadow-[0_20px_50px_rgba(0,122,255,0.1)]"
        >
           <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
               style={{
                 background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(0,122,255,0.08), transparent 40%)"
               }} 
          />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-[#007AFF]/10 rounded-xl flex items-center justify-center mb-6 border border-[#007AFF]/20 shadow-sm">
              <Cpu className="text-[#007AFF] w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">AI Routing</h3>
            <p className="text-[var(--text-secondary)] font-medium text-sm">Dynamic rerouting based on traffic, weather, and facility wait times.</p>
          </div>
        </motion.div>

        {/* Box 4: Eco Mode */}
        <motion.div 
          variants={itemVariants}
          className="col-span-1 md:col-span-3 glass bg-black/[0.03] dark:bg-black/0 rounded-[2rem] relative overflow-hidden group flex flex-col md:flex-row items-center shadow-[0_20px_50px_rgba(52,199,89,0.05)] dark:shadow-[0_20px_50px_rgba(52,199,89,0.1)]"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
               style={{
                 background: "radial-gradient(1000px circle at var(--mouse-x) var(--mouse-y), rgba(52,199,89,0.06), transparent 40%)"
               }} 
          />
          <div className="p-8 md:w-1/2 relative z-10">
            <div className="w-12 h-12 bg-[#34C759]/10 rounded-xl flex items-center justify-center mb-6 border border-[#34C759]/20 shadow-sm">
              <Leaf className="text-[#34C759] w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Eco-Efficiency</h3>
            <p className="text-[var(--text-secondary)] font-medium">Reduce carbon footprint by optimizing engine idling and temperature compressor cycles automatically.</p>
          </div>
          <div className="md:w-1/2 h-full w-full min-h-[300px] relative">
             <ImageWithFallback 
                src="https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=800" 
                alt="Fresh Produce" 
                className="w-full h-full object-cover opacity-[0.15] dark:opacity-50 absolute inset-0 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] to-transparent" />
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
