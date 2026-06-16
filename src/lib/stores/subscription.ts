import { create } from 'zustand';

/**
 * ISP-billing subscription store — mirrors the canonical inventory-service store
 * (inventory-ui/src/store/subscription.ts). Holds the derived expiry/grace state
 * that drives the shared <SubscriptionBanner>.
 *
 * GRACE_PERIOD_DAYS = 7: once a subscription's `expiresAt` passes, the tenant has
 * a 7-day grace window (banner nags but access continues) before it is treated
 * as fully expired.
 */

export type SubscriptionPlan = string;
export type SubscriptionStatus =
  | 'active' | 'trial' | 'past_due' | 'suspended' | 'expired' | 'cancelled' | string;

const GRACE_PERIOD_DAYS = 7;

export interface SubscriptionState {
  plan: SubscriptionPlan | null;
  status: SubscriptionStatus | null;
  expiresAt: Date | null;
  gracePeriodEndsAt: Date | null;
  features: string[];
  limits: Record<string, number>;
  isInGracePeriod: boolean;
  isExpired: boolean;
  daysUntilExpiry: number | null;
}

interface SubscriptionStore extends SubscriptionState {
  hydrated: boolean;
  setFromRaw: (raw: RawSubscriptionData) => void;
  clear: () => void;
}

export interface RawSubscriptionData {
  plan?: string | null;
  status?: string | null;
  /** Resolved Date (or ISO string) of current_period_end. */
  expiresAt?: Date | string | null;
  features?: string[];
  limits?: Record<string, number>;
}

function computeDerived(
  status: SubscriptionStatus | null,
  expiresAt: Date | null,
): Pick<SubscriptionState, 'gracePeriodEndsAt' | 'isInGracePeriod' | 'isExpired' | 'daysUntilExpiry'> {
  const now = Date.now();
  const gracePeriodEndsAt = expiresAt
    ? new Date(expiresAt.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000)
    : null;

  const normalized = (status ?? '').toUpperCase();
  let isInGracePeriod = false;
  let isExpired = false;
  let daysUntilExpiry: number | null = null;

  if (expiresAt) {
    const msUntil = expiresAt.getTime() - now;
    daysUntilExpiry = Math.ceil(msUntil / (1000 * 60 * 60 * 24));
    if (now > expiresAt.getTime()) {
      if (gracePeriodEndsAt && now <= gracePeriodEndsAt.getTime()) {
        isInGracePeriod = true;
      } else {
        isExpired = true;
      }
    }
  }
  if (normalized === 'EXPIRED' || normalized === 'CANCELLED') {
    if (!isInGracePeriod) isExpired = true;
  }

  return { gracePeriodEndsAt, isInGracePeriod, isExpired, daysUntilExpiry };
}

const EMPTY_STATE: SubscriptionState = {
  plan: null, status: null, expiresAt: null, gracePeriodEndsAt: null,
  features: [], limits: {}, isInGracePeriod: false, isExpired: false, daysUntilExpiry: null,
};

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  ...EMPTY_STATE,
  hydrated: false,

  setFromRaw: (raw) => {
    const plan = (raw.plan ?? null) as SubscriptionPlan | null;
    const status = (raw.status ?? null) as SubscriptionStatus | null;
    const expiresAt = raw.expiresAt
      ? (raw.expiresAt instanceof Date ? raw.expiresAt : new Date(raw.expiresAt))
      : null;
    const features = raw.features ?? [];
    const limits = raw.limits ?? {};
    const derived = computeDerived(status, expiresAt);

    set({ plan, status, expiresAt, features, limits, ...derived, hydrated: true });
  },

  clear: () => set({ ...EMPTY_STATE, hydrated: false }),
}));
