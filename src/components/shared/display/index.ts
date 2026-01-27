/**
 * Shared Display Components
 * 
 * A collection of reusable display components for consistent UI across the application.
 * These components handle common patterns like status badges, empty states, errors, and loading.
 * 
 * @example
 * ```tsx
 * import { StatusBadge, EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/shared/display';
 * 
 * // Status badges
 * <StatusBadge status="active" />
 * <StatusBadge status="paid" showIcon />
 * 
 * // Empty state
 * <EmptyState
 *   type="search"
 *   title="No results"
 *   description="Try different search terms"
 * />
 * 
 * // Error state
 * <ErrorState
 *   type="network"
 *   message="Failed to load"
 *   onRetry={refetch}
 * />
 * 
 * // Loading state
 * <LoadingState message="Loading..." />
 * 
 * // Page header
 * <PageHeader
 *   title="Users"
 *   action={{ label: "Add User", onClick: openDialog }}
 * />
 * ```
 */

export { StatusBadge, type StatusBadgeProps, type StatusType, type StatusConfig } from './StatusBadge';
export { EmptyState, type EmptyStateProps, type EmptyStateType } from './EmptyState';
export { ErrorState, type ErrorStateProps, type ErrorType } from './ErrorState';
export { LoadingState, type LoadingStateProps } from './LoadingState';
export { PageHeader, type PageHeaderProps } from './PageHeader';
