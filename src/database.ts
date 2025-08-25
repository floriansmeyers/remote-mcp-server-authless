// Database operations for denuo.be content
import type { ScrapedArticle, ScrapedEvent, ScrapedPartner } from "./scraper";

export class DenuoDatabase {
	constructor(private db: D1Database) {}

	async storeArticles(articles: ScrapedArticle[]): Promise<void> {
		if (articles.length === 0) return;

		const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO articles 
            (title, content, summary, url, published_date, category, language, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

		const batch = articles.map((article) =>
			stmt.bind(
				article.title,
				article.content,
				article.summary || null,
				article.url,
				article.publishedDate || null,
				article.category || null,
				article.language,
			),
		);

		await this.db.batch(batch);
		await this.updateScrapeMetadata(
			`articles_${articles[0].language}`,
			"success",
		);
	}

	async storeEvents(events: ScrapedEvent[]): Promise<void> {
		if (events.length === 0) return;

		const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO events 
            (title, description, event_date, location, url, language, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

		const batch = events.map((event) =>
			stmt.bind(
				event.title,
				event.description || null,
				event.eventDate || null,
				event.location || null,
				event.url || null,
				event.language,
			),
		);

		await this.db.batch(batch);
		await this.updateScrapeMetadata("events", "success");
	}

	async storePartners(partners: ScrapedPartner[]): Promise<void> {
		if (partners.length === 0) return;

		const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO partners 
            (name, description, website, logo_url, category, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

		const batch = partners.map((partner) =>
			stmt.bind(
				partner.name,
				partner.description || null,
				partner.website || null,
				partner.logoUrl || null,
				partner.category || null,
			),
		);

		await this.db.batch(batch);
		await this.updateScrapeMetadata("partners", "success");
	}

	async searchArticles(
		query: string,
		language?: "nl" | "fr",
		category?: string,
		limit: number = 10,
	): Promise<any[]> {
		let sql = `
            SELECT id, title, summary, url, published_date, category, language, scraped_at
            FROM articles
            WHERE (title LIKE ?1 OR content LIKE ?1)
        `;

		const params: any[] = [`%${query}%`];
		let paramIndex = 2;

		if (language) {
			sql += ` AND language = ?${paramIndex}`;
			params.push(language);
			paramIndex++;
		}

		if (category) {
			sql += ` AND category = ?${paramIndex}`;
			params.push(category);
			paramIndex++;
		}

		sql += ` ORDER BY published_date DESC LIMIT ?${paramIndex}`;
		params.push(limit);

		const result = await this.db
			.prepare(sql)
			.bind(...params)
			.all();
		return result.results || [];
	}

	async getRecentArticles(
		language?: "nl" | "fr",
		limit: number = 10,
	): Promise<any[]> {
		let sql = `
            SELECT id, title, summary, url, published_date, category, language, scraped_at
            FROM articles
        `;

		const params: any[] = [];

		if (language) {
			sql += ` WHERE language = ?1`;
			params.push(language);
		}

		sql += ` ORDER BY published_date DESC LIMIT ?${params.length + 1}`;
		params.push(limit);

		const result = await this.db
			.prepare(sql)
			.bind(...params)
			.all();
		return result.results || [];
	}

	async getUpcomingEvents(limit: number = 5): Promise<any[]> {
		const result = await this.db
			.prepare(`
            SELECT id, title, description, event_date, location, url, language, scraped_at
            FROM events
            WHERE event_date >= date('now')
            ORDER BY event_date ASC
            LIMIT ?1
        `)
			.bind(limit)
			.all();

		return result.results || [];
	}

	async getAllEvents(limit: number = 10): Promise<any[]> {
		const result = await this.db
			.prepare(`
            SELECT id, title, description, event_date, location, url, language, scraped_at
            FROM events
            ORDER BY event_date DESC
            LIMIT ?1
        `)
			.bind(limit)
			.all();

		return result.results || [];
	}

	async getPartners(limit: number = 20): Promise<any[]> {
		const result = await this.db
			.prepare(`
            SELECT id, name, description, website, logo_url, category, scraped_at
            FROM partners
            ORDER BY name ASC
            LIMIT ?1
        `)
			.bind(limit)
			.all();

		return result.results || [];
	}

	async getArticleById(id: number): Promise<any | null> {
		const result = await this.db
			.prepare(`
            SELECT id, title, content, summary, url, published_date, category, language, scraped_at
            FROM articles
            WHERE id = ?1
        `)
			.bind(id)
			.first();

		return result || null;
	}

	private async updateScrapeMetadata(
		section: string,
		status: "success" | "failed",
		errorMessage?: string,
	): Promise<void> {
		await this.db
			.prepare(`
            INSERT OR REPLACE INTO scrape_metadata (section, last_scraped, status, error_message)
            VALUES (?1, CURRENT_TIMESTAMP, ?2, ?3)
        `)
			.bind(section, status, errorMessage || null)
			.run();
	}

	async getScrapeMetadata(): Promise<any[]> {
		const result = await this.db
			.prepare(`
            SELECT section, last_scraped, status, error_message
            FROM scrape_metadata
            ORDER BY last_scraped DESC
        `)
			.all();

		return result.results || [];
	}
}
