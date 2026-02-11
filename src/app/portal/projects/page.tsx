"use client";

import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import { useState } from "react";
import { Search, ExternalLink, Calendar, Package, Lock, Globe, Palette, Glasses, Rocket, ArrowRight, Plus, ChevronLeft, ClipboardList } from "lucide-react";
import Link from "next/link";
import { ProjectWizard } from "../../start-project/project-wizard";
import { IntakeForm } from "./IntakeForm";
import { CustomDealPanel } from "./CustomDealPanel";

type ProjectStatus = "new" | "planning" | "design" | "development" | "review" | "completed" | "launched";

const statusColors: Record<ProjectStatus, string> = {
  new: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  planning: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
  design: "bg-brand-dark/10 text-pink-400 border border-brand-dark/20",
  development: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  review: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  launched: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
};

const statusLabels: Record<ProjectStatus, string> = {
  new: "New",
  planning: "Planning",
  design: "Design",
  development: "Development",
  review: "Review",
  completed: "Completed",
  launched: "Launched",
};

const SERVICES = [
  { icon: Globe, label: "Websites" },
  { icon: Palette, label: "Branding" },
  { icon: Glasses, label: "VR" },
  { icon: Rocket, label: "Bundles" },
];

function BuildYourProject({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 lg:p-10 max-w-lg w-full text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.label}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="p-3 rounded-xl bg-zinc-800 border border-zinc-700">
                  <Icon className="w-5 h-5 text-zinc-400" />
                </div>
                <span className="text-[11px] text-zinc-500 font-medium">{service.label}</span>
              </div>
            );
          })}
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Start Your Project
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
          Websites, branding, VR experiences, or bundles - our project wizard walks you through it step by step.
        </p>

        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-zinc-950 font-semibold hover:bg-zinc-200 transition-colors"
        >
          Get Started
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Custom deal project view - intake form + invoice/subscription panel
function CustomDealView({ project }: { project: Doc<"projects"> }) {
  const [intakeSubmitted, setIntakeSubmitted] = useState(!!project.intakeSubmittedAt);
  const [view, setView] = useState<"status" | "edit-intake">("status");

  if (!intakeSubmitted || view === "edit-intake") {
    return (
      <div>
        {intakeSubmitted && (
          <button
            onClick={() => setView("status")}
            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Project Status
          </button>
        )}
        <IntakeForm
          project={project}
          onSubmitted={() => {
            setIntakeSubmitted(true);
            setView("status");
          }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Project header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/50 border border-zinc-800 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-6 h-6 text-zinc-400" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-white mb-0.5">{project.projectType}</h2>
              {project.company && <p className="text-sm text-gray-400">{project.company}</p>}
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[project.status as ProjectStatus] ?? statusColors.new}`}>
                  {statusLabels[project.status as ProjectStatus] ?? project.status}
                </span>
                <span className="text-xs text-green-400 flex items-center gap-1">
                  Intake submitted
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setView("edit-intake")}
            className="text-sm text-gray-400 hover:text-white transition-colors underline underline-offset-4"
          >
            Update intake info
          </button>
        </div>
      </div>

      {/* Invoice + Subscription panels */}
      <CustomDealPanel project={project} />
    </div>
  );
}

export default function ClientProjectsPage() {
  const projects = useQuery(api.projects.getMyProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [showWizard, setShowWizard] = useState(false);

  // Separate custom deal projects from standard projects
  const customDealProjects = projects?.filter((p) => p.isCustomDeal) ?? [];
  const standardProjects = projects?.filter((p) => !p.isCustomDeal) ?? [];

  const filtered = standardProjects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.projectType.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.company?.toLowerCase().includes(query)
    );
  });

  const hasStandardProjects = standardProjects.length > 0;
  const hasCustomDeal = customDealProjects.length > 0;
  const hasAnyProjects = projects && projects.length > 0;

  // If the client has a custom deal project and no standard projects yet,
  // show the custom deal flow instead of the build options
  if (projects !== undefined && hasCustomDeal && !showWizard) {
    return (
      <div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-xl lg:text-2xl font-semibold mb-2">My Projects</h1>
          <p className="text-gray-400">View and track your projects</p>
        </motion.div>

        {/* Custom deal projects */}
        <div className="space-y-8">
          {customDealProjects.map((project) => (
            <CustomDealView key={project._id} project={project} />
          ))}
        </div>

        {/* Standard projects below if they also have some */}
        {hasStandardProjects && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-white mb-4">Other Projects</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              {standardProjects.map((project) => (
                <StandardProjectCard key={project._id} project={project} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          {showWizard ? (
            <>
              <button
                onClick={() => setShowWizard(false)}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm mb-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Projects
              </button>
              <h1 className="text-xl lg:text-2xl font-semibold mb-2">Start a Project</h1>
              <p className="text-gray-400">Fill out the steps below and we will follow up within 1-2 business days.</p>
            </>
          ) : (
            <>
              <h1 className="text-xl lg:text-2xl font-semibold mb-2">My Projects</h1>
              <p className="text-gray-400">View and track your website projects</p>
            </>
          )}
        </div>
        {hasAnyProjects && !showWizard && (
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-800 text-gray-300 hover:text-white hover:border-zinc-800 hover:bg-zinc-800 transition-all text-sm font-medium w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </motion.div>

      {/* Inline wizard */}
      {showWizard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ProjectWizard />
        </motion.div>
      )}

      {/* Show build options when no projects and not in wizard */}
      {!showWizard && projects !== undefined && !hasAnyProjects && (
        <BuildYourProject onStart={() => setShowWizard(true)} />
      )}

      {/* Show projects grid when they have standard projects and not in wizard */}
      {hasStandardProjects && !showWizard && (
        <>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-colors text-sm"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {filtered.length > 0 ? (
              filtered.map((project) => (
                <StandardProjectCard key={project._id} project={project} />
              ))
            ) : (
              <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
                <p className="text-gray-400">No projects match your search.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StandardProjectCard({ project }: { project: Doc<"projects"> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 lg:p-6 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{project.projectType}</h3>
          {project.company && (
            <p className="text-sm text-gray-400">{project.company}</p>
          )}
        </div>
        <span
          className={`text-xs font-medium px-3 py-1.5 rounded-full ${
            statusColors[project.status as ProjectStatus]
          }`}
        >
          {statusLabels[project.status as ProjectStatus]}
        </span>
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{project.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-zinc-800">
        {project.budget && (
          <div className="flex items-center gap-2 text-sm">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">{project.budget}</span>
          </div>
        )}
        {project.timeline && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">{project.timeline}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-colors text-sm font-medium justify-center"
          >
            <ExternalLink className="w-4 h-4" />
            Live Site
          </a>
        )}
        <Link
          href={`/portal/projects/${project._id}/vault`}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-colors text-sm font-medium justify-center ${!project.liveUrl ? "sm:col-span-2" : ""}`}
        >
          <Lock className="w-4 h-4" />
          Setup Vault
        </Link>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800 text-xs text-gray-500">
        Created {new Date(project.createdAt).toLocaleDateString()}
      </div>
    </motion.div>
  );
}
