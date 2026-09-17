// The one place language and direction are decided. Switch LOCALE to "he" and
// the whole app turns around: every component is written in logical
// properties, so no layout code changes with it.
export type Locale = "en" | "he";

export const LOCALE: Locale = "en";

// Looked up rather than compared: TypeScript narrows a const to its literal,
// so `LOCALE === "he"` would be flagged as an impossible comparison.
const DIRS: Record<Locale, "ltr" | "rtl"> = { en: "ltr", he: "rtl" };
export const DIR = DIRS[LOCALE];

const en = {
  // Nav
  wordmark: "Michaela Hotels",
  roleStaff: "Staff",
  roleGuest: "Guest",
  availability: "Availability",
  myBookings: "My bookings",
  adminLink: "Admin",
  signOut: "Sign out",
  signIn: "Sign in",
  register: "Register",

  // Home
  findRoom: "Find a room",
  homeLead:
    "Five boutique properties. Availability is checked live against real bookings — no account needed to look.",
  property: "Property",
  checkIn: "Check in",
  checkOut: "Check out",
  guests: "Guests",
  searchAvailability: "Search availability",
  roomsAvailable: (n: number) => `${n} room${n === 1 ? "" : "s"} available`,
  guestCount: (n: number) => `${n} guest${n === 1 ? "" : "s"}`,
  nothingFree:
    "Nothing free for those dates. Try a different property or shift the dates.",
  perNight: " / night · up to ",
  guestsWord: " guests",
  nights: (n: number) => `${n} night${n === 1 ? "" : "s"}`,
  totalWord: "total",
  bookThisRoom: "Book this room",

  // Sign in
  loginLead:
    "Guests see their own bookings. Staff accounts also get the admin console.",
  email: "Email",
  password: "Password",
  signingIn: "Signing in…",
  noAccount: "No account?",

  // Register
  checkInbox: "Check your inbox",
  confirmLead:
    "Your account was created. Click the confirmation link we emailed you, then sign in.",
  goToSignIn: "Go to sign in",
  createAccount: "Create an account",
  signupLead:
    "A guest profile is created automatically and linked to your bookings.",
  firstName: "First name",
  lastName: "Last name",
  marketingOptIn: "Send me offers from Michaela Hotels",
  invalidEmailHelp:
    "Supabase rejects addresses whose domain has no real mail server — including example.com. Use a live address.",
  creating: "Creating…",
  alreadyRegistered: "Already registered?",

  // Account
  bookingCreated: "Booking created. Front desk will confirm it shortly.",
  myAccount: "My account",
  points: "points",
  nothingBooked: "Nothing booked yet.",

  // Admin
  staffOnly: "Staff only",
  staffOnlyNeeds: "This console needs",
  staffOnlyOnAccount:
    "on your account. Guests see their own bookings under",
  adminConsole: "Admin console",
  signedInAs: "Signed in as",
  fullAccess: "— full access across all five properties.",
  tabs: { overview: "overview", customers: "customers", bookings: "bookings" },
  kpiCustomers: "Customers",
  kpiBookings: "Bookings",
  kpiRevenue: "Revenue",
  revenueByProperty: "Revenue by property",
  colGuest: "Guest",
  colEmail: "Email",
  colLocation: "Location",
  colTier: "Tier",
  colPoints: "Points",
  colReference: "Reference",
  colProperty: "Property",
  colRoom: "Room",
  colDates: "Dates",
  colChannel: "Channel",
  colStatus: "Status",
  colTotal: "Total",

  // Values that arrive from the database
  status: {} as Record<string, string>,
  tier: {} as Record<string, string>,
};

