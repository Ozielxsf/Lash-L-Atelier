import SiteChrome from "@/components/layout/SiteChrome";

/** Public pages get the site chrome (see components/layout/SiteChrome.tsx). */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <SiteChrome>{children}</SiteChrome>;
}
