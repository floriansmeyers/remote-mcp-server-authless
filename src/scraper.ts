// Scraping utilities for denuo.be content
export interface ScrapedArticle {
	title: string;
	content: string;
	summary?: string;
	url: string;
	publishedDate?: string;
	category?: string;
	language: "nl" | "fr";
}

export interface ScrapedEvent {
	title: string;
	description?: string;
	eventDate?: string;
	location?: string;
	url?: string;
	language: "nl" | "fr";
}

export interface ScrapedPartner {
	name: string;
	description?: string;
	website?: string;
	logoUrl?: string;
	category?: string;
}

export class DenuoScraper {
	private baseUrl = "https://denuo.be";

	async scrapeArticles(language: "nl" | "fr"): Promise<ScrapedArticle[]> {
		const url =
			language === "nl"
				? `${this.baseUrl}/nl/denuo-nieuws`
				: `${this.baseUrl}/fr/actualites-denuo`;

		try {
			console.log(`Fetching articles from: ${url}`);
			const response = await fetch(url);
			if (!response.ok) {
				console.error(`HTTP error ${response.status} for ${url}`);
				throw new Error(`Failed to fetch ${url}: ${response.status}`);
			}

			const html = await response.text();
			console.log(`Fetched ${html.length} characters of HTML for ${language} articles`);
			const articles = this.parseArticles(html, language, url);
			console.log(`Parsed ${articles.length} articles for ${language}`);
			return articles;
		} catch (error) {
			console.error(`Error scraping articles for ${language}:`, error);
			return [];
		}
	}

	async scrapeEvents(): Promise<ScrapedEvent[]> {
		const url = `${this.baseUrl}/nl/agenda`;

		try {
			console.log(`Fetching events from: ${url}`);
			const response = await fetch(url);
			if (!response.ok) {
				console.error(`HTTP error ${response.status} for ${url}`);
				throw new Error(`Failed to fetch ${url}: ${response.status}`);
			}

			const html = await response.text();
			console.log(`Fetched ${html.length} characters of HTML for events`);
			const events = this.parseEvents(html);
			console.log(`Parsed ${events.length} events`);
			return events;
		} catch (error) {
			console.error("Error scraping events:", error);
			return [];
		}
	}

	async scrapePartners(): Promise<ScrapedPartner[]> {
		const url = `${this.baseUrl}/nl/partners`;

		try {
			console.log(`Fetching partners from: ${url}`);
			const response = await fetch(url);
			if (!response.ok) {
				console.error(`HTTP error ${response.status} for ${url}`);
				throw new Error(`Failed to fetch ${url}: ${response.status}`);
			}

			const html = await response.text();
			console.log(`Fetched ${html.length} characters of HTML for partners`);
			const partners = this.parsePartners(html);
			console.log(`Parsed ${partners.length} partners`);
			return partners;
		} catch (error) {
			console.error("Error scraping partners:", error);
			return [];
		}
	}

	private parseArticles(
		html: string,
		language: "nl" | "fr",
		baseUrl: string,
	): ScrapedArticle[] {
		const articles: ScrapedArticle[] = [];

		// Try multiple patterns to find articles/news items
		const patterns = [
			/<article[^>]*>[\s\S]*?<\/article>/gi,
			/<div[^>]*class="[^"]*news[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
			/<div[^>]*class="[^"]*item[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
			/<div[^>]*class="[^"]*post[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
		];

		for (const pattern of patterns) {
			const matches = html.match(pattern) || [];
			
			for (const matchHtml of matches) {
				const title = this.extractText(matchHtml, /<h[1-6][^>]*>(.*?)<\/h[1-6]>/i) ||
							  this.extractText(matchHtml, /<a[^>]*>(.*?)<\/a>/i);
				
				const content = this.extractText(matchHtml, /<p[^>]*>(.*?)<\/p>/gi) ||
							   this.extractText(matchHtml, /<div[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/i);
				
				const urlMatch = matchHtml.match(/href="([^"]*)"/) || [];
				const url = urlMatch[1] ? this.resolveUrl(urlMatch[1]) : baseUrl;

				if (title && title.length > 3) { // Basic validation
					articles.push({
						title: this.cleanText(title),
						content: content ? this.cleanText(content) : this.cleanText(title),
						summary: content ? this.generateSummary(content) : this.generateSummary(title),
						url,
						language,
						category: this.extractCategory(matchHtml),
					});
				}
			}

			// If we found articles with this pattern, use them
			if (articles.length > 0) break;
		}

		return articles;
	}

