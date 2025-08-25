# Denuo.be MCP Server

A Remote MCP (Model Context Protocol) Server that provides access to denuo.be content through AI agents. This server scrapes and caches content from denuo.be, Belgium's waste and recycling industry website, making it searchable and accessible via MCP tools.

## Features

- **Automated Content Scraping**: Scheduled worker scrapes denuo.be every 6 hours
- **Multilingual Support**: Handles both Dutch (nl) and French (fr) content
- **Fast Queries**: Content stored in Cloudflare D1 for rapid access
- **MCP Tools Available**:
  - `search_denuo_articles` - Search articles by query, language, and category
  - `get_denuo_recent_articles` - Get recent articles with optional language filter
  - `get_denuo_events` - Get upcoming or all events
  - `get_denuo_partners` - Get partner/member information
  - `get_denuo_article_details` - Get full article content by ID

## Setup Instructions

### Prerequisites

- Cloudflare account with Workers and D1 enabled
- Node.js and npm installed
- Wrangler CLI configured

### 1. Create D1 Database

```bash
npx wrangler d1 create denuo-content
```

Copy the database ID and update `wrangler.jsonc`:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DENUO_DB",
      "database_name": "denuo-content",
      "database_id": "YOUR_DATABASE_ID_HERE"
    }
  ]
}
```

### 2. Initialize Database Schema

```bash
npx wrangler d1 execute denuo-content --file=./schema.sql
```

### 3. Deploy to Cloudflare Workers

```bash
npm run deploy
```

### 4. Connect to MCP Clients

Your MCP server will be available at:
- SSE endpoint: `https://your-worker.your-account.workers.dev/sse`
- Standard MCP: `https://your-worker.your-account.workers.dev/mcp`

## Connect to Cloudflare AI Playground

1. Go to https://playground.ai.cloudflare.com/
2. Enter your deployed MCP server URL (`your-worker.your-account.workers.dev/sse`)
3. You can now use your MCP tools directly from the playground!

## Connect Claude Desktop to your MCP server

To connect to your MCP server from Claude Desktop, follow [Anthropic's Quickstart](https://modelcontextprotocol.io/quickstart/user) and within Claude Desktop go to Settings > Developer > Edit Config.

Update with this configuration:

```json
{
  "mcpServers": {
    "denuo": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://your-worker.your-account.workers.dev/sse"
      ]
    }
  }
}
```

## Architecture

- **Cloudflare Workers**: Serverless execution environment
- **D1 Database**: SQLite-compatible database for content storage
- **Scheduled Workers**: Automated scraping every 6 hours via cron triggers
- **Durable Objects**: State persistence for MCP agent

## Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Type check
npm run type-check

# Format code
npm run format

# Fix linting issues
npm run lint:fix
```

## Content Types

### Articles
- News and updates from denuo.be
- Categorized content with summaries
- Available in Dutch and French

### Events
- Industry events and meetings
- Date, location, and description information

### Partners
- Member companies and organizations
- Contact information and websites

## Scheduled Scraping

The worker automatically scrapes content every 6 hours:
- Articles from `/nl/nieuws` and `/fr/actualites`
- Events from `/agenda`
- Partners from `/partners`

All content is stored with metadata including scrape timestamps and success status.

## Error Handling

- Graceful degradation when scraping fails
- Cached content remains available during outages
- Comprehensive error logging and metadata tracking

## Customizing your MCP Server

To add your own [tools](https://developers.cloudflare.com/agents/model-context-protocol/tools/) to the MCP server, define each tool inside the `init()` method of `src/index.ts` using `this.server.tool(...)`.