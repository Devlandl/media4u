#!/usr/bin/env node

/**
 * CLI Script to add blog posts directly to Convex
 * Usage: node scripts/add-blog.js [options]
 */

const { ConvexHttpClient } = require("convex/browser");
const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "VR Technology",
    date: new Date().toISOString().split("T")[0],
    readTime: "5 min read",
    gradient: "from-cyan-500 via-blue-500 to-purple-600",
    featured: false,
    published: true,
    contentFile: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const value = args[i + 1];

    switch (arg) {
      case "--title":
        options.title = value;
        i++;
        break;
      case "--slug":
        options.slug = value;
        i++;
        break;
      case "--excerpt":
        options.excerpt = value;
        i++;
        break;
      case "--content":
        options.content = value;
        i++;
        break;
      case "--content-file":
        options.contentFile = value;
        i++;
        break;
      case "--category":
        options.category = value;
        i++;
        break;
      case "--date":
        options.date = value;
        i++;
        break;
      case "--read-time":
        options.readTime = value;
        i++;
        break;
      case "--gradient":
        options.gradient = value;
        i++;
        break;
      case "--featured":
        options.featured = value === "true";
        i++;
        break;
      case "--published":
        options.published = value === "true";
        i++;
        break;
      case "--draft":
        options.published = false;
        break;
      case "--help":
        showHelp();
        process.exit(0);
    }
  }

  // Load content from file if specified
  if (options.contentFile) {
    try {
      const contentPath = path.resolve(options.contentFile);
      const fileContent = fs.readFileSync(contentPath, "utf-8");

      // If it's a Markdown file, convert to HTML
      if (options.contentFile.endsWith(".md")) {
        options.content = marked.parse(fileContent);
      } else {
        options.content = fileContent;
      }
    } catch (error) {
      console.error(`Error reading content file: ${error.message}`);
      process.exit(1);
    }
  }

  // Auto-generate slug from title if not provided
  if (options.title && !options.slug) {
    options.slug = options.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  return options;
}

function showHelp() {
  console.log(`
CLI Script to add blog posts to Media4U

Usage: node scripts/add-blog.js [options]

Options:
  --title "Post Title"           Blog post title (required)
  --slug "post-slug"            URL slug (auto-generated from title if not provided)
  --excerpt "Short description"  Brief summary (required)
  --content "Full content"       Blog post content (required if no --content-file)
  --content-file path/to/file    Read content from file (Markdown supported)
  --category "Category Name"     Category (default: "VR Technology")
  --date "YYYY-MM-DD"           Publish date (default: today)
  --read-time "X min read"      Estimated read time (default: "5 min read")
  --gradient "gradient-class"    Tailwind gradient (default: cyan-blue-purple)
  --featured true/false          Mark as featured (default: false)
  --published true/false         Publish immediately (default: true)
  --draft                        Same as --published false
  --help                         Show this help message

Examples:
  # Basic blog post
  node scripts/add-blog.js --title "My First Post" --excerpt "A great post" --content "Full content here"

  # Blog post from file
  node scripts/add-blog.js --title "VR Guide" --excerpt "Complete guide" --content-file blog-post.md

  # Save as draft
  node scripts/add-blog.js --title "Draft Post" --excerpt "Not ready" --content "..." --draft

Gradients available:
  - from-cyan-500 via-blue-500 to-purple-600
  - from-purple-500 via-pink-500 to-rose-500
  - from-emerald-500 via-teal-500 to-cyan-500
  - from-orange-500 via-amber-500 to-yellow-500
  - from-pink-500 via-purple-500 to-indigo-500
  `);
}

function validateOptions(options) {
  const errors = [];

  if (!options.title) errors.push("Title is required (--title)");
  if (!options.excerpt) errors.push("Excerpt is required (--excerpt)");
  if (!options.content) errors.push("Content is required (--content or --content-file)");

  if (errors.length > 0) {
    console.error("Validation errors:");
    errors.forEach((err) => console.error(`  - ${err}`));
    console.log("\nRun with --help for usage information");
    process.exit(1);
  }
}

async function addBlogPost(options) {
  // Load environment variables
  require("dotenv").config({ path: ".env.local" });

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.error("Error: NEXT_PUBLIC_CONVEX_URL not found in .env.local");
    process.exit(1);
  }

  console.log("Connecting to Convex...");
  const client = new ConvexHttpClient(convexUrl);

  try {
    console.log("Creating blog post...");
    console.log(`  Title: ${options.title}`);
    console.log(`  Slug: ${options.slug}`);
    console.log(`  Category: ${options.category}`);
    console.log(`  Published: ${options.published}`);
    console.log(`  Featured: ${options.featured}`);

    // Get CLI admin key
    const adminKey = process.env.CLI_ADMIN_KEY || "dev-key-12345";

    const id = await client.mutation("cli:createBlogPostCLI", {
      adminKey,
      title: options.title,
      slug: options.slug,
      excerpt: options.excerpt,
      content: options.content,
      category: options.category,
      date: options.date,
      readTime: options.readTime,
      gradient: options.gradient,
      featured: options.featured,
      published: options.published,
    });

    console.log("\n✅ Blog post created successfully!");
    console.log(`   ID: ${id}`);
    console.log(`   View at: http://localhost:3000/blog/${options.slug}`);
    if (options.published) {
      console.log(`   Live at: https://media4u.fun/blog/${options.slug}`);
    } else {
      console.log(`   Status: Draft (not visible publicly)`);
    }
  } catch (error) {
    console.error("\n❌ Error creating blog post:");
    console.error(error.message);
    process.exit(1);
  }
}

// Main execution
const options = parseArgs();

if (process.argv.length <= 2) {
  showHelp();
  process.exit(1);
}

validateOptions(options);
addBlogPost(options);
