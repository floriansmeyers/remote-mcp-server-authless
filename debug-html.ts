// Debug script to analyze HTML structure
async function debugHtml() {
    const url = 'https://denuo.be/nl/denuo-nieuws';
    console.log(`🔍 Fetching and analyzing HTML from: ${url}\n`);
    
    const response = await fetch(url);
    const html = await response.text();
    
    console.log(`📄 HTML length: ${html.length} characters\n`);
    
    // Look for views-row patterns
    const viewsRows = html.match(/<div[^>]*class="[^"]*views-row[^"]*"[^>]*>[\s\S]*?<\/div>/gi) || [];
    console.log(`🎯 Found ${viewsRows.length} .views-row elements`);
    
    if (viewsRows.length > 0) {
        console.log(`📋 Sample .views-row content:`);
        console.log(viewsRows[0].substring(0, 500) + '...\n');
    }
    
    // Look for title patterns
    const titleMatches = html.match(/<[^>]*class="[^"]*views-field-title[^"]*"[^>]*>[\s\S]*?<\/[^>]*>/gi) || [];
    console.log(`📰 Found ${titleMatches.length} .views-field-title elements`);
    
    if (titleMatches.length > 0) {
        console.log(`📋 Sample title content:`);
        console.log(titleMatches[0] + '\n');
    }
    
    // Look for category patterns
    const categoryMatches = html.match(/<[^>]*class="[^"]*views-field-field-category[^"]*"[^>]*>[\s\S]*?<\/[^>]*>/gi) || [];
    console.log(`🏷️ Found ${categoryMatches.length} .views-field-field-category elements`);
    
    if (categoryMatches.length > 0) {
        console.log(`📋 Sample category content:`);
        console.log(categoryMatches[0] + '\n');
    }
    
    // Look for links within these structures
    const linkMatches = html.match(/<a[^>]+href="([^"]*)"[^>]*>([^<]*)<\/a>/gi) || [];
    console.log(`🔗 Found ${linkMatches.length} links total`);
    
    // Show first few meaningful links (not navigation)
    const meaningfulLinks = linkMatches.filter(link => 
        !link.includes('javascript:') && 
        !link.includes('mailto:') && 
        !link.includes('#') &&
        link.includes('href="/') &&
        link.match(/>([^<]+)<\/a>/)?.[1]?.trim().length > 3
    );
    
    console.log(`📝 Found ${meaningfulLinks.length} meaningful content links:`);
    meaningfulLinks.slice(0, 5).forEach((link, i) => {
        const match = link.match(/<a[^>]+href="([^"]*)"[^>]*>([^<]*)<\/a>/);
        if (match) {
            console.log(`   ${i + 1}. "${match[2].trim()}" -> ${match[1]}`);
        }
    });
}

debugHtml().catch(console.error);