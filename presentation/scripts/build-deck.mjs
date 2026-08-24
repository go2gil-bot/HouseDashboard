import pptxgen from "pptxgenjs";
import fs from "node:fs";
import path from "node:path";

const SHOTS = path.join(process.cwd(), "shots");
const OUT = process.argv[2] || path.join(process.cwd(), "michaela-crm.pptx");

const TEAL = "0F5B57";
const TEAL_DARK = "093B38";
const TEAL_SOFT = "E3EDEC";
const GOLD = "C9A227";
const GOLD_SOFT = "F6EFD9";
const INK = "1A1A1A";
const MUTED = "6B7280";
const LINE = "DDDAD2";
const PAPER = "FFFFFF";

const HE = { fontFace: "Arial", rtlMode: true, align: "right" };
const has = (f) => fs.existsSync(path.join(SHOTS, f));
const img = (f) => path.join(SHOTS, f);

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
pres.author = "Gil Levi";
pres.title = "Michaela Hotels CRM";

const shadow = () => ({
  type: "outer",
  blur: 14,
  offset: 3,
  angle: 90,
  color: "999999",
  opacity: 0.35,
});

/** Standard content slide: right-aligned Hebrew title, optional kicker. */
function contentSlide(title, kicker) {
  const s = pres.addSlide();
  s.background = { color: PAPER };
  s.addText(title, {
    ...HE,
    x: 0.5,
    y: 0.35,
    w: 12.3,
    h: 0.75,
    fontSize: 34,
    bold: true,
    color: TEAL,
  });
  if (kicker) {
    s.addText(kicker, {
      ...HE,
      x: 0.5,
      y: 1.08,
      w: 12.3,
      h: 0.4,
      fontSize: 14,
      color: MUTED,
    });
  }
  return s;
}

function shotSlide(title, kicker, file, opts = {}) {
  if (!has(file)) {
    console.log("SKIP (missing)", file);
    return null;
  }
  const s = contentSlide(title, kicker);
  s.addImage({
    path: img(file),
    x: opts.x ?? 1.15,
    y: opts.y ?? 1.65,
    w: opts.w ?? 11.0,
    h: opts.h ?? 5.4,
    sizing: { type: "contain", w: opts.w ?? 11.0, h: opts.h ?? 5.4 },
    shadow: shadow(),
  });
  return s;
}

// ───────────────────────────────────────────────────────────── 1. title ──────
{
  const s = pres.addSlide();
  s.background = { color: TEAL_DARK };

  s.addShape(pres.ShapeType.ellipse, {
    x: 10.6, y: -1.4, w: 4.6, h: 4.6,
    fill: { color: TEAL, transparency: 45 },
  });
  s.addShape(pres.ShapeType.ellipse, {
    x: -1.2, y: 5.2, w: 3.4, h: 3.4,
    fill: { color: GOLD, transparency: 78 },
  });

  s.addText("תרגיל שימוש בקלוד", {
    ...HE, x: 0.8, y: 1.75, w: 11.7, h: 1.0,
    fontSize: 46, bold: true, color: "FFFFFF",
  });
  s.addText("להקמת מערכת נתונים חיה ומתעדכנת", {
    ...HE, x: 0.8, y: 2.75, w: 11.7, h: 0.9,
    fontSize: 40, bold: true, color: GOLD,
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 8.05, y: 4.25, w: 4.45, h: 0.85,
    fill: { color: TEAL }, rectRadius: 0.12,
  });
  s.addText("מגישים  גיל לוי והקלוד הנחמד שלו", {
    ...HE, x: 8.2, y: 4.25, w: 4.15, h: 0.85,
    fontSize: 17, color: "FFFFFF", valign: "middle", margin: 0,
  });

  s.addText("* גם מצגת זאת הוכנה על ידי קלוד הנחמד", {
    ...HE, x: 0.8, y: 6.45, w: 11.7, h: 0.45,
    fontSize: 13, italic: true, color: "9FBDBA",
  });
  s.addNotes("Michaela Hotels CRM — exercise submission.");
}

