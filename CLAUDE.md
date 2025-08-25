# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Guidelines

**IMPORTANT**: Always check the official Cloudflare documentation before implementing new features:
- Remote MCP Server Guide: https://developers.cloudflare.com/agents/guides/remote-mcp-server/
- Cloudflare Workers: https://developers.cloudflare.com/workers/
- Durable Objects: https://developers.cloudflare.com/durable-objects/

## Development Commands

### Essential Commands
- `npm run dev` or `npm start` - Start local Wrangler development server (runs on localhost:8787)
- `npm run deploy` - Deploy to Cloudflare Workers
- `npm run format` - Format code with Biome
- `npm run lint:fix` - Fix linting issues with Biome
- `npm run type-check` - Type check with TypeScript (runs `tsc --noEmit`)
- `npm run cf-typegen` - Generate Cloudflare types with Wrangler

## Architecture

This is a **Remote MCP (Model Context Protocol) Server** deployed on Cloudflare Workers using Durable Objects.

### Core Components

1. **MCP Agent (`src/index.ts`)**
   - Extends `McpAgent` from the `agents` package
   - Uses `@modelcontextprotocol/sdk` for MCP server implementation
   - Implements tools in the `init()` method using `this.server.tool(...)`
   - Tools use Zod schemas for parameter validation

2. **Worker Entry Point**
   - Handles routes:
     - `/sse` and `/sse/message` - SSE endpoint for streaming connections
     - `/mcp` - Standard MCP endpoint
   - Delegates to `MyMCP` Durable Object via static methods

3. **Durable Object Configuration**
   - Class `MyMCP` is configured as a Durable Object in `wrangler.jsonc`
   - Bound as `MCP_OBJECT` for state persistence

### Adding New Tools

To add MCP tools, modify the `init()` method in `src/index.ts`:

```typescript
this.server.tool(
  "toolName",
  { 
    param1: z.string(),
    param2: z.number()
  },
  async ({ param1, param2 }) => ({
    content: [{ type: "text", text: "result" }]
  })
);
```

### Tech Stack
- **Runtime**: Cloudflare Workers with Durable Objects
- **Language**: TypeScript with strict mode
- **Formatter/Linter**: Biome (indentWidth: 4, lineWidth: 100)
- **MCP SDK**: `@modelcontextprotocol/sdk` v1.17.1
- **Validation**: Zod for schema validation

## Deployment

The project deploys to Cloudflare Workers at:
- Pattern: `remote-mcp-server-authless.<account>.workers.dev/sse`
- Requires Durable Objects support
- Uses nodejs_compat compatibility flag

## Remote MCP Server Documentation Summary

Based on Cloudflare's official documentation, this project implements an **unauthenticated Remote MCP Server**:

### Key Features
- **Deployment Options**: Supports both authenticated (OAuth-based) and unauthenticated configurations
- **Current Implementation**: Unauthenticated version for immediate accessibility
- **Architecture**: Built on Cloudflare Workers with Durable Objects for state persistence
- **Endpoints**: Provides both SSE (`/sse`) and standard MCP (`/mcp`) endpoints
- **Scalability**: Leverages Cloudflare's global network for low-latency access

### Authentication Options (Future Enhancement)
- OAuth integration with GitHub and other providers
- Scoped permissions for tool access
- Secure token management
- User management system integration

### Development Workflow
- Local development with `wrangler`
- TypeScript-based implementation
- Custom tool integration support
- Production-ready deployment pipeline