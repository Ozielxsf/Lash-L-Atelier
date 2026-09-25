"use client";

import { createContext, useContext } from "react";
import { getBookingAction, type BookingAction } from "@/lib/booking";

/**
 * Carries the online-booking switch (read once in the root layout) down to
 * client components — header, phone menu, bottom bar, lash selector — so they
 * all agree with the server-rendered buttons.
 */
const BookingContext = createContext<boolean>(false);

export function BookingProvider({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  return <BookingContext.Provider value={enabled}>{children}</BookingContext.Provider>;
}

export function useBookingAction(): BookingAction {
  return getBookingAction(useContext(BookingContext));
}
