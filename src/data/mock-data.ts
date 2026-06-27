// ============================================================
// ANNAPURNA — Mock Data for Demo Scenario
// ============================================================

import {
  Cargo,
  Wholesaler,
  Market,
  Bid,
  ActiveOrder,
  GeoPoint,
} from "@/lib/types";

// --- Route coordinates (Nashik → Mumbai via NH-3) ---
export const NASHIK_TO_MUMBAI_ROUTE: GeoPoint[] = [
  { lat: 19.9975, lng: 73.7898 },  // Nashik
  { lat: 19.9200, lng: 73.7500 },
  { lat: 19.8400, lng: 73.6800 },
  { lat: 19.7500, lng: 73.5500 },
  { lat: 19.6800, lng: 73.4200 },
  { lat: 19.6000, lng: 73.3000 },
  { lat: 19.5200, lng: 73.2000 },  // Near Igatpuri
  { lat: 19.4500, lng: 73.1500 },
  { lat: 19.3800, lng: 73.1000 },
  { lat: 19.3200, lng: 73.0800 },  // Near Kasara
  { lat: 19.2500, lng: 73.0500 },
  { lat: 19.2300, lng: 73.1300 },  // Kalyan junction (REROUTE POINT)
  { lat: 19.1800, lng: 73.0000 },
  { lat: 19.1200, lng: 72.9500 },
  { lat: 19.0760, lng: 72.8777 },  // Mumbai APMC
];

// --- Nearby Markets for Emergency Rerouting ---
export const NEARBY_MARKETS: Market[] = [
  {
    id: "mkt-001",
    name: "Kalyan Wholesale Market",
    location: { lat: 19.2437, lng: 73.1355 },
    distanceKm: 12,
    etaMinutes: 18,
    type: "wholesale_market",
  },
  {
    id: "mkt-002",
    name: "Bhiwandi APMC Mandi",
    location: { lat: 19.2967, lng: 73.0631 },
    distanceKm: 22,
    etaMinutes: 28,
    type: "mandi",
  },
  {
    id: "mkt-003",
    name: "Thane Fresh Market",
    location: { lat: 19.2183, lng: 72.9781 },
    distanceKm: 35,
    etaMinutes: 42,
    type: "wholesale_market",
  },
];

// --- Demo Cargo (The Star of the Show) ---
export const DEMO_CARGO: Cargo = {
  id: "cargo-001",
  type: "tomatoes",
  quantityKg: 5000,
  truckId: "truck-001",
  truckPlate: "KA-01-AB-1234",
  driverName: "Ramesh Patil",
  driverPhone: "+91-9876543210",

  origin: {
    name: "Nashik Farm Cooperative",
    location: { lat: 19.9975, lng: 73.7898 },
  },
  originalDestination: {
    name: "Mumbai APMC Market",
    location: { lat: 19.0760, lng: 72.8777 },
  },
  currentLocation: { lat: 19.3200, lng: 73.0800 }, // Near Kasara — truck is HERE

  routePolyline: NASHIK_TO_MUMBAI_ROUTE,

  telemetry: {
    temperature: 4.2,  // Starts safe — will spike during demo
    humidity: 72,
    ethyleneLevel: "low",
    timestamp: Date.now(),
  },
  safeTemperatureMax: 10,
  loadedAt: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago

  status: "in_transit",
  spoilageTimeMinutes: null,
  etaMinutes: 260,  // 4h 20m to Mumbai
  estimatedCargoValue: 100000, // ₹1,00,000
  askingPricePerKg: null,

  reroutableMarkets: NEARBY_MARKETS,
  selectedMarket: null,
};

// --- Additional Cargos for fleet view ---
export const FLEET_CARGOS: Cargo[] = [
  DEMO_CARGO,
  {
    id: "cargo-002",
    type: "mangoes",
    quantityKg: 3000,
    truckId: "truck-002",
    truckPlate: "MH-04-CD-5678",
    driverName: "Sunil Jadhav",
    driverPhone: "+91-9876543211",
    origin: {
      name: "Ratnagiri Orchards",
      location: { lat: 16.9902, lng: 73.3120 },
    },
    originalDestination: {
      name: "Pune Crawford Market",
      location: { lat: 18.5204, lng: 73.8567 },
    },
    currentLocation: { lat: 17.6800, lng: 73.5100 },
    routePolyline: [],
    telemetry: {
      temperature: 6.8,
      humidity: 65,
      ethyleneLevel: "low",
      timestamp: Date.now(),
    },
    safeTemperatureMax: 12,
    loadedAt: Date.now() - 2 * 60 * 60 * 1000,
    status: "in_transit",
    spoilageTimeMinutes: null,
    etaMinutes: 180,
    estimatedCargoValue: 135000,
    askingPricePerKg: null,
    reroutableMarkets: [],
    selectedMarket: null,
  },
  {
    id: "cargo-003",
    type: "fish",
    quantityKg: 2000,
    truckId: "truck-003",
    truckPlate: "GJ-05-EF-9012",
    driverName: "Ahmed Khan",
    driverPhone: "+91-9876543212",
    origin: {
      name: "Veraval Fish Harbor",
      location: { lat: 20.9070, lng: 70.3675 },
    },
    originalDestination: {
      name: "Ahmedabad Fish Market",
      location: { lat: 23.0225, lng: 72.5714 },
    },
    currentLocation: { lat: 21.7645, lng: 72.1519 },
    routePolyline: [],
    telemetry: {
      temperature: 2.1,
      humidity: 88,
      ethyleneLevel: "low",
      timestamp: Date.now(),
    },
    safeTemperatureMax: 4,
    loadedAt: Date.now() - 1 * 60 * 60 * 1000,
    status: "in_transit",
    spoilageTimeMinutes: null,
    etaMinutes: 320,
    estimatedCargoValue: 240000,
    askingPricePerKg: null,
    reroutableMarkets: [],
    selectedMarket: null,
  },
];