const he: typeof en = {
  // Nav
  wordmark: "מלונות מיכאלה",
  roleStaff: "צוות",
  roleGuest: "אורח",
  availability: "זמינות",
  myBookings: "ההזמנות שלי",
  adminLink: "ניהול",
  signOut: "התנתקות",
  signIn: "התחברות",
  register: "הרשמה",

  // Home
  findRoom: "מצאו חדר",
  homeLead:
    "חמישה בתי מלון בוטיק. הזמינות נבדקת בזמן אמת מול הזמנות אמיתיות — אין צורך בחשבון כדי להציץ.",
  property: "בית מלון",
  checkIn: "תאריך הגעה",
  checkOut: "תאריך עזיבה",
  guests: "אורחים",
  searchAvailability: "חיפוש זמינות",
  roomsAvailable: (n: number) =>
    n === 1 ? "חדר אחד פנוי" : `${n} חדרים פנויים`,
  guestCount: (n: number) => (n === 1 ? "אורח אחד" : `${n} אורחים`),
  nothingFree:
    "אין חדרים פנויים בתאריכים האלה. נסו בית מלון אחר או הזיזו את התאריכים.",
  perNight: " ללילה · עד ",
  guestsWord: " אורחים",
  nights: (n: number) => (n === 1 ? "לילה אחד" : `${n} לילות`),
  totalWord: "סך הכול",
  bookThisRoom: "הזמינו את החדר",

  // Sign in
  loginLead:
    "אורחים רואים את ההזמנות שלהם. לחשבונות צוות יש גם גישה לקונסולת הניהול.",
  email: "אימייל",
  password: "סיסמה",
  signingIn: "מתחבר…",
  noAccount: "אין לכם חשבון?",

  // Register
  checkInbox: "בדקו את תיבת הדואר",
  confirmLead:
    "החשבון נוצר. לחצו על קישור האישור ששלחנו לכם במייל, ואז התחברו.",
  goToSignIn: "מעבר להתחברות",
  createAccount: "פתיחת חשבון",
  signupLead: "פרופיל אורח נוצר אוטומטית ומקושר להזמנות שלכם.",
  firstName: "שם פרטי",
  lastName: "שם משפחה",
  marketingOptIn: "שלחו לי הצעות ממלונות מיכאלה",
  invalidEmailHelp:
    "‏Supabase דוחה כתובות שלדומיין שלהן אין שרת דואר אמיתי — כולל example.com. השתמשו בכתובת פעילה.",
  creating: "יוצר…",
  alreadyRegistered: "כבר רשומים?",

  // Account
  bookingCreated: "ההזמנה נוצרה. הקבלה תאשר אותה בקרוב.",
  myAccount: "החשבון שלי",
  points: "נקודות",
  nothingBooked: "עדיין לא הזמנתם כלום.",

  // Admin
  staffOnly: "לצוות בלבד",
  staffOnlyNeeds: "הקונסולה הזאת דורשת",
  staffOnlyOnAccount: "בחשבון שלכם. אורחים רואים את ההזמנות שלהם תחת",
  adminConsole: "קונסולת ניהול",
  signedInAs: "מחוברים כ־",
  fullAccess: "— גישה מלאה לכל חמשת בתי המלון.",
  tabs: { overview: "סקירה", customers: "אורחים", bookings: "הזמנות" },
  kpiCustomers: "אורחים",
  kpiBookings: "הזמנות",
  kpiRevenue: "הכנסות",
  revenueByProperty: "הכנסות לפי בית מלון",
  colGuest: "אורח",
  colEmail: "אימייל",
  colLocation: "מיקום",
  colTier: "דרגה",
  colPoints: "נקודות",
  colReference: "אסמכתה",
  colProperty: "בית מלון",
  colRoom: "חדר",
  colDates: "תאריכים",
  colChannel: "ערוץ",
  colStatus: "סטטוס",
  colTotal: "סך הכול",

  // Values that arrive from the database, translated on the way out. Anything
  // not listed falls back to the stored English word rather than vanishing.
  status: {
    Confirmed: "מאושרת",
    "Checked-in": "בצ'ק-אין",
    Landed: "נחתה",
    Pending: "ממתינה",
    Delayed: "מתעכבת",
    Scheduled: "מתוכננת",
    Cancelled: "בוטלה",
    "Checked-out": "הסתיימה",
  },
  tier: {
    Bronze: "ארד",
    Silver: "כסף",
    Gold: "זהב",
    Platinum: "פלטינה",
  },
};

const DICTS: Record<Locale, typeof en> = { en, he };
export const t = DICTS[LOCALE];
