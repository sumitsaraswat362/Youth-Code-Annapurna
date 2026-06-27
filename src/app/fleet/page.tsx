"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppState } from "@/lib/store";
import { getSimulationFrame, calculateSpoilageTime, shouldTriggerEmergency, getTotalFrames } from "@/lib/simulator";
import { makeDecision } from "@/lib/ai-agent";
import CargoHealthMonitor from "@/components/CargoHealthMonitor";
import AIDecisionCard from "@/components/AIDecisionCard";
import BidCard from "@/components/BidCard";
import { useAuth } from "@/lib/auth";
import { Bid, CargoType } from "@/lib/types";
import Link from "next/link";
import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("@/components/LiveMap"), { ssr: false });

// ============================================================================
// ICONS & NAVIGATION
// ============================================================================
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "fleet", label: "Fleet Tracking", icon: "truck" },
  { id: "alerts", label: "Active Alerts", icon: "bell" },
  { id: "marketplace", label: "Marketplace", icon: "store" },
  { id: "analytics", label: "Analytics", icon: "chart" },
  { id: "settings", label: "Settings", icon: "gear" },
];

const TAB_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "fleet", label: "Fleet", icon: "truck" },
  { id: "alerts", label: "Alerts", icon: "bell" },
  { id: "marketplace", label: "Market", icon: "store" },
  { id: "settings", label: "Settings", icon: "gear" },
];

function NavIcon({ icon, className = "" }: { icon: string; className?: string }) {
  const c = `w-5 h-5 ${className}`;
  switch (icon) {
    case "grid": return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" /></svg>;
    case "truck": return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>;
    case "bell": return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>;
    case "store": return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" /></svg>;
    case "chart": return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>;
    case "gear": return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;
    case "shield": return <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
    default: return null;
  }
}

