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

const lessonVideoLibrary = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
];

const baseTrainingModules = [
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
      { id: "s1", title: "The Art of Greeting", duration: "10:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=M3QAjN8ZqIM" }, // Hospitality training
      { id: "s2", title: "Table Setting Standards", duration: "15:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=KoJk6j1vYl0" }, // Table setting
      { id: "s3", title: "Taking Orders Efficiency", duration: "12:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=-14h9d58O3E" }, // Taking orders
      { id: "s4", title: "Upselling Techniques", duration: "08:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=O9z6s5b1e6Q" }, // Upselling
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
      { id: "p1", title: "System Overview", duration: "05:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=X1d-p1z1z1c" }, // Generic POS
      { id: "p2", title: "Entering Complex Orders", duration: "10:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=2y4y4y4y4y4" }, 
      { id: "p3", title: "Splitting Bills", duration: "08:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=3z5z5z5z5z5" },
      { id: "p4", title: "Voiding & Refunds", duration: "07:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=4a6a6a6a6a6" },
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
      { id: "pay1", title: "Card Terminal Operation", duration: "06:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=5b7b7b7b7b7" },
      { id: "pay2", title: "Cash Handling & Change", duration: "09:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=6c8c8c8c8c8" },
      { id: "pay3", title: "Digital Wallets", duration: "05:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=7d9d9d9d9d9" },
    ]
  },

  // KITCHEN / CHEF MODULES
  { 
    id: "haccp-hygiene", 
    title: "HACCP & Hygiene", 
    roles: ["STAFF", "CHEF", "MANAGER", "TRAINEE"],
    description: "Essential food safety standards and hygiene protocols for all staff.",
    progress: 0, 
    totalLessons: 5, 
    completedLessons: 0, 
    badge: "✅",
    chapters: [
      { id: "h1", title: "Personal Hygiene", duration: "08:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=8e0e0e0e0e0" },
      { id: "h2", title: "Cross-Contamination", duration: "12:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=9f1f1f1f1f1" },
      { id: "h3", title: "Temperature Control", duration: "10:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=0g2g2g2g2g2" },
      { id: "h4", title: "Cleaning Schedules", duration: "15:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=1h3h3h3h3h3" },
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
      { id: "k1", title: "Knife Sharpening", duration: "15:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=2i4i4i4i4i4" },
      { id: "k2", title: "Oven Cleaning", duration: "20:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=3j5j5j5j5j5" },
      { id: "k3", title: "Fridge Organization", duration: "10:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=4k6k6k6k6k6" },
    ]
  },
  { 
    id: "cocktail-funds", 
    title: "Cocktail Fundamentals", 
    roles: ["CHEF", "STAFF", "TRAINEE"], 
    description: "Understanding spirits, mixers, and classic cocktail techniques.",
    progress: 0, 
    totalLessons: 12, 
    completedLessons: 0, 
    badge: "🍸",
    chapters: [
      { id: "c1", title: "Spirit Categories", duration: "15:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=5l7l7l7l7l7" },
      { id: "c2", title: "Pouring Techniques", duration: "10:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=6m8m8m8m8m8" },
      { id: "c3", title: "Shaking vs Stirring", duration: "08:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=7n9n9n9n9n9" },
      { id: "c4", title: "Garnishing 101", duration: "12:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=8o0o0o0o0o0" },
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
      { id: "f1", title: "Reading a P&L", duration: "20:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=9p1p1p1p1p1" },
      { id: "f2", title: "Daily Sales Reports", duration: "15:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=0q2q2q2q2q2" },
      { id: "f3", title: "Cost of Goods Sold (COGS)", duration: "25:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=1r3r3r3r3r3" },
    ]
  },
  { 
    id: "leadership", 
    title: "Leadership & Scheduling", 
    roles: ["MANAGER", "OWNER"],
    description: "Effective team management, conflict resolution, and rota planning.",
    progress: 0, 
    totalLessons: 8, 
    completedLessons: 0, 
    badge: "👥",
    chapters: [
      { id: "l1", title: "Effective Communication", duration: "15:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=2s4s4s4s4s4" },
      { id: "l2", title: "Conflict Resolution", duration: "20:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=3t5t5t5t5t5" },
      { id: "l3", title: "Optimizing Schedules", duration: "30:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=4u6u6u6u6u6" },
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
      { id: "i1", title: "Weekly Stock Takes", duration: "15:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=5v7v7v7v7v7" },
      { id: "i2", title: "Supplier Management", duration: "10:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=6w8w8w8w8w8" },
      { id: "i3", title: "Waste Tracking", duration: "12:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=7x9x9x9x9x9" },
    ]
  },
];

