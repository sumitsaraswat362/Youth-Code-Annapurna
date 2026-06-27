import { motion } from "motion/react";
import { Check, Cpu, X } from "lucide-react";

export function BiddingPage() {
  const bids = [
    { id: 1, origin: "Mumbai, MH", dest: "Delhi, DL", weight: "4,800 kg", price: "₹45", total: "₹220K" },
    { id: 2, origin: "Bengaluru, KA", dest: "Chennai, TN", weight: "2,200 kg", price: "₹62", total: "₹136K" },
    { id: 3, origin: "Pune, MH", dest: "Ahmedabad, GJ", weight: "6,500 kg", price: "₹38", total: "₹247K" },
  ];

  return (
    <div className="w-full px-4 md:px-8 max-w-[1400px] mx-auto pb-32">
      {/* Hero Section */}
      <div className="text-center mt-20 mb-20 md:mb-32">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-extrabold tracking-tighter text-[var(--text-primary)] mb-6 drop-shadow-sm"
        >
          The Market,<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#007AFF] to-[#34C759]">
            Evolved.
          </span>
        </motion.h1>
      </div>

      {/* Split Layout Section */}
      <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-start">
        
        {/* Left Pinned Column */}
        <div className="w-full md:w-1/3 sticky top-28 md:top-40 z-20 py-4 md:py-0">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="pr-4"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 md:mb-6 text-[var(--text-primary)]">
              Swipe to <span className="text-[#34C759]">Accept.</span> <br />
              Counter with <span className="text-[#007AFF]">AI.</span>
            </h2>
            <p className="text-[var(--text-secondary)] font-medium text-base md:text-xl hidden md:block">
              Make instant decisions with machine-learning backed pricing models. 
              Drag cards to reject, or hit accept to lock in the contract instantly.
            </p>
          </motion.div>
        </div>

        {/* Right Scrollable Column - Bids Stack */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          {bids.map((bid, index) => (
            <div key={bid.id} className="relative w-full rounded-[32px] bg-[#FF3B30]">
              
              {/* Background Layer (Reject Button) */}
              <div className="absolute inset-0 flex items-center justify-end px-8 z-0">
                <div className="flex flex-col items-center justify-center text-white">
                  <div className="bg-white/20 p-3 rounded-full mb-2">
                    <X className="w-6 h-6" />
                  </div>
                  <span className="font-bold tracking-wide uppercase text-sm">Reject</span>
                </div>
              </div>

              {/* Foreground Layer (Draggable Card) */}
              <motion.div 
                drag="x"
                dragConstraints={{ left: -120, right: 0 }}
                dragElastic={0.1}
                whileTap={{ cursor: "grabbing" }}
                className="relative z-10 glass border border-[var(--separator)] shadow-[0_8px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] rounded-[32px] p-6 md:p-8 cursor-grab bg-[var(--bg-primary)]"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                  
                  {/* Left Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-[var(--fill-secondary)] border border-[var(--separator)] px-3 py-1 rounded-full text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                        Spot Load
                      </span>
                      <span className="text-[var(--text-secondary)] font-medium text-sm">{bid.weight}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex flex-col">
                        <span className="text-[var(--text-primary)] font-bold text-lg">{bid.origin}</span>
                      </div>
                      <div className="h-[3px] flex-1 bg-gradient-to-r from-[#007AFF]/10 via-[#007AFF] to-[#007AFF]/10 mx-2 relative rounded-full">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#007AFF] rounded-full shadow-[0_0_8px_rgba(0,122,255,0.8)]" />
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[var(--text-primary)] font-bold text-lg">{bid.dest}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Info (Pricing & Actions) */}
                  <div className="flex flex-col items-start md:items-end gap-4 md:pl-8 md:border-l border-[var(--separator)]">
                    <div className="flex flex-col items-start md:items-end font-mono">
                      <span className="text-[var(--text-secondary)] font-medium text-sm mb-1">Price/kg: <span className="text-[var(--text-primary)] font-bold">{bid.price}</span></span>
                      <span className="text-[#34C759] text-3xl font-extrabold tracking-tighter">
                        {bid.total}
                      </span>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[var(--fill-secondary)] hover:bg-[var(--fill-tertiary)] border border-[var(--separator)] rounded-full px-5 py-2.5 text-sm font-bold text-[var(--text-primary)] transition-colors shadow-sm">
                        <Cpu className="w-4 h-4 text-[#007AFF]" />
                        Counter
                      </button>
                      <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#34C759] hover:bg-[#2fb350] rounded-full px-5 py-2.5 text-sm font-bold text-white transition-colors shadow-sm border border-[#34C759]/20">
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