// ──────────────────────────────────────────────────────── 2. what we built ───
{
  const s = contentSlide("מה נבנה", "שלוש שכבות, מערכת אחת חיה");
  const cards = [
    ["מסד נתונים", "Supabase / Postgres\n5 טבלאות, נתונים סינתטיים,\nהרשאות ברמת השורה"],
    ["אתר לאורחים", "Next.js\nחיפוש זמינות חי,\nהרשמה והזמנת חדר"],
    ["קונסולת ניהול", "מסך צוות\nלקוחות, הזמנות\nוהכנסות לפי מלון"],
  ];
  cards.forEach(([h, body], i) => {
    const x = 8.85 - i * 4.15;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 1.95, w: 3.85, h: 3.5,
      fill: { color: "FFFFFF" }, line: { color: LINE, width: 1 },
      rectRadius: 0.14, shadow: shadow(),
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: x + 3.0, y: 2.25, w: 0.62, h: 0.62, fill: { color: GOLD_SOFT },
    });
    s.addText(String(i + 1), {
      x: x + 3.0, y: 2.25, w: 0.62, h: 0.62, fontSize: 16, bold: true,
      color: GOLD, align: "center", valign: "middle", margin: 0,
      fontFace: "Arial",
    });
    s.addText(h, {
      ...HE, x: x + 0.25, y: 3.05, w: 3.35, h: 0.5,
      fontSize: 21, bold: true, color: TEAL,
    });
    s.addText(body, {
      ...HE, x: x + 0.25, y: 3.6, w: 3.35, h: 1.6,
      fontSize: 14, color: MUTED, lineSpacingMultiple: 1.25,
    });
  });
}

// ──────────────────────────────────────────────────────────── 3. the ERD ─────
{
  const s = contentSlide("מבנה הנתונים והקשרים", "חמש טבלאות ושישה מפתחות זרים, כפי שהם מוגדרים במסד עצמו");

  const box = (x, y, w, name, cols, tone) => {
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w, h: 1.5,
      fill: { color: tone === "core" ? TEAL : "FFFFFF" },
      line: { color: tone === "core" ? TEAL : LINE, width: 1 },
      rectRadius: 0.1, shadow: shadow(),
    });
    s.addText(name, {
      x: x + 0.15, y: y + 0.1, w: w - 0.3, h: 0.4, fontSize: 16, bold: true,
      color: tone === "core" ? "FFFFFF" : TEAL, align: "left",
      fontFace: "Arial", margin: 0,
    });
    s.addText(cols, {
      x: x + 0.15, y: y + 0.52, w: w - 0.3, h: 0.9, fontSize: 10.5,
      color: tone === "core" ? "CFE2E0" : MUTED, align: "left",
      fontFace: "Arial", margin: 0, lineSpacingMultiple: 1.15,
    });
  };

  // parents on the right, children flowing left (RTL reading)
  box(10.15, 1.75, 2.6, "hotels", "id · code · name\ncity · country\nstar_rating", "plain");
  box(10.15, 4.05, 2.6, "rooms", "id · hotel_id →\nroom_type · rate\nimage_url", "plain");
  box(5.85, 2.9, 2.9, "bookings", "id · reference\ncustomer_id → · hotel_id →\nroom_id → · dates · status", "core");
  box(1.55, 1.75, 2.9, "customers", "id · user_id →\nname · email\nloyalty_tier", "core");
  box(1.55, 4.65, 2.9, "flights", "id · booking_id →\ncustomer_id → · route\ndeparture_time", "core");

  const link = (x1, y1, x2, y2, label, lx, ly) => {
    s.addShape(pres.ShapeType.line, {
      x: Math.min(x1, x2), y: Math.min(y1, y2),
      w: Math.abs(x2 - x1), h: Math.abs(y2 - y1),
      line: { color: GOLD, width: 1.75, dashType: "solid" },
      flipH: x2 < x1, flipV: y2 < y1,
    });
    if (label) {
      s.addText(label, {
        x: lx, y: ly, w: 1.5, h: 0.28, fontSize: 9, color: GOLD,
        align: "center", fontFace: "Arial", margin: 0, bold: true,
      });
    }
  };

  link(10.15, 2.5, 8.75, 3.4, "hotel_id", 9.0, 2.62);   // hotels -> bookings
  link(10.15, 4.8, 8.75, 3.9, "room_id", 9.0, 4.35);    // rooms  -> bookings
  link(10.15, 3.25, 11.45, 4.05, "hotel_id", 9.35, 3.5); // hotels -> rooms
  link(5.85, 3.4, 4.45, 2.5, "customer_id", 4.55, 2.72); // customers -> bookings
  link(5.85, 3.9, 4.45, 5.4, "booking_id", 4.5, 4.35);   // bookings -> flights
  link(3.0, 3.25, 3.0, 4.65, "customer_id", 2.25, 3.85); // customers -> flights

  s.addText(
    "מחיקת לקוח מוחקת גם את ההזמנות והטיסות שלו.  ·  מלון שיש לו הזמנות אינו ניתן למחיקה.  ·  מחיקת חדר משאירה את ההזמנה במקומה, ללא שיוך לחדר.",
    { ...HE, x: 0.5, y: 6.5, w: 12.3, h: 0.55, fontSize: 12.5, color: MUTED, align: "center" },
  );
}

