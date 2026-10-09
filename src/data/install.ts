/**
 * "Add to Home Screen" — the footer invitation and the step-by-step sheets.
 *
 * iPhone steps follow Apple's own process ("Turn a website into an app on
 * iPhone"). Safari's toolbar moved in iOS 26 (Share now sits behind the •••
 * button), so step 2 covers both layouts rather than guessing the version.
 * Android with Chrome gets the browser's real install prompt instead; the
 * Android steps are only the fallback for browsers that don't offer one.
 */
export const INSTALL = {
  /** Shown under the icon on the phone's home screen. Short on purpose:
   *  iPhone and Android truncate labels past ~12 characters. */
  homeScreenName: "L’Atelier",
  /** The studio dashboard installs as its own app (app/admin/manifest.webmanifest). */
  admin: {
    name: "Lash L’Atelier — Studio Admin",
    homeScreenName: "Studio Admin",
  },
  invite: {
    eyebrow: "Keep us close",
    title: "Add L’Atelier to your home screen",
    body: "One tap to our menu, prices and phone — just like an app, with nothing to download.",
    button: "Add to Home Screen",
  },
  installed: "Added — you’ll find L’Atelier on your home screen.",
  ios: {
    title: "Add to your iPhone",
    intro: "Four quick taps and we’re on your home screen.",
    steps: [
      {
        id: "safari",
        title: "Open this website in Safari",
        detail: "Home-screen icons can only be added from Safari.",
        doneNote: "You’re already in Safari — on to step 2.",
        notSafariNote: "You’re in another app’s browser. Copy the link, then paste it into Safari.",
      },
      {
        id: "share",
        title: "Tap the Share button",
        detail: "It’s the square with an arrow, in Safari’s toolbar. Don’t see it? Tap ••• first, then Share.",
      },
      {
        id: "add",
        title: "Scroll down and tap “Add to Home Screen”",
        detail: "You may need to scroll the list of options to find it.",
      },
      {
        id: "confirm",
        title: "Tap “Add”",
        detail: "In the top-right corner. If you see “Open as Web App”, leave it switched on.",
      },
    ],
    copyLink: "Copy link",
    copied: "Link copied",
  },
  android: {
    title: "Add to your phone",
    intro: "Your browser didn’t offer the one-tap option, so here’s the quick way:",
    steps: [
      { id: "menu", title: "Tap the menu", detail: "The ⋮ dots in the top-right corner (or ≡ at the bottom in Samsung Internet)." },
      { id: "add", title: "Tap “Add to Home screen” or “Install app”", detail: "In Samsung Internet it’s under “Add page to”." },
      { id: "confirm", title: "Tap “Add” or “Install”", detail: "L’Atelier will appear on your home screen." },
    ],
  },
  close: "Close",
} as const;
