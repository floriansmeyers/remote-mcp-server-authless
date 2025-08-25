import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ComprehensiveDenuoScraper } from "./scraper-v2";
import { ComprehensiveDenuoDatabase } from "./database-v2";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Denuo.be MCP Server",
		version: "1.0.0",
	});

	async init() {
		// Access environment through the MCP framework's context
		const environment = (this as any).env;
		const db = environment?.DENUO_DB ? new ComprehensiveDenuoDatabase(environment.DENUO_DB) : null;

		// 1. Search Denuo News
		this.server.tool(
			"search_denuo_news",
			{
				query: z.string().describe("Search term for news articles"),
				language: z.enum(["nl", "fr"]).optional().describe("Language filter"),
				category: z.string().optional().describe("Category filter"),
				limit: z.number().default(10).describe("Maximum number of results"),
			},
			async ({ query, language, category, limit }) => {
				if (!db) return { content: [{ type: "text", text: "Database not available" }] };

				try {
					const results = await db.searchNews(query, language, category, limit);
					if (results.length === 0) {
						return { content: [{ type: "text", text: `No news found for query: "${query}"` }] };
					}

					const formatted = results
						.map(item =>
							`**${item.title}** (${item.language.toUpperCase()})\n` +
							`${item.summary || "No summary available"}\n` +
							`Category: ${item.category || "Uncategorized"}\n` +
							`Date: ${item.publication_date || "Unknown"}\n` +
							`URL: ${item.url}\n`
						)
						.join("\n---\n\n");

					return { content: [{ type: "text", text: `Found ${results.length} news articles:\n\n${formatted}` }] };
				} catch (error) {
					return { content: [{ type: "text", text: `Error searching news: ${error}` }] };
				}
			},
		);

		// 2. Get Recent News
		this.server.tool(
			"get_denuo_recent_news",
			{
				language: z.enum(["nl", "fr"]).optional().describe("Language filter"),
				limit: z.number().default(10).describe("Maximum number of results"),
			},
			async ({ language, limit }) => {
				if (!db) return { content: [{ type: "text", text: "Database not available" }] };

				try {
					const results = await db.getRecentNews(language, limit);
					if (results.length === 0) {
						return { content: [{ type: "text", text: "No recent news found" }] };
					}

					const formatted = results
						.map(item =>
							`**${item.title}** (${item.language.toUpperCase()})\n` +
							`${item.summary || "No summary available"}\n` +
							`Category: ${item.category || "Uncategorized"}\n` +
							`Date: ${item.publication_date || "Unknown"}\n` +
							`URL: ${item.url}\n`
						)
						.join("\n---\n\n");

					return { content: [{ type: "text", text: `Recent news:\n\n${formatted}` }] };
				} catch (error) {
					return { content: [{ type: "text", text: `Error getting recent news: ${error}` }] };
				}
			},
		);

		// 3. Search Standpunten (Position Papers)
		this.server.tool(
			"search_denuo_standpunten",
			{
				query: z.string().describe("Search term for position papers"),
				year: z.string().optional().describe("Publication year filter"),
				limit: z.number().default(10).describe("Maximum number of results"),
			},
			async ({ query, year, limit }) => {
				if (!db) return { content: [{ type: "text", text: "Database not available" }] };

				try {
					const results = await db.searchStandpunten(query, year, limit);
					if (results.length === 0) {
						return { content: [{ type: "text", text: `No standpunten found for query: "${query}"` }] };
					}

					const formatted = results
						.map(item =>
							`**${item.title}**\n` +
							`${item.description || "No description available"}\n` +
							`Year: ${item.publication_year || "Unknown"}\n` +
							`Type: ${item.document_type || "Document"}\n` +
							`Language: ${item.language.toUpperCase()}\n` +
							`URL: ${item.url}\n`
						)
						.join("\n---\n\n");

					return { content: [{ type: "text", text: `Found ${results.length} standpunten:\n\n${formatted}` }] };
				} catch (error) {
					return { content: [{ type: "text", text: `Error searching standpunten: ${error}` }] };
				}
			},
		);

		// 4. Get All Standpunten
		this.server.tool(
			"get_all_denuo_standpunten",
			{
				limit: z.number().default(20).describe("Maximum number of results"),
			},
			async ({ limit }) => {
				if (!db) return { content: [{ type: "text", text: "Database not available" }] };

				try {
					const results = await db.getAllStandpunten(limit);
					if (results.length === 0) {
						return { content: [{ type: "text", text: "No standpunten found" }] };
					}

					const formatted = results
						.map(item =>
							`**${item.title}**\n` +
							`Year: ${item.publication_year || "Unknown"}\n` +
							`Type: ${item.document_type || "Document"}\n` +
							`URL: ${item.url}\n`
						)
						.join("\n---\n\n");

					return { content: [{ type: "text", text: `All standpunten:\n\n${formatted}` }] };
				} catch (error) {
					return { content: [{ type: "text", text: `Error getting standpunten: ${error}` }] };
				}
			},
		);

		// 5. Search Dossiers
		this.server.tool(
			"search_denuo_dossiers",
			{
				query: z.string().describe("Search term for dossiers"),
				category: z.string().optional().describe("Category filter"),
				language: z.enum(["nl", "fr"]).optional().describe("Language filter"),
				limit: z.number().default(10).describe("Maximum number of results"),
			},
			async ({ query, category, language, limit }) => {
				if (!db) return { content: [{ type: "text", text: "Database not available" }] };

				try {
					const results = await db.searchDossiers(query, category, limit);
					if (results.length === 0) {
						return { content: [{ type: "text", text: `No dossiers found for query: "${query}"` }] };
					}

					const formatted = results
						.map(item =>
							`**${item.title}**\n` +
							`${item.description || "No description available"}\n` +
							`Categories: ${item.categories ? JSON.parse(item.categories).join(", ") : "None"}\n` +
							`Language: ${item.language.toUpperCase()}\n` +
							`URL: ${item.url}\n`
						)
						.join("\n---\n\n");

					return { content: [{ type: "text", text: `Found ${results.length} dossiers:\n\n${formatted}` }] };
				} catch (error) {
					return { content: [{ type: "text", text: `Error searching dossiers: ${error}` }] };
				}
			},
		);

		// 6. Get All Dossiers
		this.server.tool(
			"get_all_denuo_dossiers",
			{
				limit: z.number().default(20).describe("Maximum number of results"),
			},
			async ({ limit }) => {
				if (!db) return { content: [{ type: "text", text: "Database not available" }] };

				try {
					const results = await db.getAllDossiers(limit);
					if (results.length === 0) {
						return { content: [{ type: "text", text: "No dossiers found" }] };
					}

					const formatted = results
						.map(item =>
							`**${item.title}**\n` +
							`Categories: ${item.categories ? JSON.parse(item.categories).join(", ") : "None"}\n` +
							`Language: ${item.language.toUpperCase()}\n` +
							`URL: ${item.url}\n`
						)
						.join("\n---\n\n");

					return { content: [{ type: "text", text: `All dossiers:\n\n${formatted}` }] };
				} catch (error) {
					return { content: [{ type: "text", text: `Error getting dossiers: ${error}` }] };
				}
			},
		);

		// 7. Get Paritaire Comités
		this.server.tool(
			"get_denuo_committees",
			{
				limit: z.number().default(20).describe("Maximum number of results"),
			},
			async ({ limit }) => {
				if (!db) return { content: [{ type: "text", text: "Database not available" }] };

				try {
					const results = await db.getAllCommittees();
					if (results.length === 0) {
						return { content: [{ type: "text", text: "No committees found" }] };
					}

					const formatted = results
						.slice(0, limit)
						.map(item =>
							`**${item.psc_number}: ${item.title}**\n` +
							`${item.description || "No description available"}\n` +
							`Sector: ${item.sector || "Not specified"}\n` +
							`URL: ${item.url}\n`
						)
						.join("\n---\n\n");

					return { content: [{ type: "text", text: `Paritaire Comités:\n\n${formatted}` }] };
				} catch (error) {
					return { content: [{ type: "text", text: `Error getting committees: ${error}` }] };
				}
			},
		);

		// 8. Get denuo.be events
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
								`Type: ${event.event_type || "Event"}\n` +
								`Date: ${event.event_date || "TBD"}\n` +
								`Time: ${event.event_time || "TBD"}\n` +
								`Location: ${event.location_name || "TBD"}\n` +
								(event.location_address ? `Address: ${event.location_address}\n` : "") +
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

		// 9. Search Downloads
		this.server.tool(
			"search_denuo_downloads",
			{
				query: z.string().describe("Search term for downloads"),
				file_type: z.string().optional().describe("File type filter (e.g., pdf, doc)"),
				limit: z.number().default(10).describe("Maximum number of results"),
			},
			async ({ query, file_type, limit }) => {
				if (!db) return { content: [{ type: "text", text: "Database not available" }] };

				try {
					const results = await db.searchDownloads(query, file_type, limit);
					if (results.length === 0) {
						return { content: [{ type: "text", text: `No downloads found for query: "${query}"` }] };
					}

					const formatted = results
						.map(item =>
							`**${item.title}**\n` +
							`${item.description || "No description available"}\n` +
							`File Type: ${item.file_type || "Unknown"}\n` +
							`Categories: ${item.categories ? JSON.parse(item.categories).join(", ") : "None"}\n` +
							`Languages: ${item.languages_available || "Not specified"}\n` +
							`Download: ${item.download_url}\n`
						)
						.join("\n---\n\n");

					return { content: [{ type: "text", text: `Found ${results.length} downloads:\n\n${formatted}` }] };
				} catch (error) {
					return { content: [{ type: "text", text: `Error searching downloads: ${error}` }] };
				}
			},
		);

		// 10. Get All Downloads
		this.server.tool(
			"get_all_denuo_downloads",
			{
				limit: z.number().default(20).describe("Maximum number of results"),
			},
			async ({ limit }) => {
				if (!db) return { content: [{ type: "text", text: "Database not available" }] };

				try {
					const results = await db.getAllDownloads(limit);
					if (results.length === 0) {
						return { content: [{ type: "text", text: "No downloads found" }] };
					}

					const formatted = results
						.map(item =>
							`**${item.title}**\n` +
							`File Type: ${item.file_type || "Unknown"}\n` +
							`Categories: ${item.categories ? JSON.parse(item.categories).join(", ") : "None"}\n` +
							`Download: ${item.download_url}\n`
						)
						.join("\n---\n\n");

					return { content: [{ type: "text", text: `All downloads:\n\n${formatted}` }] };
				} catch (error) {
					return { content: [{ type: "text", text: `Error getting downloads: ${error}` }] };
				}
			},
		);

		// 11. Get About Info
		this.server.tool(
			"get_denuo_about_info",
			{
				section_type: z.string().optional().describe("Section type filter (e.g., mission, contact, team)"),
			},
			async ({ section_type }) => {
				if (!db) return { content: [{ type: "text", text: "Database not available" }] };

				try {
					const results = await db.getAboutInfo(section_type);
					if (results.length === 0) {
						return { content: [{ type: "text", text: section_type ? `No about info found for section: "${section_type}"` : "No about info found" }] };
					}

					const formatted = results
						.map(item =>
							`**${item.section_title}**\n` +
							`${item.content}\n` +
							`Section Type: ${item.section_type || "General"}\n` +
							(item.url ? `URL: ${item.url}\n` : "")
						)
						.join("\n---\n\n");

					return { content: [{ type: "text", text: `About Denuo:\n\n${formatted}` }] };
				} catch (error) {
					return { content: [{ type: "text", text: `Error getting about info: ${error}` }] };
				}
			},
		);

		// 12. Search Press Articles
		this.server.tool(
			"search_denuo_press_articles",
			{
				query: z.string().describe("Search term for press articles"),
				source: z.string().optional().describe("Source filter (e.g., 'De Morgen')"),
				language: z.enum(["nl", "fr"]).optional().describe("Language filter"),
				limit: z.number().default(10).describe("Maximum number of results"),
			},
			async ({ query, source, language, limit }) => {
				if (!db) return { content: [{ type: "text", text: "Database not available" }] };

				try {
					const results = await db.searchPressArticles(query, source, limit);
					if (results.length === 0) {
						return { content: [{ type: "text", text: `No press articles found for query: "${query}"` }] };
					}

					const formatted = results
						.map(item =>
							`**${item.title}** (${item.language.toUpperCase()})\n` +
							`${item.summary || "No summary available"}\n` +
							`Source: ${item.source || "Unknown"}\n` +
							`Categories: ${item.categories ? JSON.parse(item.categories).join(", ") : "None"}\n` +
							`Date: ${item.publication_date || "Unknown"}\n` +
							`URL: ${item.url}\n`
						)
						.join("\n---\n\n");

					return { content: [{ type: "text", text: `Found ${results.length} press articles:\n\n${formatted}` }] };
				} catch (error) {
					return { content: [{ type: "text", text: `Error searching press articles: ${error}` }] };
				}
			},
		);

		// 13. Get Recent Press Articles
		this.server.tool(
			"get_denuo_recent_press_articles",
			{
				limit: z.number().default(10).describe("Maximum number of results"),
			},
			async ({ limit }) => {
				if (!db) return { content: [{ type: "text", text: "Database not available" }] };

				try {
					const results = await db.getRecentPressArticles(limit);
					if (results.length === 0) {
						return { content: [{ type: "text", text: "No recent press articles found" }] };
					}

					const formatted = results
						.map(item =>
							`**${item.title}** (${item.language.toUpperCase()})\n` +
							`${item.summary || "No summary available"}\n` +
							`Source: ${item.source || "Unknown"}\n` +
							`Date: ${item.publication_date || "Unknown"}\n` +
							`URL: ${item.url}\n`
						)
						.join("\n---\n\n");

					return { content: [{ type: "text", text: `Recent press articles:\n\n${formatted}` }] };
				} catch (error) {
					return { content: [{ type: "text", text: `Error getting recent press articles: ${error}` }] };
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
	const scraper = new ComprehensiveDenuoScraper();
	const database = new ComprehensiveDenuoDatabase(db);

	try {
		console.log("Starting comprehensive denuo.be content scraping...");

		// Scrape all content types in parallel
		const [
			dutchNews, frenchNews,
			standpunten,
			dossiers,
			committees,
			events,
			downloads,
			aboutInfo,
			pressArticles
		] = await Promise.all([
			scraper.scrapeNews("nl"),
			scraper.scrapeNews("fr"),
			scraper.scrapeStandpunten(),
			scraper.scrapeDossiers(),
			scraper.scrapeCommittees(),
			scraper.scrapeEvents(),
			scraper.scrapeDownloads(),
			scraper.scrapeAboutInfo(),
			scraper.scrapePressArticles()
		]);

		// Store all content in parallel
		await Promise.all([
			database.storeNews([...dutchNews, ...frenchNews]),
			database.storeStandpunten(standpunten),
			database.storeDossiers(dossiers),
			database.storeCommittees(committees),
			database.storeEvents(events),
			database.storeDownloads(downloads),
			database.storeAboutInfo(aboutInfo),
			database.storePressArticles(pressArticles)
		]);

		const totalItems = 
			dutchNews.length + frenchNews.length +
			standpunten.length +
			dossiers.length +
			committees.length +
			events.length +
			downloads.length +
			aboutInfo.length +
			pressArticles.length;

		console.log(`Successfully scraped ${totalItems} total items:
			- News: ${dutchNews.length + frenchNews.length}
			- Standpunten: ${standpunten.length}
			- Dossiers: ${dossiers.length}
			- Committees: ${committees.length}
			- Events: ${events.length}
			- Downloads: ${downloads.length}
			- About Info: ${aboutInfo.length}
			- Press Articles: ${pressArticles.length}`
		);
	} catch (error) {
		console.error("Error scraping comprehensive denuo.be content:", error);
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

		if (url.pathname === "/scrape" && request.method === "POST") {
			if (!env.DENUO_DB) {
				return new Response("Database not available", { status: 500 });
			}
			
			console.log("Manual scraping triggered");
			ctx.waitUntil(scrapeDenuoContent(env.DENUO_DB));
			return new Response("Scraping started", { status: 200 });
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
