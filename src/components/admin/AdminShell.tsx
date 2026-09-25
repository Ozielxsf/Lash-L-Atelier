import Link from "next/link";
import Wordmark from "@/components/brand/Wordmark";
import LogoutButton from "@/components/admin/LogoutButton";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Bookings" },
  { href: "/admin/schedule", label: "Schedule" },
];

/**
 * The owner's side of the site. Utilitarian by design (WALLINK_STACK: "the
 * admin is a tool, the public site is the experience") but still unmistakably
 * Lash L'Atelier — noir bar, blush paper, the same type.
 */
export default function AdminShell({
  active,
  title,
  children,
}: {
  active: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="bg-noir text-creme">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <Link href="/admin" aria-label="Studio admin home" className="pt-1">
            <Wordmark size="header" />
          </Link>
          <nav aria-label="Admin" className="flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active === item.href ? "page" : undefined}
                className={cn(
                  "min-h-10 rounded-full px-3 py-2 text-sm",
                  active === item.href ? "bg-rose text-noir" : "text-creme/85 hover:text-rose",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/" className="hidden min-h-10 px-3 py-2 text-sm text-creme/70 hover:text-rose sm:inline-block">
              View site ↗
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-5xl px-5 pt-8 pb-20">
        <h1 className="font-display text-4xl font-medium">{title}</h1>
        {children}
      </main>
    </>
  );
}

/** A plain white panel — the admin's one container. */
export function Panel({ title, description, children, className }: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-6 rounded-2xl border border-ink/10 bg-white/85 p-5 shadow-soft sm:p-6", className)}>
      <h2 className="font-display text-2xl font-medium">{title}</h2>
      {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}
