#!/usr/bin/env node

/**
 * CLI Script to add newsletters directly to Convex
 * Usage: node scripts/add-newsletter.js [options]
 */

const { ConvexHttpClient } = require("convex/browser");
const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    subject: "",
    content: "",
    contentFile: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const value = args[i + 1];

    switch (arg) {
      case "--subject":
        options.subject = value;
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

  return options;
}

function showHelp() {
  console.log(`
CLI Script to add newsletters to Media4U

Usage: node scripts/add-newsletter.js [options]

Options:
  --subject "Newsletter Subject"  Email subject line (required)
  --content "HTML content"        Newsletter content as HTML (required if no --content-file)
  --content-file path/to/file     Read content from file (HTML or Markdown)
  --help                          Show this help message

Examples:
  # Basic newsletter
  node scripts/add-newsletter.js --subject "Monthly Update" --content "<p>Hello!</p>"

  # Newsletter from HTML file
  node scripts/add-newsletter.js --subject "January News" --content-file newsletter.html

  # Newsletter from Markdown file (auto-converts to HTML)
  node scripts/add-newsletter.js --subject "Updates" --content-file newsletter.md

Notes:
  - Newsletters are created as DRAFTS by default
  - You can schedule or send them from the admin panel at /admin/newsletter
  - HTML content should be formatted for email clients
  - Markdown files will be automatically converted to basic HTML

Supported HTML tags:
  - <h1>, <h2>, <h3> for headings
  - <p> for paragraphs
  - <strong>, <em> for formatting
  - <ul>, <ol>, <li> for lists
  - <a href="..."> for links
  - <img src="..." alt="..."> for images
  `);
}

function validateOptions(options) {
  const errors = [];

  if (!options.subject) errors.push("Subject is required (--subject)");
  if (!options.content) errors.push("Content is required (--content or --content-file)");

  if (errors.length > 0) {
    console.error("Validation errors:");
    errors.forEach((err) => console.error(`  - ${err}`));
    console.log("\nRun with --help for usage information");
    process.exit(1);
  }
}

async function addNewsletter(options) {
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
    console.log("Creating newsletter draft...");
    console.log(`  Subject: ${options.subject}`);
    console.log(`  Content length: ${options.content.length} characters`);

    // Get CLI admin key
    const adminKey = process.env.CLI_ADMIN_KEY || "dev-key-12345";

    const id = await client.mutation("cli:createNewsletterCLI", {
      adminKey,
      subject: options.subject,
      content: options.content,
    });

    console.log("\n✅ Newsletter draft created successfully!");
    console.log(`   ID: ${id}`);
    console.log(`   Status: Draft`);
    console.log(`\nNext steps:`);
    console.log(`   1. View/edit at: http://localhost:3000/admin/newsletter`);
    console.log(`   2. Or use the admin panel to:`);
    console.log(`      - Preview the newsletter`);
    console.log(`      - Schedule it for later`);
    console.log(`      - Send it immediately to all subscribers`);
  } catch (error) {
    console.error("\n❌ Error creating newsletter:");
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
addNewsletter(options);
