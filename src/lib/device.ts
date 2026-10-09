/**
 * What kind of phone / browser is this? Used only to choose which
 * "Add to Home Screen" help to show — never for anything that matters.
 * Pure functions over the user-agent so they can be reasoned about (and
 * tested) without a browser.
 */
export type Platform = "ios" | "android" | "other";

export function detectPlatform(ua: string, platform = "", maxTouchPoints = 0): Platform {
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  // iPadOS 13+ reports itself as a Mac; a touchscreen gives it away.
  if (platform === "MacIntel" && maxTouchPoints > 1) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

/** Instagram, Facebook, TikTok, Snapchat… — their built-in browsers can't add to the home screen. */
export function isInAppBrowser(ua: string): boolean {
  return /Instagram|FBAN|FBAV|FB_IAB|musical_ly|Bytedance|TikTok|Snapchat|Line\/|Pinterest|LinkedInApp/i.test(ua);
}

/** On iOS: genuine Safari, not Chrome/Firefox/Edge/in-app browsers (they all add their own token). */
export function isIosSafari(ua: string): boolean {
  return /Safari\//.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\/|DuckDuckGo/i.test(ua) && !isInAppBrowser(ua);
}

/** Already opened from the home screen? Then there's nothing to offer. */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}
