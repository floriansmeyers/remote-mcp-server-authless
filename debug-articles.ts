// Debug script to analyze actual article structure
async function debugArticles() {
    const url = 'https://denuo.be/nl/denuo-nieuws';
    console.log(`🔍 Analyzing article structure from: ${url}\n`);
    
    const response = await fetch(url);
    const html = await response.text();
    
    // Look for article elements
    const articleMatches = html.match(/<article[^>]*>[\s\S]*?<\/article>/gi) || [];
    console.log(`📰 Found ${articleMatches.length} <article> elements`);
    
    if (articleMatches.length > 0) {
        console.log(`\n📋 First article structure:`);
        console.log(articleMatches[0] + '\n');
        
        // Extract titles from articles
        const titleMatch = articleMatches[0].match(/<h\d[^>]*>([^<]+)<\/h\d>/) ||
                          articleMatches[0].match(/title="([^"]+)"/) ||
                          articleMatches[0].match(/>([^<]+)</);
        
        if (titleMatch) {
            console.log(`📝 Extracted title: "${titleMatch[1]}"`);
        }
    }
    
    // Look for links that go to article pages
    const articleLinks = html.match(/<a[^>]+href="\/nl\/[^"]+denuo[^"]*"[^>]*>/gi) || [];
    console.log(`\n🔗 Found ${articleLinks.length} potential article links`);
    
    // Extract href and analyze
    articleLinks.slice(0, 3).forEach((link, i) => {
        const hrefMatch = link.match(/href="([^"]+)"/);
        if (hrefMatch) {
            console.log(`   ${i + 1}. ${hrefMatch[1]}`);
        }
    });
    
    // Look for any text content within article elements
    if (articleMatches.length > 0) {
        const textContent = articleMatches[0].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        console.log(`\n📄 Article text content (first 200 chars):`);
        console.log(`"${textContent.substring(0, 200)}..."`);
    }
    
    // Check for category/theme patterns
    const categoryPatterns = [
        /class="[^"]*category[^"]*"/gi,
        /class="[^"]*theme[^"]*"/gi,
        /class="[^"]*tag[^"]*"/gi,
        /<span[^>]*>([^<]*(?:nieuws|partners|leden)[^<]*)<\/span>/gi
    ];
    
    categoryPatterns.forEach((pattern, i) => {
        const matches = html.match(pattern) || [];
        if (matches.length > 0) {
            console.log(`\n🏷️ Category pattern ${i + 1}: ${matches.length} matches`);
            console.log(`   Sample: ${matches[0]}`);
        }
    });
}

debugArticles().catch(console.error);