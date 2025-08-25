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
				? `${this.baseUrl}/nl/nieuws`
				: `${this.baseUrl}/fr/actualites`;

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Failed to fetch ${url}: ${response.status}`);
			}

			const html = await response.text();
			return this.parseArticles(html, language, url);
		} catch (error) {
			console.error(`Error scraping articles for ${language}:`, error);
			return [];
		}
	}

	async scrapeEvents(): Promise<ScrapedEvent[]> {
		const url = `${this.baseUrl}/agenda`;

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Failed to fetch ${url}: ${response.status}`);
			}

			const html = await response.text();
			return this.parseEvents(html);
		} catch (error) {
			console.error("Error scraping events:", error);
			return [];
		}
	}

	async scrapePartners(): Promise<ScrapedPartner[]> {
		const url = `${this.baseUrl}/partners`;

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Failed to fetch ${url}: ${response.status}`);
			}

			const html = await response.text();
			return this.parsePartners(html);
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

		// Use HTMLRewriter-compatible parsing
		// This is a simplified approach - in production you'd use HTMLRewriter
		const articleMatches =
			html.match(/<article[^>]*>[\s\S]*?<\/article>/gi) || [];

		for (const articleHtml of articleMatches) {
			const title = this.extractText(
				articleHtml,
				/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i,
			);
			const content = this.extractText(articleHtml, /<p[^>]*>(.*?)<\/p>/gi);
			const urlMatch = articleHtml.match(/href="([^"]*)"/) || [];
			const url = urlMatch[1] ? this.resolveUrl(urlMatch[1]) : baseUrl;

			if (title && content) {
				articles.push({
					title: this.cleanText(title),
					content: this.cleanText(content),
					summary: this.generateSummary(content),
					url,
					language,
					category: this.extractCategory(articleHtml),
				});
			}
		}

		return articles;
	}

	private parseEvents(html: string): ScrapedEvent[] {
		const events: ScrapedEvent[] = [];

		// Event parsing logic - simplified
		const eventMatches =
			html.match(/<div[^>]*class="[^"]*event[^"]*"[^>]*>[\s\S]*?<\/div>/gi) ||
			[];

		for (const eventHtml of eventMatches) {
			const title = this.extractText(
				eventHtml,
				/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i,
			);
			const description = this.extractText(eventHtml, /<p[^>]*>(.*?)<\/p>/i);

			if (title) {
				events.push({
					title: this.cleanText(title),
					description: description ? this.cleanText(description) : undefined,
					language: "nl", // Default, would need more logic to detect
				});
			}
		}

		return events;
	}

	private parsePartners(html: string): ScrapedPartner[] {
		const partners: ScrapedPartner[] = [];

		// Partner parsing logic - simplified
		const partnerMatches =
			html.match(/<div[^>]*class="[^"]*partner[^"]*"[^>]*>[\s\S]*?<\/div>/gi) ||
			[];

		for (const partnerHtml of partnerMatches) {
			const name = this.extractText(
				partnerHtml,
				/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i,
			);
			const logoMatch = partnerHtml.match(/<img[^>]*src="([^"]*)"[^>]*>/i);
			const websiteMatch = partnerHtml.match(/<a[^>]*href="([^"]*)"[^>]*>/i);

			if (name) {
				partners.push({
					name: this.cleanText(name),
					logoUrl: logoMatch?.[1] ? this.resolveUrl(logoMatch[1]) : undefined,
					website: websiteMatch?.[1]
						? this.resolveUrl(websiteMatch[1])
						: undefined,
				});
			}
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
