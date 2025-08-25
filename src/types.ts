// Type definitions for Cloudflare Workers environment
export interface Env {
	DENUO_DB: D1Database;
	MCP_OBJECT: DurableObjectNamespace;
}

// Extend the global types
declare global {
	interface Env {
		DENUO_DB: D1Database;
		MCP_OBJECT: DurableObjectNamespace;
	}
}
