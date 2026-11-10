/* ============================================================
   EXHIBITOR SEED DATA
   Realistic demo data for the Exhibitor Panel.
   Deterministic IDs so cross-references stay stable.
   ============================================================ */

const NOW = Date.now();
const day = 24 * 60 * 60 * 1000;
const iso = (offsetMs) => new Date(NOW + offsetMs).toISOString();

export const SEED_COMPANY = {
  id: "cmp-meridian",
  name: "Meridian Industrial Systems",
  logo: "",
  industry: "Industrial Technology",
  registrationNo: "PK-REG-2018-44219",
  establishedYear: 2016,
  size: "51–200 employees",
  website: "https://meridian-industrial.example.com",
  description:
    "Meridian Industrial Systems designs and manufactures smart automation components for manufacturing plants across South Asia. Our portfolio spans industrial IoT gateways, predictive-maintenance sensors, and turnkey SCADA integrations for mid-size factories.",
  mission:
    "To make world-class industrial automation accessible to growing manufacturers through reliable hardware, transparent pricing, and on-site engineering support.",
  category: "Automation & IoT",
  email: "hello@meridian-industrial.example.com",
  phone: "+92 21 3456 7890",
  altContact: "+92 300 1234567",
  country: "Pakistan",
  city: "Karachi",
  address: "Plot 42, Sector 7-A, Korangi Industrial Area, Karachi 74900",
  socials: {
    linkedin: "https://linkedin.com/company/meridian-industrial",
    twitter: "https://twitter.com/meridian_indsys",
    instagram: "",
  },
};

export const SEED_EXPOS = [
  {
    id: "expo-techworld-2026",
    name: "TechWorld Expo 2026",
    category: "Technology",
    description:
      "The region's largest enterprise technology exhibition, bringing together 300+ exhibitors across automation, cloud infrastructure, and industrial IoT.",
    venue: "Karachi Expo Center",
    city: "Karachi",
    country: "Pakistan",
    startDate: iso(day * 18),
    endDate: iso(day * 21),
    applicationDeadline: iso(day * 6),
    boothSizeOptions: ["6×6 m²", "9×9 m²", "12×12 m²"],
    boothTypes: ["Standard", "Corner", "Island", "Premium"],
    organizer: {
      name: "EventStrat Events",
      email: "techworld@eventstrat.example.com",
      phone: "+92 21 111 222 333",
    },
    requirements: [
      "Company registration certificate",
      "Product catalogue (PDF)",
      "At least one on-site staff member",
    ],
    coverImage: "",
    announcements: [
      { id: "ann-1", at: iso(-day * 2), text: "Booth selection opens 14 days before the expo." },
      { id: "ann-2", at: iso(-day * 5), text: "Early-bird application discount closes in 3 days." },
    ],
  },
  {
    id: "expo-greenpack-2026",
    name: "GreenPack Summit",
    category: "Packaging & Sustainability",
    description:
      "A focused B2B summit for sustainable packaging innovation, circular materials, and supply-chain decarbonization.",
    venue: "Lahore Hall 2",
    city: "Lahore",
    country: "Pakistan",
    startDate: iso(day * 40),
    endDate: iso(day * 42),
    applicationDeadline: iso(day * 25),
    boothSizeOptions: ["6×6 m²", "9×9 m²"],
    boothTypes: ["Standard", "Corner"],
    organizer: {
      name: "EventStrat Events",
      email: "greenpack@eventstrat.example.com",
      phone: "+92 42 111 444 555",
    },
    requirements: ["Company registration certificate", "Sustainability policy document"],
    coverImage: "",
    announcements: [],
  },
  {
    id: "expo-autotech-2026",
    name: "AutoTech Showcase",
    category: "Automotive",
    description:
      "Where automotive OEMs, tier-1 suppliers, and EV startups meet to source components and showcase next-generation mobility.",
    venue: "Islamabad Expo",
    city: "Islamabad",
    country: "Pakistan",
    startDate: iso(day * 58),
    endDate: iso(day * 60),
    applicationDeadline: iso(day * 35),
    boothSizeOptions: ["9×9 m²", "12×12 m²", "18×18 m²"],
    boothTypes: ["Corner", "Island", "Premium"],
    organizer: {
      name: "EventStrat Events",
      email: "autotech@eventstrat.example.com",
      phone: "+92 51 111 666 777",
    },
    requirements: ["Company registration certificate", "Product catalogue"],
    coverImage: "",
    announcements: [],
  },
  {
    id: "expo-foodexpo-2026",
    name: "Food & Beverage Expo",
    category: "F&B",
    description:
      "Annual gathering of food manufacturers, distributors, and retail chains across Pakistan and the Gulf.",
    venue: "Karachi Expo Center",
    city: "Karachi",
    country: "Pakistan",
    startDate: iso(-day * 12),
    endDate: iso(-day * 9),
    applicationDeadline: iso(-day * 20),
    boothSizeOptions: ["6×6 m²", "9×9 m²"],
    boothTypes: ["Standard", "Corner"],
    organizer: {
      name: "EventStrat Events",
      email: "foodexpo@eventstrat.example.com",
      phone: "+92 21 111 888 999",
    },
    requirements: ["Company registration certificate", "Food safety license"],
    coverImage: "",
    announcements: [],
  },
];