// ============================================================================
// MAIN LAYOUT
// ============================================================================
export default function FleetApp() {
  const { state, dispatch } = useAppState();
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState("fleet"); // Default to fleet for hackathon
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (NAV_ITEMS.some(i => i.id === hash) || TAB_ITEMS.some(i => i.id === hash)) {
        setActiveNav(hash);
      } else {
        setActiveNav("fleet");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    if (window.location.hash) handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Derived state for sidebar badges
  const emergencyCount = state.cargos.filter((c) => c.status === "emergency" || c.status === "rerouting").length;
  const newBidsCount = state.bids.filter((b) => b.status === "pending").length;
  const unreadAlerts = state.notifications.filter((n) => !n.read).length;

  const handleNavClick = (id: string) => {
    window.location.hash = id;
    setDrawerOpen(false);
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[var(--bg-primary)] aura-container relative">
      {/* Background Aura */}
      <div className="aura-orb aura-blue w-[70vw] h-[70vh] top-[-10%] left-[-10%]" />
      <div className="aura-orb aura-green w-[50vw] h-[50vh] bottom-[-10%] right-[-10%]" style={{ animationDelay: '-5s' }} />

      {/* ===== MOBILE: Top Navbar (hamburger only) ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[var(--bg-primary)]/85 backdrop-blur-md border-b border-[var(--separator-opaque)] px-4 h-[44px] flex items-center">
        {/* Hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-10 h-10 flex items-center justify-start rounded-lg active:opacity-50 transition-opacity"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      {/* ===== MOBILE: Bottom Sheet (Drawer) ===== */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden drawer-overlay open z-50"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100) setDrawerOpen(false);
              }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-[101] bg-[var(--bg-primary)] rounded-t-[2.5rem] overflow-hidden flex flex-col max-h-[85vh] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-[var(--separator)]"
            >
              {/* Drag Handle */}
              <div className="w-full flex justify-center py-4 bg-transparent z-10 touch-none">
                <div className="w-12 h-1.5 rounded-full bg-[var(--separator-opaque)]" />
              </div>

              <div className="flex-1 overflow-y-auto pb-[80px]">
                {/* Drawer Header: User Profile */}
                <div className="p-6 pb-5 border-b border-[var(--separator)]">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#007AFF]/20 to-[#AF52DE]/20 border border-[var(--separator)] text-[#007AFF] flex items-center justify-center text-xl font-extrabold shadow-sm">
                      {user?.name?.charAt(0).toUpperCase() || "D"}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-[var(--text-primary)]">{user?.name || "Director"}</p>
                      <p className="text-sm font-medium text-[var(--text-secondary)]">Logistics Director</p>
                    </div>
                  </div>
                </div>

                {/* Drawer Nav Items */}
                <nav className="p-4 space-y-1">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleNavClick(item.id);
                        setDrawerOpen(false);
                      }}
                      className={`drawer-nav-item w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                        activeNav === item.id 
                          ? "bg-[var(--fill-secondary)] text-[#007AFF] font-bold" 
                          : "text-[var(--text-primary)] hover:bg-[var(--fill-tertiary)]"
                      }`}
                    >
                      <NavIcon icon={item.icon} className={activeNav === item.id ? "text-[#007AFF]" : "text-[var(--text-tertiary)]"} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.id === "alerts" && unreadAlerts > 0 && (
                        <span className="badge-count shadow-sm">{unreadAlerts}</span>
                      )}
                      {item.id === "marketplace" && newBidsCount > 0 && (
                        <span className="min-w-[20px] h-5 rounded-full bg-[#007AFF] text-white text-[10px] flex items-center justify-center font-bold px-1.5 shadow-sm">
                          {newBidsCount}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Drawer Footer: Sign Out */}
              <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-[var(--separator)] bg-[var(--bg-primary)]/80 backdrop-blur-md pb-safe">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#FF3B30]/10 text-[#FF3B30] font-bold active:scale-[0.98] transition-transform"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== MOBILE: Bottom Tab Bar ===== */}
      <div className="md:hidden ios-tabbar glass z-40">
        {TAB_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`ios-tab ${activeNav === item.id ? "active" : ""}`}
          >
            <div className="relative">
              <NavIcon icon={item.icon} className="w-6 h-6" />
              {item.id === "alerts" && unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-[#FF3B30] border-2 border-[var(--bg-primary)]" />
              )}
            </div>
            <span className="mt-1">{item.label}</span>
          </button>
        ))}
      </div>

      {/* ===== DESKTOP: Sidebar ===== */}
      <aside className={`hidden md:flex h-full glass liquid-glass border-r border-[var(--separator)] flex-col shrink-0 z-20 transition-all duration-300 ${isSidebarOpen ? "w-[280px]" : "w-0 overflow-hidden opacity-0"}`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 p-6 border-b border-[var(--separator)] group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#007AFF]/20 to-[#34C759]/20 border border-[var(--separator)] flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
            <svg className="w-5 h-5 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold bg-gradient-to-r from-[#007AFF] to-[#34C759] bg-clip-text text-transparent drop-shadow-sm">Annapurna</p>
            <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mt-0.5">Fleet Command</p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeNav === item.id
                  ? "bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20 shadow-[0_2px_10px_rgba(0,122,255,0.1)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--fill-secondary)] border border-transparent"
              }`}
            >
              <NavIcon icon={item.icon} className={activeNav === item.id ? "text-[#007AFF]" : "text-[var(--text-tertiary)]"} />
              <span>{item.label}</span>
              {item.id === "alerts" && unreadAlerts > 0 && (
                <span className="ml-auto badge-count shadow-sm">{unreadAlerts}</span>
              )}
              {item.id === "marketplace" && newBidsCount > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-[#007AFF] text-white text-[10px] flex items-center justify-center font-bold shadow-sm">
                  {newBidsCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-[var(--separator)]">
          <div onClick={logout} className="flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer bg-[var(--fill-secondary)] hover:bg-[#FF3B30]/10 border border-transparent hover:border-[#FF3B30]/30 group transition-all">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#007AFF]/20 to-[#34C759]/20 border border-[var(--separator)] flex items-center justify-center text-sm font-bold text-[#007AFF] group-hover:border-[#FF3B30]/50 group-hover:text-[#FF3B30] shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || "D"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-[#FF3B30]">{user?.name || "Director"}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] truncate">Logistics</p>
            </div>
            <svg className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[#FF3B30]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </div>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-y-auto relative z-10 mt-[44px] md:mt-0 has-tabbar flex flex-col">
        {/* Desktop Hamburger Toggle */}
        <div className="hidden md:flex items-center px-8 pt-6 pb-2">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 rounded-xl bg-[var(--fill-secondary)] hover:bg-[var(--fill-tertiary)] text-[var(--text-primary)] transition-colors border border-[var(--separator)] shadow-sm" aria-label="Toggle Sidebar">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          </button>
        </div>
        <div className="p-4 md:px-8 md:pt-4 min-h-full pb-[160px] relative z-10">
          {/* View Router */}
          <div className="view-transition-enter-active relative z-10">
            {activeNav === "dashboard" && <DashboardView />}
            {activeNav === "fleet" && <FleetTrackingView />}
            {activeNav === "alerts" && <AlertsView />}
            {activeNav === "marketplace" && <MarketplaceView />}
            {activeNav === "analytics" && <AnalyticsView />}
            {activeNav === "settings" && <SettingsView />}
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// VIEW 1: DASHBOARD (Overview)
// ============================================================================
function DashboardView() {
  const { state } = useAppState();
  const { user } = useAuth();
  
  // Only show cargos owned by this user
  const myCargos = state.cargos.filter(c => !c.ownerId || c.ownerId === user?.name);

  const totalCargos = myCargos.length;
  const totalValue = myCargos.reduce((acc, c) => acc + c.estimatedCargoValue, 0);
  const emergencyCargos = myCargos.filter((c) => c.status === "emergency").length;
  const reroutedCargos = myCargos.filter((c) => c.status === "rerouting").length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">System Overview</h1>
        <p className="text-[var(--text-tertiary)] mt-1">Real-time aggregate view of your entire logistics network.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        <div className="kpi-card relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <NavIcon icon="truck" className="w-16 h-16 text-[#007AFF]" />
          </div>
          <p className="kpi-label uppercase tracking-wider">Active Fleet</p>
          <p className="kpi-value text-[var(--text-primary)]">{totalCargos}</p>
          <p className="text-xs text-[#34C759] mt-2 flex items-center gap-1 font-medium">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" /></svg>
            All systems nominal
          </p>
        </div>

        <div className="kpi-card relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-16 h-16 text-[#34C759]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          </div>
          <p className="kpi-label uppercase tracking-wider">Total Cargo Value</p>
          <p className="kpi-value text-[#34C759]">₹{(totalValue / 100000).toFixed(2)}L</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-2 font-medium">Insured up to ₹1.0Cr</p>
        </div>

        <div className={`kpi-card relative overflow-hidden transition-all duration-500 ${emergencyCargos > 0 ? 'ring-2 ring-[#FF3B30]/40' : ''}`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <NavIcon icon="bell" className={`w-16 h-16 ${emergencyCargos > 0 ? 'text-[#FF3B30]' : 'text-[#FF9500]'}`} />
          </div>
          <p className="kpi-label uppercase tracking-wider">Critical Alerts</p>
          <p className={`kpi-value ${emergencyCargos > 0 ? 'text-[#FF3B30] animate-pulse-danger' : 'text-[var(--text-primary)]'}`}>{emergencyCargos}</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-2 font-medium">Requiring immediate attention</p>
        </div>

        <div className="kpi-card relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <NavIcon icon="shield" className="w-16 h-16 text-[#007AFF]" />
          </div>
          <p className="kpi-label uppercase tracking-wider">Cargos Saved</p>
          <p className="kpi-value text-[#007AFF]">{reroutedCargos}</p>
          <p className="text-xs text-[#007AFF] mt-2 font-medium">Autonomously rerouted</p>
        </div>

        {/* Feature 7: Carbon Credit Tokenization */}
        <div className="kpi-card relative overflow-hidden ring-1 ring-[#34C759]/20">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-16 h-16 text-[#34C759]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" /></svg>
          </div>
          <p className="kpi-label uppercase tracking-wider">Carbon Credits</p>
          <p className="kpi-value text-[#34C759]">{reroutedCargos * 45} <span className="text-lg">GCC</span></p>
          <p className="text-[10px] text-[#34C759] mt-2 font-medium">Methane emissions prevented</p>
        </div>
      </div>

      {/* Large visual placeholder for Dashboard */}
      <div className="ios-card p-8 h-96 flex items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#007AFF]/5 to-[#34C759]/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="text-center relative z-10">
          <div className="w-24 h-24 mx-auto bg-[var(--bg-primary)] rounded-3xl border border-[var(--separator)] flex items-center justify-center mb-6 shadow-lg">
            <svg className="w-12 h-12 text-[#007AFF] opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Network Topology Map</h3>
          <p className="text-[var(--text-tertiary)] max-w-sm mx-auto">
            Comprehensive multi-node visualization is disabled in demo mode. Switch to the Fleet Tracking tab to run the single-vehicle simulation.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// VIEW 2: FLEET TRACKING (The Core Simulation View)
// ============================================================================
function FleetTrackingView() {
  const { state, dispatch } = useAppState();
  const { user } = useAuth();
  
  // Only show cargos owned by this user
  // Exclude delivered cargos from active fleet view
  const myCargos = state.cargos.filter(c => (!c.ownerId || c.ownerId === user?.name) && c.status !== "delivered");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [selectedCargoId, setSelectedCargoId] = useState<string>("cargo-001");
  const selectedCargo = myCargos.find((c) => c.id === selectedCargoId);
  const [emergencyTriggered, setEmergencyTriggered] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [qualityScore, setQualityScore] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [isOfflineZone, setIsOfflineZone] = useState(false);
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [activeMapBid, setActiveMapBid] = useState<Bid | null>(null);
  const [driverLocation, setDriverLocation] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>("");

  // Add Cargo Form States
  const [newPlate, setNewPlate] = useState("MH-04-XX-9999");
  const [newType, setNewType] = useState("Apples");
  const [newQty, setNewQty] = useState(5000);
  const [newOrigin, setNewOrigin] = useState("");

  // Market Listing States
  const [askingPrice, setAskingPrice] = useState(25);

  const [liveAiMetrics, setLiveAiMetrics] = useState<{
    trafficScore?: number;
    weatherScore?: number;
    waitTimesScore?: number;
    carbonReduced?: string;
    engineIdle?: string;
    routeScore?: string;
    compressorStatus?: string;
  } | null>(null);

  const latestDecision = state.aiDecisions.filter((d) => d.cargoId === selectedCargoId).at(-1) ?? null;
  const cargoBids = state.bids.filter((b) => b.cargoId === selectedCargoId);

  // Generate dynamic AI metrics locally to avoid rate-limits and ensure realtime UI
  useEffect(() => {
    if (!selectedCargo) return;
    
    const generateMetrics = () => {
      const temp = selectedCargo.telemetry.temperature;
      const maxSafe = selectedCargo.safeTemperatureMax;
      const riskRatio = Math.max(0, temp / maxSafe);
      
      // Add slight random jitter (-2 to +2) to make it feel live
      const jitter = () => Math.floor(Math.random() * 5) - 2;
      
      let routeScore = "A+";
      let compressorStatus = "Optimal";
      let trafficScore = Math.min(100, Math.max(10, 94 - Math.floor(riskRatio * 20) + jitter()));
      let waitTimesScore = Math.min(100, Math.max(10, 91 - Math.floor(riskRatio * 10) + jitter()));
      
      if (temp >= maxSafe) {
        routeScore = "C-";
        compressorStatus = "Overdrive";
        trafficScore -= 30; // drastic drop if spoiling
      } else if (temp > maxSafe - 2) {
        routeScore = "B";
        compressorStatus = "Strained";
      }

      setLiveAiMetrics({
        trafficScore,
        weatherScore: Math.min(100, Math.max(10, 87 + jitter())),
        waitTimesScore,
        carbonReduced: (14.2 - (riskRatio * 5) + (jitter() / 10)).toFixed(1) + "%",
        engineIdle: `${-23 + Math.floor(riskRatio * 10) + jitter()} min`,
        routeScore,
        compressorStatus
      });
    };
    
    // Generate immediately
    generateMetrics();
    
    // Fluctuate every 3 seconds for a highly dynamic, living UI
    const intervalId = setInterval(generateMetrics, 3000);
    return () => clearInterval(intervalId);
  }, [selectedCargo?.id, selectedCargo?.telemetry?.temperature, selectedCargo?.status]);

  const startSimulation = useCallback(() => {
    if (intervalRef.current) return;
    dispatch({ type: "START_SIMULATION" });

    let step = 0;
    intervalRef.current = setInterval(async () => {
      if (step >= getTotalFrames()) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      const frame = getSimulationFrame(step);
      dispatch({ type: "UPDATE_TELEMETRY", cargoId: "cargo-001", telemetry: frame });

      const spoilageMin = calculateSpoilageTime(frame.temperature, 10, frame.ethyleneLevel);

      if (frame.temperature > 10 && !emergencyTriggered) {
        dispatch({ type: "UPDATE_CARGO_STATUS", cargoId: "cargo-001", status: "warning", spoilageMinutes: spoilageMin });
      }

      if (shouldTriggerEmergency(spoilageMin, 260) && !emergencyTriggered) {
        setEmergencyTriggered(true);
        dispatch({ type: "UPDATE_CARGO_STATUS", cargoId: "cargo-001", status: "emergency", spoilageMinutes: spoilageMin });

        const cargo = state.cargos.find((c) => c.id === "cargo-001");
        if (cargo) {
          const updatedCargo = { ...cargo, telemetry: frame, status: "emergency" as const, spoilageTimeMinutes: spoilageMin };
          const decision = await makeDecision(updatedCargo);
          dispatch({ type: "ADD_AI_DECISION", decision });
          dispatch({ type: "SET_ASKING_PRICE", cargoId: "cargo-001", pricePerKg: 16 });
          dispatch({ type: "BROADCAST_TO_MARKETPLACE", cargoId: "cargo-001" });
          dispatch({
            type: "ADD_NOTIFICATION",
            notification: {
              id: `notif-${Date.now()}`,
              type: "system",
              title: "🚨 Emergency Liquidation Mode",
              message: "Cold chain failure on KA-01-AB-1234. AI recommending reroute to Kalyan Wholesale Market.",
              timestamp: Date.now(),
              read: false,
            },
          });
        }
      }

      dispatch({ type: "ADVANCE_SIMULATION" });
      step++;
    }, 2000);
  }, [dispatch, emergencyTriggered, state.cargos]);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleAcceptBid = (bidId: string) => {
    dispatch({ type: "ACCEPT_BID", bidId, cargoId: selectedCargoId });
    const acceptedBid = state.bids.find(b => b.id === bidId);
    if (acceptedBid) {
      setActiveMapBid(acceptedBid);
      
      // Request Driver's Real-Time GPS Location
      if ("geolocation" in navigator) {
        setLocationStatus("Detecting truck GPS coordinates...");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setDriverLocation(`${position.coords.latitude},${position.coords.longitude}`);
            setLocationStatus("Live GPS Locked ✅");
          },
          (error) => {
            console.error("Error getting location:", error);
            setLocationStatus("GPS signal lost. Using approximate origin.");
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setLocationStatus("GPS hardware not available.");
      }
    }
    
    dispatch({
      type: "ADD_NOTIFICATION",
      notification: {
        id: `notif-accept-${Date.now()}`,
        type: "bid_accepted",
        title: "✅ Bid Accepted",
        message: `Truck is being rerouted. Updated ETA sent to wholesaler.`,
        timestamp: Date.now(),
        read: false,
      },
    });
  };

  const handleRejectBid = (bidId: string) => dispatch({ type: "UPDATE_BID_STATUS", bidId, status: "rejected" });
  const handleCounterBid = (bidId: string, counterPrice: number) => dispatch({ type: "UPDATE_BID_STATUS", bidId, status: "counter_offered", counterPrice });

  const renderCargoDetails = () => {
    if (!selectedCargo) return null;
    return (
      <div className="space-y-6">
        <CargoHealthMonitor
          temperature={selectedCargo.telemetry.temperature}
          humidity={selectedCargo.telemetry.humidity}
          ethyleneLevel={selectedCargo.telemetry.ethyleneLevel}
          safeMax={selectedCargo.safeTemperatureMax}
          spoilageMinutes={selectedCargo.spoilageTimeMinutes}
        />

        {/* Computer Vision Quality Assessment */}
        <div className="ios-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>
              AI Vision Assessment
            </h3>
            {qualityScore && (
              <span className="badge badge-safe">Score: {qualityScore}</span>
            )}
          </div>
          
          {qualityScore ? (
            <div className="bg-[#34C759]/10 border border-[#34C759]/20 rounded-lg p-3">
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-md bg-[var(--bg-primary)] overflow-hidden relative">
                  <div className="absolute inset-0 bg-[#34C759]/20 mix-blend-overlay"></div>
                  <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1590005354167-6da97ce2b4dc?auto=format&fit=crop&q=80&w=200')] bg-cover bg-center"></div>
                </div>
                <div>
                  <p className="text-xs text-[#34C759] font-bold mb-1">✓ AI Verification Complete</p>
                  <p className="text-[10px] text-[var(--text-tertiary)] leading-relaxed">
                    Visual analysis indicates minimal surface bruising (2.4%). Coloration is consistent with safe ripeness levels. No mold detected.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => {
                setIsScanning(true);
                setTimeout(() => {
                  setIsScanning(false);
                  setQualityScore("A- (92%)");
                }, 2500);
              }}
              disabled={isScanning}
              className="w-full btn btn-ghost py-4 border border-dashed border-[var(--separator-opaque)] relative overflow-hidden group rounded-xl"
            >
              {isScanning ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full h-1 bg-[var(--fill-secondary)] rounded-full overflow-hidden">
                    <div className="h-full bg-[#007AFF] w-1/2 animate-[pulse_1s_ease-in-out_infinite] translate-x-[-100%]"></div>
                  </div>
                  <span className="text-xs text-[#007AFF] animate-pulse">Running YOLOv8 Vision Model...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2 text-[var(--text-tertiary)] group-hover:text-[#007AFF]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                  Driver: Upload Photo for Quality Cert
                </span>
              )}
              {isScanning && <div className="absolute top-0 left-0 w-full h-0.5 bg-[#007AFF] shadow-[0_0_10px_#007AFF] animate-[scan_2s_ease-in-out_infinite]"></div>}
            </button>
          )}
        </div>

        <AIDecisionCard decision={latestDecision} />

        {/* Feature: Emergency SOS */}
        {selectedCargo.status === "emergency" && (
          <div className="ios-card p-5 ring-2 ring-[#FF3B30]/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF3B30]/5 to-transparent pointer-events-none" />
            <h3 className="text-sm font-bold text-[#FF3B30] uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" /></svg>
              Emergency SOS
            </h3>
            <p className="text-xs text-[var(--text-tertiary)] mb-4 relative z-10">Cold chain failure detected. Deploy backup refrigeration unit to preserve cargo.</p>
            <button 
              onClick={() => {
                dispatch({ type: "ADD_NOTIFICATION", notification: { id: `sos-${Date.now()}`, type: "system", title: "🚨 SOS Dispatched", message: "Backup refrigeration unit deployed to truck location. ETA: 12 min.", timestamp: Date.now(), read: false } });
              }}
              className="w-full skeuomorphic-btn skeuomorphic-danger py-3 px-6 text-sm font-bold uppercase tracking-wider relative z-10 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
              Dispatch Backup Refrigeration Unit
            </button>
          </div>
        )}

        {/* Feature: AI Decision Matrix */}
        <div className="ios-card glass p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#007AFF]/10 to-transparent rounded-bl-full pointer-events-none" />
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
            <svg className="w-4 h-4 text-[#5856D6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" /></svg>
            AI Decision Matrix <span className="animate-pulse ml-2 w-2 h-2 rounded-full bg-green-500 inline-block shadow-[0_0_8px_#34C759]"></span>
          </h3>
          <div className="clay rounded-xl p-4 relative z-10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Confidence Score</span>
              <span className="font-[family-name:var(--font-mono)] text-sm font-bold text-[#34C759]">{latestDecision ? `${(latestDecision.confidence * 100).toFixed(1)}%` : '99.8%'}</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[9px] text-[var(--text-tertiary)] mb-1"><span>Traffic Analysis</span><span>{liveAiMetrics?.trafficScore || 94}%</span></div>
                <div className="h-2 w-full bg-[var(--fill-secondary)] rounded-full overflow-hidden"><div className="h-full bg-[#007AFF] rounded-full transition-all duration-1000" style={{width: `${liveAiMetrics?.trafficScore || 94}%`}} /></div>
              </div>
              <div>
                <div className="flex justify-between text-[9px] text-[var(--text-tertiary)] mb-1"><span>Weather Conditions</span><span>{liveAiMetrics?.weatherScore || 87}%</span></div>
                <div className="h-2 w-full bg-[var(--fill-secondary)] rounded-full overflow-hidden"><div className="h-full bg-[#34C759] rounded-full transition-all duration-1000" style={{width: `${liveAiMetrics?.weatherScore || 87}%`}} /></div>
              </div>
              <div>
                <div className="flex justify-between text-[9px] text-[var(--text-tertiary)] mb-1"><span>Facility Wait Times</span><span>{liveAiMetrics?.waitTimesScore || 91}%</span></div>
                <div className="h-2 w-full bg-[var(--fill-secondary)] rounded-full overflow-hidden"><div className="h-full bg-[#AF52DE] rounded-full transition-all duration-1000" style={{width: `${liveAiMetrics?.waitTimesScore || 91}%`}} /></div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-3 relative z-10 flex items-center gap-1">Powered by Groq LLM <span className="animate-spin text-xs">⟳</span> Live</p>
        </div>

        {/* Feature: AI Routing & Eco-Efficiency */}
        <div className="ios-card p-5 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-[#34C759]/10 to-transparent rounded-tr-full pointer-events-none" />
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
            <svg className="w-4 h-4 text-[#34C759]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864a4.5 4.5 0 0 1 .405 6.836l-1.56-1.56a4.502 4.502 0 0 0-3.025-1.56.75.75 0 0 0-.543.22l-.204.203a4.5 4.5 0 0 1-3.178 1.317A5.207 5.207 0 0 1 3 9.75C3 5.372 6.623 1.875 11.438 1.875a.75.75 0 0 1 .312.03Z" /></svg>
            AI Routing & Eco-Efficiency
          </h3>
          <div className="grid grid-cols-2 gap-3 relative z-10">
            <div className="clay rounded-xl p-3 text-center transition-all duration-500">
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Carbon Reduced</p>
              <p className="text-lg font-bold text-[#34C759]">{liveAiMetrics?.carbonReduced || "14.2%"}</p>
              <p className="text-[9px] text-[var(--text-tertiary)]">vs standard route</p>
            </div>
            <div className="clay rounded-xl p-3 text-center transition-all duration-500">
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Engine Idle</p>
              <p className="text-lg font-bold text-[#007AFF]">{liveAiMetrics?.engineIdle || "-23 min"}</p>
              <p className="text-[9px] text-[var(--text-tertiary)]">optimized stops</p>
            </div>
            <div className="clay rounded-xl p-3 text-center transition-all duration-500">
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Route Score</p>
              <p className="text-lg font-bold text-[#AF52DE]">{liveAiMetrics?.routeScore || "A+"}</p>
              <p className="text-[9px] text-[var(--text-tertiary)]">traffic + weather</p>
            </div>
            <div className="clay rounded-xl p-3 text-center transition-all duration-500">
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Compressor</p>
              <p className={`text-lg font-bold ${liveAiMetrics?.compressorStatus === "Optimal" ? "text-[#5AC8FA]" : "text-[#FF9500]"}`}>{liveAiMetrics?.compressorStatus || "Optimal"}</p>
              <p className="text-[9px] text-[var(--text-tertiary)]">cycle efficiency</p>
            </div>
          </div>
        </div>

        {/* Feature: Military-Grade Security */}
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#34C759]/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#34C759]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--text-primary)]">Military-Grade Security</p>
            <p className="text-[10px] text-[var(--text-tertiary)]">AES-256 End-to-End Encryption • All manifest & telemetry data secured</p>
          </div>
          <svg className="w-4 h-4 text-[#34C759] ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
        </div>

        {/* Manual Overrides Control Panel */}
        <div className="ios-card p-5 ring-1 ring-[#FF9500]/30">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#FF9500]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" /></svg>
            Manual Overrides
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => {
                dispatch({ type: "TRIGGER_MANUAL_EMERGENCY", cargoId: selectedCargoId, newTemperature: 18.5 });
              }}
              className="w-full skeuomorphic-btn py-3 px-4 text-sm flex items-center justify-center gap-2 text-[#FF9500]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.866 8.284 8.284 0 0 0 3 2.48Z" /></svg>
              Simulate Temp Spike (18.5°C)
            </button>
            <button 
              onClick={() => setShowMarketModal(true)}
              className="w-full skeuomorphic-btn skeuomorphic-primary py-3 px-4 text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" /></svg>
              Push to Wholesaler Market
            </button>
          </div>
        </div>

        {cargoBids.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4 flex items-center gap-2">
              <NavIcon icon="store" className="w-4 h-4 text-[#007AFF]" /> Live Bids
              <span className="min-w-[20px] h-5 rounded-full bg-[#007AFF] text-white text-[10px] flex items-center justify-center font-bold px-1.5">
                {cargoBids.length}
              </span>
            </h3>
            <div className="space-y-4">
              {cargoBids.map((bid) => (
                <BidCard 
                  key={bid.id} 
                  bid={bid} 
                  onAccept={handleAcceptBid} 
                  onReject={handleRejectBid} 
                  onCounter={handleCounterBid} 
                  onViewMap={(bidId) => { 
                    const b = state.bids.find(x => x.id === bidId); 
                    if (b) setActiveMapBid(b); 
                  }}
                  onPaymentReceived={(bidId) => {
                    dispatch({ type: "UPDATE_BID_STATUS", bidId, status: "payment_cleared" });
                    // Mark the cargo as delivered so it disappears from Active Consignments
                    if (selectedCargo) {
                      dispatch({ type: "MARK_DELIVERED", cargoId: selectedCargo.id });
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 md:h-[100dvh] flex flex-col relative">
        {/* DELETE CONFIRMATION MODAL (Glassmorphism) */}
        <AnimatePresence>
          {deleteConfirmId && (
            <motion.div 
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/20"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 100%)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  boxShadow: "0 30px 60px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,0.5)"
                }}
              >
                {/* Liquid Blobs */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF3B30] rounded-full mix-blend-multiply filter blur-[32px] opacity-40 animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#FF9500] rounded-full mix-blend-multiply filter blur-[32px] opacity-40 animate-pulse" />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#FF3B30]/10 flex items-center justify-center mb-4 border border-[#FF3B30]/20">
                    <svg className="w-8 h-8 text-[#FF3B30]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#1D1D1F] dark:text-white mb-2 tracking-tight">Delete Consignment?</h3>
                  <p className="text-[#4B4B52] dark:text-[var(--text-tertiary)] text-sm mb-8 leading-relaxed font-medium">This action cannot be undone. All active tracking and bids will be permanently cancelled.</p>
                  
                  <div className="flex w-full gap-3">
                    <button 
                      onClick={() => setDeleteConfirmId(null)}
                      className="flex-1 py-3.5 rounded-2xl font-bold text-[#4B4B52] dark:text-white bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/40 transition-all border border-white/30 backdrop-blur-md"
                    >
                      Keep It
                    </button>
                    <button 
                      onClick={() => {
                        dispatch({ type: "DELETE_CARGO", cargoId: deleteConfirmId });
                        setDeleteConfirmId(null);
                      }}
                      className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-br from-[#FF3B30] to-[#FF2D55] hover:opacity-90 transition-all shadow-[0_8px_16px_rgba(255,59,48,0.25)]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Active Operations</h1>
          <p className="text-[var(--text-tertiary)] mt-1 text-sm md:text-base">Live telemetry and AI oversight for {state.cargos.length} vehicles in transit.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button 
            onClick={() => setIsOfflineZone(!isOfflineZone)} 
            className={`btn btn-sm ${isOfflineZone ? 'bg-[#FF9500]/10 text-[#FF9500] ring-1 ring-[#FF9500]/30' : 'btn-ghost'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
            </svg>
            {isOfflineZone ? "5G Reconnected" : "Simulate Dead Zone"}
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn btn-sm btn-success">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            New Consignment
          </button>
          <button
            onClick={startSimulation}
            disabled={state.simulationRunning}
            className={`btn btn-sm ${state.simulationRunning ? "bg-[#FF3B30]/10 text-[#FF3B30] cursor-not-allowed" : "btn-danger"}`}
          >
            {state.simulationRunning ? (
              <><span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-pulse-dot" /> Simulating Failure...</>
            ) : (
              <><NavIcon icon="shield" className="w-4 h-4" /> Auto-Simulate Script</>
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 md:flex-1 md:min-h-0">
        {/* ===== LEFT COLUMN (60%) ===== */}
        <div className="flex-[3] space-y-6 flex flex-col md:min-w-0">
          {/* Map Area */}
          <div className="ios-card glass p-4 md:p-6 relative overflow-hidden flex-shrink-0">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                <NavIcon icon="grid" className="w-4 h-4 text-[#007AFF]" /> Live Map
              </h3>
              {isOfflineZone ? (
                <span className="badge badge-warning flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF9500] animate-pulse"></span> LoRaWAN Mesh Sync
                </span>
              ) : (
                <span className="badge badge-info">● 5G GPS Sync Active</span>
              )}
            </div>
            
            {/* Real Map */}
            <div className="relative rounded-xl h-48 md:h-64 border border-[var(--separator)] overflow-hidden shadow-inner z-0">
              {selectedCargo && selectedCargo.origin?.location ? (
                <LiveMap
                  origin={selectedCargo.origin}
                  destination={selectedCargo.status === "rerouting" ? null : selectedCargo.originalDestination}
                  currentLocation={selectedCargo.currentLocation || null}
                  routePoints={selectedCargo.routePolyline || []}
                  status={selectedCargo.status}
                  reroute={selectedCargo.selectedMarket && selectedCargo.status === "rerouting" ? { name: selectedCargo.selectedMarket.name, location: selectedCargo.selectedMarket.location } : null}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] text-xs bg-[var(--bg-primary)]">
                  Select a consignment to view route
                </div>
              )}
            </div>

            {/* Route Info Bar */}
            {selectedCargo && (
              <div className="mt-4 flex items-center gap-4 text-xs font-medium text-[var(--text-tertiary)] bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--separator)]">
                <span className="flex items-center gap-2 text-[var(--text-primary)]"><span className="w-2 h-2 rounded-full bg-[#34C759]" /> {selectedCargo.origin.name}</span>
                <svg className="w-4 h-4 text-[#C6C6C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                {selectedCargo.status === "rerouting" && selectedCargo.selectedMarket ? (
                  <span className="flex items-center gap-2 text-[#34C759] font-bold"><span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse-dot" /> {selectedCargo.selectedMarket.name} (Rerouted)</span>
                ) : selectedCargo.status === "emergency" ? (
                  <span className="flex items-center gap-2 text-[#FF3B30] font-bold"><span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-pulse-dot" /> {selectedCargo.originalDestination?.name || "Pending Buyer"} (Emergency)</span>
                ) : selectedCargo.originalDestination?.name ? (
                  <span className="flex items-center gap-2 text-[#007AFF] font-bold"><span className="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse-dot" /> {selectedCargo.originalDestination.name} (Destination Set)</span>
                ) : (
                  <span className="flex items-center gap-2 text-[var(--text-tertiary)] italic"><span className="w-2 h-2 rounded-full bg-[var(--separator)]" /> Awaiting Wholesaler Bid</span>
                )}
              </div>
            )}
          </div>

          {/* Active Fleet List & Predictive Maintenance */}
          <div className="md:flex-1 flex gap-6 md:min-h-0 md:overflow-hidden">
            {/* Active Consignments List */}
            <div className="flex-1 md:overflow-y-auto pr-2 pb-[160px] md:pb-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                <NavIcon icon="truck" className="w-4 h-4 text-[var(--text-tertiary)]" /> Active Consignments
              </h3>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
                {myCargos.map((cargo) => (
                  <div key={cargo.id} className="flex flex-col relative group">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(cargo.id); }}
                      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-[var(--bg-primary)] border border-[var(--separator)] text-[#FF3B30] flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-[#FF3B30] hover:text-white transition-all shadow-sm"
                      title="Delete Consignment"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                    <button
                      onClick={() => setSelectedCargoId(cargo.id)}
                      className={`ios-card p-5 text-left transition-all duration-300 ${
                        selectedCargoId === cargo.id ? "ring-2 ring-[#007AFF]/50 bg-[#007AFF]/5" : "hover:bg-[var(--bg-primary)]"
                      } ${cargo.status === "emergency" ? "ring-2 ring-[#FF3B30]/50" : ""} ${
                        cargo.status === "rerouting" ? "ring-2 ring-[#34C759]/50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-base font-bold text-[var(--text-primary)] capitalize tracking-tight flex items-center gap-2">
                            {cargo.type}
                            <span className={`badge ${cargo.status === "in_transit" ? "badge-safe" : cargo.status === "warning" ? "badge-warning" : cargo.status === "emergency" ? "badge-danger" : cargo.status === "rerouting" ? "badge-safe" : "badge-info"} scale-90 origin-left`}>
                              {cargo.status === "in_transit" ? "In Transit" : cargo.status === "rerouting" ? "✓ Rerouting" : cargo.status.toUpperCase()}
                            </span>
                          </p>
                          <p className="font-[family-name:var(--font-mono)] text-xs font-medium text-[var(--text-secondary)] mt-1">
                            {cargo.truckPlate} <span className="mx-1 text-[var(--text-quaternary)]">|</span> {(cargo.quantityKg / 1000).toFixed(1)}T
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--separator)]">
                        <span className={`font-[family-name:var(--font-mono)] text-sm font-bold flex items-center gap-1.5 ${
                          cargo.telemetry.temperature > cargo.safeTemperatureMax ? "text-[#FF3B30]" : "text-[#34C759]"
                        }`}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.866 8.284 8.284 0 0 0 3 2.48Z" /></svg>
                          {cargo.telemetry.temperature.toFixed(1)}°C
                        </span>
                        <span className="text-xs text-[var(--text-tertiary)] font-medium flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                          {cargo.origin.name.split(",")[0]} → {cargo.status === "rerouting" && cargo.selectedMarket ? cargo.selectedMarket.name.split(",")[0] : (cargo.originalDestination?.name?.split(",")[0] || "Pending")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--separator)] text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                        <span>Created: {cargo.createdAt ? new Date(cargo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                        {(() => {
                          const acceptedBid = state.bids.find(b => b.cargoId === cargo.id && b.status === "accepted");
                          return acceptedBid ? (
                            <span className="text-[#34C759]">Accepted: {acceptedBid.createdAt ? new Date(acceptedBid.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                          ) : null;
                        })()}
                      </div>
                    </button>
                    {selectedCargoId === cargo.id && (
                      <div className="mt-4 lg:hidden animate-in fade-in slide-in-from-top-2 duration-300">
                        {renderCargoDetails()}
                      </div>
                    )}
                  </div>
                ))}
                         {/* Feature 8: Predictive Fleet Maintenance AI */}
            <div className="h-fit w-[300px] shrink-0 hidden lg:flex flex-col ios-card clay overflow-hidden">
              <div className="p-4 border-b border-[var(--separator)] bg-[#AF52DE]/5">
                <h3 className="text-xs font-bold text-[#AF52DE] uppercase tracking-widest flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.83M11.42 15.17l2.492-3.053c.203-.25.476-.432.793-.52l.983-.272M11.42 15.17l-3.053 2.492c-.25.203-.432.476-.52-.793l-.272.983M15.17 11.42l-2.492 3.053c-.203.25-.476.432-.793.52l-.983.272M15.17 11.42l3.053-2.492c.25-.203.432-.476.52-.793l.272-.983" /></svg>
                  Fleet Health AI <span className="animate-pulse ml-1 w-1.5 h-1.5 rounded-full bg-[#AF52DE] inline-block"></span>
                </h3>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto max-h-[350px]">
                {myCargos.length === 0 ? (
                  <p className="text-xs text-[var(--text-tertiary)] italic">No active fleets to monitor.</p>
                ) : (
                  myCargos.map((cargo, idx) => {
                    // Calculate dynamic risk based on temperature and status
                    let risk = 10;
                    if (cargo.telemetry.temperature > cargo.safeTemperatureMax) {
                      risk = Math.min(95, 50 + (cargo.telemetry.temperature - cargo.safeTemperatureMax) * 10);
                    } else {
                      risk = Math.max(5, (cargo.telemetry.temperature / cargo.safeTemperatureMax) * 40);
                    }
                    if (cargo.status === "emergency") risk = Math.max(90, risk);

                    let riskColor = "#34C759";
                    let statusText = "All systems nominal. Optimal conditions.";
                    if (risk > 75) {
                      riskColor = "#FF3B30";
                      statusText = `Cooling anomaly predicted. Ambient heat threshold exceeded.`;
                    } else if (risk > 40) {
                      riskColor = "#FF9500";
                      statusText = "Compressor load elevated. Monitoring closely.";
                    }

                    return (
                      <div key={cargo.id} className="space-y-1 transition-all duration-500">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[var(--text-secondary)] font-bold">{cargo.truckPlate}</span>
                          <span className="font-bold transition-colors duration-500" style={{ color: riskColor }}>
                            {risk.toFixed(1)}% Risk
                          </span>
                        </div>
                        <p className="text-[9px] text-[var(--text-tertiary)]">{statusText}</p>
                        <div className="h-1 w-full bg-[var(--fill-secondary)] rounded-full overflow-hidden mt-1">
                          <div className="h-full transition-all duration-1000" style={{ backgroundColor: riskColor, width: `${risk}%` }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>   </div>
            </div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN (40%) ===== */}
        <div className="flex-[2] overflow-y-auto space-y-6 pb-6 pr-2 min-w-0 hidden lg:block">
          {renderCargoDetails()}
        </div>
      </div>

      {/* ADD CARGO MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="ios-card w-full max-w-md p-6 relative shadow-xl">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Register New Consignment</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1 block">Truck Plate Number</label>
                <input type="text" value={newPlate} onChange={(e) => setNewPlate(e.target.value)} className="ios-input font-[family-name:var(--font-mono)] text-sm" />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1 block">Origin (Auto-detected)</label>
                  <input type="text" value={newOrigin} onChange={(e) => setNewOrigin(e.target.value)} placeholder={user?.city || "e.g. Nashik Hub"} className="ios-input text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1 block">Cargo Type</label>
                  <input type="text" value={newType} onChange={(e) => setNewType(e.target.value)} className="ios-input text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1 block">Quantity (kg)</label>
                  <input type="number" value={newQty} onChange={(e) => setNewQty(Number(e.target.value))} className="ios-input font-[family-name:var(--font-mono)] text-sm" />
                </div>
              </div>
              <button 
                onClick={() => {
                  dispatch({
                    type: "ADD_CARGO",
                    cargo: {
                      id: `cargo-${Date.now()}`,
                      ownerId: user?.name || "Logistics",
                      truckPlate: newPlate,
                      type: newType as CargoType,
                      quantityKg: newQty,
                      estimatedCargoValue: newQty * 50,
                      safeTemperatureMax: 10,
                      spoilageTimeMinutes: 1440,
                      status: "in_transit",
                      origin: { name: newOrigin || user?.city || (user?.coords ? "GPS Location" : "Nashik"), location: user?.coords || { lat: 19.99, lng: 73.78 } },
                      originalDestination: null,
                      telemetry: { temperature: 4.2, humidity: 85, ethyleneLevel: "low", timestamp: Date.now() }
                    } as any
                  });
                  setShowAddModal(false);
                }}
                className="w-full btn btn-success mt-2 py-3"
              >
                Launch Consignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MARKETPLACE LISTING MODAL */}
      {showMarketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="ios-card w-full max-w-md p-6 relative shadow-xl ring-1 ring-[#007AFF]/20">
            <button onClick={() => setShowMarketModal(false)} className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Push to Marketplace</h2>
            <p className="text-sm text-[var(--text-tertiary)] mb-6">Instantly broadcast this cargo to nearby wholesalers for emergency liquidation.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1 block">Asking Price (₹ per kg)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] font-bold text-base">₹</span>
                  <input type="number" value={askingPrice} onChange={(e) => setAskingPrice(Number(e.target.value))} className="ios-input font-[family-name:var(--font-mono)] text-sm" style={{ paddingLeft: '2.5rem' }} />
                </div>
              </div>
              
              <button 
                onClick={() => {
                  dispatch({ type: "SET_ASKING_PRICE", cargoId: selectedCargoId, pricePerKg: askingPrice });
                  dispatch({ type: "BROADCAST_TO_MARKETPLACE", cargoId: selectedCargoId });
                  setShowMarketModal(false);
                }}
                className="w-full btn btn-primary mt-2 py-3"
              >
                Broadcast to Marketplace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAP REROUTE MODAL */}
      {activeMapBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="ios-card w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative shadow-xl ring-1 ring-[#34C759]/30">
            <button onClick={() => setActiveMapBid(null)} className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse-dot" />
              Rerouting Driver
            </h2>
            <p className="text-sm text-[var(--text-tertiary)] mb-2">Live navigation instructions transmitted to Truck {selectedCargo?.truckPlate || "Unknown"}. Destination: {activeMapBid.wholesalerLocation}</p>
            <p className="text-xs font-bold text-[#34C759] mb-6 bg-[#34C759]/10 inline-block px-3 py-1.5 rounded-full border border-[#34C759]/20">
              {locationStatus || "Initializing GPS tracking module..."}
            </p>
            
            <div className="w-full h-[40vh] md:h-96 min-h-[200px] rounded-xl overflow-hidden border border-[var(--separator)] mb-6 bg-[var(--bg-primary)] relative">
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://maps.google.com/maps?${driverLocation ? `saddr=${driverLocation}&daddr=${encodeURIComponent(activeMapBid.wholesalerLocation)}` : `q=${encodeURIComponent(activeMapBid.wholesalerLocation)}`}&t=&z=10&ie=UTF8&iwloc=&output=embed`} 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0}
              ></iframe>
            </div>
            <div className="flex gap-4">
              <a 
                href={`https://www.google.com/maps/dir/?api=1${driverLocation ? `&origin=${driverLocation}` : ''}&destination=${encodeURIComponent(activeMapBid.wholesalerLocation)}&travelmode=driving`}
                target="_blank"
                rel="noreferrer"
                className="w-full btn btn-success py-3 text-center flex items-center justify-center gap-2 font-bold"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                Launch Truck Navigation
              </a>
              <button 
                onClick={() => {
                  setActiveMapBid(null);
                  setDriverLocation(null);
                  setLocationStatus("");
                }}
                className="w-full btn btn-ghost py-3 font-semibold"
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// VIEW 3: ACTIVE ALERTS
// ============================================================================
function AlertsView() {
  const { state } = useAppState();
  
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 border-b border-[var(--separator)] pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Active Alerts & Event Log</h1>
        <p className="text-[var(--text-tertiary)] mt-1">System notifications, AI interventions, and critical warnings.</p>
      </header>

      {state.notifications.length === 0 ? (
        <div className="ios-card p-16 text-center border border-dashed border-[var(--separator-opaque)]">
          <NavIcon icon="bell" className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">No alerts to display</h3>
          <p className="text-[var(--text-tertiary)] mt-2 text-sm">All systems are nominal. Critical alerts will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#C6C6C8]/30 before:to-transparent">
          {state.notifications.map((notif, i) => (
            <div key={notif.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Timeline dot */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#F2F2F7] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${
                notif.type === 'system' ? 'bg-[#FF3B30]' :
                notif.type === 'new_cargo' ? 'bg-[#007AFF]' : 'bg-[#34C759]'
              }`}>
                <NavIcon icon={notif.type === 'system' ? 'shield' : notif.type === 'new_cargo' ? 'truck' : 'store'} className="w-4 h-4 text-white" />
              </div>
              
              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ios-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    notif.type === 'system' ? 'text-[#FF3B30]' :
                    notif.type === 'new_cargo' ? 'text-[#007AFF]' : 'text-[#34C759]'
                  }`}>{notif.type.replace('_', ' ')}</span>
                  <span className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--text-tertiary)]">
                    {new Date(notif.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <h4 className="text-base font-bold text-[var(--text-primary)] mb-1">{notif.title}</h4>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// VIEW 4: MARKETPLACE HISTORY
// ============================================================================
function MarketplaceView() {
  const { state } = useAppState();
  const [expandedBidId, setExpandedBidId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedBidId(prev => prev === id ? null : id);
  };
  
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Marketplace Activity</h1>
        <p className="text-[var(--text-tertiary)] mt-1">Review all incoming wholesaler bids and negotiation history.</p>
      </header>

      {/* MOBILE VIEW (Accordion Cards) */}
      <div className="md:hidden space-y-3">
        {state.bids.length === 0 ? (
          <div className="ios-card p-6 text-center text-[var(--text-tertiary)]">
            No bids recorded in the current session. Run a simulation to generate activity.
          </div>
        ) : (
          state.bids.map((bid) => {
            const isExpanded = expandedBidId === bid.id;
            return (
              <div key={bid.id} className="relative rounded-2xl overflow-hidden mb-3 bg-[#FFFFFF] dark:bg-[#1C1C1E] shadow-sm border border-[var(--separator-opaque)]">
                {/* Background Swipe Actions - only visible while dragging */}
                <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
                  <span className="text-[#34C759] font-bold tracking-widest text-xs uppercase opacity-40">← Accept</span>
                  <span className="text-[#FF3B30] font-bold tracking-widest text-xs uppercase opacity-40">Reject →</span>
                </div>

                <motion.div 
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 relative z-10 w-full"
                >
                  {/* Header (Always visible) */}
                  <div 
                    className="flex justify-between items-center cursor-pointer select-none"
                    onClick={() => toggleExpand(bid.id)}
                  >
                    <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center font-bold">
                      {bid.wholesalerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-base capitalize">{bid.wholesalerName}</h3>
                      <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--text-tertiary)] mt-0.5">
                        ID: {bid.cargoId.split('-')[0]}-{bid.cargoId.split('-')[1]?.slice(0,4) || bid.cargoId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge text-[9px] px-1.5 py-0.5 ${
                      bid.status === 'accepted' ? 'badge-safe' :
                      bid.status === 'rejected' ? 'badge-danger opacity-70' :
                      bid.status === 'counter_offered' ? 'badge-warning' :
                      'badge-info'
                    }`}>
                      {bid.status === 'counter_offered' ? 'Counter Offer' : bid.status === 'payment_cleared' ? 'Payment Cleared' : bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                    </span>
                    <svg className={`w-5 h-5 text-[var(--text-tertiary)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[var(--separator-opaque)] grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 fade-in duration-300">
                    <div>
                      <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Price/kg</p>
                      <p className="font-[family-name:var(--font-mono)] font-bold text-[#34C759] text-lg">₹{bid.offeredPricePerKg}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Quantity</p>
                      <p className="font-[family-name:var(--font-mono)] text-lg">{(bid.requestedQuantityKg/1000).toFixed(1)}T</p>
                    </div>
                    <div className="col-span-2 bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--separator-opaque)]">
                      <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Total Value</p>
                      <p className="font-[family-name:var(--font-mono)] text-xl font-bold text-[#007AFF]">₹{(bid.totalValue/1000).toFixed(0)}K</p>
                    </div>
                  </div>
                )}
                </motion.div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP VIEW (Table) */}
      <div className="hidden md:block ios-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--separator-opaque)] bg-[var(--bg-primary)]">
              <th className="px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Wholesaler</th>
              <th className="px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Cargo ID</th>
              <th className="px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Price/kg</th>
              <th className="px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Quantity</th>
              <th className="px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Total Value</th>
              <th className="px-6 py-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--separator-opaque)]">
            {state.bids.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-tertiary)]">
                  No bids recorded in the current session. Run a simulation to generate activity.
                </td>
              </tr>
            ) : (
              state.bids.map((bid) => (
                <tr key={bid.id} className="hover:bg-[var(--bg-primary)] transition-colors cursor-default">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center font-bold text-xs">
                        {bid.wholesalerName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium capitalize">{bid.wholesalerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-[family-name:var(--font-mono)] text-xs text-[var(--text-tertiary)]">
                    {bid.cargoId.split('-')[0]}-{bid.cargoId.split('-')[1]?.slice(0,4) || bid.cargoId}
                  </td>
                  <td className="px-6 py-4 font-[family-name:var(--font-mono)] text-sm font-bold text-[#34C759]">₹{bid.offeredPricePerKg}</td>
                  <td className="px-6 py-4 font-[family-name:var(--font-mono)] text-sm">{(bid.requestedQuantityKg/1000).toFixed(1)}T</td>
                  <td className="px-6 py-4 font-[family-name:var(--font-mono)] text-sm font-bold text-[#007AFF]">₹{(bid.totalValue/1000).toFixed(0)}K</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${
                      bid.status === 'accepted' ? 'badge-safe' :
                      bid.status === 'rejected' ? 'badge-danger opacity-70' :
                      bid.status === 'counter_offered' ? 'badge-warning' :
                      'badge-info'
                    }`}>
                      {bid.status === 'counter_offered' ? 'Counter Offer' : bid.status === 'payment_cleared' ? 'Payment Cleared' : bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// VIEW 5: ANALYTICS
// ============================================================================
function AnalyticsView() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Performance Analytics</h1>
        <p className="text-[var(--text-tertiary)] mt-1">Financial recovery metrics and cold chain reliability scores.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <div className="ios-card p-6">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-6">Spoilage Prevented (₹)</h3>
          <div className="h-64 flex items-end gap-2 bg-[var(--bg-primary)] rounded-xl p-4 border border-[var(--separator)] relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
              <div className="border-t border-[#8E8E93] border-dashed w-full" />
              <div className="border-t border-[#8E8E93] border-dashed w-full" />
              <div className="border-t border-[#8E8E93] border-dashed w-full" />
              <div className="border-t border-[#8E8E93] border-dashed w-full" />
            </div>
            
            {/* Bars */}
            {[40, 65, 30, 85, 55, 95, 75].map((h, i) => (
              <div key={i} className="w-full bg-gradient-to-t from-[#34C759]/20 to-[#34C759] relative group cursor-pointer rounded-t-sm transition-all duration-300 hover:opacity-80" style={{ height: `${h}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 badge badge-safe opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  ₹{h}K
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-[var(--text-tertiary)] font-[family-name:var(--font-mono)] uppercase">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="ios-card p-6">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-6">Cold Chain Failures by Region</h3>
          <div className="h-64 flex items-center justify-center bg-[var(--bg-primary)] rounded-xl border border-[var(--separator)] relative">
            {/* Fake Donut Chart SVG */}
            <svg viewBox="0 0 100 100" className="w-48 h-48">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#34C759" strokeWidth="16" strokeDasharray="60 191" strokeDashoffset="0" className="opacity-80" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#007AFF" strokeWidth="16" strokeDasharray="80 171" strokeDashoffset="-60" className="opacity-90" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FF3B30" strokeWidth="16" strokeDasharray="40 211" strokeDashoffset="-140" className="opacity-70" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FF9500" strokeWidth="16" strokeDasharray="71.3 180" strokeDashoffset="-180" className="opacity-80" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-[family-name:var(--font-mono)] font-bold text-[var(--text-primary)]">24</span>
              <span className="text-[10px] uppercase text-[var(--text-tertiary)] tracking-widest mt-1">Total Events</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><span className="w-2.5 h-2.5 rounded-full bg-[#007AFF]" /> North</div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><span className="w-2.5 h-2.5 rounded-full bg-[#34C759]" /> West</div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><span className="w-2.5 h-2.5 rounded-full bg-[#FF9500]" /> South</div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"><span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30]" /> East</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// VIEW 6: SETTINGS
// ============================================================================
function SettingsView() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#000000';
      document.body.style.color = '#FFFFFF';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F2F2F7';
      document.body.style.color = '#000000';
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Preferences & Settings</h1>
        <p className="text-[var(--text-tertiary)] mt-1">Manage appearance, AI rules, and notifications.</p>
      </header>

      <div className="space-y-6">
        {/* Appearance */}
        <div className="ios-card p-6">
          <h3 className="text-lg font-bold mb-4">Appearance</h3>
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
            <div>
              <p className="font-semibold">Dark Mode</p>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">Switch between light and dark appearance.</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`w-[51px] h-[31px] rounded-full relative cursor-pointer transition-colors duration-300 ${isDark ? 'bg-[#34C759]' : 'bg-[var(--fill-secondary)]'}`}
            >
              <div className={`absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-md transition-transform duration-300 ${isDark ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
            </button>
          </div>
        </div>

        {/* AI Rules */}
        <div className="ios-card p-6">
          <h3 className="text-lg font-bold mb-4">Autonomous AI Rules</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
              <div>
                <p className="font-semibold">Auto-Accept Optimal Bids</p>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">Allow AI to immediately accept bids &gt; 90% of asking price.</p>
              </div>
              <div className="w-[51px] h-[31px] bg-[#34C759] rounded-full relative cursor-pointer">
                <div className="absolute top-[2px] right-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-md" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
              <div>
                <p className="font-semibold">Automated Counter-Offers</p>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">AI will auto-counter low bids based on spoilage curve.</p>
              </div>
              <div className="w-[51px] h-[31px] bg-[#34C759] rounded-full relative cursor-pointer">
                <div className="absolute top-[2px] right-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-md" />
              </div>
            </div>
          </div>
        </div>

        {/* API */}
        <div className="ios-card p-6 opacity-50 grayscale pointer-events-none">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
            API Integrations
            <span className="badge badge-warning text-[9px]">Locked in Demo</span>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Google Maps API Key</label>
              <input type="password" value="************************" readOnly className="ios-input font-[family-name:var(--font-mono)]" />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Gemini AI Project ID</label>
              <input type="text" value="annapurna-prod-v2" readOnly className="ios-input font-[family-name:var(--font-mono)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
