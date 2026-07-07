import Image from "next/image";
import { withBasePath } from "@/lib/site";
import {
  contactLinks,
  experience,
  highlights,
  navLinks,
  type HighlightAccent,
} from "./portfolioData";

const interactive =
  "pointer-events-auto transition-colors duration-200";

const accentStyles: Record<
  HighlightAccent,
  { bar: string; glow: string; title: string; panel: string }
> = {
  ocean: {
    bar: "from-blue-deep via-blue to-blue-bright",
    glow: "shadow-[0_8px_32px_rgba(26,48,80,0.55)]",
    title: "text-blue-light",
    panel: "bg-blue-deep/55 border-blue/30",
  },
  midnight: {
    bar: "from-navy via-indigo to-blue",
    glow: "shadow-[0_8px_32px_rgba(15,26,46,0.65)]",
    title: "text-blue-bright",
    panel: "bg-indigo/50 border-indigo/40",
  },
  steel: {
    bar: "from-blue-mid via-steel to-blue-bright",
    glow: "shadow-[0_8px_32px_rgba(36,59,92,0.5)]",
    title: "text-blue-light",
    panel: "bg-blue-mid/50 border-steel/40",
  },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-blue-bright">
      {children}
    </p>
  );
}

function Panel({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "ocean" | "midnight" | "steel" | "contact";
}) {
  const variants = {
    default: "border-blue-deep/45 bg-navy-panel/75",
    ocean: accentStyles.ocean.panel,
    midnight: accentStyles.midnight.panel,
    steel: accentStyles.steel.panel,
    contact: "border-blue/35 bg-blue-deep/40",
  };

  return (
    <div
      className={`rounded-xl border backdrop-blur-md ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  );
}

function ProfilePortrait({
  size,
  priority = false,
}: {
  size: number;
  priority?: boolean;
}) {
  return (
    <Panel
      variant="ocean"
      className="p-2 shadow-[0_0_48px_rgba(74,122,173,0.2)]"
    >
      <Image
        src={withBasePath("/profile.png")}
        alt="Portrait of Tyler Probst"
        width={size}
        height={size}
        className="rounded-lg"
        priority={priority}
      />
    </Panel>
  );
}

export default function PortfolioContent() {
  const year = new Date().getFullYear();

  return (
    <div className="pointer-events-none relative z-10 *:pointer-events-none [&_a]:pointer-events-auto">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-8">
        <header className="flex items-center justify-between gap-6 border-b border-blue-deep/40 py-6 md:py-8">
          <a
            href={withBasePath("/")}
            className={`text-sm font-semibold text-[#e8eaed] ${interactive} hover:text-blue-light`}
          >
            Tyler Probst
          </a>
          <nav className="flex gap-5 md:gap-8" aria-label="Primary">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-[13px] text-steel ${interactive} hover:text-blue-bright`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </header>

        <section className="grid min-h-[calc(100dvh-5.5rem)] items-center gap-12 pb-16 pt-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="max-w-xl">
            <div className="mb-8 flex justify-center lg:hidden">
              <ProfilePortrait size={220} priority />
            </div>
            <SectionLabel>Software Engineer</SectionLabel>
            <h1 className="mt-4 text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.12] tracking-tight text-[#e8eaed]">
              Building clear,{" "}
              <span className="bg-gradient-to-r from-blue-light via-blue-bright to-blue bg-clip-text text-transparent">
                reliable
              </span>{" "}
              web experiences.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#8fa3b8]">
              I work across the stack — from polished interfaces to the systems
              behind them — with a focus on craft, clarity, and shipping work
              that holds up.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#contact"
                className={`rounded-lg bg-blue-deep/80 px-4 py-2.5 text-[13px] font-medium text-blue-light ring-1 ring-blue/45 ${interactive} hover:bg-blue-mid hover:text-white`}
              >
                Get in touch
              </a>
              <a
                href="https://github.com/tylerprobst"
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-lg bg-navy-panel/60 px-4 py-2.5 text-[13px] font-medium text-blue-bright ring-1 ring-blue-deep/50 ${interactive} hover:ring-blue/40 hover:text-blue-light`}
              >
                View GitHub
              </a>
            </div>
            <p className="mt-10 text-[11px] tracking-[0.18em] text-steel uppercase max-md:hidden">
              Move through the fluid
            </p>
            <p className="mt-10 text-[11px] tracking-[0.18em] text-steel uppercase md:hidden">
              Swipe up to scroll · drag to stir the fluid
            </p>
          </div>

          <div className="hidden justify-center lg:flex">
            <ProfilePortrait size={360} priority />
          </div>
        </section>

        <section
          className="grid gap-4 pb-24 md:grid-cols-3 md:gap-5"
          aria-label="Focus areas"
        >
          {highlights.map((item) => {
            const style = accentStyles[item.accent];
            return (
              <Panel
                key={item.title}
                variant={item.accent}
                className={`overflow-hidden ${style.glow}`}
              >
                <div
                  className={`h-1.5 bg-gradient-to-r ${style.bar}`}
                  aria-hidden
                />
                <div className="p-6">
                  <h2 className={`text-base font-semibold ${style.title}`}>
                    {item.title}
                  </h2>
                  <p className="mt-3 text-[14px] leading-relaxed text-[#8fa3b8]">
                    {item.description}
                  </p>
                </div>
              </Panel>
            );
          })}
        </section>

        <section id="about" className="pb-24">
          <Panel className="p-8 md:p-10">
            <SectionLabel>About</SectionLabel>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#e8eaed]">
              About me
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#8fa3b8]">
              From browser-based tools and games to full-stack applications, I
              enjoy turning ideas into software people can actually use. This
              site is my home base for work history, projects, and ways to
              connect.
            </p>
          </Panel>
        </section>

        <section id="experience" className="pb-24">
          <div className="mb-8 max-w-2xl">
            <SectionLabel>Experience</SectionLabel>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#e8eaed]">
              Previous work
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#8fa3b8]">
              A snapshot of recent roles. More history and project detail will be
              added over time.
            </p>
          </div>

          {experience.map((job) => (
            <Panel key={job.company} variant="midnight" className="p-8 md:p-10">
              <div className="flex flex-col gap-2 text-[13px] text-steel sm:flex-row sm:items-center sm:gap-4">
                <time
                  dateTime={job.datetime}
                  className="font-medium text-blue-bright"
                >
                  {job.dates}
                </time>
                <span className="hidden text-blue-deep sm:inline">·</span>
                <span>{job.location}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-[#e8eaed]">
                <a
                  href={job.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${interactive} hover:text-blue-light`}
                >
                  {job.company}
                </a>
              </h3>
              <p className="mt-1 text-[14px] font-medium text-blue">
                {job.role}
              </p>
              <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-[#8fa3b8]">
                {job.summary}
              </p>
              <ul className="mt-6 space-y-3 text-[14px] leading-relaxed text-[#8fa3b8]">
                {job.details.map((detail) => (
                  <li key={detail} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </section>

        <section id="contact" className="pb-20">
          <Panel variant="contact" className="p-8 md:p-10">
            <SectionLabel>Contact</SectionLabel>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#e8eaed]">
              Get in touch
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#8fa3b8]">
              Open to conversations about engineering roles, collaborations, and
              interesting problems.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
              {contactLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={"external" in link && link.external ? "_blank" : undefined}
                  rel={
                    "external" in link && link.external
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className={`text-[14px] text-blue-light underline decoration-blue/40 underline-offset-4 ${interactive} hover:text-white hover:decoration-blue-bright`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </Panel>
        </section>

        <footer className="border-t border-blue-deep/50 py-8 text-[13px] text-steel">
          <p>
            &copy; {year}{" "}
            <span className="text-blue-bright">Tyler Probst</span>
          </p>
        </footer>
      </div>
    </div>
  );
}