export function HeroOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center pb-[12vh] md:pb-[14vh]">
      <div
        className="mx-4 max-w-lg rounded-2xl px-8 py-6 text-center backdrop-blur-sm"
        style={{
          background: "rgba(30, 40, 55, 0.35)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        }}
      >
        <p
          className="mb-2 text-sm font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--sky-peach)" }}
        >
          Software Engineer
        </p>
        <h1
          className="mb-3 text-4xl font-bold tracking-tight text-white md:text-5xl"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
        >
          Tyler Probst
        </h1>
        <p className="text-base font-medium text-white/85 md:text-lg">
          Building clear, reliable web experiences
        </p>
      </div>
    </div>
  );
}