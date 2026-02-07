/**
 * Shared toast utility wrapping Sonner.
 *
 * Every component should import from here instead of 'sonner' directly
 * so that styling/defaults are consistent across the entire frontend.
 *
 * Usage:
 *   import { showToast } from '@/lib/utils/toast';
 *   showToast.success('Saved!');
 *   showToast.error('Something went wrong');
 *   showToast.packageExpired();
 */

import { toast, type ExternalToast } from 'sonner';

// ─── Defaults ────────────────────────────────────────────────────────────────
const DEFAULT_DURATION = 4000;
const ERROR_DURATION = 5000;

const defaults: ExternalToast = {
  duration: DEFAULT_DURATION,
};

// ─── Core helpers ────────────────────────────────────────────────────────────

function success(message: string, opts?: ExternalToast) {
  return toast.success(message, { ...defaults, ...opts });
}

function error(message: string, opts?: ExternalToast) {
  return toast.error(message, { ...defaults, duration: ERROR_DURATION, ...opts });
}

function info(message: string, opts?: ExternalToast) {
  return toast.info(message, { ...defaults, ...opts });
}

function warning(message: string, opts?: ExternalToast) {
  return toast.warning(message, { ...defaults, ...opts });
}

function loading(message: string, opts?: ExternalToast) {
  return toast.loading(message, { ...defaults, ...opts });
}

/** Dismiss a specific toast (or all if no id). */
function dismiss(id?: string | number) {
  return toast.dismiss(id);
}

// ─── Domain-specific helpers ─────────────────────────────────────────────────

/** Package or voucher expired / invalid. */
function packageExpired(opts?: ExternalToast) {
  return error('Your package or voucher has expired or is invalid. Please purchase a new package.', opts);
}

/** Package or voucher already used. */
function packageUsed(opts?: ExternalToast) {
  return error('This package or voucher has already been used.', opts);
}

/** Successfully connected to the network. */
function connected(opts?: ExternalToast) {
  return success('You are now connected to the internet!', opts);
}

/** Payment completed. */
function paymentSuccess(opts?: ExternalToast) {
  return success('Payment completed successfully!', opts);
}

/** Payment failed. */
function paymentFailed(message?: string, opts?: ExternalToast) {
  return error(message || 'Payment failed. Please try again.', opts);
}

/** Voucher redeemed. */
function voucherRedeemed(opts?: ExternalToast) {
  return success('Voucher redeemed successfully!', opts);
}

/** Invalid credentials. */
function invalidCredentials(opts?: ExternalToast) {
  return error('Invalid username or password. Please try again.', opts);
}

/** Generic saved confirmation. */
function saved(entity?: string, opts?: ExternalToast) {
  return success(entity ? `${entity} saved successfully` : 'Saved successfully', opts);
}

/** Generic deleted confirmation. */
function deleted(entity?: string, opts?: ExternalToast) {
  return success(entity ? `${entity} deleted successfully` : 'Deleted successfully', opts);
}

// ─── Promise helper (wraps toast.promise) ────────────────────────────────────

type PromiseMessages<T> = {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((err: unknown) => string);
};

function promise<T>(
  fn: Promise<T> | (() => Promise<T>),
  messages: PromiseMessages<T>,
  opts?: ExternalToast,
) {
  return toast.promise(fn, {
    ...messages,
    ...opts,
  });
}

// ─── Export ──────────────────────────────────────────────────────────────────

export const showToast = {
  // Core
  success,
  error,
  info,
  warning,
  loading,
  dismiss,
  promise,

  // Domain-specific
  packageExpired,
  packageUsed,
  connected,
  paymentSuccess,
  paymentFailed,
  voucherRedeemed,
  invalidCredentials,
  saved,
  deleted,
} as const;

/** Re-export the raw Sonner toast for edge cases. */
export { toast } from 'sonner';
