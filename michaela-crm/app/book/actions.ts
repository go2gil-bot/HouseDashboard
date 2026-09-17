"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";

export async function createBooking(formData: FormData) {
  const user = await getUser();
  const roomId = Number(formData.get("room_id"));
  const hotelId = Number(formData.get("hotel_id"));
  const checkIn = String(formData.get("check_in"));
  const checkOut = String(formData.get("check_out"));
  const guests = Number(formData.get("guests") ?? 2);
  const total = Number(formData.get("total_price"));

  if (!user) {
    const back = `/?hotel=${hotelId}&from=${checkIn}&to=${checkOut}&guests=${guests}`;
    redirect(`/login?next=${encodeURIComponent(back)}`);
  }

  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!customer) redirect("/account?error=no-profile");

  const reference = `MCH-W-${Date.now().toString(36).toUpperCase()}`;

  // RLS enforces that customer_id is the caller's own row.
  const { error } = await supabase.from("bookings").insert({
    booking_reference: reference,
    customer_id: customer.id,
    hotel_id: hotelId,
    room_id: roomId,
    check_in: checkIn,
    check_out: checkOut,
    guests,
    status: "Pending",
    channel: "Direct",
    total_amount: total,
    currency: "EUR",
  });

  if (error) redirect(`/account?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/account");
  redirect("/account?booked=1");
}
