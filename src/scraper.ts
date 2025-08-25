// Comprehensive scraper for all denuo.be content types
export interface ScrapedNews {
    title: string;
    summary?: string;
    content?: string;
    url: string;
    category?: string;
    publicationDate?: string;
    language: 'nl' | 'fr';
}

export interface ScrapedStandpunt {
    title: string;
    description?: string;
    content?: string;
    url: string;
    publicationYear?: string;
    documentType?: string;
    language: 'nl' | 'fr' | 'en';
}

export interface ScrapedDossier {
    title: string;
    description?: string;
    content?: string;
    url: string;
    categories: string[];
    language: 'nl' | 'fr';
}

export interface ScrapedCommittee {
    pscNumber: string;
    title: string;
    description?: string;
    content?: string;
    url: string;
    sector?: string;
}

export interface ScrapedEvent {
    title: string;
    description?: string;
    eventType?: string;
    eventDate?: string;
    eventTime?: string;
    locationName?: string;
    locationAddress?: string;
    url?: string;
    language: 'nl' | 'fr';
}

export interface ScrapedDownload {
    title: string;
    description?: string;
    fileType?: string;
    downloadUrl: string;
    pageUrl?: string;
    categories: string[];
    languagesAvailable?: string[];
    url: string; // For deduplication - same as downloadUrl
}

export interface ScrapedAboutInfo {
    sectionTitle: string;
    content: string;
    sectionType: string;
    url?: string;
}

export interface ScrapedPressArticle {
    title: string;
    summary?: string;
    content?: string;
    url: string;
    categories: string[];
    publicationDate?: string;
    source?: string;
    language: 'nl' | 'fr';
}

export class ComprehensiveDenuoScraper {
    private baseUrl = 'https://denuo.be';

