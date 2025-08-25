-- Enhanced database schema for comprehensive denuo.be content
-- Run with: wrangler d1 execute denuo-content --file=./schema-v2.sql

-- Drop existing tables to recreate with new structure
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS events;  
DROP TABLE IF EXISTS partners;
DROP TABLE IF EXISTS scrape_metadata;

-- News articles (denuo-nieuws)
CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    url TEXT UNIQUE NOT NULL,
    category TEXT,
    publication_date TEXT,
    language TEXT CHECK (language IN ('nl', 'fr')) DEFAULT 'nl',
    scraped_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Standpunten (position papers)
CREATE TABLE IF NOT EXISTS standpunten (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    url TEXT UNIQUE NOT NULL,
    publication_year TEXT,
    document_type TEXT,
    language TEXT CHECK (language IN ('nl', 'fr', 'en')) DEFAULT 'nl',
    scraped_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Dossiers
CREATE TABLE IF NOT EXISTS dossiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    url TEXT UNIQUE NOT NULL,
    categories TEXT, -- JSON array of category tags
    language TEXT CHECK (language IN ('nl', 'fr')) DEFAULT 'nl',
    scraped_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Paritaire Comités
CREATE TABLE IF NOT EXISTS committees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    psc_number TEXT NOT NULL, -- e.g., "PSC 142.01"
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    url TEXT UNIQUE NOT NULL,
    sector TEXT, -- e.g., "Terugwinning metalen"
    scraped_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Events/Agenda
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT, -- e.g., "Workshop", "Netwerkevent"
    event_date TEXT,
    event_time TEXT,
    location_name TEXT,
    location_address TEXT,
    url TEXT,
    language TEXT CHECK (language IN ('nl', 'fr')) DEFAULT 'nl',
    scraped_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Downloads
CREATE TABLE IF NOT EXISTS downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    file_type TEXT,
    download_url TEXT NOT NULL,
    page_url TEXT,
    categories TEXT, -- JSON array
    languages_available TEXT, -- e.g., "nl,en,fr"
    scraped_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- About Denuo information
CREATE TABLE IF NOT EXISTS about_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_title TEXT NOT NULL,
    content TEXT NOT NULL,
    section_type TEXT, -- e.g., "mission", "contact", "team"
    url TEXT,
    scraped_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Press articles
CREATE TABLE IF NOT EXISTS press_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    url TEXT UNIQUE NOT NULL,
    categories TEXT, -- JSON array of category tags
    publication_date TEXT,
    source TEXT, -- e.g., "De Morgen"
    language TEXT CHECK (language IN ('nl', 'fr')) DEFAULT 'nl',
    scraped_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Scraping metadata to track last successful scrapes
CREATE TABLE IF NOT EXISTS scrape_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL UNIQUE, -- 'news', 'standpunten', 'dossiers', etc.
    last_scraped TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK (status IN ('success', 'failed')),
    items_scraped INTEGER DEFAULT 0,
    error_message TEXT
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_news_language ON news(language);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_date ON news(publication_date DESC);

CREATE INDEX IF NOT EXISTS idx_standpunten_year ON standpunten(publication_year DESC);
CREATE INDEX IF NOT EXISTS idx_standpunten_language ON standpunten(language);

CREATE INDEX IF NOT EXISTS idx_dossiers_language ON dossiers(language);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);

CREATE INDEX IF NOT EXISTS idx_press_date ON press_articles(publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_press_language ON press_articles(language);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_news_title_content ON news(title, content);
CREATE INDEX IF NOT EXISTS idx_standpunten_title ON standpunten(title, description);
CREATE INDEX IF NOT EXISTS idx_dossiers_title ON dossiers(title, description);
CREATE INDEX IF NOT EXISTS idx_press_title ON press_articles(title, content);