export const SEED_APPLICATIONS = [
  {
    id: "APP-2026-0001",
    expoId: "expo-techworld-2026",
    expoName: "TechWorld Expo 2026",
    submittedAt: iso(-day * 3),
    updatedAt: iso(-day * 1),
    status: "approved",
    boothType: "Corner",
    boothSize: "9×9 m²",
    staffCount: 3,
    products: ["iot-gateway-x7", "predictive-sensor-s2"],
    services: ["scada-integration"],
    documents: [
      { id: "doc-1", name: "Registration Certificate.pdf", size: 182400, uploadedAt: iso(-day * 3) },
      { id: "doc-2", name: "Product Catalogue 2026.pdf", size: 3400000, uploadedAt: iso(-day * 3) },
    ],
    rejectionReason: null,
  },
  {
    id: "APP-2026-0002",
    expoId: "expo-greenpack-2026",
    expoName: "GreenPack Summit",
    submittedAt: iso(-day * 1),
    updatedAt: iso(-day * 1),
    status: "pending",
    boothType: "Standard",
    boothSize: "6×6 m²",
    staffCount: 2,
    products: ["iot-gateway-x7"],
    services: [],
    documents: [
      { id: "doc-3", name: "Registration Certificate.pdf", size: 182400, uploadedAt: iso(-day * 1) },
    ],
    rejectionReason: null,
  },
  {
    id: "APP-2025-0042",
    expoId: "expo-foodexpo-2026",
    expoName: "Food & Beverage Expo",
    submittedAt: iso(-day * 30),
    updatedAt: iso(-day * 22),
    status: "rejected",
    boothType: "Standard",
    boothSize: "6×6 m²",
    staffCount: 1,
    products: [],
    services: [],
    documents: [],
    rejectionReason:
      "Company industry (Industrial Technology) does not match the F&B event category. Consider applying to TechWorld Expo instead.",
  },
];

export const SEED_BOOTH_REQUESTS = [
  {
    id: "BR-2026-0001",
    applicationId: "APP-2026-0001",
    expoId: "expo-techworld-2026",
    boothId: "tw-a-104",
    requestedAt: iso(-day * 1),
    status: "approved",
  },
];

