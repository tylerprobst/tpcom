export function HeroOverlay() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pt-[6vh]">
      <div
        className="mx-4 max-w-xl rounded-xl px-7 py-5 text-center"
        style={{
          background: "rgba(20, 28, 38, 0.45)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.25)",
        }}
      >
        <p
          className="mb-1.5 text-xs font-semibold uppercase tracking-[0.25em]"
          style={{ color: "var(--sakura-pale)" }}
        >
          Software Engineer
        </p>
        <h1
          className="mb-2 text-3xl font-bold tracking-tight text-white md:text-4xl"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,0.4)" }}
        >
          Tyler Probst
        </h1>
        <p className="text-sm font-medium text-white/80 md:text-base">
          Building clear, reliable web experiences
        </p>
      </div>
    </div>
  );
}