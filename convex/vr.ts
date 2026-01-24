import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get single VR experience by slug
export const getExperienceBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const experience = await ctx.db
      .query("vrExperiences")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    return experience;
  },
});

// Get all VR experiences
export const getAllExperiences = query({
  handler: async (ctx) => {
    const experiences = await ctx.db
      .query("vrExperiences")
      .collect();
    return experiences.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get experiences by type (property or destination)
export const getExperiencesByType = query({
  args: { type: v.union(v.literal("property"), v.literal("destination")) },
  handler: async (ctx, { type }) => {
    const experiences = await ctx.db
      .query("vrExperiences")
      .withIndex("by_type", (q) => q.eq("type", type))
      .collect();
    return experiences.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get featured experiences
export const getFeaturedExperiences = query({
  handler: async (ctx) => {
    const experiences = await ctx.db
      .query("vrExperiences")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .collect();
    return experiences.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Create new VR experience
export const createExperience = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    type: v.union(v.literal("property"), v.literal("destination")),
    categories: v.array(v.string()),
    description: v.string(),
    fullDescription: v.optional(v.string()),
    thumbnailImage: v.string(),
    gallery: v.optional(v.array(v.string())),
    features: v.optional(v.array(v.object({
      name: v.string(),
      description: v.string(),
    }))),
    multiverseUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    price: v.optional(v.number()),
    gradient: v.string(),
    featured: v.boolean(),
    testimonial: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("vrExperiences", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update VR experience
export const updateExperience = mutation({
  args: {
    id: v.id("vrExperiences"),
    title: v.string(),
    slug: v.string(),
    type: v.union(v.literal("property"), v.literal("destination")),
    categories: v.array(v.string()),
    description: v.string(),
    fullDescription: v.optional(v.string()),
    thumbnailImage: v.string(),
    gallery: v.optional(v.array(v.string())),
    features: v.optional(v.array(v.object({
      name: v.string(),
      description: v.string(),
    }))),
    multiverseUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    price: v.optional(v.number()),
    gradient: v.string(),
    featured: v.boolean(),
    testimonial: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...args }) => {
    return await ctx.db.patch(id, {
      ...args,
      updatedAt: Date.now(),
    });
  },
});

// Delete VR experience
export const deleteExperience = mutation({
  args: { id: v.id("vrExperiences") },
  handler: async (ctx, { id }) => {
    return await ctx.db.delete(id);
  },
});
