/**
 * Public pages layout - No authentication required
 * Used for payment callbacks, public forms, etc.
 */

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
