/**
 * Utility functions for the application
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  currency: string = "KES",
  locale: string = "en-KE"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
}

/**
 * Format a date with time
 */
export function formatDateTime(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
}

/**
 * Format a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;

  return formatDate(d);
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Format bandwidth speed
 */
export function formatSpeed(bitsPerSecond: number): string {
  if (bitsPerSecond < 1000) return `${bitsPerSecond} bps`;
  if (bitsPerSecond < 1000000) return `${(bitsPerSecond / 1000).toFixed(1)} Kbps`;
  if (bitsPerSecond < 1000000000)
    return `${(bitsPerSecond / 1000000).toFixed(1)} Mbps`;
  return `${(bitsPerSecond / 1000000000).toFixed(1)} Gbps`;
}

/**
 * Truncate text to a specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse error message from various error types
 */
export function parseErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    return String((error as { message: unknown }).message);
  }
  return "An unexpected error occurred";
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Check if we should use development fallback data
 * Returns fallback only in development mode, otherwise throws for production
 */
export function getDevFallback<T>(fallback: T): T {
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev) {
    throw new Error('API unavailable');
  }
  return fallback;
}
