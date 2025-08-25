-- Database schema for denuo.be content
-- Run with: wrangler d1 execute denuo-content --file=./schema.sql

-- Articles/News content
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    url TEXT UNIQUE NOT NULL,
    published_date TEXT,
    category TEXT,
    language TEXT CHECK (language IN ('nl', 'fr')),
    scraped_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Events/Agenda
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    event_date TEXT,
    location TEXT,
    url TEXT,
    language TEXT CHECK (language IN ('nl', 'fr')),
    scraped_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Partners/Members
CREATE TABLE IF NOT EXISTS partners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    category TEXT,
    scraped_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Scraping metadata to track last successful scrapes
CREATE TABLE IF NOT EXISTS scrape_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL UNIQUE, -- 'articles_nl', 'articles_fr', 'events', 'partners'
    last_scraped TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK (status IN ('success', 'failed')),
    error_message TEXT
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_language ON articles(language);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_articles_title_content ON articles(title, content);