// --- Demo Wholesalers ---
export const DEMO_WHOLESALERS: Wholesaler[] = [
  {
    id: "ws-001",
    name: "Rajesh Kumar",
    businessName: "Rajesh Traders",
    location: { lat: 19.2437, lng: 73.1355 },
    phone: "+91-9988776655",
    preferredCargo: ["tomatoes", "vegetables", "mangoes"],
    maxRadiusKm: 50,
    isOnline: true,
  },
  {
    id: "ws-002",
    name: "Priya Sharma",
    businessName: "Fresh Foods Co.",
    location: { lat: 19.2183, lng: 72.9781 },
    phone: "+91-9988776656",
    preferredCargo: ["tomatoes", "mangoes", "flowers"],
    maxRadiusKm: 40,
    isOnline: true,
  },
  {
    id: "ws-003",
    name: "Mohammed Ali",
    businessName: "Ali & Sons Wholesale",
    location: { lat: 19.2967, lng: 73.0631 },
    phone: "+91-9988776657",
    preferredCargo: ["fish", "vegetables"],
    maxRadiusKm: 30,
    isOnline: false,
  },
];

// --- Demo Bids (Pre-populated for the demo) ---
export const DEMO_BIDS: Bid[] = [
  {
    id: "bid-001",
    cargoId: "cargo-001",
    wholesalerId: "ws-001",
    wholesalerName: "Rajesh Traders",
    wholesalerLocation: "Kalyan APMC Market, Mumbai",
    distanceKm: 12,
    etaMinutes: 18,
    offeredPricePerKg: 16,
    requestedQuantityKg: 5000,
    totalValue: 16 * 5000,
    createdAt: Date.now() - 300000,
    expiresAt: Date.now() + 600000,
    status: "pending",
  },
  {
    id: "bid-002",
    cargoId: "cargo-001",
    wholesalerId: "ws-002",
    wholesalerName: "FreshMart Supply",
    wholesalerLocation: "Vashi Wholesale Market, Navi Mumbai",
    distanceKm: 28,
    etaMinutes: 42,
    offeredPricePerKg: 14,
    requestedQuantityKg: 5000,
    totalValue: 70000,
    createdAt: Date.now(),
    expiresAt: Date.now() + 7.25 * 60 * 1000, // 7.25 minutes
    status: "pending",
  },
];

// --- Demo Active Orders (for wholesaler's order history) ---
export const DEMO_ACTIVE_ORDERS: ActiveOrder[] = [
  {
    id: "order-prev-001",
    cargoType: "vegetables",
    quantityKg: 2000,
    pricePerKg: 22,
    totalValue: 44000,
    truckPlate: "MH-12-GH-3456",
    status: "delivered",
    etaMinutes: null,
    acceptedAt: Date.now() - 24 * 60 * 60 * 1000, // yesterday
  },
  {
    id: "order-prev-002",
    cargoType: "mangoes",
    quantityKg: 1500,
    pricePerKg: 50,
    totalValue: 75000,
    truckPlate: "KA-03-IJ-7890",
    status: "arriving",
    etaMinutes: 45,
    acceptedAt: Date.now() - 2 * 60 * 60 * 1000,
  },
];

// --- Temperature Simulation Sequence ---
// This is the scripted "failure" for the demo video
export const TEMPERATURE_FAILURE_SEQUENCE = [
  { time: 0, temp: 4.2, humidity: 72, ethylene: "low" as const },
  { time: 2, temp: 4.5, humidity: 72, ethylene: "low" as const },
  { time: 4, temp: 5.1, humidity: 73, ethylene: "low" as const },
  { time: 6, temp: 5.8, humidity: 73, ethylene: "low" as const },
  { time: 8, temp: 6.9, humidity: 74, ethylene: "low" as const },
  { time: 10, temp: 8.2, humidity: 75, ethylene: "medium" as const },  // Warning threshold
  { time: 12, temp: 9.5, humidity: 76, ethylene: "medium" as const },
  { time: 14, temp: 10.8, humidity: 77, ethylene: "medium" as const }, // CROSSES SAFE LIMIT
  { time: 16, temp: 12.3, humidity: 78, ethylene: "high" as const },
  { time: 18, temp: 14.1, humidity: 79, ethylene: "high" as const },
  { time: 20, temp: 15.8, humidity: 80, ethylene: "high" as const },   // AI triggers emergency
  { time: 22, temp: 17.2, humidity: 81, ethylene: "high" as const },
  { time: 24, temp: 18.0, humidity: 82, ethylene: "high" as const },   // Demo steady state
];
