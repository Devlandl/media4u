# Media4U CLI Tools

Command-line tools for adding blogs and newsletters directly from the terminal without using the admin web interface.

## Quick Start

### Add a Blog Post

```bash
npm run add-blog -- --title "My Blog Post" --excerpt "Short description" --content "Full content here"
```

### Add a Newsletter

```bash
npm run add-newsletter -- --subject "Monthly Update" --content "<p>Hello subscribers!</p>"
```

## Blog Posts

### Basic Usage

```bash
npm run add-blog -- --title "Post Title" --excerpt "Brief summary" --content "Full article content"
```

### Options

| Option | Description | Required | Default |
|--------|-------------|----------|---------|
| `--title` | Blog post title | Yes | - |
| `--excerpt` | Short summary | Yes | - |
| `--content` | Full content (HTML or text) | Yes* | - |
| `--content-file` | Path to content file | Yes* | - |
| `--slug` | URL slug | No | Auto-generated from title |
| `--category` | Post category | No | "VR Technology" |
| `--date` | Publish date (YYYY-MM-DD) | No | Today |
| `--read-time` | Reading time estimate | No | "5 min read" |
| `--gradient` | Tailwind gradient class | No | cyan-blue-purple |
| `--featured` | Mark as featured (true/false) | No | false |
| `--published` | Publish immediately (true/false) | No | true |
| `--draft` | Save as draft | No | - |

*Either `--content` or `--content-file` is required

### Available Gradients

- `from-cyan-500 via-blue-500 to-purple-600` (default)
- `from-purple-500 via-pink-500 to-rose-500`
- `from-emerald-500 via-teal-500 to-cyan-500`
- `from-orange-500 via-amber-500 to-yellow-500`
- `from-pink-500 via-purple-500 to-indigo-500`

### Categories

- VR Technology (default)
- Design
- Development
- Business
- Tutorial

### Examples

**Simple blog post:**
```bash
npm run add-blog -- \
  --title "Getting Started with VR" \
  --excerpt "A beginner's guide to virtual reality" \
  --content "Virtual reality is becoming more accessible..."
```

**Blog post from Markdown file:**
```bash
npm run add-blog -- \
  --title "Advanced VR Techniques" \
  --excerpt "Pro tips for VR development" \
  --content-file ./content/advanced-vr.md \
  --category "Tutorial" \
  --read-time "10 min read"
```

**Featured blog post:**
```bash
npm run add-blog -- \
  --title "2026 VR Trends" \
  --excerpt "What's hot in virtual reality" \
  --content-file trends-2026.md \
  --featured true \
  --gradient "from-purple-500 via-pink-500 to-rose-500"
```

**Save as draft:**
```bash
npm run add-blog -- \
  --title "Work in Progress" \
  --excerpt "Still writing this" \
  --content "Draft content..." \
  --draft
```

## Newsletters

### Basic Usage

```bash
npm run add-newsletter -- --subject "Email Subject" --content "<p>Newsletter content</p>"
```

### Options

| Option | Description | Required |
|--------|-------------|----------|
| `--subject` | Email subject line | Yes |
| `--content` | HTML content | Yes* |
| `--content-file` | Path to HTML/Markdown file | Yes* |

*Either `--content` or `--content-file` is required

### Examples

**Simple newsletter:**
```bash
npm run add-newsletter -- \
  --subject "January 2026 Update" \
  --content "<h2>Hello!</h2><p>Here's what's new...</p>"
```

**Newsletter from HTML file:**
```bash
npm run add-newsletter -- \
  --subject "Product Launch" \
  --content-file ./newsletters/launch.html
```

**Newsletter from Markdown (auto-converts):**
```bash
npm run add-newsletter -- \
  --subject "Weekly Tips" \
  --content-file weekly-tips.md
```

### Important Notes

- Newsletters are always created as **DRAFTS**
- You must schedule or send them from the admin panel: `http://localhost:3000/admin/newsletter`
- Content should be HTML formatted for email clients
- Markdown files are automatically converted to basic HTML

### Supported HTML in Newsletters

- `<h1>`, `<h2>`, `<h3>` - Headings
- `<p>` - Paragraphs
- `<strong>`, `<em>` - Bold and italic
- `<ul>`, `<ol>`, `<li>` - Lists
- `<a href="...">` - Links
- `<img src="..." alt="...">` - Images

## Content Files

### Markdown Files

Create a `.md` file with your content:

```markdown
# Main Heading

This is a paragraph with **bold** and *italic* text.

## Subheading

- Bullet point 1
- Bullet point 2

[Link text](https://example.com)
```

### HTML Files

Create a `.html` file with formatted content:

```html
<h2>Welcome to Our Newsletter</h2>
<p>We're excited to share...</p>

<ul>
  <li>Feature 1</li>
  <li>Feature 2</li>
</ul>

<a href="https://media4u.fun">Visit our website</a>
```

## Tips

### Writing Good Blog Posts

1. **Title**: Clear, descriptive, under 60 characters
2. **Excerpt**: Compelling 1-2 sentence summary
3. **Content**: Use headings, paragraphs, and lists for readability
4. **Slug**: Use lowercase with hyphens (e.g., `my-blog-post`)
5. **Read Time**: Estimate 200 words per minute

### Writing Good Newsletters

1. **Subject**: Clear, engaging, under 50 characters
2. **Content**: Keep it concise, use headings to break up content
3. **Call to Action**: Include clear next steps
4. **Preview**: Always preview before sending
5. **Test**: Send a test to yourself first

## Workflow

### For Claude (AI Assistant)

1. Write content in the conversation
2. Save to a file or use inline
3. Run the CLI command
4. Verify it was created successfully

### For You (Admin)

1. Check the admin panel to review
2. Edit if needed
3. Publish blog posts or send newsletters

## Troubleshooting

### "NEXT_PUBLIC_CONVEX_URL not found"
Make sure `.env.local` exists with your Convex URL.

### "Error creating blog post"
Make sure Convex dev is running: `npx convex dev`

### "Content file not found"
Use absolute paths or paths relative to the project root.

### Permission errors
The scripts require admin access through Convex mutations.

## Help

Show help for any command:

```bash
npm run add-blog -- --help
npm run add-newsletter -- --help
```
