import PageHeader from "@/components/layout/PageHeader";
import SiteChrome from "@/components/layout/SiteChrome";
import ButtonLink from "@/components/ui/ButtonLink";

export default function NotFound() {
  // The root 404 sits outside the (site) group, so it brings the chrome itself.
  return (
    <SiteChrome>
    <PageHeader french="Oh là là" title="This street doesn’t go anywhere." intro="The page you were looking for has moved or never existed. Let’s get you back to the atelier.">
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink href="/" variant="rose">Back home</ButtonLink>
        <ButtonLink href="/services" variant="outline-dark">See the menu</ButtonLink>
      </div>
    </PageHeader>
    </SiteChrome>
  );
}
