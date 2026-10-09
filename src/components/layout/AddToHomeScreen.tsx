"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check, Compass, Copy, Ellipsis, Share, SquarePlus, X } from "lucide-react";
import { INSTALL } from "@/data/install";
import { detectPlatform, isIosSafari, isStandalone, type Platform } from "@/lib/device";
import { cn } from "@/lib/utils";

/** Chrome's install prompt event (not yet in TypeScript's DOM types). */
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
declare global {
  interface Window {
    __lashInstall?: InstallPromptEvent;
  }
}

const STEP_ICONS = { safari: Compass, share: Share, add: SquarePlus, confirm: Check, menu: Ellipsis } as const;

/**
 * "Add to Home Screen" — the footer invitation.
 *
 * Reads the device once mounted (nothing renders on the server, so there's no
 * flash of the wrong thing):
 *  - Android + Chrome: the button opens the browser's own install prompt
 *    (caught early by the inline script in app/layout.tsx).
 *  - Android, no prompt available (Samsung Internet, Firefox…): short steps.
 *  - iPhone / iPad: Apple's steps, starting with "Open in Safari" — ticked
 *    off automatically when they're already in Safari, with a Copy-link
 *    button when they're in Instagram/Facebook/TikTok's built-in browser.
 *  - Desktop, or already opened from the home screen: hidden.
 *
 * The sheet is a native <dialog> (showModal): focus trap, Escape and the
 * backdrop come from the browser, so it's accessible without extra code.
 */
export default function AddToHomeScreen() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [inSafari, setInSafari] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [copied, setCopied] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    // Reading the device can only happen in the browser, after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlatform(isStandalone() ? "other" : detectPlatform(ua, navigator.platform, navigator.maxTouchPoints));
    setInSafari(isIosSafari(ua));
    setCanPrompt(Boolean(window.__lashInstall));

    const onInstallable = () => setCanPrompt(true);
    const onInstalled = () => {
      window.__lashInstall = undefined;
      setInstalled(true);
    };
    window.addEventListener("lash:installable", onInstallable);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("lash:installable", onInstallable);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (platform !== "ios" && platform !== "android") return null;

  const onAdd = async () => {
    const prompt = window.__lashInstall;
    if (platform === "android" && prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      window.__lashInstall = undefined; // a prompt can only be used once
      setCanPrompt(false);
      if (outcome === "accepted") setInstalled(true);
      return;
    }
    dialog.current?.showModal();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard blocked — the address is printed beside the button anyway */
    }
  };

  const ios = platform === "ios";
  const sheet = ios ? INSTALL.ios : INSTALL.android;

  return (
    <div className="mx-auto mt-12 flex max-w-md flex-col items-center rounded-[28px] border border-rose/20 bg-noir-soft/80 px-6 py-7 text-center">
      <Image
        src="/icons/icon-192.png"
        alt=""
        width={192}
        height={192}
        className="h-16 w-16 rounded-[18px] shadow-[0_10px_30px_rgb(242_167_198/0.18)]"
      />
      <p className="mt-4 font-caps text-[0.66rem] font-semibold tracking-[0.3em] text-rose uppercase">
        {INSTALL.invite.eyebrow}
      </p>
      <h2 className="mt-2 font-display text-2xl text-creme">{INSTALL.invite.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-creme-muted">{INSTALL.invite.body}</p>

      {installed ? (
        <p role="status" className="mt-5 flex items-center gap-2 text-sm text-rose">
          <Check className="h-4 w-4" aria-hidden="true" />
          {INSTALL.installed}
        </p>
      ) : (
        <button
          type="button"
          onClick={onAdd}
          aria-haspopup={ios || !canPrompt ? "dialog" : undefined}
          className="mt-5 inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-rose px-7 text-[0.78rem] font-medium tracking-[0.18em] text-noir uppercase transition-colors hover:bg-rose-soft"
        >
          <SquarePlus className="h-4 w-4" aria-hidden="true" />
          {INSTALL.invite.button}
        </button>
      )}

      <dialog
        ref={dialog}
        aria-labelledby="install-title"
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        className="mx-auto mt-auto mb-0 max-h-[92dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-[28px] border border-rose/20 bg-noir-soft p-0 text-creme backdrop:bg-noir/75 sm:mb-auto sm:rounded-[28px]"
      >
        <div className="relative px-6 pt-7 pb-[calc(1.75rem+env(safe-area-inset-bottom))] text-left sm:px-8">
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="absolute top-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full text-creme-muted hover:text-rose"
          >
            <X className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">{INSTALL.close}</span>
          </button>

          <div className="flex items-center gap-4 pr-10">
            <Image src="/icons/icon-192.png" alt="" width={192} height={192} className="h-12 w-12 rounded-[14px]" />
            <div>
              <h2 id="install-title" className="font-display text-2xl text-creme">
                {sheet.title}
              </h2>
              <p className="text-sm text-creme-muted">{sheet.intro}</p>
            </div>
          </div>

          <ol className="mt-6 space-y-3">
            {sheet.steps.map((step, i) => {
              const Icon = STEP_ICONS[step.id as keyof typeof STEP_ICONS] ?? Check;
              const done = ios && step.id === "safari" && inSafari;
              return (
                <li
                  key={step.id}
                  className={cn(
                    "flex gap-4 rounded-2xl border px-4 py-3.5",
                    done ? "border-rose/15 bg-noir/40 opacity-75" : "border-line-dark bg-noir/60",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-caps text-sm font-semibold",
                      done ? "bg-rose text-noir" : "border border-rose/40 text-rose",
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-medium text-creme">
                      <span className="sr-only">Step {i + 1}: </span>
                      {step.title}
                      <Icon className="h-4 w-4 shrink-0 text-rose" aria-hidden="true" />
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-creme-muted">
                      {"doneNote" in step ? (done ? step.doneNote : step.notSafariNote) : step.detail}
                    </p>
                    {ios && step.id === "safari" && !inSafari && (
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={copyLink}
                          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-rose/40 px-4 text-[0.72rem] font-medium tracking-[0.14em] text-rose uppercase hover:bg-rose hover:text-noir"
                        >
                          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                          {copied ? INSTALL.ios.copied : INSTALL.ios.copyLink}
                        </button>
                        <span className="text-sm text-creme-muted select-all">{window.location.host}</span>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          <p aria-live="polite" className="sr-only">
            {copied ? INSTALL.ios.copied : ""}
          </p>
        </div>
      </dialog>
    </div>
  );
}
