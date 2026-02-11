// Mock data for the KesselOps application
// All data is stateless/dummy for UI development

export const currentUser = {
  id: "1",
  email: "owner@oscho.de",
  firstName: "Max",
  lastName: "Mustermann",
  role: "OWNER" as const,
  avatar: null,
  venueId: "1",
};

export const currentVenue = {
  id: "1",
  name: "OSCHO Café & Bar",
  type: "bar",
  city: "Stuttgart",
  address: "Calwer Str. 12, 70173 Stuttgart",
  openingHours: "18:00 - 03:00",
};

export const venues = [
  currentVenue,
  {
    id: "2",
    name: "OSCHO Rooftop",
    type: "bar",
    city: "Stuttgart",
    address: "Königstr. 1, 70173 Stuttgart",
    openingHours: "19:00 - 02:00",
  },
];

export const staff = [
  { id: "1", firstName: "Max", lastName: "Mustermann", role: "OWNER", avatar: null },
  { id: "2", firstName: "Anna", lastName: "Schmidt", role: "MANAGER", avatar: null },
  { id: "3", firstName: "Tom", lastName: "Weber", role: "STAFF", avatar: null },
  { id: "4", firstName: "Lisa", lastName: "Fischer", role: "STAFF", avatar: null },
  { id: "5", firstName: "Tim", lastName: "Müller", role: "TRAINEE", avatar: null },
];

export const todaysShift = {
  id: "1",
  date: "2026-02-09",
  type: "EVENING" as const,
  startTime: "18:00",
  endTime: "02:00",
  staff: [
    { id: "2", firstName: "Anna", lastName: "Schmidt", role: "MANAGER", status: "ACTIVE" },
    { id: "3", firstName: "Tom", lastName: "Weber", role: "STAFF", status: "ACTIVE" },
    { id: "4", firstName: "Lisa", lastName: "Fischer", role: "STAFF", status: "PENDING" },
  ],
};

export const revenueData = {
  today: 2847.50,
  target: 4000,
  yesterday: 3124.80,
  weekTotal: 18452.30,
};

export const alerts = [
  { id: "1", type: "danger" as const, message: "Hendrick's Gin: 14% stock remaining", category: "inventory" },
  { id: "2", type: "warning" as const, message: "3 tasks pending for closing", category: "tasks" },
  { id: "3", type: "warning" as const, message: "Lisa Fischer hasn't checked in yet", category: "staff" },
];

export const tasks = [
  { id: "1", title: "Check Fridge Temperature", category: "HACCP", type: "input", completed: true, value: "4°C" },
  { id: "2", title: "Clean Bar Top", category: "Opening", type: "checkbox", completed: true },
  { id: "3", title: "Ice Machine Photo", category: "HACCP", type: "photo", completed: false },
  { id: "4", title: "Restock Garnishes", category: "Opening", type: "checkbox", completed: false },
  { id: "5", title: "Count Cash Drawer", category: "Opening", type: "input", completed: false },
  { id: "6", title: "Check Keg Levels", category: "Opening", type: "checkbox", completed: true },
  { id: "7", title: "Clean Coffee Machine", category: "Closing", type: "checkbox", completed: false },
  { id: "8", title: "Final Floor Sweep", category: "Closing", type: "checkbox", completed: false },
];

export const inventory = [
  { id: "1", name: "Hendrick's Gin", category: "Spirits", stock: 2, minStock: 5, unit: "bottles", status: "critical" as const },
  { id: "2", name: "Grey Goose Vodka", category: "Spirits", stock: 8, minStock: 5, unit: "bottles", status: "ok" as const },
  { id: "3", name: "Fresh Lemons", category: "Garnish", stock: 12, minStock: 20, unit: "pieces", status: "low" as const },
  { id: "4", name: "Fresh Limes", category: "Garnish", stock: 25, minStock: 20, unit: "pieces", status: "ok" as const },
  { id: "5", name: "Aperol", category: "Spirits", stock: 3, minStock: 4, unit: "bottles", status: "low" as const },
  { id: "6", name: "Prosecco", category: "Wine", stock: 18, minStock: 12, unit: "bottles", status: "ok" as const },
  { id: "7", name: "Fresh Mint", category: "Garnish", stock: 5, minStock: 10, unit: "bunches", status: "low" as const },
  { id: "8", name: "Tonic Water", category: "Mixers", stock: 48, minStock: 24, unit: "bottles", status: "ok" as const },
];

