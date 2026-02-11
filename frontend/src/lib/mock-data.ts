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

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

type ModuleQuiz = {
  title: string;
  questions: QuizQuestion[];
};

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

const moduleQuizBank: Record<string, ModuleQuiz> = {
  "service-101": {
    title: "Service Excellence Final Quiz",
    questions: [
      { id: "q1", question: "What should happen within the first 30 seconds after guest seating?", options: ["Warm greeting and menu introduction", "Ask for payment method", "Offer dessert menu", "Begin clearing plates"], correctAnswer: 0, explanation: "Fast, warm acknowledgment sets service tone." },
      { id: "q2", question: "What is the best body-language posture for table-side service?", options: ["Crossed arms to look confident", "Open stance and eye contact", "Looking at order pad only", "Standing behind the guest"], correctAnswer: 1, explanation: "Open posture and eye contact signal attentiveness." },
      { id: "q3", question: "When confirming an order, what is most important?", options: ["Speak quickly to save time", "Repeat key items and modifiers", "Only repeat drink orders", "Avoid repeating to prevent annoyance"], correctAnswer: 1, explanation: "Repeating key items prevents costly mistakes." },
      { id: "q4", question: "What is an effective upselling approach?", options: ["Push highest-priced item only", "Suggest relevant add-ons based on guest choice", "Upsell before greeting", "Avoid upselling during busy times"], correctAnswer: 1, explanation: "Contextual recommendations feel helpful, not pushy." },
      { id: "q5", question: "If a guest complaint escalates, first step is to:", options: ["Defend team policy immediately", "Acknowledge and empathize", "Walk away and call manager silently", "Offer discount before listening"], correctAnswer: 1, explanation: "Acknowledgment lowers tension and builds trust." },
      { id: "q6", question: "Which table setting check should happen before service starts?", options: ["Napkins and cutlery aligned to standard", "Only check water glasses", "Skip checks if table looks clean", "Wait for first guest to inspect"], correctAnswer: 0, explanation: "Consistent setup quality is a core service standard." },
      { id: "q7", question: "Best practice when delivering food is to:", options: ["Announce only one dish name", "Place dishes without speaking", "Name each dish and confirm correct guest", "Ask guests to sort dishes themselves"], correctAnswer: 2, explanation: "Calling dishes avoids mix-ups and improves flow." },
      { id: "q8", question: "During a rush, priority for a section is:", options: ["Longest-tenured guests only", "Random table visits", "Structured scan: greeting, drinks, orders, check-back", "Only VIP tables"], correctAnswer: 2, explanation: "A consistent scan prevents dropped service steps." },
      { id: "q9", question: "What creates the strongest closing impression?", options: ["Silent bill drop", "Quick table reset", "Thanking by name and inviting return", "Upselling one last item"], correctAnswer: 2, explanation: "Personalized farewell increases loyalty." },
      { id: "q10", question: "A service recovery is successful when:", options: ["Issue is logged only", "Guest leaves without speaking", "Guest confirms satisfaction after correction", "Manager sends internal note"], correctAnswer: 2, explanation: "Recovery is complete when guest experience is restored." },
    ],
  },
  "pos-mastery": {
    title: "POS Mastery Final Quiz",
    questions: [
      { id: "q1", question: "Why are item modifiers critical in POS entry?", options: ["They only affect kitchen printer font", "They capture preparation details accurately", "They increase tax automatically", "They disable split billing"], correctAnswer: 1, explanation: "Modifiers carry execution details to the kitchen/bar." },
      { id: "q2", question: "Before sending an order, you should:", options: ["Close the table immediately", "Review quantity, modifiers, and seat mapping", "Apply refund", "Change venue profile"], correctAnswer: 1, explanation: "Final review prevents re-fire and voids." },
      { id: "q3", question: "Best way to handle a wrong item entered:", options: ["Leave as is", "Void/correct according to policy with reason", "Delete without trace", "Create second duplicate item"], correctAnswer: 1, explanation: "Traceable corrections protect audit integrity." },
      { id: "q4", question: "When splitting bills, priority is:", options: ["Round totals randomly", "Map items correctly to each guest", "Charge one guest then refund", "Disable discounts"], correctAnswer: 1, explanation: "Accurate allocation avoids disputes at payment." },
      { id: "q5", question: "What should trigger manager approval in many POS setups?", options: ["Adding water", "Void/refund after send", "Printing kitchen chit", "Opening table"], correctAnswer: 1, explanation: "Post-send financial changes usually need authorization." },
      { id: "q6", question: "If POS is slow/unresponsive, first action is:", options: ["Restart entire network immediately", "Check local connectivity and retry safely", "Continue blind entries", "Force-close without saving"], correctAnswer: 1, explanation: "Controlled troubleshooting reduces data loss." },
      { id: "q7", question: "Seat numbers in POS mainly help:", options: ["Increase menu prices", "Track who ordered which item", "Disable handover", "Skip KOT printing"], correctAnswer: 1, explanation: "Seat mapping helps runners and billing accuracy." },
      { id: "q8", question: "A discount should be applied:", options: ["After payment is finalized", "With correct reason/promo code before close", "Only by deleting items", "Never on combo orders"], correctAnswer: 1, explanation: "Proper tagging keeps reports accurate." },
      { id: "q9", question: "What is the safest end-of-shift POS habit?", options: ["Share credentials for speed", "Log out and reconcile your transactions", "Leave terminal unlocked", "Skip cash-out"], correctAnswer: 1, explanation: "Individual accountability depends on secure sign-off." },
      { id: "q10", question: "Why is real-time POS hygiene important?", options: ["Looks cleaner on screen", "Improves reporting and operational decisions", "Changes customer names", "Avoids table service"], correctAnswer: 1, explanation: "Clean data powers labor, stock, and sales decisions." },
    ],
  },
  "payment-processing": {
    title: "Payment Processing Final Quiz",
    questions: [
      { id: "q1", question: "Before processing card payment, confirm:", options: ["Guest social handle", "Amount and table/order reference", "Server shift color", "Kitchen section"], correctAnswer: 1, explanation: "Amount confirmation reduces disputes and chargebacks." },
      { id: "q2", question: "PCI-safe behavior includes:", options: ["Writing full card number in notes", "Never storing card details in plain text", "Sharing CVV with kitchen", "Photographing guest card"], correctAnswer: 1, explanation: "Card data must be protected and minimally handled." },
      { id: "q3", question: "If terminal declines card, first step is:", options: ["Announce loudly", "Retry once and offer alternate method politely", "Cancel order", "Force offline payment"], correctAnswer: 1, explanation: "Professional retry flow keeps checkout smooth." },
      { id: "q4", question: "Cash handling best practice at register:", options: ["Keep drawer open between guests", "Count change back visibly to guest", "Mix personal cash with drawer", "Skip denomination checks"], correctAnswer: 1, explanation: "Transparent counting prevents errors and conflict." },
      { id: "q5", question: "Digital wallet payment requires:", options: ["Manual card imprint", "Successful terminal authorization confirmation", "Paper-only signature", "Manager PIN always"], correctAnswer: 1, explanation: "Authorization result is the legal completion signal." },
      { id: "q6", question: "Refunds should be:", options: ["Processed without record", "Linked to original transaction and reason", "Done as cash always", "Avoided permanently"], correctAnswer: 1, explanation: "Traceable refunds support reconciliation and fraud control." },
      { id: "q7", question: "Tip handling should follow:", options: ["Server preference only", "Venue policy and local compliance rules", "Random rounding", "No documentation"], correctAnswer: 1, explanation: "Consistent policy avoids payroll and legal issues." },
      { id: "q8", question: "In payment disputes, staff should:", options: ["Argue with guest", "Escalate with transaction details and receipt", "Delete transaction", "Ignore issue"], correctAnswer: 1, explanation: "Documented escalation resolves faster and fairly." },
      { id: "q9", question: "End-of-day payment reconciliation compares:", options: ["Weather vs revenue", "POS totals against cash/card settlement", "Menu design", "Staff birthdays"], correctAnswer: 1, explanation: "Reconciliation validates financial accuracy." },
      { id: "q10", question: "Most important objective in checkout:", options: ["Fastest possible exit only", "Accurate, secure, and courteous completion", "Upsell after card approved only", "Manual override every payment"], correctAnswer: 1, explanation: "Speed matters, but accuracy/security come first." },
    ],
  },
  "haccp-hygiene": {
    title: "HACCP & Hygiene Final Quiz",
    questions: [
      { id: "q1", question: "Food danger zone is approximately:", options: ["-5°C to 0°C", "5°C to 60°C", "60°C to 90°C", "0°C to 2°C"], correctAnswer: 1, explanation: "Microbial growth is fastest in 5°C–60°C range." },
      { id: "q2", question: "Handwashing should include:", options: ["Water rinse only", "Soap + friction + proper drying", "Gloves without washing", "Only sanitizer"], correctAnswer: 1, explanation: "Mechanical washing is essential before sanitizing." },
      { id: "q3", question: "Cross-contamination can be reduced by:", options: ["Same board for all foods", "Separate tools for raw and ready-to-eat items", "Reusing marinade", "Ignoring allergen labels"], correctAnswer: 1, explanation: "Separation is core HACCP control." },
      { id: "q4", question: "Cooked hot food should be held at:", options: ["Below 20°C", "At or above safe hot-hold threshold", "Room temperature", "Exactly 30°C"], correctAnswer: 1, explanation: "Hot-holding prevents pathogen growth." },
      { id: "q5", question: "Cooling cooked food safely means:", options: ["Leave out overnight", "Rapid cooling with monitored time/temperature", "Seal while steaming hot", "Place near heat lamp"], correctAnswer: 1, explanation: "Rapid cooling minimizes danger-zone exposure." },
      { id: "q6", question: "Cleaning schedule should define:", options: ["Only who cleans", "What, when, how, and verification", "Only chemical brand", "Only monthly tasks"], correctAnswer: 1, explanation: "Complete SOPs improve repeatability and audits." },
      { id: "q7", question: "Allergen control requires:", options: ["Guessing from memory", "Clear labeling and avoidance of cross-contact", "Ignoring trace amounts", "Only FOH awareness"], correctAnswer: 1, explanation: "Allergen safety depends on full-chain control." },
      { id: "q8", question: "If fridge temp is above limit, first action:", options: ["Ignore briefly", "Quarantine at-risk food and report/escalate", "Serve quickly", "Turn off fridge"], correctAnswer: 1, explanation: "Protect food first, then troubleshoot equipment." },
      { id: "q9", question: "Pest evidence in prep area should be:", options: ["Cleaned and forgotten", "Logged, isolated, and escalated immediately", "Covered with cloth", "Reported weekly"], correctAnswer: 1, explanation: "Immediate response prevents contamination spread." },
      { id: "q10", question: "HACCP records are important because they:", options: ["Decorate audits", "Prove controls were applied and verified", "Replace training", "Remove need for supervision"], correctAnswer: 1, explanation: "Documented controls are central to compliance." },
    ],
  },
  "kitchen-main": {
    title: "Kitchen Maintenance Final Quiz",
    questions: [
      { id: "q1", question: "A primary sign a knife needs sharpening is:", options: ["Blade feels heavy", "It crushes product instead of slicing cleanly", "Handle is shiny", "Color fades"], correctAnswer: 1, explanation: "Poor cut quality signals dull edge." },
      { id: "q2", question: "Routine maintenance of ovens should include:", options: ["Only exterior wipe", "Scheduled deep clean + seal/gasket checks", "Avoid cleaning at all", "Power-cycle during service"], correctAnswer: 1, explanation: "Functional checks prevent service failures." },
      { id: "q3", question: "Best fridge organization method is:", options: ["Random placement", "Raw below ready-to-eat with labeled zones", "Highest shelves for raw poultry", "No date labels"], correctAnswer: 1, explanation: "Zoning reduces contamination risks." },
      { id: "q4", question: "Equipment maintenance logs should capture:", options: ["Only technician name", "Date, issue, action taken, verification", "Only replacement cost", "Only cleaning chemical"], correctAnswer: 1, explanation: "Actionable logs improve reliability and handover." },
      { id: "q5", question: "Before cleaning powered equipment:", options: ["Spray while running", "Isolate power and follow lockout-safe steps", "Remove guards permanently", "Use food cloths"], correctAnswer: 1, explanation: "Safety isolation is mandatory for maintenance." },
      { id: "q6", question: "A blocked drain near prep area should be:", options: ["Ignored until close", "Addressed immediately and sanitized", "Covered with mat", "Reported next week"], correctAnswer: 1, explanation: "Drain issues quickly become hygiene hazards." },
      { id: "q7", question: "Preventive maintenance is better than reactive because:", options: ["It costs more", "It reduces downtime and emergency repairs", "It removes need for SOPs", "It is optional only"], correctAnswer: 1, explanation: "Prevention protects throughput and food safety." },
      { id: "q8", question: "When should calibration checks happen?", options: ["Never", "On schedule and after incidents/repairs", "Only during audits", "Only when guests complain"], correctAnswer: 1, explanation: "Calibration keeps measurements trustworthy." },
      { id: "q9", question: "Which cloth should clean food-contact surfaces?", options: ["Any used rag", "Sanitized dedicated cloths per station", "Floor mop", "Dry tissue only"], correctAnswer: 1, explanation: "Dedicated sanitized tools prevent contamination." },
      { id: "q10", question: "The goal of station close-down checks is:", options: ["Leave quickly", "Hand over clean, functional, stocked stations", "Lock lights only", "Do paperwork later"], correctAnswer: 1, explanation: "Strong close-down enables consistent next shift starts." },
    ],
  },
  "cocktail-funds": {
    title: "Cocktail Fundamentals Final Quiz",
    questions: [
      { id: "q1", question: "The base spirit in a classic Margarita is:", options: ["Gin", "Tequila", "Rum", "Whiskey"], correctAnswer: 1, explanation: "Margarita is tequila-forward." },
      { id: "q2", question: "Shaking is preferred when a drink contains:", options: ["Only clear spirits", "Citrus, dairy, or syrups requiring aeration", "No ingredients", "Only vermouth"], correctAnswer: 1, explanation: "Shaking integrates and chills textured mixes." },
      { id: "q3", question: "Stirring is generally used for:", options: ["Highly pulpy juices", "Spirit-forward drinks needing clarity", "Egg-white sours", "Frozen cocktails"], correctAnswer: 1, explanation: "Stirring preserves texture and clarity." },
      { id: "q4", question: "A jigger is used to:", options: ["Crush ice", "Measure accurate pour volumes", "Strain herbs", "Smoke glassware"], correctAnswer: 1, explanation: "Consistent measurement controls quality and cost." },
      { id: "q5", question: "Why does ice quality matter?", options: ["Only visual effect", "Dilution rate and final drink balance", "It does not matter", "Only glass temperature"], correctAnswer: 1, explanation: "Ice drives chilling and dilution." },
      { id: "q6", question: "Bitters in cocktails primarily add:", options: ["Sugar only", "Aromatic complexity and balance", "Carbonation", "Alcohol proof"], correctAnswer: 1, explanation: "Bitters shape aroma and finish." },
      { id: "q7", question: "A garnish should be:", options: ["Random and oversized", "Functional to aroma/flavor and consistent", "Optional always", "Prepared at table only"], correctAnswer: 1, explanation: "Garnish should elevate, not distract." },
      { id: "q8", question: "Most common reason for inconsistent cocktails:", options: ["Guest glass choice", "Inaccurate measurement/pouring", "Bar music volume", "POS layout"], correctAnswer: 1, explanation: "Measurement discipline is key." },
      { id: "q9", question: "A proper pre-service bar setup includes:", options: ["No mise en place", "Prepared garnishes, chilled glassware, stocked station", "Only spirits", "Only syrups"], correctAnswer: 1, explanation: "Setup enables speed and consistency." },
      { id: "q10", question: "Balanced cocktail taste usually combines:", options: ["Only sweet", "Acid, sweetness, bitterness, and dilution harmony", "Only bitter", "Only high ABV"], correctAnswer: 1, explanation: "Balance is multi-dimensional, not single-note." },
    ],
  },
  "financial-basics": {
    title: "Financial Basics Final Quiz",
    questions: [
      { id: "q1", question: "COGS stands for:", options: ["Cost of Guest Service", "Cost of Goods Sold", "Cash Over Gross Sales", "Cost of Growth Strategy"], correctAnswer: 1, explanation: "COGS is direct product cost consumed for sales." },
      { id: "q2", question: "Gross profit is calculated as:", options: ["Revenue - COGS", "Revenue - Rent", "COGS - Revenue", "Revenue + COGS"], correctAnswer: 0, explanation: "Gross profit isolates contribution before operating costs." },
      { id: "q3", question: "Prime cost usually combines:", options: ["Utilities + marketing", "Labor + COGS", "Rent + tax", "Tips + discounts"], correctAnswer: 1, explanation: "Prime cost is a core controllable KPI." },
      { id: "q4", question: "A rising food cost percentage with flat sales may indicate:", options: ["Perfect purchasing", "Portioning/waste or purchase price issues", "Lower labor hours only", "Higher guest satisfaction only"], correctAnswer: 1, explanation: "Variance often comes from cost control drift." },
      { id: "q5", question: "Daily sales report is most useful for:", options: ["Annual tax filing only", "Operational decisions and trend detection", "Changing venue logo", "Skipping reconciliation"], correctAnswer: 1, explanation: "Daily cadence enables timely corrective actions." },
      { id: "q6", question: "Variance analysis compares:", options: ["Forecast/target vs actual", "Only two random days", "Tips vs weather", "Menu colors"], correctAnswer: 0, explanation: "Variance highlights where performance deviates." },
      { id: "q7", question: "A healthy margin strategy requires:", options: ["Price cuts only", "Balance of pricing, mix, and cost discipline", "Ignoring supplier contracts", "No recipe standards"], correctAnswer: 1, explanation: "Margin comes from both revenue and cost levers." },
      { id: "q8", question: "Comped items should be:", options: ["Hidden from reports", "Tracked with reasons and approvals", "Deleted permanently", "Ignored if small"], correctAnswer: 1, explanation: "Comps affect net revenue and accountability." },
      { id: "q9", question: "Cash flow differs from profit because:", options: ["They are always identical", "Timing of cash movement can differ from accounting profit", "Cash flow ignores payments", "Profit ignores sales"], correctAnswer: 1, explanation: "Liquidity and profitability are related but distinct." },
      { id: "q10", question: "Best weekly financial routine is:", options: ["Review only at month end", "Review KPIs, investigate variance, assign actions", "Focus only on revenue top line", "Ignore labor trends"], correctAnswer: 1, explanation: "Weekly rhythm keeps operations financially healthy." },
    ],
  },
  "leadership": {
    title: "Leadership & Scheduling Final Quiz",
    questions: [
      { id: "q1", question: "Effective feedback is best when it is:", options: ["Delayed and vague", "Timely, specific, and actionable", "Public and harsh", "Only positive always"], correctAnswer: 1, explanation: "Actionable feedback drives behavior change." },
      { id: "q2", question: "In conflict resolution, first leader move is:", options: ["Choose a side instantly", "Listen to both perspectives objectively", "Escalate immediately", "Ignore small conflicts"], correctAnswer: 1, explanation: "Fact-finding prevents biased decisions." },
      { id: "q3", question: "A fair rota/schedule should prioritize:", options: ["Only seniority", "Coverage needs, skills, and legal rest rules", "Random assignment", "Same people every weekend"], correctAnswer: 1, explanation: "Fairness and compliance improve retention." },
      { id: "q4", question: "Delegation works best when leader provides:", options: ["Task only", "Outcome, constraints, and check-in points", "No context", "Only deadline"], correctAnswer: 1, explanation: "Clarity and support increase execution quality." },
      { id: "q5", question: "A pre-shift briefing should include:", options: ["Only menu jokes", "Targets, risks, VIP notes, and role assignments", "No updates", "Long policy reading"], correctAnswer: 1, explanation: "Briefings align the team quickly." },
      { id: "q6", question: "Good leaders monitor morale by:", options: ["Waiting for resignations", "Regular check-ins and observable workload balance", "Reading sales only", "Posting announcements only"], correctAnswer: 1, explanation: "Early signals prevent burnout and turnover." },
      { id: "q7", question: "When a new trainee struggles, a manager should:", options: ["Remove them permanently", "Coach with clear steps and follow-up", "Publicly criticize", "Ignore errors"], correctAnswer: 1, explanation: "Coaching builds competence and confidence." },
      { id: "q8", question: "The purpose of SOPs in leadership is to:", options: ["Reduce autonomy completely", "Create consistency and training baseline", "Replace all judgment", "Increase complexity"], correctAnswer: 1, explanation: "SOPs standardize core outcomes." },
      { id: "q9", question: "Best approach to shift handover between supervisors:", options: ["Verbal only memory", "Structured written + verbal status transfer", "No handover needed", "Personal chat only"], correctAnswer: 1, explanation: "Structured handover reduces operational gaps." },
      { id: "q10", question: "Leadership success in service operations is measured by:", options: ["Loudest manager", "Team performance, retention, and guest outcomes", "Number of meetings", "Punishment count"], correctAnswer: 1, explanation: "Results and team health define sustainable leadership." },
    ],
  },
  "inventory-ctrl": {
    title: "Inventory Control Final Quiz",
    questions: [
      { id: "q1", question: "PAR level means:", options: ["Maximum legal stock", "Target on-hand quantity to maintain operations", "Expired stock threshold", "Price adjustment rule"], correctAnswer: 1, explanation: "PAR is operational target inventory." },
      { id: "q2", question: "FIFO in inventory stands for:", options: ["Fast In Fast Out", "First In First Out", "Final Inventory Final Out", "First Inspection First Order"], correctAnswer: 1, explanation: "FIFO reduces spoilage and old-stock usage." },
      { id: "q3", question: "Cycle counting helps by:", options: ["Replacing all ordering", "Finding variance earlier than monthly stocktake", "Ignoring shrinkage", "Reducing documentation"], correctAnswer: 1, explanation: "Frequent checks catch issues sooner." },
      { id: "q4", question: "A recurring negative variance often indicates:", options: ["Perfect controls", "Waste, theft, or recording inaccuracies", "Higher guest traffic only", "Menu redesign"], correctAnswer: 1, explanation: "Variance needs root-cause analysis." },
      { id: "q5", question: "Best reorder decision uses:", options: ["Guesswork", "Usage rate, lead time, and safety stock", "Supplier mood", "One-time promotions only"], correctAnswer: 1, explanation: "Data-driven reorder prevents stockouts and overstock." },
      { id: "q6", question: "Supplier performance should be reviewed on:", options: ["Logo quality", "Cost, reliability, quality, and lead times", "Website color", "Invoice font"], correctAnswer: 1, explanation: "Procurement quality is multi-factor." },
      { id: "q7", question: "To reduce waste in perishables:", options: ["Over-order for safety", "Track shelf life and enforce rotation discipline", "Ignore prep yield", "Store all at room temp"], correctAnswer: 1, explanation: "Rotation and shelf-life visibility reduce losses." },
      { id: "q8", question: "A purchase order should be:", options: ["Verbal only", "Documented with line items, quantities, and approvals", "Submitted after delivery", "Optional for key suppliers"], correctAnswer: 1, explanation: "PO control improves spend governance." },
      { id: "q9", question: "Stock received should be checked against:", options: ["Only supplier promise", "PO quantity/quality before acceptance", "Guest feedback", "Weekly schedule"], correctAnswer: 1, explanation: "Receiving controls prevent bad inventory intake." },
      { id: "q10", question: "Most useful inventory KPI set includes:", options: ["Only total stock value", "Stock turns, variance %, waste %, stockout rate", "Only number of suppliers", "Only menu price"], correctAnswer: 1, explanation: "A balanced KPI set drives better decisions." },
    ],
  },
};

function buildFinalQuizChapter(moduleId: string, moduleTitle: string) {
  const quiz = moduleQuizBank[moduleId];
  return {
    id: `${moduleId}-final-quiz`,
    title: quiz?.title ?? `${moduleTitle} Final Quiz`,
    duration: "10 Questions",
    completed: false,
    type: "QUIZ" as const,
    passPercent: 70,
    quizQuestions: quiz?.questions ?? [],
  };
}

let lessonVideoIndex = 0;

export const trainingModules = baseTrainingModules.map((module) => ({
  ...module,
  chapters: [
    ...(module.chapters || []).map((chapter) => {
      const videoUrl = lessonVideoLibrary[lessonVideoIndex % lessonVideoLibrary.length];
      lessonVideoIndex += 1;
      return {
        ...chapter,
        type: "VIDEO" as const,
        videoUrl,
      };
    }),
    buildFinalQuizChapter(module.id, module.title),
  ],
  totalLessons: (module.chapters || []).length + 1,
  completedLessons: 0,
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
