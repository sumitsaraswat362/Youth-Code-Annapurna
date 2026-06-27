// ============================================================
// ANNAPURNA — Global State Store (React Context + useReducer)
// ============================================================

"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import {
  Cargo,
  Bid,
  TelemetryData,
  AIDecision,
  Notification,
  CargoStatus,
  Market,
} from "./types";
import { supabase } from "./supabase";

// --- State Shape ---
export interface AppState {
  cargos: Cargo[];
  bids: Bid[];
  aiDecisions: AIDecision[];
  notifications: Notification[];
  simulationRunning: boolean;
  simulationStep: number;
}

const initialState: AppState = {
  cargos: [],
  bids: [],
  aiDecisions: [],
  notifications: [],
  simulationRunning: false,
  simulationStep: 0,
};

// --- Actions ---
type Action =
  | { type: "UPDATE_TELEMETRY"; cargoId: string; telemetry: TelemetryData }
  | { type: "UPDATE_CARGO_STATUS"; cargoId: string; status: CargoStatus; spoilageMinutes?: number }
  | { type: "SET_ASKING_PRICE"; cargoId: string; pricePerKg: number }
  | { type: "ADD_AI_DECISION"; decision: AIDecision }
  | { type: "ADD_BID"; bid: Bid }
  | { type: "UPDATE_BID_STATUS"; bidId: string; status: Bid["status"]; counterPrice?: number }
  | { type: "ACCEPT_BID"; bidId: string; cargoId: string }
  | { type: "ADD_NOTIFICATION"; notification: Notification }
  | { type: "MARK_NOTIFICATION_READ"; notificationId: string }
  | { type: "START_SIMULATION" }
  | { type: "ADVANCE_SIMULATION" }
  | { type: "SET_CARGO_REROUTE"; cargoId: string; market: Market }
  | { type: "BROADCAST_TO_MARKETPLACE"; cargoId: string }
  | { type: "ADD_CARGO"; cargo: Cargo }
  | { type: "TRIGGER_MANUAL_EMERGENCY"; cargoId: string; newTemperature: number }
  | { type: "SET_CARGOS"; cargos: Cargo[] }
  | { type: "SET_BIDS"; bids: Bid[] }
  | { type: "MARK_DELIVERED"; cargoId: string }
  | { type: "DELETE_CARGO"; cargoId: string };

// --- Reducer ---
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "UPDATE_TELEMETRY":
      return {
        ...state,
        cargos: state.cargos.map((c) =>
          c.id === action.cargoId ? { ...c, telemetry: action.telemetry } : c
        ),
      };

    case "UPDATE_CARGO_STATUS":
      return {
        ...state,
        cargos: state.cargos.map((c) =>
          c.id === action.cargoId
            ? {
                ...c,
                status: action.status,
                spoilageTimeMinutes: action.spoilageMinutes ?? c.spoilageTimeMinutes,
              }
            : c
        ),
      };

    case "SET_ASKING_PRICE":
      return {
        ...state,
        cargos: state.cargos.map((c) =>
          c.id === action.cargoId
            ? { ...c, askingPricePerKg: action.pricePerKg }
            : c
        ),
      };

    case "ADD_AI_DECISION":
      return {
        ...state,
        aiDecisions: [...state.aiDecisions, action.decision],
      };

    case "ADD_BID":
      return {
        ...state,
        bids: [...state.bids, action.bid],
      };

    case "UPDATE_BID_STATUS":
      return {
        ...state,
        bids: state.bids.map((b) =>
          b.id === action.bidId
            ? {
                ...b,
                status: action.status,
                counterPricePerKg: action.counterPrice,
              }
            : b
        ),
      };

    case "ACCEPT_BID": {
      const acceptedBid = state.bids.find((b) => b.id === action.bidId);
      const targetCargo = state.cargos.find((c) => c.id === action.cargoId);
      if (!acceptedBid || !targetCargo) return state;

      const isPartial = acceptedBid.requestedQuantityKg < targetCargo.quantityKg;

      return {
        ...state,
        bids: state.bids.map((b) =>
          b.id === action.bidId
            ? { ...b, status: "accepted" as const }
            : (!isPartial && b.cargoId === action.cargoId)
            ? { ...b, status: "rejected" as const }
            : b
        ),
        cargos: state.cargos.map((c) =>
          c.id === action.cargoId
            ? {
                ...c,
                quantityKg: Math.max(0, c.quantityKg - acceptedBid.requestedQuantityKg),
                status: isPartial ? c.status : ("rerouting" as const),
                originalDestination: {
                  name: acceptedBid.wholesalerLocation,
                  location: acceptedBid.wholesalerCoords || {
                    lat: c.origin.location.lat - 0.5,
                    lng: c.origin.location.lng - 0.5
                  }
                },
                selectedMarket: isPartial ? c.selectedMarket : (acceptedBid
                  ? {
                      id: acceptedBid.wholesalerId,
                      name: acceptedBid.wholesalerLocation,
                      location: acceptedBid.wholesalerCoords || {
                        lat: c.origin.location.lat - 0.5,
                        lng: c.origin.location.lng - 0.5
                      },
                      distanceKm: acceptedBid.distanceKm,
                      etaMinutes: acceptedBid.etaMinutes,
                      type: "wholesale_market" as const,
                    }
                  : null),
              }
            : c
        ),
      };
    }

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.notification, ...state.notifications],
      };

    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.notificationId ? { ...n, read: true } : n
        ),
      };

    case "START_SIMULATION":
      return { ...state, simulationRunning: true, simulationStep: 0 };

    case "ADVANCE_SIMULATION":
      return { ...state, simulationStep: state.simulationStep + 1 };

    case "SET_CARGO_REROUTE":
      return {
        ...state,
        cargos: state.cargos.map((c) =>
          c.id === action.cargoId
            ? { ...c, selectedMarket: action.market, status: "rerouting" }
            : c
        ),
      };

    case "BROADCAST_TO_MARKETPLACE":
      return {
        ...state,
        notifications: [
          {
            id: `notif-broadcast-${Date.now()}`,
            type: "new_cargo",
            title: "Emergency Cargo Broadcast",
            message: `Distress cargo ${action.cargoId} sent to nearby wholesalers. Awaiting bids.`,
            timestamp: Date.now(),
            read: false,
          },
          ...state.notifications,
        ],
      };

    case "ADD_CARGO":
      return {
        ...state,
        cargos: [action.cargo, ...state.cargos],
        notifications: [
          {
            id: `notif-add-${Date.now()}`,
            type: "system",
            title: "New Consignment Added",
            message: `Truck ${action.cargo.truckPlate} added to active fleet tracking.`,
            timestamp: Date.now(),
            read: false,
          },
          ...state.notifications,
        ],
      };

    case "TRIGGER_MANUAL_EMERGENCY":
      return {
        ...state,
        cargos: state.cargos.map((c) =>
          c.id === action.cargoId
            ? { 
                ...c, 
                status: "emergency", 
                telemetry: { ...c.telemetry, temperature: action.newTemperature } 
              }
            : c
        ),
      };

    case "SET_CARGOS":
      return { ...state, cargos: action.cargos };
      
    case "SET_BIDS":
      return { ...state, bids: action.bids };

    case "MARK_DELIVERED":
      return {
        ...state,
        cargos: state.cargos.map((c) =>
          c.id === action.cargoId
            ? { ...c, status: "delivered" as CargoStatus }
            : c
        ),
      };

    case "DELETE_CARGO":
      return {
        ...state,
        cargos: state.cargos.filter((c) => c.id !== action.cargoId),
      };

    default:
      return state;
  }
}