let lessonVideoIndex = 0;

export const trainingModules = baseTrainingModules.map((module) => ({
  ...module,
  chapters: (module.chapters || []).map((chapter) => {
    const videoUrl = lessonVideoLibrary[lessonVideoIndex % lessonVideoLibrary.length];
    lessonVideoIndex += 1;
    return {
      ...chapter,
      videoUrl,
    };
  }),
}));

export const recipes = [
  // COCKTAILS
  {
    id: "1",
    name: "Mojito",
    category: "Cocktail",
    isSignature: true,
    difficulty: "Medium",
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
    category: "Cocktail",
    isSignature: true,
    difficulty: "Medium",
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
  {
    id: "3",
    name: "Old Fashioned",
    category: "Cocktail",
    isSignature: false,
    difficulty: "Hard",
    glass: "Rocks",
    method: "Stir",
    garnish: "Orange zest",
    ingredients: [
      { name: "Bourbon", amount: "60ml" },
      { name: "Sugar Cube", amount: "1" },
      { name: "Angostura Bitters", amount: "3 dashes" },
      { name: "Water", amount: "Splash" },
    ],
    instructions: "Soak sugar cube with bitters and water in glass. Muddle. Add ice and whiskey. Stir for 20-30 seconds. Garnish with orange zest.",
  },
  {
    id: "4",
    name: "Margarita",
    category: "Cocktail",
    isSignature: false,
    difficulty: "Medium",
    glass: "Coupe",
    method: "Shake",
    garnish: "Salt rim, Lime wheel",
    ingredients: [
      { name: "Tequila Blanco", amount: "50ml" },
      { name: "Cointreau", amount: "25ml" },
      { name: "Fresh Lime Juice", amount: "25ml" },
      { name: "Sugar Syrup", amount: "5ml (optional)" },
    ],
    instructions: "Rim glass with salt. Add all ingredients to shaker with ice. Shake hard. Strain into glass.",
  },
  {
    id: "5",
    name: "Espresso Martini",
    category: "Cocktail",
    isSignature: true,
    difficulty: "Medium",
    glass: "Coupe",
    method: "Shake",
    garnish: "3 Coffee beans",
    ingredients: [
      { name: "Vodka", amount: "50ml" },
      { name: "Coffee Liqueur", amount: "20ml" },
      { name: "Fresh Espresso", amount: "30ml" },
      { name: "Sugar Syrup", amount: "10ml" },
    ],
    instructions: "Add all ingredients to shaker with ice. Shake very hard to create foam. Double strain into chilled glass.",
  },
  {
    id: "6",
    name: "Negroni",
    category: "Cocktail",
    isSignature: false,
    difficulty: "Easy",
    glass: "Rocks",
    method: "Stir",
    garnish: "Orange slice",
    ingredients: [
      { name: "Gin", amount: "30ml" },
      { name: "Campari", amount: "30ml" },
      { name: "Sweet Vermouth", amount: "30ml" },
    ],
    instructions: "Add all ingredients to glass with ice. Stir until chilled. Garnish with orange slice.",
  },
  {
    id: "7",
    name: "Whiskey Sour",
    category: "Cocktail",
    isSignature: false,
    difficulty: "Medium",
    glass: "Rocks/Coupe",
    method: "Shake (Dry + Wet)",
    garnish: "Lemon peel, cherry",
    ingredients: [
      { name: "Bourbon", amount: "50ml" },
      { name: "Fresh Lemon Juice", amount: "25ml" },
      { name: "Sugar Syrup", amount: "15ml" },
      { name: "Egg White", amount: "1/2 (optional)" },
    ],
    instructions: "Add all ingredients to shaker. Dry shake (no ice) if using egg white. Add ice, shake hard. Strain into glass.",
  },
  {
    id: "8",
    name: "Cosmopolitan",
    category: "Cocktail",
    isSignature: false,
    difficulty: "Medium",
    glass: "Coupe",
    method: "Shake",
    garnish: "Flamed orange zest",
    ingredients: [
      { name: "Citron Vodka", amount: "40ml" },
      { name: "Cointreau", amount: "15ml" },
      { name: "Fresh Lime Juice", amount: "15ml" },
      { name: "Cranberry Juice", amount: "30ml" },
    ],
    instructions: "Add all ingredients to shaker with ice. Shake until chilled. Strain into chilled glass.",
  },

  // FOOD
  {
    id: "f1",
    name: "Truffle Parmesan Fries",
    category: "Food",
    isSignature: true,
    difficulty: "Easy",
    glass: "Bowl",
    method: "Fry & Toss",
    garnish: "Fresh parsley",
    ingredients: [
      { name: "French Fries", amount: "200g" },
      { name: "Truffle Oil", amount: "1 tbsp" },
      { name: "Parmesan Cheese", amount: "20g (grated)" },
      { name: "Sea Salt", amount: "Pinch" },
    ],
    instructions: "Fry fries until golden. Toss immediately in bowl with truffle oil and salt. Top generously with parmesan and parsley.",
  },
  {
    id: "f2",
    name: "Wagyu Smash Burger",
    category: "Food",
    isSignature: true,
    difficulty: "Hard",
    glass: "Plate",
    method: "Grill",
    garnish: "Pickle spear",
    ingredients: [
      { name: "Wagyu Beef Patty", amount: "150g" },
      { name: "Brioche Bun", amount: "1" },
      { name: "Caramelized Onions", amount: "1 tbsp" },
      { name: "Gruyère Cheese", amount: "1 slice" },
      { name: "Truffle Mayo", amount: "1 tbsp" },
    ],
    instructions: "Sear patty on high heat, smash down. Flip, add cheese, cover to melt. Toast bun. Assemble with mayo and onions.",
  },
  {
    id: "f3",
    name: "Miso Glazed Salmon",
    category: "Food",
    isSignature: false,
    difficulty: "Medium",
    glass: "Plate",
    method: "Oven Roast",
    garnish: "Sesame seeds, Scallions",
    ingredients: [
      { name: "Salmon Fillet", amount: "180g" },
      { name: "Miso Paste", amount: "2 tbsp" },
      { name: "Soy Sauce", amount: "1 tsp" },
      { name: "Mirin", amount: "1 tbsp" },
      { name: "Honey", amount: "1 tsp" },
    ],
    instructions: "Whisk marinade ingredients. Coat salmon and marinate for 30 mins. Roast at 200°C for 10-12 mins until flaky.",
  },
  {
    id: "f4",
    name: "Crispy Calamari",
    category: "Food",
    isSignature: false,
    difficulty: "Medium",
    glass: "Basket",
    method: "Deep Fry",
    garnish: "Lemon wedge",
    ingredients: [
      { name: "Squid Rings", amount: "150g" },
      { name: "Flour Mix", amount: "50g" },
      { name: "Paprika", amount: "1 tsp" },
      { name: "Garlic Aioli", amount: "Side" },
    ],
    instructions: "Coat squid in seasoned flour. Fry in hot oil for 2-3 mins until golden. Drain on paper towel. Serve with aioli.",
  },
];