// ────────────────────────────────────────────────── 4-5. supabase screens ────
shotSlide("הפרויקט ב-Supabase", "מסד נתונים חי באזור פרנקפורט, עם היסטוריית מיגרציות", "s00-project-overview.png", { y: 1.7, h: 5.2 });
shotSlide("עורך הטבלאות", "טבלת ההזמנות עם הנתונים האמיתיים, וחמש הטבלאות בסרגל הצד", "s01-table-editor.png", { y: 1.7, h: 5.2 });
shotSlide("הקשרים בין הטבלאות", "המפתחות הזרים כפי שהמסד עצמו מצייר אותם, כולל הקישור לחשבונות ההתחברות", "s03-schema-visualizer.png", { y: 1.7, h: 5.2 });
shotSlide("משתמשי המערכת", "שלושת החשבונות: מנהל ושני חשבונות בדיקה, כל אחד מקושר לרשומת לקוח", "s05-auth-users.png", { y: 1.85, h: 4.6 });

// ────────────────────────────────────────────────────────── 6. the data ──────
{
  const s = contentSlide("הנתונים שבמערכת", "נתונים סינתטיים שנוצרים באופן דטרמיניסטי. הרצה מחדש מייצרת בדיוק אותו מידע");
  const stats = [
    ["5", "מלונות"],
    ["25", "חדרים עם תמונות"],
    ["26", "לקוחות"],
    ["61", "הזמנות"],
    ["76", "קטעי טיסה"],
  ];
  stats.forEach(([n, label], i) => {
    const x = 10.55 - i * 2.42;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 2.3, w: 2.2, h: 2.2,
      fill: { color: i === 0 ? TEAL : TEAL_SOFT },
      rectRadius: 0.14,
    });
    s.addText(n, {
      x, y: 2.55, w: 2.2, h: 1.0, fontSize: 46, bold: true,
      color: i === 0 ? "FFFFFF" : TEAL, align: "center", margin: 0,
      fontFace: "Arial",
    });
    s.addText(label, {
      ...HE, x, y: 3.6, w: 2.2, h: 0.6, fontSize: 13,
      color: i === 0 ? "CFE2E0" : MUTED, align: "center",
    });
  });
  s.addText(
    "חמישה מלונות: ליסבון · סנטוריני · ציריך · תל אביב · פראג",
    { ...HE, x: 0.5, y: 4.95, w: 12.3, h: 0.5, fontSize: 17, bold: true, color: TEAL, align: "center" },
  );
  s.addText(
    "לכל חדר תמונה, מחיר ללילה ותפוסה מרבית. הזמנות וטיסות נוצרות מגיבוב דטרמיניסטי, כך שהמידע זהה בכל הרצה.",
    { ...HE, x: 1.5, y: 5.5, w: 10.3, h: 0.6, fontSize: 14, color: MUTED, align: "center" },
  );
}

