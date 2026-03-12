import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// Ensure no trailing slash to prevent double slashes in URL construction
export const base_url = `http://localhost:5000/api/v1`.replace(/\/+$/, "");
