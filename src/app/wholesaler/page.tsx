"use client";

import { useState, useEffect } from "react";
import { useAppState } from "@/lib/store";
import { Bid } from "@/lib/types";
import CargoOfferCard from "@/components/CargoOfferCard";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

export default function WholesalerDashboard() {
  const { state, dispatch } = useAppState();
  const [activeTab, setActiveTab] = useState<"offers" | "orders">("offers");

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "offers" || hash === "orders") {
        setActiveTab(hash as "offers" | "orders");
      } else {
        setActiveTab("offers");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    if (window.location.hash) handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleTabClick = (tab: "offers" | "orders") => {
    window.location.hash = tab;
  };

  const getAvailableQuantity = (cargoId: string, totalQty: number) => {
    const bidsForCargo = state.bids.filter(b => 
      b.cargoId === cargoId && 
      (b.status === "pending" || b.status === "accepted" || b.status === "delivered" || b.status === "payment_cleared")
    );
    const orderedQty = bidsForCargo.reduce((sum, bid) => sum + bid.requestedQuantityKg, 0);
    return Math.max(0, totalQty - orderedQty);
  };

  // Get cargos that are in emergency mode (available for purchase)
  const emergencyCargosRaw = state.cargos.filter(
    (c) => (c.status === "emergency" || (c.askingPricePerKg !== undefined && c.askingPricePerKg !== null)) && 
           c.status !== "rerouting" && 
           c.status !== "delivered" && 
           c.status !== "spoiled"
  );

  const emergencyCargos = emergencyCargosRaw
    .map(c => ({ ...c, quantityKg: getAvailableQuantity(c.id, c.quantityKg) }))
    .filter(c => c.quantityKg > 0);

  const { user, logout } = useAuth();
  
  // Real orders (accepted bids by this wholesaler)
  const orders = state.bids.filter(
    (b) => b.wholesalerId === user?.name && (b.status === "accepted" || b.status === "delivered" || b.status === "payment_cleared")
  );

  const upcomingCargosRaw = state.cargos.filter(
    (c) => c.status === "warning"
  );

  const upcomingCargos = upcomingCargosRaw
    .map(c => ({ ...c, quantityKg: getAvailableQuantity(c.id, c.quantityKg) }))
    .filter(c => c.quantityKg > 0);

  const totalOffers = emergencyCargos.length + upcomingCargos.length;

  const handleSendBid = (cargoId: string, price: number, qty: number) => {
    const cargo = state.cargos.find(c => c.id === cargoId);
    if (!cargo || !user) return;
    
    const existingBid = state.bids.find(b => b.cargoId === cargoId && b.wholesalerId === user.name);
    
    if (existingBid) {
      // Just update the existing bid if they are countering a counter-offer
      dispatch({ 
        type: "UPDATE_BID_STATUS", 
        bidId: existingBid.id, 
        status: "pending",
        counterPrice: undefined // Reset counter price since wholesaler responded
      });
      // We also need to update offered price, but for demo just status is enough to show pending
    } else {
      const newBid: Bid = {
        id: `bid-${Date.now()}`,
        cargoId: cargoId,
        wholesalerId: user.name, // using name as ID for demo
        wholesalerName: user.name,
        wholesalerLocation: user.location || "Local Operations",
        offeredPricePerKg: price,
        requestedQuantityKg: qty,
        totalValue: price * qty,
        distanceKm: Math.floor(Math.random() * 30) + 5,
        etaMinutes: Math.floor(Math.random() * 45) + 10,
        createdAt: Date.now(),
        expiresAt: Date.now() + 5 * 60000,
        status: "pending"
      };
      dispatch({ type: "ADD_BID", bid: newBid });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] aura-container relative">
      {/* Background Aura */}
      <div className="aura-orb aura-blue w-[80vw] h-[80vh] top-[-20%] left-[-10%]" />
      <div className="aura-orb aura-green w-[60vw] h-[60vh] bottom-[-10%] right-[-10%]" style={{ animationDelay: '-5s' }} />

      {/* ===== TOP BAR ===== */}
      <header className="ios-navbar liquid-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#007AFF]/20 to-[#34C759]/20 border border-[var(--separator)] flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-[#34C759]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold bg-gradient-to-r from-[#007AFF] to-[#34C759] bg-clip-text text-transparent drop-shadow-sm">
                Annapurna
              </p>
              <p className="text-[11px] font-medium text-[var(--text-tertiary)]">Wholesaler Portal</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <span className="badge badge-safe text-[10px] shadow-sm hidden md:inline-flex">● Online</span>

            {/* Notification bell */}
            <button className="relative w-11 h-11 rounded-xl bg-white/50 dark:bg-black/50 border border-[var(--separator)] flex items-center justify-center hover:bg-[var(--fill-secondary)] transition-colors backdrop-blur-md">
              <svg className="w-5 h-5 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              {totalOffers > 0 && (
                <span className="absolute -top-1 -right-1 badge-count animate-pulse-danger shadow-sm">
                  {totalOffers}
                </span>
              )}
            </button>

            {/* User */}
            <div onClick={logout} className="flex items-center gap-3 cursor-pointer hover:bg-[var(--fill-secondary)] p-2 rounded-xl transition-colors group min-h-[44px]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#34C759]/20 to-[#5AC8FA]/20 border border-[var(--separator)] flex items-center justify-center text-sm font-bold text-[#248A3D] group-hover:border-[#FF3B30]/50 group-hover:text-[#FF3B30] shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || "W"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[#FF3B30]">{user?.name || "Wholesaler"}</p>
                <p className="text-xs font-medium text-[var(--text-tertiary)] max-w-[150px] truncate">{user?.location || "Local Operations"}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 relative z-10">
        {/* Hero Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="ios-large-title text-[var(--text-primary)] mb-3 font-extrabold tracking-tight drop-shadow-sm">
            Emergency Cargo Nearby
          </h1>
          <p className="text-[var(--text-secondary)] text-lg md:text-xl font-medium">
            {totalOffers > 0
              ? `${totalOffers} distress shipment${totalOffers > 1 ? "s" : ""} within 50km of your location`
              : "No distress shipments available right now. Check back soon."}
          </p>
        </div>

        {/* Segment Control (Tabs) */}
        <div className="glass liquid-glass rounded-xl p-1 w-full max-w-sm mb-10 mx-auto md:mx-0 flex">
          <button
            onClick={() => handleTabClick("offers")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === "offers" 
                ? "bg-[var(--bg-primary)] shadow-md text-[var(--text-primary)]" 
                : "text-[var(--text-secondary)] hover:bg-[var(--fill-tertiary)]"
            }`}
          >
            Live Offers
            {totalOffers > 0 && (
              <span className="ml-2 badge-count text-[10px]">
                {totalOffers}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabClick("orders")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === "orders" 
                ? "bg-[var(--bg-primary)] shadow-md text-[var(--text-primary)]" 
                : "text-[var(--text-secondary)] hover:bg-[var(--fill-tertiary)]"
            }`}
          >
            My Orders
            <span className="ml-2 text-[var(--text-tertiary)]">({orders.length})</span>
          </button>
        </div>

        {activeTab === "offers" ? (
          <>
            {/* Emergency Offers */}
            {emergencyCargos.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-pulse-dot" />
                  <h2 className="text-sm font-semibold text-[#FF3B30] uppercase tracking-wider">
                    Urgent — Respond Immediately
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {emergencyCargos.map((cargo) => {
                    const existingBid = state.bids.find(b => b.cargoId === cargo.id && b.wholesalerId === user?.name);
                    return (
                    <CargoOfferCard
                      key={cargo.id}
                      cargo={cargo}
                      existingBid={existingBid}
                      distance={12}
                      etaMinutes={18}
                      onAcceptFull={(id) => handleSendBid(id, cargo.askingPricePerKg || Math.round(cargo.estimatedCargoValue / cargo.quantityKg), cargo.quantityKg)}
                      onAcceptPartial={(id, qty) => handleSendBid(id, cargo.askingPricePerKg || Math.round(cargo.estimatedCargoValue / cargo.quantityKg), qty)}
                      onCounterOffer={(id, price, qty) => handleSendBid(id, price, qty)}
                    />
                  )})}
                </div>
              </div>
            )}

            {/* Warning Offers */}
            {upcomingCargos.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#FF9500]" />
                  <h2 className="text-sm font-semibold text-[#FF9500] uppercase tracking-wider">
                    Upcoming — Cold Chain at Risk
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {upcomingCargos.map((cargo) => {
                    const existingBid = state.bids.find(b => b.cargoId === cargo.id && b.wholesalerId === user?.name);
                    return (
                    <CargoOfferCard
                      key={cargo.id}
                      cargo={{...cargo, askingPricePerKg: cargo.askingPricePerKg ?? Math.round(cargo.estimatedCargoValue / cargo.quantityKg)}}
                      existingBid={existingBid}
                      distance={28}
                      etaMinutes={35}
                      onAcceptFull={(id) => handleSendBid(id, cargo.askingPricePerKg || Math.round(cargo.estimatedCargoValue / cargo.quantityKg), cargo.quantityKg)}
                      onAcceptPartial={(id, qty) => handleSendBid(id, cargo.askingPricePerKg || Math.round(cargo.estimatedCargoValue / cargo.quantityKg), qty)}
                      onCounterOffer={(id, price, qty) => handleSendBid(id, price, qty)}
                    />
                  )})}
                </div>
              </div>
            )}

            {/* Empty State */}
            {emergencyCargos.length === 0 && upcomingCargos.length === 0 && (
              <div className="glass liquid-glass p-16 text-center rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-[var(--separator)]">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-[#007AFF]/10 border border-[#007AFF]/20 flex items-center justify-center clay">
                  <svg className="w-12 h-12 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">No Distress Cargo Available</h3>
                <p className="text-base text-[var(--text-secondary)] max-w-lg mx-auto font-medium">
                  All nearby trucks have healthy cold chains right now. You&apos;ll be notified instantly when a distress shipment becomes available within your radius.
                </p>
                <div className="mt-8 inline-block bg-[var(--fill-tertiary)] px-4 py-2 rounded-xl">
                  <p className="text-xs text-[var(--text-tertiary)] font-bold">
                    💡 Tip: Open the Fleet Manager dashboard in another tab and click &quot;Simulate Cold Chain Failure&quot; to see how the marketplace works.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* ===== ORDERS TAB ===== */
          <>
            {/* Desktop Table */}
            <div className="glass liquid-glass rounded-2xl overflow-hidden hidden md:block border border-[var(--separator)] shadow-lg">
              <table className="w-full">
                <thead className="bg-[var(--fill-secondary)]">
                  <tr>
                    <th className="text-left px-6 py-4 text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Cargo</th>
                    <th className="text-left px-6 py-4 text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Quantity</th>
                    <th className="text-left px-6 py-4 text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Price Paid</th>
                    <th className="text-left px-6 py-4 text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Total</th>
                    <th className="text-left px-6 py-4 text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Truck</th>
                    <th className="text-left px-6 py-4 text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Status</th>
                    <th className="text-left px-6 py-4 text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const cargo = state.cargos.find(c => c.id === order.cargoId);
                    return (
                    <tr
                      key={order.id}
                      className="border-b border-[var(--separator)] hover:bg-[var(--fill-secondary)] transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-[var(--text-primary)] capitalize">
                          {cargo?.type || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-[family-name:var(--font-mono)] text-sm font-bold text-[var(--text-secondary)] bg-white/50 dark:bg-black/50 px-2 py-1 rounded-md">
                          {(order.requestedQuantityKg / 1000).toFixed(1)}T
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-[family-name:var(--font-mono)] text-base font-bold text-[#34C759]">
                          ₹{order.offeredPricePerKg}/kg
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-[family-name:var(--font-mono)] text-base font-bold text-[var(--text-primary)]">
                          ₹{order.totalValue.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-[family-name:var(--font-mono)] text-xs font-bold text-[var(--text-tertiary)] bg-[var(--fill-tertiary)] px-2 py-1 rounded">
                          {cargo?.truckPlate || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {order.status === "accepted" ? (
                          <button 
                            onClick={() => dispatch({ type: "UPDATE_BID_STATUS", bidId: order.id, status: "delivered" })}
                            className="skeuomorphic-btn skeuomorphic-primary text-xs w-full py-2"
                          >
                            Mark Received
                          </button>
                        ) : order.status === "delivered" ? (
                          <div className="flex flex-col items-center gap-2">
                            <span className="badge badge-warning w-full text-center block shadow-sm">
                              Payment Pending
                            </span>
                            <button 
                              onClick={() => dispatch({ type: "UPDATE_BID_STATUS", bidId: order.id, status: "payment_cleared" })}
                              className="text-[10px] font-bold text-[#FF9500] hover:text-[var(--text-primary)] underline mt-0.5 transition-colors"
                            >
                              Mark Paid
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="badge badge-safe text-[10px] w-full text-center block shadow-sm">✓ Executed</span>
                            <span className="font-[family-name:var(--font-mono)] text-[9px] font-bold text-[#34C759]">Tx: 0x{order.id.split('-')[1]}...</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        {order.status === "accepted" ? (
                          <span className="font-[family-name:var(--font-mono)] text-sm font-bold text-[#FF9500] animate-pulse">
                            {order.etaMinutes ? `${order.etaMinutes}m` : "Arriving"}
                          </span>
                        ) : (
                          <span className="font-[family-name:var(--font-mono)] text-xs font-bold text-[var(--text-tertiary)]">
                            Delivered
                          </span>
                        )}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-4">
              {orders.map((order) => {
                const cargo = state.cargos.find(c => c.id === order.cargoId);
                return (
                  <div key={order.id} className="ios-card clay p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-[var(--text-primary)] capitalize">
                        {cargo?.type || "Unknown"}
                      </span>
                      {order.status === "accepted" ? (
                        <span className="font-[family-name:var(--font-mono)] text-sm font-bold text-[#FF9500] animate-pulse">
                          ETA: {order.etaMinutes ? `${order.etaMinutes} min` : "Arriving"}
                        </span>
                      ) : (
                        <span className="font-[family-name:var(--font-mono)] text-xs font-bold text-[var(--text-tertiary)]">
                          Delivered
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-[var(--fill-tertiary)] p-2 rounded-lg text-center">
                        <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Qty</p>
                        <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-[var(--text-secondary)] mt-0.5">
                          {(order.requestedQuantityKg / 1000).toFixed(1)}T
                        </p>
                      </div>
                      <div className="bg-[var(--fill-tertiary)] p-2 rounded-lg text-center">
                        <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Price</p>
                        <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-[#34C759] mt-0.5">
                          ₹{order.offeredPricePerKg}/kg
                        </p>
                      </div>
                      <div className="bg-[var(--fill-tertiary)] p-2 rounded-lg text-center">
                        <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Total</p>
                        <p className="font-[family-name:var(--font-mono)] text-sm font-bold text-[var(--text-primary)] mt-0.5">
                          ₹{order.totalValue.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--separator)]">
                      <span className="font-[family-name:var(--font-mono)] text-xs font-bold text-[var(--text-tertiary)] bg-[var(--fill-tertiary)] px-2 py-1 rounded">
                        {cargo?.truckPlate || "Unknown"}
                      </span>
                      {order.status === "accepted" ? (
                        <button 
                          onClick={() => dispatch({ type: "UPDATE_BID_STATUS", bidId: order.id, status: "delivered" })}
                          className="skeuomorphic-btn skeuomorphic-primary text-xs px-4 py-2"
                        >
                          Mark Received
                        </button>
                      ) : order.status === "delivered" ? (
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="badge badge-warning text-center shadow-sm">
                            Payment Pending
                          </span>
                          <button 
                            onClick={() => dispatch({ type: "UPDATE_BID_STATUS", bidId: order.id, status: "payment_cleared" })}
                            className="text-[10px] font-bold text-[#FF9500] hover:text-[var(--text-primary)] underline"
                          >
                            Mark Paid
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="badge badge-safe text-[9px] text-center shadow-sm">✓ Contract Executed</span>
                          <span className="font-[family-name:var(--font-mono)] text-[8px] font-bold text-[#34C759]">Tx: 0x{order.id.split('-')[1]}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Stats Footer */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="clay text-center p-6">
            <p className="font-[family-name:var(--font-mono)] text-3xl font-extrabold text-[#34C759] drop-shadow-sm">{orders.length}</p>
            <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-2">Orders This Month</p>
          </div>
          <div className="clay text-center p-6">
            <p className="font-[family-name:var(--font-mono)] text-3xl font-extrabold text-[#007AFF] drop-shadow-sm">
              ₹{orders.reduce((acc, o) => acc + (o.totalValue * 0.15), 0).toLocaleString("en-IN")}
            </p>
            <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-2">Est. Savings</p>
          </div>
          <div className="clay text-center p-6">
            <p className="font-[family-name:var(--font-mono)] text-3xl font-extrabold text-[#FF9500] drop-shadow-sm">
              {(orders.reduce((acc, o) => acc + o.requestedQuantityKg, 0) / 1000).toFixed(1)}T
            </p>
            <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-2">Food Saved</p>
          </div>
          <div className="clay text-center p-6">
            <p className="font-[family-name:var(--font-mono)] text-3xl font-extrabold text-[#AF52DE] drop-shadow-sm">100%</p>
            <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-2">Acceptance Rate</p>
          </div>
        </div>
      </main>

      {/* Military-Grade Security Badge */}
      <div className="glass rounded-2xl p-4 mx-4 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#34C759]/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-[#34C759]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
        </div>
        <div>
          <p className="text-xs font-bold text-[var(--text-primary)]">Military-Grade Security</p>
          <p className="text-[10px] text-[var(--text-tertiary)]">AES-256 End-to-End Encryption for all manifest & telemetry data</p>
        </div>
        <svg className="w-4 h-4 text-[#34C759] ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
      </div>
    </div>
  );
}