// ──────────────────────────────────────────────────────── 7-10. the site ─────
shotSlide("האתר פתוח לכל אחד", "חמשת המלונות פתוחים לצפייה ללא חשבון", "01-home-anonymous.png", { y: 1.6, h: 5.4 });

{
  const s = contentSlide("מעבר בין מלונות", "אותם תאריכים, מלון אחר. הזמינות מחושבת מחדש מול ההזמנות האמיתיות");
  const files = ["02-availability-santorini.png", "03-availability-zurich.png", "04-availability-telaviv.png"];
  const names = ["סנטוריני", "ציריך", "תל אביב"];
  files.forEach((f, i) => {
    if (!has(f)) return;
    const x = 9.0 - i * 4.15;
    s.addImage({
      path: img(f), x, y: 1.85, w: 3.85, h: 4.3,
      sizing: { type: "contain", w: 3.85, h: 4.3 }, shadow: shadow(),
    });
    s.addText(names[i], {
      ...HE, x, y: 6.3, w: 3.85, h: 0.4, fontSize: 15, bold: true,
      color: TEAL, align: "center",
    });
  });
}

shotSlide("כרטיסי החדרים", "לכל חדר תמונה, מחיר ללילה, תפוסה וסך הכל לשהות", "05-room-cards.png", { y: 1.6, h: 5.4 });
shotSlide("להזמין חדר צריך חשבון", "לחיצה על כפתור ההזמנה ללא התחברות מפנה את המבקר למסך הכניסה", "06-booking-requires-signin.png", { y: 1.6, h: 5.4 });

// ───────────────────────────────────────────────────── 11. registration ──────
{
  const s = contentSlide("הליך ההרשמה", "שלושה שלבים: מילוי פרטים, אישור אימייל, כניסה למערכת");
  const files = ["07-signup-empty.png", "08-signup-filled.png", "09-signup-check-inbox.png"];
  const caps = ["טופס הרשמה", "מילוי פרטי האורח", "אישור נשלח לאימייל"];
  files.forEach((f, i) => {
    if (!has(f)) return;
    const x = 9.0 - i * 4.15;
    s.addImage({
      path: img(f), x, y: 1.9, w: 3.85, h: 4.15,
      sizing: { type: "contain", w: 3.85, h: 4.15 }, shadow: shadow(),
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: x + 3.25, y: 6.15, w: 0.5, h: 0.5, fill: { color: GOLD_SOFT },
    });
    s.addText(String(i + 1), {
      x: x + 3.25, y: 6.15, w: 0.5, h: 0.5, fontSize: 14, bold: true,
      color: GOLD, align: "center", valign: "middle", margin: 0, fontFace: "Arial",
    });
    s.addText(caps[i], {
      ...HE, x, y: 6.2, w: 3.15, h: 0.4, fontSize: 13, color: MUTED,
    });
  });
}

shotSlide("האזור האישי של האורח", "כל אורח רואה אך ורק את ההזמנות שלו. הסינון נאכף במסד, לא בממשק", "11-account-my-bookings.png", { y: 1.6, h: 5.4 });

// ──────────────────────────────────────────────────────────── 13-14. admin ───
shotSlide("קונסולת הניהול", "מדדים והכנסות לפי מלון, גלוי רק למשתמש עם הרשאת צוות", "12-admin-overview.png", { y: 1.6, h: 5.4 });
shotSlide("ניהול הלקוחות", "כל 26 הלקוחות, דרגות נאמנות ונקודות", "13-admin-customers.png", { y: 1.6, h: 5.4 });
shotSlide("ניהול ההזמנות", "כל ההזמנות ברשת, עם ערוץ הזמנה, סטטוס וסכום", "14-admin-bookings.png", { y: 1.6, h: 5.4 });

