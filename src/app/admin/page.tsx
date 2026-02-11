/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import {
  Mail,
  Inbox,
  FileText,
  Image as ImageIcon,
  PenLine,
  Plus,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Briefcase,
  Target,
  AlertCircle,
  Send,
  UserPlus,
  Globe,
} from "lucide-react";

export default function AdminDashboard() {
  const contactSubmissions = useQuery(api.contactSubmissions.getContactSubmissions, {});
  const subscriberCount = useQuery(api.newsletter.getSubscriberCount, {});
  const blogPosts = useQuery(api.blog.getAllPosts, {});
  const projects = useQuery(api.portfolio.getAllProjects);
  const projectRequests = useQuery(api.projectRequests.getProjectRequests, {});
  const leads = useQuery(api.leads.getAllLeads);
  const communityMembers = useQuery(api.community.getAllMembers);
  const communityRequests = useQuery(api.community.getInviteRequests);
  const clientProjects = useQuery(api.projects.getAllProjects);

  // Calculate trends (comparing recent activity)
  function calculateTrend(items: any[] | undefined) {
    if (!items || items.length === 0) return { trend: 0, isUp: false };

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

    const thisWeek = items.filter((item: any) => item.createdAt > weekAgo).length;
    const lastWeek = items.filter((item: any) => item.createdAt > twoWeeksAgo && item.createdAt <= weekAgo).length;

    if (lastWeek === 0) return { trend: thisWeek > 0 ? 100 : 0, isUp: thisWeek > 0 };

    const percentChange = ((thisWeek - lastWeek) / lastWeek) * 100;
    return { trend: Math.abs(Math.round(percentChange)), isUp: percentChange > 0 };
  }

  const contactTrend = calculateTrend(contactSubmissions);
  const blogTrend = calculateTrend(blogPosts);
  const projectTrend = calculateTrend(projects);
  const leadsTrend = calculateTrend(leads);

  // Calculate pending items for "Needs Attention"
  const unreadContacts = contactSubmissions?.filter((c: any) => c.status === "new").length || 0;
  const newLeads = leads?.filter((l: any) => l.status === "new").length || 0;
  const pendingRequests = projectRequests?.filter((r: any) => r.status === "new").length || 0;
  const pendingCommunity = communityRequests?.filter((r: any) => r.status === "pending").length || 0;
  const pendingApprovals = communityMembers?.filter((m: any) => !m.approved).length || 0;

  const totalPendingItems = unreadContacts + newLeads + pendingRequests + pendingCommunity + pendingApprovals;

  const stats = [
    {
      label: "Contact Submissions",
      value: contactSubmissions?.length || 0,
      href: "/admin/contacts",
      icon: Mail,
      color: "from-blue-500 to-cyan-500",
      trend: contactTrend,
    },
    {
      label: "Newsletter Subscribers",
      value: subscriberCount || 0,
      href: "/admin/newsletter",
      icon: Inbox,
      color: "from-purple-500 to-pink-500",
      trend: { trend: 0, isUp: false },
    },
    {
      label: "Leads",
      value: leads?.length || 0,
      href: "/admin/leads",
      icon: Target,
      color: "from-green-500 to-emerald-500",
      trend: leadsTrend,
    },
    {
      label: "Project Requests",
      value: projectRequests?.length || 0,
      href: "/admin/project-requests",
      icon: Briefcase,
      color: "from-cyan-500 to-blue-500",
      trend: calculateTrend(projectRequests),
    },
    {
      label: "Blog Posts",
      value: blogPosts?.length || 0,
      href: "/admin/blog",
      icon: FileText,
      color: "from-amber-500 to-orange-500",
      trend: blogTrend,
    },
    {
      label: "Portfolio Projects",
      value: projects?.length || 0,
      href: "/admin/portfolio",
      icon: ImageIcon,
      color: "from-rose-500 to-pink-500",
      trend: projectTrend,
    },
    {
      label: "Community Members",
      value: communityMembers?.filter((m: any) => m.approved).length || 0,
      href: "/admin/community",
      icon: Users,
      color: "from-violet-500 to-purple-500",
      trend: calculateTrend(communityMembers?.filter((m: any) => m.approved)),
    },
    {
      label: "VR Experiences",
      value: useQuery(api.vr.getAllExperiences)?.length || 0,
      href: "/admin/vr",
      icon: Globe,
      color: "from-teal-500 to-cyan-500",
      trend: { trend: 0, isUp: false },
    },
    {
      label: "Client Projects",
      value: clientProjects?.length || 0,
      href: "/admin/projects",
      icon: Briefcase,
      color: "from-orange-500 to-yellow-500",
      trend: calculateTrend(clientProjects),
    },
  ];

  // Get recent activity
  const recentActivity = [
    ...(contactSubmissions?.slice(0, 3).map((item: any) => ({
      type: "Contact",
      name: item.name,
      time: item.createdAt,
      color: "text-blue-400",
    })) || []),
    ...(projectRequests?.slice(0, 3).map((item: any) => ({
      type: "Project Request",
      name: item.name,
      time: item.createdAt,
      color: "text-cyan-400",
    })) || []),
    ...(leads?.slice(0, 2).map((item: any) => ({
      type: "New Lead",
      name: item.name,
      time: item.createdAt,
      color: "text-green-400",
    })) || []),
    ...(blogPosts?.filter((p: any) => p.published).slice(0, 2).map((item: any) => ({
      type: "Blog Post",
      name: item.title,
      time: item.createdAt,
      color: "text-amber-400",
    })) || []),
  ].sort((a, b) => b.time - a.time).slice(0, 5);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to your admin panel. Manage your content below.</p>
      </motion.div>

      {/* Needs Attention Banner */}
      {totalPendingItems > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30"
        >
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Needs Attention</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium">
              {totalPendingItems} items
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {unreadContacts > 0 && (
              <Link href="/admin/contacts" className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white">{unreadContacts} unread contacts</span>
              </Link>
            )}
            {newLeads > 0 && (
              <Link href="/admin/leads" className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white">{newLeads} new leads</span>
              </Link>
            )}
            {pendingRequests > 0 && (
              <Link href="/admin/project-requests" className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-white">{pendingRequests} project requests</span>
              </Link>
            )}
            {pendingCommunity > 0 && (
              <Link href="/admin/community" className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <UserPlus className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white">{pendingCommunity} invite requests</span>
              </Link>
            )}
            {pendingApprovals > 0 && (
              <Link href="/admin/community" className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Users className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-white">{pendingApprovals} pending approvals</span>
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={stat.href}>
              <div className="glass-elevated rounded-2xl p-5 hover:border-white/20 transition-all duration-200 cursor-pointer group h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-20`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  {stat.trend && stat.trend.trend > 0 && (
                    <div className={`flex items-center gap-1 text-xs font-semibold ${
                      stat.trend.isUp ? "text-green-400" : "text-red-400"
                    }`}>
                      {stat.trend.isUp ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {stat.trend.trend}%
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-10"
      >
        <h2 className="text-2xl font-display font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/blog?action=new" className="group">
            <div className="glass-elevated rounded-xl p-4 hover:border-white/20 transition-all duration-200 h-full">
              <PenLine className="w-8 h-8 text-amber-400 mb-2" />
              <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                Write Blog Post
              </h3>
            </div>
          </Link>

          <Link href="/admin/portfolio?action=new" className="group">
            <div className="glass-elevated rounded-xl p-4 hover:border-white/20 transition-all duration-200 h-full">
              <Plus className="w-8 h-8 text-pink-400 mb-2" />
              <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                Add Project
              </h3>
            </div>
          </Link>

          <Link href="/admin/newsletter" className="group">
            <div className="glass-elevated rounded-xl p-4 hover:border-white/20 transition-all duration-200 h-full">
              <Send className="w-8 h-8 text-purple-400 mb-2" />
              <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                Send Newsletter
              </h3>
            </div>
          </Link>

          <Link href="/admin/leads" className="group">
            <div className="glass-elevated rounded-xl p-4 hover:border-white/20 transition-all duration-200 h-full">
              <UserPlus className="w-8 h-8 text-green-400 mb-2" />
              <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                Add Lead
              </h3>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-10"
      >
        <h2 className="text-2xl font-display font-bold mb-4">Recent Activity</h2>
        <div className="glass-elevated rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/10">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${activity.color} mb-1`}>
                        {activity.type}
                      </p>
                      <p className="text-white text-sm truncate">{activity.name}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {new Date(activity.time).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-10 p-5 rounded-2xl bg-white/5 border border-white/10"
      >
        <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" /> Pro Tip
        </h3>
        <p className="text-gray-400 text-sm">
          Check the &quot;Needs Attention&quot; banner above for items requiring your action. You can also use Settings → Integrations to test your email configuration.
        </p>
      </motion.div>
    </div>
  );
}
