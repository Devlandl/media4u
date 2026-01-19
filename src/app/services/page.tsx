"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

const services = [
  {
    id: "vr-environments",
    title: "VR Environments",
    description:
      "Immersive virtual reality experiences that transport your audience to custom-designed digital worlds.",
    features: [
      "Custom 3D environment design",
      "Interactive elements & hotspots",
      "Multi-platform deployment",
      "Real-time collaboration spaces",
    ],
    gradient: "from-cyber-cyan to-cyber-purple",
    glowColor: "cyan",
    icon: (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="vr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <rect
          x="15"
          y="30"
          width="70"
          height="40"
          rx="8"
          stroke="url(#vr-grad)"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="35" cy="50" r="8" stroke="url(#vr-grad)" strokeWidth="2" fill="none" />
        <circle cx="65" cy="50" r="8" stroke="url(#vr-grad)" strokeWidth="2" fill="none" />
        <path
          d="M10 50 L15 50"
          stroke="url(#vr-grad)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M85 50 L90 50"
          stroke="url(#vr-grad)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M43 50 L57 50"
          stroke="url(#vr-grad)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "web-design",
    title: "Web Design & Development",
    description:
      "Cutting-edge websites that blend stunning aesthetics with powerful functionality and performance.",
    features: [
      "Custom responsive design",
      "SEO optimization",
      "E-commerce solutions",
      "CMS integration",
    ],
    gradient: "from-cyber-magenta to-cyber-cyan",
    glowColor: "magenta",
    icon: (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="web-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff2d92" />
            <stop offset="100%" stopColor="#00d4ff" />
          </linearGradient>
        </defs>
        <rect
          x="15"
          y="20"
          width="70"
          height="50"
          rx="4"
          stroke="url(#web-grad)"
          strokeWidth="2"
          fill="none"
        />
        <line
          x1="15"
          y1="32"
          x2="85"
          y2="32"
          stroke="url(#web-grad)"
          strokeWidth="2"
        />
        <circle cx="22" cy="26" r="2" fill="#ff2d92" />
        <circle cx="29" cy="26" r="2" fill="#00d4ff" />
        <circle cx="36" cy="26" r="2" fill="#8b5cf6" />
        <rect x="20" y="38" width="25" height="4" rx="1" fill="url(#web-grad)" opacity="0.6" />
        <rect x="20" y="46" width="40" height="3" rx="1" fill="url(#web-grad)" opacity="0.4" />
        <rect x="20" y="52" width="35" height="3" rx="1" fill="url(#web-grad)" opacity="0.4" />
        <rect x="20" y="58" width="30" height="3" rx="1" fill="url(#web-grad)" opacity="0.4" />
        <path
          d="M40 80 L50 75 L60 80"
          stroke="url(#web-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    id: "multiverse",
    title: "Multiverse Projects",
    description:
      "Unified brand experiences across multiple virtual platforms and metaverse environments.",
    features: [
      "Cross-platform integration",
      "Unified brand presence",
      "Social VR experiences",
      "Metaverse strategy",
    ],
    gradient: "from-cyber-purple to-cyber-magenta",
    glowColor: "purple",
    icon: (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="multi-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ff2d92" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="30" stroke="url(#multi-grad)" strokeWidth="2" fill="none" />
        <ellipse
          cx="50"
          cy="50"
          rx="30"
          ry="12"
          stroke="url(#multi-grad)"
          strokeWidth="2"
          fill="none"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="12"
          ry="30"
          stroke="url(#multi-grad)"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="50" cy="20" r="4" fill="#8b5cf6" />
        <circle cx="50" cy="80" r="4" fill="#ff2d92" />
        <circle cx="20" cy="50" r="4" fill="#00d4ff" />
        <circle cx="80" cy="50" r="4" fill="#8b5cf6" />
      </svg>
    ),
  },
  {
    id: "consulting",
    title: "Creative Consulting",
    description:
      "Strategic guidance to help your organization navigate the digital landscape and emerging technologies.",
    features: [
      "Digital strategy development",
      "Technology assessment",
      "Implementation roadmapping",
      "Team training & workshops",
    ],
    gradient: "from-cyber-cyan to-cyber-magenta",
    glowColor: "cyan",
    icon: (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="consult-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#ff2d92" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="30" r="15" stroke="url(#consult-grad)" strokeWidth="2" fill="none" />
        <path
          d="M50 45 L50 55"
          stroke="url(#consult-grad)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M30 65 L50 55 L70 65"
          stroke="url(#consult-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M30 65 L30 80 L50 85 L70 80 L70 65"
          stroke="url(#consult-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="50" cy="30" r="5" fill="url(#consult-grad)" opacity="0.5" />
        <path
          d="M45 28 L48 32 L56 24"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

interface ServiceCardProps {
  service: (typeof services)[number];
  index: number;
  isReversed: boolean;
}

function ServiceCard({ service, index, isReversed }: ServiceCardProps): React.ReactNode {
  const glowShadows: Record<string, string> = {
    cyan: "shadow-[0_0_80px_rgba(0,212,255,0.2)]",
    magenta: "shadow-[0_0_80px_rgba(255,45,146,0.2)]",
    purple: "shadow-[0_0_80px_rgba(139,92,246,0.2)]",
  };

  return (
    <motion.div
      variants={itemVariants}
      className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} gap-8 lg:gap-16 items-center`}
    >
      <motion.div
        whileHover={{ scale: 1.02, rotate: isReversed ? -2 : 2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`relative w-[200px] h-[200px] flex-shrink-0 rounded-3xl bg-gradient-to-br ${service.gradient} p-[2px] ${glowShadows[service.glowColor]}`}
      >
        <div className="w-full h-full rounded-3xl bg-void-950 flex items-center justify-center p-8">
          {service.icon}
        </div>
        <div
          className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${service.gradient} opacity-20 blur-2xl -z-10`}
        />
      </motion.div>

      <div className="flex-1 text-center lg:text-left">
        <motion.span
          initial={{ opacity: 0, x: isReversed ? 20 : -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          viewport={{ once: true }}
          className="inline-block mb-3 text-xs font-semibold tracking-[0.2em] uppercase text-cyan-400"
        >
          0{index + 1}
        </motion.span>
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-4 text-white">
          {service.title}
        </h3>
        <p className="text-gray-400 text-lg mb-6 max-w-xl">
          {service.description}
        </p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {service.features.map((feature, featureIndex) => (
            <motion.li
              key={feature}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + featureIndex * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 text-gray-300"
            >
              <span
                className={`w-2 h-2 rounded-full bg-gradient-to-r ${service.gradient}`}
              />
              {feature}
            </motion.li>
          ))}
        </ul>

        <Link href="/contact">
          <Button variant="secondary" size="md">
            Learn More
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function ServicesPage(): React.ReactNode {
  return (
    <main className="min-h-screen bg-void-950">
      <Section className="pt-32 md:pt-40">
        <SectionHeader
          tag="Services"
          title="What We "
          highlight="Offer"
          description="From immersive VR experiences to cutting-edge web solutions, we craft digital experiences that push boundaries and captivate audiences."
        />
      </Section>

      <Section className="pt-0">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-24 lg:space-y-32"
        >
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              isReversed={index % 2 === 1}
            />
          ))}
        </motion.div>
      </Section>

      <Section>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative rounded-3xl p-[1px] bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-magenta"
        >
          <div className="rounded-3xl bg-void-900 px-8 py-16 md:px-16 md:py-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.08),transparent_70%)]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
                Custom Solutions for{" "}
                <span className="text-gradient-cyber">Every Budget</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                Every project is unique. Let us create a tailored package that
                fits your vision and budget. Get in touch to discuss your
                requirements.
              </p>
              <Link href="/contact">
                <Button variant="primary" size="lg">
                  Get a Custom Quote
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </Section>
    </main>
  );
}
