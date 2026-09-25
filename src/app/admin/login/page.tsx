import { redirect } from "next/navigation";
import Wordmark from "@/components/brand/Wordmark";
import LoginForm from "@/components/admin/LoginForm";
import { isAdmin } from "@/lib/admin-auth";
import { isSessionConfigured } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  const configured = isSessionConfigured();
  return (
    <main id="main" className="flex min-h-dvh items-center justify-center px-5">
      <div className="w-full max-w-sm rounded-3xl bg-noir px-7 pt-10 pb-8 text-creme shadow-lift">
        <div className="text-center">
          <Wordmark size="footer" showPronunciation={false} />
          <p className="mt-4 font-caps text-[0.68rem] tracking-[0.3em] text-creme-muted uppercase">Studio admin</p>
        </div>
        {configured ? (
          <div className="rounded-2xl bg-papier p-5 text-ink [&_form]:mt-0">
            <LoginForm />
          </div>
        ) : (
          <p className="mt-8 text-center text-sm text-creme-muted">
            Admin sign-in isn’t set up yet. Set <code>SESSION_SECRET</code> and <code>ADMIN_PASSWORD</code> in Vercel.
          </p>
        )}
      </div>
    </main>
  );
}