// --- Context ---
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, { ...initialState, cargos: [], bids: [] });

  React.useEffect(() => {
    // 1. Initial Fetch
    const fetchInitialData = async () => {
      const { data: cargos } = await supabase.from('cargos').select('*').order('created_at', { ascending: false });
      const { data: bids } = await supabase.from('bids').select('*').order('created_at', { ascending: false });
      
      if (cargos) {
        // Map db columns to camelCase
        const mappedCargos = cargos.map(c => ({
          ...c,
          ownerId: c.telemetry?.ownerId,
          truckPlate: c.truck_plate,
          quantityKg: c.quantity_kg,
          estimatedCargoValue: c.estimated_cargo_value,
          safeTemperatureMax: c.safe_temperature_max,
          spoilageTimeMinutes: c.spoilage_time_minutes,
          originalDestination: c.original_destination,
          askingPricePerKg: c.asking_price_per_kg,
          selectedMarket: c.selected_market,
          createdAt: c.created_at
        }));
        dispatch({ type: 'SET_CARGOS', cargos: mappedCargos });
      }
      if (bids) {
        const mappedBids = bids.map(b => ({
          ...b,
          cargoId: b.cargo_id,
          wholesalerId: b.wholesaler_id,
          wholesalerName: b.wholesaler_name,
          wholesalerLocation: b.wholesaler_location,
          offeredPricePerKg: b.offered_price_per_kg,
          requestedQuantityKg: b.requested_quantity_kg,
          totalValue: b.total_value,
          distanceKm: b.distance_km,
          etaMinutes: b.eta_minutes,
          counterPricePerKg: b.counter_price_per_kg,
          expiresAt: b.expires_at ? new Date(b.expires_at).getTime() : Date.now() + 15 * 60000,
          createdAt: b.created_at
        }));
        dispatch({ type: 'SET_BIDS', bids: mappedBids });
      }
    };
    fetchInitialData();

    // 2. Real-time Subscriptions
    const cargoSub = supabase.channel('cargos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cargos' }, fetchInitialData)
      .subscribe();

    const bidSub = supabase.channel('bids-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids' }, fetchInitialData)
      .subscribe();

    return () => {
      supabase.removeChannel(cargoSub);
      supabase.removeChannel(bidSub);
    };
  }, []);

  // Middleware Dispatch to push to Supabase
  const asyncDispatch = async (action: Action) => {
    dispatch(action); // Optimistic UI update

    try {
      if (action.type === 'ADD_CARGO') {
        const { error } = await supabase.from('cargos').insert({
          id: action.cargo.id,
          truck_plate: action.cargo.truckPlate,
          type: action.cargo.type,
          quantity_kg: action.cargo.quantityKg,
          estimated_cargo_value: action.cargo.estimatedCargoValue,
          safe_temperature_max: action.cargo.safeTemperatureMax,
          spoilage_time_minutes: action.cargo.spoilageTimeMinutes,
          status: action.cargo.status,
          origin: action.cargo.origin,
          original_destination: action.cargo.originalDestination,
          telemetry: { ...action.cargo.telemetry, ownerId: action.cargo.ownerId },
        });
        if (error) console.error("ADD_CARGO DB Error:", error.message, error.details, error.hint, error.code);
      } else if (action.type === 'TRIGGER_MANUAL_EMERGENCY') {
        // Fetch current telemetry first
        const { data, error: selectErr } = await supabase.from('cargos').select('telemetry').eq('id', action.cargoId).single();
        if (selectErr) console.error("TRIGGER_EMERGENCY Select Error:", selectErr.message);
        if (data) {
          const { error } = await supabase.from('cargos').update({
            status: 'emergency',
            telemetry: { ...data.telemetry, temperature: action.newTemperature }
          }).eq('id', action.cargoId);
          if (error) console.error("TRIGGER_EMERGENCY Update Error:", error.message);
        }
      } else if (action.type === 'SET_ASKING_PRICE') {
        const { error } = await supabase.from('cargos').update({
          asking_price_per_kg: action.pricePerKg
        }).eq('id', action.cargoId);
        if (error) console.error("SET_ASKING_PRICE Error:", error.message, error.details);
      } else if (action.type === 'BROADCAST_TO_MARKETPLACE') {
        // Notifications are handled locally or via alerts table
      } else if (action.type === 'ADD_BID') {
        await supabase.from('bids').insert({
          id: action.bid.id,
          cargo_id: action.bid.cargoId,
          wholesaler_id: action.bid.wholesalerId,
          wholesaler_name: action.bid.wholesalerName,
          wholesaler_location: action.bid.wholesalerLocation,
          offered_price_per_kg: action.bid.offeredPricePerKg,
          requested_quantity_kg: action.bid.requestedQuantityKg,
          total_value: action.bid.totalValue,
          distance_km: action.bid.distanceKm,
          eta_minutes: action.bid.etaMinutes,
          status: action.bid.status
        });
      } else if (action.type === 'UPDATE_BID_STATUS') {
        await supabase.from('bids').update({
          status: action.status,
          counter_price_per_kg: action.counterPrice
        }).eq('id', action.bidId);
      } else if (action.type === 'ACCEPT_BID') {
        const bid = state.bids.find(b => b.id === action.bidId);
        const oldCargo = state.cargos.find(c => c.id === action.cargoId);
        if (bid && oldCargo) {
          const isPartial = bid.requestedQuantityKg < oldCargo.quantityKg;
          const newStatus = isPartial ? oldCargo.status : "rerouting";
          const newQuantity = Math.max(0, oldCargo.quantityKg - bid.requestedQuantityKg);
          
          const newOriginalDestination = {
            name: bid.wholesalerLocation,
            location: bid.wholesalerCoords || {
              lat: oldCargo.origin.location.lat - 0.5,
              lng: oldCargo.origin.location.lng - 0.5
            }
          };

          const newSelectedMarket = isPartial ? oldCargo.selectedMarket : {
            id: bid.wholesalerId,
            name: bid.wholesalerLocation,
            location: bid.wholesalerCoords || {
              lat: oldCargo.origin.location.lat - 0.5,
              lng: oldCargo.origin.location.lng - 0.5
            },
            distanceKm: bid.distanceKm,
            etaMinutes: bid.etaMinutes,
            type: "wholesale_market" as const,
          };

          // Accept the current bid
          await supabase.from('bids').update({ status: 'accepted' }).eq('id', action.bidId);
          
          // If the cargo was fully bought out, reject other bids
          if (newQuantity <= 0) {
            await supabase.from('bids').update({ status: 'rejected' }).eq('cargo_id', action.cargoId).neq('id', action.bidId);
          }
          
          await supabase.from('cargos').update({
            status: newStatus,
            quantity_kg: newQuantity,
            selected_market: newSelectedMarket,
            original_destination: newOriginalDestination
          }).eq('id', action.cargoId);
        }
      } else if (action.type === 'MARK_DELIVERED') {
        await supabase.from('cargos').update({ status: 'delivered' }).eq('id', action.cargoId);
      } else if (action.type === 'DELETE_CARGO') {
        await supabase.from('cargos').delete().eq('id', action.cargoId);
        // Optionally delete bids associated with the cargo
        await supabase.from('bids').delete().eq('cargo_id', action.cargoId);
      }
    } catch (err) {
      console.error("Supabase Sync Error:", err);
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch: asyncDispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppProvider");
  }
  return context;
}