	private parseEvents(html: string): ScrapedEvent[] {
		const events: ScrapedEvent[] = [];

		// Try multiple patterns to find events
		const patterns = [
			/<div[^>]*class="[^"]*event[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
			/<div[^>]*class="[^"]*agenda[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
			/<article[^>]*>[\s\S]*?<\/article>/gi,
			/<li[^>]*>[\s\S]*?<\/li>/gi,
		];

		for (const pattern of patterns) {
			const matches = html.match(pattern) || [];
			
			for (const matchHtml of matches) {
				const title = this.extractText(matchHtml, /<h[1-6][^>]*>(.*?)<\/h[1-6]>/i) ||
							  this.extractText(matchHtml, /<a[^>]*>(.*?)<\/a>/i);
				
				const description = this.extractText(matchHtml, /<p[^>]*>(.*?)<\/p>/i);
				const dateMatch = matchHtml.match(/\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/);

				if (title && title.length > 3) {
					events.push({
						title: this.cleanText(title),
						description: description ? this.cleanText(description) : undefined,
						eventDate: dateMatch ? dateMatch[0] : undefined,
						language: "nl",
					});
				}
			}

			if (events.length > 0) break;
		}

		return events;
	}

	private parsePartners(html: string): ScrapedPartner[] {
		const partners: ScrapedPartner[] = [];

		// Try multiple patterns to find partners/members
		const patterns = [
			/<div[^>]*class="[^"]*partner[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
			/<div[^>]*class="[^"]*member[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
			/<li[^>]*>[\s\S]*?<\/li>/gi,
			/<img[^>]*alt="[^"]*"[^>]*>/gi, // Partner logos
		];

		for (const pattern of patterns) {
			const matches = html.match(pattern) || [];
			
			for (const matchHtml of matches) {
				// Try to get name from various sources
				const name = this.extractText(matchHtml, /<h[1-6][^>]*>(.*?)<\/h[1-6]>/i) ||
							 this.extractText(matchHtml, /alt="([^"]+)"/i) ||
							 this.extractText(matchHtml, /<a[^>]*title="([^"]+)"[^>]*>/i);
				
				const logoMatch = matchHtml.match(/<img[^>]*src="([^"]*)"[^>]*>/i);
				const websiteMatch = matchHtml.match(/<a[^>]*href="([^"]*)"[^>]*>/i);

				if (name && name.length > 1 && !name.toLowerCase().includes('logo')) {
					partners.push({
						name: this.cleanText(name),
						logoUrl: logoMatch?.[1] ? this.resolveUrl(logoMatch[1]) : undefined,
						website: websiteMatch?.[1] ? this.resolveUrl(websiteMatch[1]) : undefined,
					});
				}
			}

			if (partners.length > 0) break;
		}

		return partners;
	}

	private extractText(html: string, regex: RegExp): string {
		const matches = html.match(regex);
		if (!matches) return "";

		if (regex.global) {
			return matches
				.map((match) => {
					const textMatch = match.match(/>([^<]+)</);
					return textMatch?.[1] || "";
				})
				.join(" ");
		}

		return matches[1] || "";
	}

	private cleanText(text: string): string {
		return text
			.replace(/<[^>]*>/g, "") // Remove HTML tags
			.replace(/&amp;/g, "&")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&quot;/g, '"')
			.replace(/&#039;/g, "'")
			.replace(/\s+/g, " ")
			.trim();
	}

	private generateSummary(content: string, maxLength: number = 200): string {
		const cleaned = this.cleanText(content);
		if (cleaned.length <= maxLength) return cleaned;

		const truncated = cleaned.substring(0, maxLength);
		const lastSpace = truncated.lastIndexOf(" ");
		return lastSpace > 0
			? truncated.substring(0, lastSpace) + "..."
			: truncated + "...";
	}

	private extractCategory(html: string): string | undefined {
		// Simple category extraction - would need to be refined based on actual HTML structure
		const categoryMatch = html.match(
			/class="[^"]*category[^"]*"[^>]*>([^<]+)</i,
		);
		return categoryMatch?.[1] ? this.cleanText(categoryMatch[1]) : undefined;
	}

	private resolveUrl(url: string): string {
		if (url.startsWith("http")) return url;
		if (url.startsWith("/")) return this.baseUrl + url;
		return this.baseUrl + "/" + url;
	}
}
