// Enhanced database operations for comprehensive denuo.be content
import type {
    ScrapedNews,
    ScrapedStandpunt,
    ScrapedDossier,
    ScrapedCommittee,
    ScrapedEvent,
    ScrapedDownload,
    ScrapedAboutInfo,
    ScrapedPressArticle,
} from './scraper';

export class ComprehensiveDenuoDatabase {
    constructor(private db: D1Database) {}

    // News operations
    async storeNews(news: ScrapedNews[]): Promise<void> {
        if (news.length === 0) return;

        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO news 
            (title, summary, content, url, category, publication_date, language, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

        const batch = news.map((item) =>
            stmt.bind(
                item.title,
                item.summary || null,
                item.content || null,
                item.url,
                item.category || null,
                item.publicationDate || null,
                item.language,
            ),
        );

        await this.db.batch(batch);
        await this.updateScrapeMetadata('news', 'success', news.length);
    }

    async searchNews(query: string, language?: 'nl' | 'fr', category?: string, limit: number = 10): Promise<any[]> {
        let sql = `
            SELECT id, title, summary, url, category, publication_date, language, scraped_at
            FROM news
            WHERE (title LIKE ?1 OR content LIKE ?1 OR summary LIKE ?1)
        `;
        
        const params: any[] = [`%${query}%`];
        let paramIndex = 2;

        if (language) {
            sql += ` AND language = ?${paramIndex}`;
            params.push(language);
            paramIndex++;
        }

        if (category) {
            sql += ` AND category LIKE ?${paramIndex}`;
            params.push(`%${category}%`);
            paramIndex++;
        }

        sql += ` ORDER BY publication_date DESC, scraped_at DESC LIMIT ?${paramIndex}`;
        params.push(limit);

        const result = await this.db.prepare(sql).bind(...params).all();
        return result.results || [];
    }

    async getRecentNews(language?: 'nl' | 'fr', limit: number = 10): Promise<any[]> {
        let sql = `
            SELECT id, title, summary, url, category, publication_date, language, scraped_at
            FROM news
        `;
        
        const params: any[] = [];
        
        if (language) {
            sql += ` WHERE language = ?1`;
            params.push(language);
        }

        sql += ` ORDER BY publication_date DESC, scraped_at DESC LIMIT ?${params.length + 1}`;
        params.push(limit);

        const result = await this.db.prepare(sql).bind(...params).all();
        return result.results || [];
    }

    async getNewsById(id: number): Promise<any | null> {
        const result = await this.db.prepare(`
            SELECT * FROM news WHERE id = ?1
        `).bind(id).first();
        
        return result || null;
    }

    // Legacy method for compatibility
    async getArticleById(id: number): Promise<any | null> {
        return this.getNewsById(id);
    }

    // Standpunten operations
    async storeStandpunten(standpunten: ScrapedStandpunt[]): Promise<void> {
        if (standpunten.length === 0) return;

        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO standpunten 
            (title, description, content, url, publication_year, document_type, language, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

        const batch = standpunten.map((item) =>
            stmt.bind(
                item.title,
                item.description || null,
                item.content || null,
                item.url,
                item.publicationYear || null,
                item.documentType || null,
                item.language,
            ),
        );

        await this.db.batch(batch);
        await this.updateScrapeMetadata('standpunten', 'success', standpunten.length);
    }

    async searchStandpunten(query: string, year?: string, limit: number = 10): Promise<any[]> {
        let sql = `
            SELECT id, title, description, url, publication_year, document_type, language, scraped_at
            FROM standpunten
            WHERE (title LIKE ?1 OR description LIKE ?1)
        `;
        
        const params: any[] = [`%${query}%`];
        let paramIndex = 2;

        if (year) {
            sql += ` AND publication_year = ?${paramIndex}`;
            params.push(year);
            paramIndex++;
        }

        sql += ` ORDER BY publication_year DESC, scraped_at DESC LIMIT ?${paramIndex}`;
        params.push(limit);

        const result = await this.db.prepare(sql).bind(...params).all();
        return result.results || [];
    }

    async getAllStandpunten(limit: number = 20): Promise<any[]> {
        const result = await this.db.prepare(`
            SELECT id, title, description, url, publication_year, document_type, language, scraped_at
            FROM standpunten
            ORDER BY publication_year DESC, title ASC
            LIMIT ?1
        `).bind(limit).all();
        
        return result.results || [];
    }

    // Dossiers operations
    async storeDossiers(dossiers: ScrapedDossier[]): Promise<void> {
        if (dossiers.length === 0) return;

        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO dossiers 
            (title, description, content, url, categories, language, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

        const batch = dossiers.map((item) =>
            stmt.bind(
                item.title,
                item.description || null,
                item.content || null,
                item.url,
                JSON.stringify(item.categories) || null,
                item.language,
            ),
        );

        await this.db.batch(batch);
        await this.updateScrapeMetadata('dossiers', 'success', dossiers.length);
    }

    async searchDossiers(query: string, category?: string, limit: number = 10): Promise<any[]> {
        let sql = `
            SELECT id, title, description, url, categories, language, scraped_at
            FROM dossiers
            WHERE (title LIKE ?1 OR description LIKE ?1)
        `;
        
        const params: any[] = [`%${query}%`];
        let paramIndex = 2;

        if (category) {
            sql += ` AND categories LIKE ?${paramIndex}`;
            params.push(`%${category}%`);
            paramIndex++;
        }

        sql += ` ORDER BY scraped_at DESC LIMIT ?${paramIndex}`;
        params.push(limit);

        const result = await this.db.prepare(sql).bind(...params).all();
        return result.results || [];
    }

    async getAllDossiers(limit: number = 20): Promise<any[]> {
        const result = await this.db.prepare(`
            SELECT id, title, description, url, categories, language, scraped_at
            FROM dossiers
            ORDER BY scraped_at DESC
            LIMIT ?1
        `).bind(limit).all();
        
        return result.results || [];
    }

    // Committees operations
    async storeCommittees(committees: ScrapedCommittee[]): Promise<void> {
        if (committees.length === 0) return;

        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO committees 
            (psc_number, title, description, content, url, sector, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

        const batch = committees.map((item) =>
            stmt.bind(
                item.pscNumber,
                item.title,
                item.description || null,
                item.content || null,
                item.url,
                item.sector || null,
            ),
        );

        await this.db.batch(batch);
        await this.updateScrapeMetadata('committees', 'success', committees.length);
    }

    async getAllCommittees(): Promise<any[]> {
        const result = await this.db.prepare(`
            SELECT id, psc_number, title, description, url, sector, scraped_at
            FROM committees
            ORDER BY psc_number ASC
        `).all();
        
        return result.results || [];
    }

    // Events operations  
    async storeEvents(events: ScrapedEvent[]): Promise<void> {
        if (events.length === 0) return;

        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO events 
            (title, description, event_type, event_date, event_time, location_name, location_address, url, language, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

        const batch = events.map((event) =>
            stmt.bind(
                event.title,
                event.description || null,
                event.eventType || null,
                event.eventDate || null,
                event.eventTime || null,
                event.locationName || null,
                event.locationAddress || null,
                event.url || null,
                event.language,
            ),
        );

        await this.db.batch(batch);
        await this.updateScrapeMetadata('events', 'success', events.length);
    }

    async getUpcomingEvents(limit: number = 10): Promise<any[]> {
        const result = await this.db.prepare(`
            SELECT id, title, description, event_type, event_date, event_time, location_name, location_address, url, language
            FROM events
            WHERE event_date IS NULL OR event_date >= date('now')
            ORDER BY event_date ASC, scraped_at DESC
            LIMIT ?1
        `).bind(limit).all();
        
        return result.results || [];
    }

    async getAllEvents(limit: number = 20): Promise<any[]> {
        const result = await this.db.prepare(`
            SELECT id, title, description, event_type, event_date, event_time, location_name, location_address, url, language
            FROM events
            ORDER BY event_date DESC, scraped_at DESC
            LIMIT ?1
        `).bind(limit).all();
        
        return result.results || [];
    }

    // Downloads operations
    async storeDownloads(downloads: ScrapedDownload[]): Promise<void> {
        if (downloads.length === 0) return;

        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO downloads 
            (title, description, file_type, download_url, page_url, categories, languages_available, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

        const batch = downloads.map((item) =>
            stmt.bind(
                item.title,
                item.description || null,
                item.fileType || null,
                item.downloadUrl,
                item.pageUrl || null,
                JSON.stringify(item.categories) || null,
                item.languagesAvailable?.join(',') || null,
            ),
        );

        await this.db.batch(batch);
        await this.updateScrapeMetadata('downloads', 'success', downloads.length);
    }

    async searchDownloads(query: string, fileType?: string, limit: number = 10): Promise<any[]> {
        let sql = `
            SELECT id, title, description, file_type, download_url, categories, languages_available, scraped_at
            FROM downloads
            WHERE (title LIKE ?1 OR description LIKE ?1)
        `;
        
        const params: any[] = [`%${query}%`];
        let paramIndex = 2;

        if (fileType) {
            sql += ` AND file_type = ?${paramIndex}`;
            params.push(fileType);
            paramIndex++;
        }

        sql += ` ORDER BY scraped_at DESC LIMIT ?${paramIndex}`;
        params.push(limit);

        const result = await this.db.prepare(sql).bind(...params).all();
        return result.results || [];
    }

    async getAllDownloads(limit: number = 20): Promise<any[]> {
        const result = await this.db.prepare(`
            SELECT id, title, description, file_type, download_url, categories, languages_available, scraped_at
            FROM downloads
            ORDER BY scraped_at DESC
            LIMIT ?1
        `).bind(limit).all();
        
        return result.results || [];
    }

    // About info operations
    async storeAboutInfo(aboutInfo: ScrapedAboutInfo[]): Promise<void> {
        if (aboutInfo.length === 0) return;

        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO about_info 
            (section_title, content, section_type, url, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

        const batch = aboutInfo.map((item) =>
            stmt.bind(
                item.sectionTitle,
                item.content,
                item.sectionType,
                item.url || null,
            ),
        );

        await this.db.batch(batch);
        await this.updateScrapeMetadata('about_info', 'success', aboutInfo.length);
    }

    async getAboutInfo(sectionType?: string): Promise<any[]> {
        let sql = `SELECT id, section_title, content, section_type, url, scraped_at FROM about_info`;
        const params: any[] = [];

        if (sectionType) {
            sql += ` WHERE section_type = ?1`;
            params.push(sectionType);
        }

        sql += ` ORDER BY section_type ASC, section_title ASC`;

        const result = await this.db.prepare(sql).bind(...params).all();
        return result.results || [];
    }

    // Press articles operations
    async storePressArticles(pressArticles: ScrapedPressArticle[]): Promise<void> {
        if (pressArticles.length === 0) return;

        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO press_articles 
            (title, summary, content, url, categories, publication_date, source, language, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

        const batch = pressArticles.map((item) =>
            stmt.bind(
                item.title,
                item.summary || null,
                item.content || null,
                item.url,
                JSON.stringify(item.categories) || null,
                item.publicationDate || null,
                item.source || null,
                item.language,
            ),
        );

        await this.db.batch(batch);
        await this.updateScrapeMetadata('press_articles', 'success', pressArticles.length);
    }

    async searchPressArticles(query: string, source?: string, limit: number = 10): Promise<any[]> {
        let sql = `
            SELECT id, title, summary, url, categories, publication_date, source, language, scraped_at
            FROM press_articles
            WHERE (title LIKE ?1 OR summary LIKE ?1 OR content LIKE ?1)
        `;
        
        const params: any[] = [`%${query}%`];
        let paramIndex = 2;

        if (source) {
            sql += ` AND source LIKE ?${paramIndex}`;
            params.push(`%${source}%`);
            paramIndex++;
        }

        sql += ` ORDER BY publication_date DESC, scraped_at DESC LIMIT ?${paramIndex}`;
        params.push(limit);

        const result = await this.db.prepare(sql).bind(...params).all();
        return result.results || [];
    }

    async getRecentPressArticles(limit: number = 10): Promise<any[]> {
        const result = await this.db.prepare(`
            SELECT id, title, summary, url, categories, publication_date, source, language, scraped_at
            FROM press_articles
            ORDER BY publication_date DESC, scraped_at DESC
            LIMIT ?1
        `).bind(limit).all();
        
        return result.results || [];
    }

    // Metadata operations
    private async updateScrapeMetadata(section: string, status: 'success' | 'failed', itemsScraped: number = 0, errorMessage?: string): Promise<void> {
        await this.db.prepare(`
            INSERT OR REPLACE INTO scrape_metadata (section, last_scraped, status, items_scraped, error_message)
            VALUES (?1, CURRENT_TIMESTAMP, ?2, ?3, ?4)
        `).bind(section, status, itemsScraped, errorMessage || null).run();
    }

    async getScrapeMetadata(): Promise<any[]> {
        const result = await this.db.prepare(`
            SELECT section, last_scraped, status, items_scraped, error_message
            FROM scrape_metadata
            ORDER BY last_scraped DESC
        `).all();
        
        return result.results || [];
    }
}