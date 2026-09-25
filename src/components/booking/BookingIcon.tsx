import { CalendarDays, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

/** Phone while booking is by call; calendar once online booking is on. */
export default function BookingIcon({ online, className }: { online: boolean; className?: string }) {
  const Icon = online ? CalendarDays : Phone;
  return <Icon className={cn("h-4 w-4", className)} aria-hidden="true" />;
}
