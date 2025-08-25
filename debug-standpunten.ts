// Debug standpunten page structure
async function debugStandpunten() {
    const url = 'https://denuo.be/nl/standpunten';
    console.log(`🔍 Analyzing standpunten structure from: ${url}\n`);
    
    const response = await fetch(url);
    const html = await response.text();
    
    console.log(`📄 HTML length: ${html.length} characters\n`);
    
    // Look for view-content area
    const viewContent = html.match(/<div[^>]*class="[^"]*view-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (viewContent) {
        console.log(`📋 Found view-content area (${viewContent[1].length} chars)`);
        console.log(`First 500 chars of view-content:`);
        console.log(viewContent[1].substring(0, 500) + '...\n');
    }
    
    // Look for all links in the page
    const allLinks = Array.from(html.matchAll(/<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi));
    console.log(`🔗 Found ${allLinks.length} total links\n`);
    
    // Filter for potential standpunten links
    const documentLinks = allLinks.filter(match => {
        const href = match[1];
        const text = match[2];
        return href.includes('.pdf') || 
               text.includes('[') || 
               text.includes('(20') || // year pattern
               href.includes('/sites/') // document path
    });
    
    console.log(`📄 Found ${documentLinks.length} potential document links:`);
    documentLinks.slice(0, 10).forEach((match, i) => {
        const href = match[1];
        const text = match[2].replace(/<[^>]*>/g, '').trim();
        console.log(`   ${i + 1}. "${text}" -> ${href}`);
    });
    
    // Look for bracket patterns specifically
    const bracketMatches = html.match(/\[[^\]]{5,}\]/g) || [];
    console.log(`\n📋 Found ${bracketMatches.length} bracket patterns:`);
    bracketMatches.slice(0, 5).forEach((match, i) => {
        console.log(`   ${i + 1}. ${match}`);
    });
}

debugStandpunten().catch(console.error);