export function HeroOverlay() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pt-[5vh]">
      <div
        className="mx-4 max-w-xl rounded-2xl px-8 py-5 text-center"
        style={{
          background: "rgba(30, 35, 50, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-[#ffc8d8]">
          Software Engineer
        </p>
        <h1
          className="mb-2 text-3xl font-bold tracking-tight text-white md:text-4xl"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.35)" }}
        >
          Tyler Probst
        </h1>
        <p className="text-sm font-medium text-white/85 md:text-base">
          Building clear, reliable web experiences
        </p>
      </div>
    </div>
  );
}