export const menuItems = [
  { id: "1", name: "Basil Smash", category: "Cocktails", price: 12.50, cost: 2.40, available: true, tags: ["Vegan", "Signature"] },
  { id: "2", name: "Espresso Martini", category: "Cocktails", price: 13.00, cost: 2.80, available: true, tags: [] },
  { id: "3", name: "Aperol Spritz", category: "Cocktails", price: 10.50, cost: 2.00, available: false, tags: ["Popular"] },
  { id: "4", name: "Old Fashioned", category: "Cocktails", price: 14.00, cost: 3.20, available: true, tags: ["Classic"] },
  { id: "5", name: "Mojito", category: "Cocktails", price: 11.50, cost: 2.10, available: true, tags: ["Vegan"] },
  { id: "6", name: "Negroni", category: "Cocktails", price: 12.00, cost: 2.60, available: true, tags: ["Classic", "Bitter"] },
  { id: "7", name: "Bruschetta", category: "Food", price: 8.50, cost: 1.80, available: true, tags: ["Vegan Option"] },
  { id: "8", name: "Cheese Platter", category: "Food", price: 16.00, cost: 5.50, available: true, tags: [] },
];

export const reservations = [
  { id: "1", guestName: "Ludwig Heer", date: "2026-02-09", time: "19:00", partySize: 4, status: "CONFIRMED" as const, table: "T3" },
  { id: "2", guestName: "Sarah Klein", date: "2026-02-09", time: "20:30", partySize: 2, status: "PENDING" as const, table: null },
  { id: "3", guestName: "Corporate Event", date: "2026-02-09", time: "18:00", partySize: 12, status: "CONFIRMED" as const, table: "VIP" },
];

export const weeklyShifts = [
  { day: "Mon", shifts: [{ type: "EVENING", staff: ["Anna", "Tom"] }] },
  { day: "Tue", shifts: [{ type: "EVENING", staff: ["Lisa", "Tim"] }] },
  { day: "Wed", shifts: [] },
  { day: "Thu", shifts: [{ type: "EVENING", staff: ["Anna", "Lisa"] }] },
  { day: "Fri", shifts: [{ type: "EVENING", staff: ["Anna", "Tom", "Lisa"] }] },
  { day: "Sat", shifts: [{ type: "EVENING", staff: ["Anna", "Tom", "Lisa", "Tim"] }] },
  { day: "Sun", shifts: [{ type: "EVENING", staff: ["Tom", "Lisa"] }] },
];

export const handover = {
  incoming: {
    from: "Tom Weber",
    timestamp: "2026-02-09T18:00:00",
    notes: "Busy afternoon crowd. VIP table reserved for 18:00. Hendrick's Gin running low - check with Anna.",
    issues: ["Ice machine making noise", "Guest complaint about music volume"],
  },
};

