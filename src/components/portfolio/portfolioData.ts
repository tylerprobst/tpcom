export const highlights = [
  {
    title: "Frontend",
    accent: "ocean",
    description:
      "React, TypeScript, and modern CSS — interfaces that feel fast, intentional, and polished.",
  },
  {
    title: "Backend",
    accent: "midnight",
    description:
      "Python, Ruby, SQL, and API design — reliable services behind the experiences people use.",
  },
  {
    title: "Delivery",
    accent: "steel",
    description:
      "Git, cloud deployment, and iterative development — from idea to production with care.",
  },
] as const;

export type HighlightAccent = (typeof highlights)[number]["accent"];

export const experience = [
  {
    dates: "Sep 2022 – Jan 2025",
    datetime: "2022-09/2025-01",
    location: "Rohnert Park, CA",
    company: "Graton Resort & Casino",
    companyUrl: "https://www.gratonresortcasino.com/",
    role: "Web Developer Integration Engineer",
    summary:
      "Supported the digital presence for one of Sonoma County's largest resort and casino destinations, with a focus on guest-facing web experiences and platform integrations.",
    details: [
      "Built and maintained front-end web experiences for booking, events, and resort services across high-traffic property sites.",
      "Integrated third-party hospitality, e-commerce, and booking platforms into the resort's web stack.",
      "Partnered with internal teams to ship reliable updates, troubleshoot production issues, and improve the guest digital journey.",
      "Contributed to ongoing web operations, release work, and cross-platform consistency for casino and resort properties.",
    ],
  },
] as const;

export const contactLinks = [
  { label: "tprobstcoding@gmail.com", href: "mailto:tprobstcoding@gmail.com" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/tylerprobst",
    external: true,
  },
  {
    label: "GitHub",
    href: "https://github.com/tylerprobst",
    external: true,
  },
] as const;

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
] as const;