export const SEED_BOOTHS = [
  { id: "tw-a-101", expoId: "expo-techworld-2026", hall: "Hall A", floor: "Ground", number: "A-101", size: "9×9 m²", dimensions: "3×3 m", type: "Corner", price: 185000, status: "occupied" },
  { id: "tw-a-102", expoId: "expo-techworld-2026", hall: "Hall A", floor: "Ground", number: "A-102", size: "9×9 m²", dimensions: "3×3 m", type: "Standard", price: 150000, status: "occupied" },
  { id: "tw-a-103", expoId: "expo-techworld-2026", hall: "Hall A", floor: "Ground", number: "A-103", size: "9×9 m²", dimensions: "3×3 m", type: "Standard", price: 150000, status: "reserved" },
  { id: "tw-a-104", expoId: "expo-techworld-2026", hall: "Hall A", floor: "Ground", number: "A-104", size: "9×9 m²", dimensions: "3×3 m", type: "Corner", price: 185000, status: "occupied" },
  { id: "tw-a-105", expoId: "expo-techworld-2026", hall: "Hall A", floor: "Ground", number: "A-105", size: "9×9 m²", dimensions: "3×3 m", type: "Standard", price: 150000, status: "available" },
  { id: "tw-a-106", expoId: "expo-techworld-2026", hall: "Hall A", floor: "Ground", number: "A-106", size: "9×9 m²", dimensions: "3×3 m", type: "Standard", price: 150000, status: "available" },
  { id: "tw-b-201", expoId: "expo-techworld-2026", hall: "Hall B", floor: "Ground", number: "B-201", size: "12×12 m²", dimensions: "4×4 m", type: "Island", price: 320000, status: "available" },
  { id: "tw-b-202", expoId: "expo-techworld-2026", hall: "Hall B", floor: "Ground", number: "B-202", size: "12×12 m²", dimensions: "4×4 m", type: "Island", price: 320000, status: "reserved" },
  { id: "tw-b-203", expoId: "expo-techworld-2026", hall: "Hall B", floor: "Ground", number: "B-203", size: "6×6 m²", dimensions: "3×3 m", type: "Standard", price: 95000, status: "available" },
  { id: "tw-b-204", expoId: "expo-techworld-2026", hall: "Hall B", floor: "Ground", number: "B-204", size: "6×6 m²", dimensions: "3×3 m", type: "Standard", price: 95000, status: "occupied" },
  { id: "gp-1-01", expoId: "expo-greenpack-2026", hall: "Hall 1", floor: "Ground", number: "1-01", size: "6×6 m²", dimensions: "3×3 m", type: "Standard", price: 120000, status: "available" },
  { id: "gp-1-02", expoId: "expo-greenpack-2026", hall: "Hall 1", floor: "Ground", number: "1-02", size: "6×6 m²", dimensions: "3×3 m", type: "Standard", price: 120000, status: "available" },
  { id: "gp-1-03", expoId: "expo-greenpack-2026", hall: "Hall 1", floor: "Ground", number: "1-03", size: "9×9 m²", dimensions: "3×3 m", type: "Corner", price: 165000, status: "available" },
  { id: "gp-1-04", expoId: "expo-greenpack-2026", hall: "Hall 1", floor: "Ground", number: "1-04", size: "9×9 m²", dimensions: "3×3 m", type: "Corner", price: 165000, status: "reserved" },
];

export const SEED_ALLOCATIONS = [
  {
    id: "ALC-2026-0001",
    applicationId: "APP-2026-0001",
    expoId: "expo-techworld-2026",
    expoName: "TechWorld Expo 2026",
    boothId: "tw-a-104",
    boothNumber: "A-104",
    hall: "Hall A",
    floor: "Ground",
    size: "9×9 m²",
    dimensions: "3×3 m",
    allocatedAt: iso(-day * 1),
    setupDate: iso(day * 17),
    setupTime: "08:00 – 14:00",
    instructions:
      "Bring your own display stands. Power (220V, 3kW) is provided. Booth backdrop must not exceed 3m height. Check in at Hall A reception before setup.",
  },
];

export const SEED_PRODUCTS = [
  {
    id: "iot-gateway-x7",
    kind: "product",
    name: "IoT Gateway X7",
    category: "Industrial IoT",
    description:
      "Edge gateway with dual LTE + Ethernet backhaul, Modbus/OPC-UA support, and onboard AI inference for anomaly detection.",
    features: ["Dual LTE + Ethernet", "Modbus/OPC-UA", "Onboard AI inference", "IP65 rated"],
    price: "PKR 185,000",
    availability: "In production",
    image: "",
  },
  {
    id: "predictive-sensor-s2",
    kind: "product",
    name: "Predictive Sensor S2",
    category: "Sensors",
    description:
      "Vibration + temperature sensor with 5-year battery and LoRaWAN uplink. Designed for rotating-equipment monitoring.",
    features: ["LoRaWAN", "5-year battery", "Vibration + temperature", "Magnetic mount"],
    price: "PKR 42,000",
    availability: "In production",
    image: "",
  },
  {
    id: "scada-integration",
    kind: "service",
    name: "SCADA Integration",
    category: "Professional Services",
    description:
      "Turnkey SCADA deployment for mid-size factories — site survey, PLC integration, HMI design, commissioning, and 12-month support.",
    features: ["Site survey", "PLC integration", "HMI design", "12-month support"],
    price: "From PKR 1,200,000",
    availability: "Available",
    image: "",
  },
];

