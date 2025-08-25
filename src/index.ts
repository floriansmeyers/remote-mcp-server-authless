import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DenuoScraper } from "./scraper";
import { DenuoDatabase } from "./database";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Denuo.be MCP Server",
		version: "1.0.0",
	});

	async init(env?: Env) {
		const db = env?.DENUO_DB ? new DenuoDatabase(env.DENUO_DB) : null;

		// Search denuo.be articles
		this.server.tool(
			"search_denuo_articles",
			{
				query: z.string().describe("Search term for articles"),
				language: z.enum(["nl", "fr"]).optional().describe("Language filter"),
				category: z.string().optional().describe("Category filter"),
				limit: z.number().default(10).describe("Maximum number of results"),
			},
			async ({ query, language, category, limit }) => {
				if (!db) {
					return {
						content: [{ type: "text", text: "Database not available" }],
					};
				}

				try {
					const results = await db.searchArticles(
						query,
						language,
						category,
						limit,
					);
					if (results.length === 0) {
						return {
							content: [
								{
									type: "text",
									text: `No articles found for query: "${query}"`,
								},
							],
						};
					}

					const formatted = results
						.map(
							(article) =>
								`**${article.title}** (${article.language.toUpperCase()})\n` +
								`${article.summary || "No summary available"}\n` +
								`Category: ${article.category || "Uncategorized"}\n` +
								`Date: ${article.published_date || "Unknown"}\n` +
								`URL: ${article.url}\n`,
						)
						.join("\n---\n\n");

					return {
						content: [
							{
								type: "text",
								text: `Found ${results.length} articles:\n\n${formatted}`,
							},
						],
					};
				} catch (error) {
					return {
						content: [
							{ type: "text", text: `Error searching articles: ${error}` },
						],
					};
				}
			},
		);

		// Get recent denuo.be articles
		this.server.tool(
			"get_denuo_recent_articles",
			{
				language: z.enum(["nl", "fr"]).optional().describe("Language filter"),
				limit: z.number().default(10).describe("Maximum number of results"),
			},
			async ({ language, limit }) => {
				if (!db) {
					return {
						content: [{ type: "text", text: "Database not available" }],
					};
				}

				try {
					const results = await db.getRecentArticles(language, limit);
					if (results.length === 0) {
						return {
							content: [{ type: "text", text: "No recent articles found" }],
						};
					}

					const formatted = results
						.map(
							(article) =>
								`**${article.title}** (${article.language.toUpperCase()})\n` +
								`${article.summary || "No summary available"}\n` +
								`Category: ${article.category || "Uncategorized"}\n` +
								`Date: ${article.published_date || "Unknown"}\n` +
								`URL: ${article.url}\n`,
						)
						.join("\n---\n\n");

					return {
						content: [
							{ type: "text", text: `Recent articles:\n\n${formatted}` },
						],
					};
				} catch (error) {
					return {
						content: [
							{ type: "text", text: `Error getting recent articles: ${error}` },
						],
					};
				}
			},
		);

		// Get denuo.be events
		this.server.tool(
			"get_denuo_events",
			{
				upcoming_only: z
					.boolean()
					.default(true)
					.describe("Show only upcoming events"),
				limit: z.number().default(5).describe("Maximum number of results"),
			},
			async ({ upcoming_only, limit }) => {
				if (!db) {
					return {
						content: [{ type: "text", text: "Database not available" }],
					};
				}

				try {
					const results = upcoming_only
						? await db.getUpcomingEvents(limit)
						: await db.getAllEvents(limit);

					if (results.length === 0) {
						return {
							content: [
								{
									type: "text",
									text: upcoming_only
										? "No upcoming events found"
										: "No events found",
								},
							],
						};
					}

					const formatted = results
						.map(
							(event) =>
								`**${event.title}**\n` +
								`${event.description || "No description available"}\n` +
								`Date: ${event.event_date || "TBD"}\n` +
								`Location: ${event.location || "TBD"}\n` +
								(event.url ? `URL: ${event.url}\n` : ""),
						)
						.join("\n---\n\n");

					return {
						content: [
							{
								type: "text",
								text: `${upcoming_only ? "Upcoming" : "All"} events:\n\n${formatted}`,
							},
						],
					};
				} catch (error) {
					return {
						content: [{ type: "text", text: `Error getting events: ${error}` }],
					};
				}
			},
		);

		// Get denuo.be partners
		this.server.tool(
			"get_denuo_partners",
			{
				limit: z.number().default(20).describe("Maximum number of results"),
			},
			async ({ limit }) => {
				if (!db) {
					return {
						content: [{ type: "text", text: "Database not available" }],
					};
				}

				try {
					const results = await db.getPartners(limit);
					if (results.length === 0) {
						return {
							content: [{ type: "text", text: "No partners found" }],
						};
					}

					const formatted = results
						.map(
							(partner) =>
								`**${partner.name}**\n` +
								`${partner.description || "No description available"}\n` +
								(partner.website ? `Website: ${partner.website}\n` : "") +
								(partner.category ? `Category: ${partner.category}\n` : ""),
						)
						.join("\n---\n\n");

					return {
						content: [{ type: "text", text: `Partners:\n\n${formatted}` }],
					};
				} catch (error) {
					return {
						content: [
							{ type: "text", text: `Error getting partners: ${error}` },
						],
					};
				}
			},
		);

		// Get article details by ID
		this.server.tool(
			"get_denuo_article_details",
			{
				id: z.number().describe("Article ID"),
			},
			async ({ id }) => {
				if (!db) {
					return {
						content: [{ type: "text", text: "Database not available" }],
					};
				}

				try {
					const article = await db.getArticleById(id);
					if (!article) {
						return {
							content: [
								{ type: "text", text: `Article with ID ${id} not found` },
							],
						};
					}

					const formatted =
						`**${article.title}** (${article.language.toUpperCase()})\n\n` +
						`${article.content}\n\n` +
						`---\n` +
						`Category: ${article.category || "Uncategorized"}\n` +
						`Published: ${article.published_date || "Unknown"}\n` +
						`URL: ${article.url}\n` +
						`Last scraped: ${article.scraped_at}`;

					return {
						content: [{ type: "text", text: formatted }],
					};
				} catch (error) {
					return {
						content: [
							{ type: "text", text: `Error getting article details: ${error}` },
						],
					};
				}
			},
		);
	}
}

async function scrapeDenuoContent(db: D1Database): Promise<void> {
	const scraper = new DenuoScraper();
	const database = new DenuoDatabase(db);

	try {
		// Scrape articles in both languages
		const [dutchArticles, frenchArticles, events, partners] = await Promise.all(
			[
				scraper.scrapeArticles("nl"),
				scraper.scrapeArticles("fr"),
				scraper.scrapeEvents(),
				scraper.scrapePartners(),
			],
		);

		// Store all content in parallel
		await Promise.all([
			database.storeArticles(dutchArticles),
			database.storeArticles(frenchArticles),
			database.storeEvents(events),
			database.storePartners(partners),
		]);

		console.log(
			`Successfully scraped: ${dutchArticles.length + frenchArticles.length} articles, ${events.length} events, ${partners.length} partners`,
		);
	} catch (error) {
		console.error("Error scraping denuo.be content:", error);
	}
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},

	async scheduled(
		event: ScheduledEvent,
		env: Env,
		ctx: ExecutionContext,
	): Promise<void> {
		if (!env.DENUO_DB) {
			console.error("DENUO_DB not available in scheduled handler");
			return;
		}

		console.log("Starting scheduled scrape of denuo.be content");
		ctx.waitUntil(scrapeDenuoContent(env.DENUO_DB));
	},
};