export const trainingModules = [
  // WAITER / STAFF MODULES
  { 
    id: "service-101", 
    title: "Service Excellence", 
    roles: ["STAFF", "TRAINEE"],
    description: "Master the art of hospitality, from greeting guests to handling difficult situations.",
    progress: 0, 
    totalLessons: 8, 
    completedLessons: 0, 
    badge: "🤵",
    chapters: [
      { id: "s1", title: "The Art of Greeting", duration: "10:00", completed: false },
      { id: "s2", title: "Table Setting Standards", duration: "15:00", completed: false },
      { id: "s3", title: "Taking Orders Efficiency", duration: "12:00", completed: false },
      { id: "s4", title: "Upselling Techniques", duration: "08:00", completed: false },
    ]
  },
  { 
    id: "pos-mastery", 
    title: "POS Mastery", 
    roles: ["STAFF", "MANAGER", "TRAINEE"],
    description: "Learn to navigate our POS system for orders, modifiers, and payments.",
    progress: 0, 
    totalLessons: 5, 
    completedLessons: 0, 
    badge: "🖥️",
    chapters: [
      { id: "p1", title: "System Overview", duration: "05:00", completed: false },
      { id: "p2", title: "Entering Complex Orders", duration: "10:00", completed: false },
      { id: "p3", title: "Splitting Bills", duration: "08:00", completed: false },
      { id: "p4", title: "Voiding & Refunds", duration: "07:00", completed: false },
    ]
  },
  { 
    id: "payment-processing", 
    title: "Payment Processing", 
    roles: ["STAFF", "MANAGER", "TRAINEE"],
    description: "Secure and efficient payment handling for cash, cards, and mobile wallets.",
    progress: 0, 
    totalLessons: 4, 
    completedLessons: 0, 
    badge: "💳",
    chapters: [
      { id: "pay1", title: "Card Terminal Operation", duration: "06:00", completed: false },
      { id: "pay2", title: "Cash Handling & Change", duration: "09:00", completed: false },
      { id: "pay3", title: "Digital Wallets", duration: "05:00", completed: false },
    ]
  },

  // KITCHEN / CHEF MODULES
  { 
    id: "haccp-hygiene", 
    title: "HACCP & Hygiene", 
    roles: ["STAFF", "CHEF", "MANAGER", "TRAINEE"],
    description: "Essential food safety standards and hygiene protocols for all staff.",
    progress: 100, 
    totalLessons: 5, 
    completedLessons: 5, 
    badge: "✅",
    chapters: [
      { id: "h1", title: "Personal Hygiene", duration: "08:00", completed: true },
      { id: "h2", title: "Cross-Contamination", duration: "12:00", completed: true },
      { id: "h3", title: "Temperature Control", duration: "10:00", completed: true },
      { id: "h4", title: "Cleaning Schedules", duration: "15:00", completed: true },
    ]
  },
  { 
    id: "kitchen-main", 
    title: "Kitchen Maintenance", 
    roles: ["CHEF", "TRAINEE"],
    description: "Proper care and maintenance of kitchen equipment and stations.",
    progress: 0, 
    totalLessons: 6, 
    completedLessons: 0, 
    badge: "🔧",
    chapters: [
      { id: "k1", title: "Knife Sharpening", duration: "15:00", completed: false },
      { id: "k2", title: "Oven Cleaning", duration: "20:00", completed: false },
      { id: "k3", title: "Fridge Organization", duration: "10:00", completed: false },
    ]
  },
  { 
    id: "cocktail-funds", 
    title: "Cocktail Fundamentals", 
    roles: ["CHEF", "STAFF", "TRAINEE"], // Assuming chefs might need bar knowledge too, or bar staff
    description: "Understanding spirits, mixers, and classic cocktail techniques.",
    progress: 40, 
    totalLessons: 12, 
    completedLessons: 5, 
    badge: "🍸",
    chapters: [
      { id: "c1", title: "Spirit Categories", duration: "15:00", completed: true },
      { id: "c2", title: "Pouring Techniques", duration: "10:00", completed: true },
      { id: "c3", title: "Shaking vs Stirring", duration: "08:00", completed: true },
      { id: "c4", title: "Garnishing 101", duration: "12:00", completed: false },
    ]
  },

  // MANAGER MODULES
  { 
    id: "financial-basics", 
    title: "Financial Basics", 
    roles: ["MANAGER", "OWNER"],
    description: "Understanding P&L, daily reporting, and cost control.",
    progress: 0, 
    totalLessons: 10, 
    completedLessons: 0, 
    badge: "📊",
    chapters: [
      { id: "f1", title: "Reading a P&L", duration: "20:00", completed: false },
      { id: "f2", title: "Daily Sales Reports", duration: "15:00", completed: false },
      { id: "f3", title: "Cost of Goods Sold (COGS)", duration: "25:00", completed: false },
    ]
  },
  { 
    id: "leadership", 
    title: "Leadership & Scheduling", 
    roles: ["MANAGER", "OWNER"],
    description: "Effective team management, conflict resolution, and rota planning.",
    progress: 20, 
    totalLessons: 8, 
    completedLessons: 2, 
    badge: "👥",
    chapters: [
      { id: "l1", title: "Effective Communication", duration: "15:00", completed: true },
      { id: "l2", title: "Conflict Resolution", duration: "20:00", completed: true },
      { id: "l3", title: "Optimizing Schedules", duration: "30:00", completed: false },
    ]
  },
  { 
    id: "inventory-ctrl", 
    title: "Inventory Control", 
    roles: ["MANAGER", "CHEF", "OWNER"],
    description: "Strategies for efficient stock taking, ordering, and waste reduction.",
    progress: 0, 
    totalLessons: 6, 
    completedLessons: 0, 
    badge: "📦",
    chapters: [
      { id: "i1", title: "Weekly Stock Takes", duration: "15:00", completed: false },
      { id: "i2", title: "Supplier Management", duration: "10:00", completed: false },
      { id: "i3", title: "Waste Tracking", duration: "12:00", completed: false },
    ]
  },
];

export const recipes = [
  {
    id: "1",
    name: "Mojito",
    glass: "Highball",
    method: "Muddle & Build",
    garnish: "Mint sprig, Lime wheel",
    ingredients: [
      { name: "White Rum", amount: "50ml" },
      { name: "Fresh Lime Juice", amount: "25ml" },
      { name: "Sugar Syrup", amount: "15ml" },
      { name: "Fresh Mint", amount: "8-10 leaves" },
      { name: "Soda Water", amount: "Top" },
    ],
    instructions: "Add mint and syrup to glass, gently muddle. Add rum and lime juice. Fill with ice, top with soda. Stir gently.",
  },
  {
    id: "2",
    name: "Basil Smash",
    glass: "Rocks",
    method: "Shake",
    garnish: "Basil leaf",
    ingredients: [
      { name: "Gin", amount: "50ml" },
      { name: "Fresh Lemon Juice", amount: "25ml" },
      { name: "Sugar Syrup", amount: "15ml" },
      { name: "Fresh Basil", amount: "6-8 leaves" },
    ],
    instructions: "Muddle basil with syrup. Add remaining ingredients. Shake hard with ice. Double strain into rocks glass over ice.",
  },
];
