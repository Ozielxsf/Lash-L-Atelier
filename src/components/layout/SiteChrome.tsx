import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileActionBar from "@/components/layout/MobileActionBar";
import LenisProvider from "@/components/motion/LenisProvider";
import { BookingProvider } from "@/components/booking/BookingProvider";
import JsonLd from "@/components/seo/JsonLd";
import { isOnlineBookingEnabled } from "@/lib/booking-settings";
import { businessSchema, websiteSchema } from "@/lib/schema";

/**
 * The public site's chrome. Admin pages live outside this group so they never
 * get the public header, footer or bottom "Call to book" bar.
 *
 * The online-booking switch is read here once and handed to client
 * components through BookingProvider. Pages stay statically generated; the
 * admin toggle calls revalidatePath("/", "layout") so every page picks up the
 * change on its next request.
 */
export default async function SiteChrome({ children }: { children: React.ReactNode }) {
  const bookingEnabled = await isOnlineBookingEnabled();
  return (
    <BookingProvider enabled={bookingEnabled}>
      <JsonLd data={businessSchema()} />
      <JsonLd data={websiteSchema()} />
      <LenisProvider>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <MobileActionBar />
      </LenisProvider>
    </BookingProvider>
  );
}