export const SEED_STAFF = [
  { id: "staff-1", name: "Ayesha Siddiqui", photo: "", designation: "Head of Sales", email: "ayesha@meridian-industrial.example.com", phone: "+92 300 1112233", role: "Sales Lead", assignedExpoId: "expo-techworld-2026" },
  { id: "staff-2", name: "Bilal Ahmed", photo: "", designation: "Solutions Engineer", email: "bilal@meridian-industrial.example.com", phone: "+92 300 2223344", role: "Technical", assignedExpoId: "expo-techworld-2026" },
  { id: "staff-3", name: "Fatima Khan", photo: "", designation: "Marketing Manager", email: "fatima@meridian-industrial.example.com", phone: "+92 300 3334455", role: "Marketing", assignedExpoId: "expo-techworld-2026" },
];

export const SEED_INQUIRIES = [
  {
    id: "INQ-2026-0001",
    subject: "Booth power requirements clarification",
    category: "Booth",
    relatedExpoId: "expo-techworld-2026",
    status: "resolved",
    createdAt: iso(-day * 4),
    updatedAt: iso(-day * 3),
    messages: [
      { id: "m-1", from: "exhibitor", body: "Hi team, our X7 gateway demo needs 3kW continuous power. Is that supported at Booth A-104?", at: iso(-day * 4) },
      { id: "m-2", from: "organizer", body: "Yes — Booth A-104 is provisioned for 220V / 3kW. Please bring your own surge protector.", at: iso(-day * 3) },
    ],
  },
  {
    id: "INQ-2026-0002",
    subject: "Application document format",
    category: "Application",
    relatedExpoId: "expo-greenpack-2026",
    status: "in_progress",
    createdAt: iso(-day * 1),
    updatedAt: iso(-day * 1),
    messages: [
      { id: "m-3", from: "exhibitor", body: "Should the product catalogue be a PDF or is a link acceptable?", at: iso(-day * 1) },
    ],
  },
];

export const SEED_NOTIFICATIONS = [
  { id: "en-1", audience: "exhibitor", category: "approved", title: "Application approved", message: "Your application for TechWorld Expo 2026 has been approved. You can now request a booth.", at: iso(-day * 1), unread: true, link: "/exhibitor/booth-selection" },
  { id: "en-2", audience: "exhibitor", category: "booth", title: "Booth allocated", message: "Booth A-104 (Hall A) has been officially allocated to you for TechWorld Expo 2026.", at: iso(-day * 1), unread: true, link: "/exhibitor/my-booth" },
  { id: "en-3", audience: "exhibitor", category: "application", title: "Application received", message: "We received your application for GreenPack Summit. Review takes 3–5 business days.", at: iso(-day * 1), unread: false, link: "/exhibitor/my-applications" },
  { id: "en-4", audience: "exhibitor", category: "announcement", title: "Booth selection opens soon", message: "TechWorld Expo 2026 booth selection opens in 14 days.", at: iso(-day * 2), unread: false, link: "/exhibitor/browse-expos" },
  { id: "en-5", audience: "exhibitor", category: "support", title: "Organizer replied", message: "EventStrat replied to your inquiry about booth power requirements.", at: iso(-day * 3), unread: false, link: "/exhibitor/communication" },
];

export const SEED_SETTINGS = {
  emailNotifications: true,
  applicationUpdates: true,
  boothUpdates: true,
  expoAnnouncements: false,
};

export const SEED_STATE = {
  version: 1,
  company: SEED_COMPANY,
  expos: SEED_EXPOS,
  applications: SEED_APPLICATIONS,
  booths: SEED_BOOTHS,
  boothRequests: SEED_BOOTH_REQUESTS,
  allocations: SEED_ALLOCATIONS,
  products: SEED_PRODUCTS,
  staff: SEED_STAFF,
  inquiries: SEED_INQUIRIES,
  notifications: SEED_NOTIFICATIONS,
  settings: SEED_SETTINGS,
};