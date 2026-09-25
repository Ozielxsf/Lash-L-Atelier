"use client";

import { useEffect } from "react";
import { siteConfig } from "@/config/site.config";
import { telHref } from "@/lib/format";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="sky-glow flex min-h-[80svh] flex-col items-center justify-center px-6 pt-24 text-center">
      <p aria-hidden="true" className="font-script text-5xl text-rose">Pardon</p>
      <h1 className="mt-3 font-display text-4xl text-creme">Something went wrong on our side.</h1>
      <p className="mt-4 max-w-md text-creme-muted">
        Please try again — or just call us at{" "}
        <a href={telHref} className="text-rose underline underline-offset-4">
          {siteConfig.phone.display}
        </a>
        .
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 min-h-12 rounded-full bg-rose px-7 text-[0.8rem] font-medium tracking-[0.2em] text-noir uppercase"
      >
        Try again
      </button>
    </div>
  );
}