    // News articles from denuo-nieuws
    async scrapeNews(language: 'nl' | 'fr' = 'nl'): Promise<ScrapedNews[]> {
        const url = language === 'nl' 
            ? `${this.baseUrl}/nl/denuo-nieuws`
            : `${this.baseUrl}/fr/actualites-denuo`;
        
        try {
            console.log(`Fetching news from: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.status}`);
            }

            const html = await response.text();
            console.log(`Fetched ${html.length} characters for news`);
            
            const news = this.parseNewsArticles(html, language, url);
            console.log(`Parsed ${news.length} news articles`);
            return news;
        } catch (error) {
            console.error(`Error scraping news for ${language}:`, error);
            return [];
        }
    }

    // Standpunten (position papers)
    async scrapeStandpunten(): Promise<ScrapedStandpunt[]> {
        const url = `${this.baseUrl}/nl/standpunten`;
        
        try {
            console.log(`Fetching standpunten from: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.status}`);
            }

            const html = await response.text();
            console.log(`Fetched ${html.length} characters for standpunten`);
            
            const standpunten = this.parseStandpunten(html, url);
            console.log(`Parsed ${standpunten.length} standpunten`);
            return standpunten;
        } catch (error) {
            console.error('Error scraping standpunten:', error);
            return [];
        }
    }

    // Dossiers
    async scrapeDossiers(): Promise<ScrapedDossier[]> {
        const url = `${this.baseUrl}/nl/dossiers`;
        
        try {
            console.log(`Fetching dossiers from: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.status}`);
            }

            const html = await response.text();
            console.log(`Fetched ${html.length} characters for dossiers`);
            
            const dossiers = this.parseDossiers(html, url);
            console.log(`Parsed ${dossiers.length} dossiers`);
            return dossiers;
        } catch (error) {
            console.error('Error scraping dossiers:', error);
            return [];
        }
    }

    // Paritaire Comités
    async scrapeCommittees(): Promise<ScrapedCommittee[]> {
        const url = `${this.baseUrl}/nl/paritaire-comites`;
        
        try {
            console.log(`Fetching committees from: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.status}`);
            }

            const html = await response.text();
            console.log(`Fetched ${html.length} characters for committees`);
            
            const committees = this.parseCommittees(html, url);
            console.log(`Parsed ${committees.length} committees`);
            return committees;
        } catch (error) {
            console.error('Error scraping committees:', error);
            return [];
        }
    }

    // Events/Agenda
    async scrapeEvents(): Promise<ScrapedEvent[]> {
        const url = `${this.baseUrl}/nl/agenda`;
        
        try {
            console.log(`Fetching events from: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.status}`);
            }

            const html = await response.text();
            console.log(`Fetched ${html.length} characters for events`);
            
            const events = this.parseEvents(html, url);
            console.log(`Parsed ${events.length} events`);
            return events;
        } catch (error) {
            console.error('Error scraping events:', error);
            return [];
        }
    }

    // Downloads
    async scrapeDownloads(): Promise<ScrapedDownload[]> {
        const url = `${this.baseUrl}/nl/downloads`;
        
        try {
            console.log(`Fetching downloads from: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.status}`);
            }

            const html = await response.text();
            console.log(`Fetched ${html.length} characters for downloads`);
            
            const downloads = this.parseDownloads(html, url);
            console.log(`Parsed ${downloads.length} downloads`);
            return downloads;
        } catch (error) {
            console.error('Error scraping downloads:', error);
            return [];
        }
    }

    // About Denuo information
    async scrapeAboutInfo(): Promise<ScrapedAboutInfo[]> {
        const url = `${this.baseUrl}/nl/over-denuo`;
        
        try {
            console.log(`Fetching about info from: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.status}`);
            }

            const html = await response.text();
            console.log(`Fetched ${html.length} characters for about info`);
            
            const aboutInfo = this.parseAboutInfo(html, url);
            console.log(`Parsed ${aboutInfo.length} about sections`);
            return aboutInfo;
        } catch (error) {
            console.error('Error scraping about info:', error);
            return [];
        }
    }

    // Press articles
    async scrapePressArticles(): Promise<ScrapedPressArticle[]> {
        const url = `${this.baseUrl}/nl/denuo-de-pers-0`;
        
        try {
            console.log(`Fetching press articles from: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.status}`);
            }

            const html = await response.text();
            console.log(`Fetched ${html.length} characters for press articles`);
            
            const pressArticles = this.parsePressArticles(html, url);
            console.log(`Parsed ${pressArticles.length} press articles`);
            return pressArticles;
        } catch (error) {
            console.error('Error scraping press articles:', error);
            return [];
        }
    }

    // Parse news articles using proper Drupal structure
    private parseNewsArticles(html: string, language: 'nl' | 'fr', baseUrl: string): ScrapedNews[] {
        const news: ScrapedNews[] = [];
        
        // Look for article elements
        const articleMatches = Array.from(html.matchAll(/<article[^>]*about="([^"]*)"[^>]*>[\s\S]*?<\/article>/gi));
        
        for (const match of articleMatches) {
            const articleHtml = match[0];
            const href = match[1];
            
            // Skip invalid links
            if (!href || href.length < 5) continue;
            
            // Extract title from the structured field
            const titleMatch = articleHtml.match(/<span[^>]*class="[^"]*field--name-title[^"]*"[^>]*>([^<]+)<\/span>/);
            const title = titleMatch ? this.cleanText(titleMatch[1]) : '';
            
            // Extract category from field-article-type
            const categoryMatch = articleHtml.match(/<div[^>]*class="[^"]*field--name-field-article-type[^"]*"[\s\S]*?<div[^>]*class="field__item">([^<]+)<\/div>/);
            const category = categoryMatch ? this.cleanText(categoryMatch[1]) : undefined;
            
            // Extract theme from field-theme
            const themeMatch = articleHtml.match(/<div[^>]*class="[^"]*field--name-field-theme[^"]*"[\s\S]*?<div[^>]*class="field__item">([^<]+)<\/div>/);
            const theme = themeMatch ? this.cleanText(themeMatch[1]) : undefined;
            
            // Check if article is restricted (has lock icon)
            const isRestricted = articleHtml.includes('is-restricted') || articleHtml.includes('image-lock');
            
            if (title && title.length > 10 && !this.isNavigationLink(title)) {
                news.push({
                    title,
                    url: this.resolveUrl(href),
                    category: category || theme,
                    language,
                    summary: isRestricted ? 'Restricted content - Login required' : undefined,
                });
            }
        }

        return this.deduplicateByUrl(news);
    }

    private parseStandpunten(html: string, baseUrl: string): ScrapedStandpunt[] {
        const standpunten: ScrapedStandpunt[] = [];
        
        // Look for links to PDFs that contain article structures
        const linkMatches = Array.from(html.matchAll(/<a[^>]+href="([^"]*\.pdf)"[^>]*>([\s\S]*?)<\/a>/gi));
        
        for (const match of linkMatches) {
            const href = match[1];
            const linkContent = match[2];
            
            // Skip invalid links
            if (!href || href.includes('javascript:')) continue;
            
            // Extract title from the field-title structure
            const titleMatch = linkContent.match(/<div[^>]*class="[^"]*field--name-field-title[^"]*"[^>]*>([^<]+)<\/div>/);
            if (!titleMatch) continue;
            
            const fullTitle = this.cleanText(titleMatch[1]);
            
            // Extract year from title (YYYY)
            const yearMatch = fullTitle.match(/\((\d{4})\)/);
            const publicationYear = yearMatch ? yearMatch[1] : undefined;
            
            // Clean title by removing year
            const title = fullTitle.replace(/\s*\(\d{4}\)\s*/, '').trim();
            
            // Determine document type based on title
            let documentType: string | undefined = undefined;
            if (title.toLowerCase().includes('standpuntnota')) {
                documentType = 'Standpuntnota';
            } else if (title.toLowerCase().includes('memorandum')) {
                documentType = 'Memorandum';
            } else if (title.toLowerCase().includes('best practice')) {
                documentType = 'Best Practice Guide';
            } else if (title.toLowerCase().includes('voorstellen')) {
                documentType = 'Voorstellen';
            } else if (title.toLowerCase().includes('acties')) {
                documentType = 'Actieplan';
            } else {
                documentType = 'Document';
            }
            
            // Only include if we have meaningful content
            if (title && title.length > 5) {
                standpunten.push({
                    title,
                    url: this.resolveUrl(href),
                    publicationYear,
                    documentType,
                    language: 'nl',
                    description: `${documentType}${publicationYear ? ` uit ${publicationYear}` : ''}`,
                });
            }
        }
        
        return this.deduplicateByUrl(standpunten);
    }

    private parseDossiers(html: string, baseUrl: string): ScrapedDossier[] {
        const dossiers: ScrapedDossier[] = [];
        
        const linkMatches = Array.from(html.matchAll(/<a[^>]+href="([^"]*)"[^>]*>[\s\S]*?<\/a>/gi));
        
        for (const match of linkMatches) {
            const linkHtml = match[0];
            const href = match[1];
            
            if (!href || href.startsWith('mailto:') || href.includes('javascript:')) continue;
            
            const title = this.extractText(linkHtml, />([^<]+)</);
            const categories = this.extractCategories(linkHtml);
            
            if (title && title.length > 5 && !this.isNavigationLink(title)) {
                dossiers.push({
                    title: this.cleanText(title),
                    url: this.resolveUrl(href),
                    categories,
                    language: 'nl',
                });
            }
        }
        
        return this.deduplicateByUrl(dossiers);
    }

    private parseCommittees(html: string, baseUrl: string): ScrapedCommittee[] {
        const committees: ScrapedCommittee[] = [];
        
        // Look for PSC patterns
        const pscMatches = html.match(/PSC\s+\d+\.\d+[^<]*?<[\s\S]*?>/gi) || [];
        
        for (const pscHtml of pscMatches) {
            const pscNumber = pscHtml.match(/PSC\s+(\d+\.\d+)/)?.[1];
            const title = this.extractText(pscHtml, />([^<]+)</);
            const linkMatch = pscHtml.match(/href="([^"]*)"/);
            
            if (pscNumber && title) {
                committees.push({
                    pscNumber: `PSC ${pscNumber}`,
                    title: this.cleanText(title),
                    url: linkMatch ? this.resolveUrl(linkMatch[1]) : '',
                    sector: this.extractSector(title),
                });
            }
        }
        
        return committees;
    }

    private parseEvents(html: string, baseUrl: string): ScrapedEvent[] {
        const events: ScrapedEvent[] = [];
        
        // Look for event blocks with dates and descriptions
        const eventBlocks = html.match(/<div[^>]*>[\s\S]*?(?:Workshop|Netwerkevent|Training)[\s\S]*?<\/div>/gi) || [];
        
        for (const eventHtml of eventBlocks) {
            const title = this.extractEventTitle(eventHtml);
            const eventType = this.extractEventType(eventHtml);
            const eventDate = this.extractEventDate(eventHtml);
            const eventTime = this.extractEventTime(eventHtml);
            const location = this.extractLocation(eventHtml);
            
            if (title && title.length > 5) {
                events.push({
                    title: this.cleanText(title),
                    eventType,
                    eventDate,
                    eventTime,
                    locationName: location?.name,
                    locationAddress: location?.address,
                    language: 'nl',
                    description: this.extractEventDescription(eventHtml),
                });
            }
        }
        
        return events;
    }

    private parseDownloads(html: string, baseUrl: string): ScrapedDownload[] {
        const downloads: ScrapedDownload[] = [];
        
        const linkMatches = Array.from(html.matchAll(/<a[^>]+href="([^"]*)"[^>]*>[\s\S]*?<\/a>/gi));
        
        for (const match of linkMatches) {
            const linkHtml = match[0];
            const href = match[1];
            
            if (!href || href.startsWith('mailto:') || href.includes('javascript:')) continue;
            
            const title = this.extractText(linkHtml, />([^<]+)</);
            
            if (title && title.length > 5 && !this.isNavigationLink(title)) {
                downloads.push({
                    title: this.cleanText(title),
                    downloadUrl: this.resolveUrl(href),
                    url: this.resolveUrl(href),
                    pageUrl: baseUrl,
                    categories: this.extractCategories(linkHtml),
                    fileType: this.detectFileType(href),
                });
            }
        }
        
        return this.deduplicateByUrl(downloads);
    }

    private parseAboutInfo(html: string, baseUrl: string): ScrapedAboutInfo[] {
        const aboutInfo: ScrapedAboutInfo[] = [];
        
        // Extract main content sections
        const mainContent = this.extractText(html, /<main[^>]*>([\s\S]*)<\/main>/);
        const sections = mainContent.split(/(?=<h[1-6])/);
        
        for (const section of sections) {
            const title = this.extractText(section, /<h[1-6][^>]*>([^<]+)</);
            const content = this.cleanText(this.extractText(section, />([^<]+)</gi));
            
            if (title && content && content.length > 20) {
                aboutInfo.push({
                    sectionTitle: this.cleanText(title),
                    content,
                    sectionType: this.categorizeAboutSection(title),
                    url: baseUrl,
                });
            }
        }
        
        return aboutInfo;
    }

    private parsePressArticles(html: string, baseUrl: string): ScrapedPressArticle[] {
        const pressArticles: ScrapedPressArticle[] = [];
        
        const linkMatches = Array.from(html.matchAll(/<a[^>]+href="([^"]*)"[^>]*>[\s\S]*?<\/a>/gi));
        
        for (const match of linkMatches) {
            const linkHtml = match[0];
            const href = match[1];
            
            if (!href || href.startsWith('mailto:') || href.includes('javascript:')) continue;
            
            const title = this.extractText(linkHtml, />([^<]+)</);
            const categories = this.extractCategories(linkHtml);
            const source = this.extractPressSource(title);
            
            if (title && title.length > 10 && !this.isNavigationLink(title)) {
                pressArticles.push({
                    title: this.cleanText(title),
                    url: this.resolveUrl(href),
                    categories,
                    source,
                    language: 'nl',
                });
            }
        }
        
        return this.deduplicateByUrl(pressArticles);
    }

    // Helper methods
    private extractNewsTitle(html: string): string {
        return this.extractText(html, />([^<]+)</) || this.extractText(html, /alt="([^"]*)"/) || '';
    }

    private extractCategory(html: string): string | undefined {
        const categoryMatch = html.match(/\[([^\]]+)\]/) || html.match(/class="[^"]*category[^"]*"[^>]*>([^<]+)</i);
        return categoryMatch ? this.cleanText(categoryMatch[1]) : undefined;
    }

    private extractCategories(html: string): string[] {
        const categories: string[] = [];
        const matches = html.match(/\[([^\]]+)\]/g) || [];
        for (const match of matches) {
            const category = match.replace(/[\[\]]/g, '').trim();
            if (category) categories.push(category);
        }
        return categories;
    }

    private extractSummary(html: string): string | undefined {
        const summary = this.extractText(html, /<p[^>]*>([^<]+)</);
        return summary && summary.length > 10 ? this.cleanText(summary) : undefined;
    }

    private extractEventTitle(html: string): string {
        return this.extractText(html, /<h[1-6][^>]*>([^<]+)</) || this.extractText(html, />([^<]+)</);
    }

    private extractEventType(html: string): string | undefined {
        const types = ['Workshop', 'Netwerkevent', 'Training', 'Vergadering'];
        for (const type of types) {
            if (html.toLowerCase().includes(type.toLowerCase())) {
                return type;
            }
        }
        return undefined;
    }

    private extractEventDate(html: string): string | undefined {
        const dateMatch = html.match(/\b\d{1,2}\s+\w+\s+\d{4}\b/) || html.match(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/);
        return dateMatch ? dateMatch[0] : undefined;
    }

    private extractEventTime(html: string): string | undefined {
        const timeMatch = html.match(/\b\d{1,2}[\.:]\d{2}\s*-\s*\d{1,2}[\.:]\d{2}\b/);
        return timeMatch ? timeMatch[0] : undefined;
    }

    private extractLocation(html: string): { name?: string; address?: string } | undefined {
        const locationText = this.extractText(html, /(?:locatie|venue|plaats)[^:]*:([^<]+)/i);
        if (locationText) {
            const parts = locationText.split(',');
            return {
                name: parts[0]?.trim(),
                address: parts.slice(1).join(',').trim() || undefined,
            };
        }
        return undefined;
    }

    private extractEventDescription(html: string): string | undefined {
        const desc = this.extractText(html, /<p[^>]*>([^<]+)</);
        return desc && desc.length > 20 ? this.cleanText(desc) : undefined;
    }

    private extractPressSource(title: string): string | undefined {
        const sources = ['De Morgen', 'Het Nieuwsblad', 'De Standaard', 'VRT', 'RTBF'];
        for (const source of sources) {
            if (title.includes(source)) {
                return source;
            }
        }
        return undefined;
    }

    private detectDocumentType(title: string): string | undefined {
        const types = {
            'best practices': 'guide',
            'gids': 'guide',
            'standpunt': 'position',
            'position': 'position',
            'studie': 'study',
            'rapport': 'report',
            'memo': 'memorandum'
        };
        
        for (const [key, type] of Object.entries(types)) {
            if (title.toLowerCase().includes(key)) {
                return type;
            }
        }
        return undefined;
    }

    private detectFileType(url: string): string | undefined {
        const ext = url.split('.').pop()?.toLowerCase();
        const typeMap: { [key: string]: string } = {
            'pdf': 'PDF',
            'doc': 'Word',
            'docx': 'Word',
            'xls': 'Excel',
            'xlsx': 'Excel',
            'ppt': 'PowerPoint',
            'pptx': 'PowerPoint',
        };
        return typeMap[ext || ''] || undefined;
    }

    private extractSector(title: string): string | undefined {
        const sectors = ['metalen', 'lompen', 'papier', 'textiel'];
        for (const sector of sectors) {
            if (title.toLowerCase().includes(sector)) {
                return sector;
            }
        }
        return undefined;
    }

    private categorizeAboutSection(title: string): string {
        const categories: { [key: string]: string } = {
            'mission': 'mission',
            'visie': 'mission',
            'team': 'team',
            'medewerkers': 'team',
            'contact': 'contact',
            'adres': 'contact',
            'governance': 'governance',
            'bestuur': 'governance',
        };
        
        for (const [keyword, category] of Object.entries(categories)) {
            if (title.toLowerCase().includes(keyword)) {
                return category;
            }
        }
        return 'general';
    }

    private isNavigationLink(text: string): boolean {
        const navWords = ['home', 'contact', 'over ons', 'menu', 'search', 'zoeken', 'next', 'previous', 'volgende', 'vorige'];
        return navWords.some(word => text.toLowerCase().includes(word)) || text.length < 3;
    }

    private extractText(html: string, regex: RegExp): string {
        const matches = html.match(regex);
        if (!matches) return '';
        
        if (regex.global) {
            return matches.map(match => {
                const textMatch = match.match(/>([^<]+)</);
                return textMatch?.[1] || '';
            }).join(' ');
        }
        
        return matches[1] || '';
    }

    private cleanText(text: string): string {
        return text
            .replace(/<[^>]*>/g, '')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    private resolveUrl(url: string): string {
        if (url.startsWith('http')) return url;
        if (url.startsWith('/')) return this.baseUrl + url;
        return this.baseUrl + '/' + url;
    }

    private deduplicateByUrl<T extends { url: string }>(items: T[]): T[] {
        const seen = new Set<string>();
        return items.filter(item => {
            if (seen.has(item.url)) return false;
            seen.add(item.url);
            return true;
        });
    }
}