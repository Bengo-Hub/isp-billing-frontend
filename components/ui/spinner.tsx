export function Spinner({ size = 16 }: { size?: number }) {
  const s = `${size}px`;
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent align-[-0.125em] text-gray-700"
      style={{ width: s, height: s }}
      role="status"
      aria-label="loading"
    />
  );
}