// ─────────────────────────────────────────────────────────── 15. security ────
{
  const s = contentSlide("שתי רמות הרשאה", "ההפרדה נאכפת במסד הנתונים, כך שגם פנייה ישירה לשרת לא עוקפת אותה");
  const rows = [
    ["צפייה במלונות ובחדרים", "כן, ללא חשבון", "כן"],
    ["חיפוש זמינות", "כן, ללא חשבון", "כן"],
    ["יצירת הזמנה", "רק לעצמו, אחרי הרשמה", "לכל לקוח"],
    ["צפייה בהזמנות", "רק שלו", "הכל"],
    ["צפייה בלקוחות", "רק הפרופיל שלו", "הכל"],
    ["קונסולת ניהול", "חסום", "פתוח"],
  ];
  const y0 = 2.1, rh = 0.62;

  [["יכולת", 6.4, 5.65], ["אורח", 3.3, 3.0], ["צוות", 0.6, 2.6]].forEach(([h, x, w]) => {
    s.addText(h, {
      ...HE, x, y: y0 - 0.5, w, h: 0.4, fontSize: 13, bold: true,
      color: MUTED, align: "center",
    });
  });

  rows.forEach(([cap, guest, staff], i) => {
    const y = y0 + i * rh;
    if (i % 2 === 0) {
      s.addShape(pres.ShapeType.rect, {
        x: 0.6, y, w: 11.7, h: rh, fill: { color: "F7F6F3" }, line: { color: "F7F6F3", width: 1 },
      });
    }
    s.addText(cap, { ...HE, x: 6.4, y, w: 5.65, h: rh, fontSize: 14, color: INK, valign: "middle", margin: 0 });
    s.addText(guest, { ...HE, x: 3.3, y, w: 3.0, h: rh, fontSize: 13, color: MUTED, align: "center", valign: "middle", margin: 0 });
    s.addText(staff, { ...HE, x: 0.6, y, w: 2.6, h: rh, fontSize: 13, color: TEAL, bold: true, align: "center", valign: "middle", margin: 0 });
  });

  s.addText(
    "הרשאת הצוות נשמרת בשדה שרק השרת יכול לכתוב אליו, ולא בשדה שהמשתמש עצמו רשאי לערוך.\nאחרת כל אורח היה יכול להפוך את עצמו למנהל.",
    { ...HE, x: 0.6, y: 6.05, w: 11.7, h: 0.8, fontSize: 12.5, color: MUTED, lineSpacingMultiple: 1.3 },
  );
}

// ───────────────────────────────────────────────────────────── 16. close ─────
{
  const s = pres.addSlide();
  s.background = { color: TEAL_DARK };
  s.addShape(pres.ShapeType.ellipse, {
    x: -1.5, y: -1.5, w: 4.2, h: 4.2, fill: { color: TEAL, transparency: 50 },
  });
  s.addText("מערכת חיה, לא הדגמה", {
    ...HE, x: 0.8, y: 2.2, w: 11.7, h: 0.9, fontSize: 40, bold: true, color: "FFFFFF",
  });
  s.addText(
    "הזמנה שנוצרת באתר נכתבת למסד ומעלימה את החדר מהזמינות באותו רגע.\nהמדדים בקונסולת הניהול מתעדכנים מהנתונים עצמם.",
    { ...HE, x: 0.8, y: 3.25, w: 11.7, h: 1.2, fontSize: 18, color: "CFE2E0", lineSpacingMultiple: 1.4 },
  );
  s.addText("* גם מצגת זאת הוכנה על ידי קלוד הנחמד", {
    ...HE, x: 0.8, y: 6.45, w: 11.7, h: 0.45, fontSize: 13, italic: true, color: GOLD,
  });
}

await pres.writeFile({ fileName: OUT });
console.log("wrote", OUT);
