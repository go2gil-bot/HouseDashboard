import { chromium } from "playwright";
import path from "node:path";

const OUT = path.join(process.cwd(), "shots");
const BASE = "http://localhost:3000";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

const shot = async (name, opts = {}) => {
  await page.waitForTimeout(3500); // let picsum images settle
  await page.screenshot({ path: path.join(OUT, name), ...opts });
  console.log("captured", name);
};

// ---------------------------------------------------------- public browsing --
await page.goto(BASE, { waitUntil: "networkidle" });
await shot("01-home-anonymous.png", { fullPage: true });

// Property A
await page.goto(`${BASE}/?hotel=2&from=2026-09-10&to=2026-09-14&guests=2`, {
  waitUntil: "networkidle",
});
await shot("02-availability-santorini.png", { fullPage: true });

// Property B — same dates, different hotel
await page.goto(`${BASE}/?hotel=3&from=2026-09-10&to=2026-09-14&guests=2`, {
  waitUntil: "networkidle",
});
await shot("03-availability-zurich.png", { fullPage: true });

// Property C
await page.goto(`${BASE}/?hotel=4&from=2026-09-10&to=2026-09-14&guests=2`, {
  waitUntil: "networkidle",
});
await shot("04-availability-telaviv.png", { fullPage: true });

// Room cards close up
await page.goto(`${BASE}/?hotel=2&from=2026-09-10&to=2026-09-14&guests=2`, {
  waitUntil: "networkidle",
});
await page.locator("main article").first().scrollIntoViewIfNeeded();
await page.mouse.wheel(0, 420);
await shot("05-room-cards.png");

// ------------------------------------------ booking blocked without account --
await page.locator("main article form button").first().click();
await page.waitForURL(/login/, { timeout: 15000 }).catch(() => {});
await shot("06-booking-requires-signin.png");

// ------------------------------------------------------------ registration --
await page.goto(`${BASE}/signup`, { waitUntil: "networkidle" });
await shot("07-signup-empty.png");

await page.fill('input[name="first_name"]', "Dana");
await page.fill('input[name="last_name"]', "Cohen");
await page.fill('input[name="email"]', "dana.cohen@gmail.com");
await page.fill('input[name="password"]', "SummerInSantorini26");
await page.check('input[name="marketing_opt_in"]');
await shot("08-signup-filled.png");

await page.goto(`${BASE}/signup?confirm=1`, { waitUntil: "networkidle" });
await shot("09-signup-check-inbox.png");

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.fill('input[name="email"]', "go2gil@gmail.com");
await page.fill('input[name="password"]', "12345");
await shot("10-login-filled.png");

await page.click('form button[type="submit"], form button');
await page.waitForURL(/account/, { timeout: 20000 }).catch(() => {});
await page.waitForLoadState("networkidle");
await shot("11-account-my-bookings.png", { fullPage: true });

// ------------------------------------------------------------------ admin ---
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
await shot("12-admin-overview.png", { fullPage: true });

await page.goto(`${BASE}/admin?tab=customers`, { waitUntil: "networkidle" });
await shot("13-admin-customers.png", { fullPage: true });

await page.goto(`${BASE}/admin?tab=bookings`, { waitUntil: "networkidle" });
await shot("14-admin-bookings.png", { fullPage: true });

await browser.close();
console.log("done");
