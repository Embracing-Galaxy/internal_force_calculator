import { type ClassValue, clsx } from "clsx";
import katex from "katex";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const tex = (latex: string) =>
  katex.renderToString(latex, { throwOnError: false, displayMode: false });
