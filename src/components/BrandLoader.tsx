// Branded full-screen loading state used while the auth flow checks the
// current session/OAuth callback before redirecting. Keeps the navy/gold
// identity visible instead of a blank white flash between screens.
export function BrandLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center gap-4 auth-screen-enter">
      <img
        src="/brand-logo.png"
        alt="New Guard Property Hub"
        className="w-14 h-14 rounded-xl object-cover shadow-gold auth-scale-in"
        width={56}
        height={56}
      />
      <div className="w-8 h-8 spinner-gold" role="status" aria-label={label} />
      <p className="text-sm text-white/70">{label}</p>
    </div>
  );
}
