"use client";

import { startTransition, type FormEvent } from "react";

/**
 * React 19 resets a <form action={…}> after every submit — success or not —
 * so a rejected walk-in (say, a duplicate phone) would wipe everything typed.
 * Submitting through onSubmit instead keeps the fields; forms clear what they
 * need to themselves on success.
 */
export function useKeepFormSubmit(action: (data: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  };
}
