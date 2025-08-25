// Debug standpunten context around links
async function debugStandpuntenContext() {
    const url = 'https://denuo.be/nl/standpunten';
    console.log(`🔍 Analyzing standpunten context from: ${url}\n`);
    
    const response = await fetch(url);
    const html = await response.text();
    
    // Find all PDF links and their surrounding context
    const pdfMatches = Array.from(html.matchAll(/[\s\S]{200}<a[^>]+href="[^"]*\.pdf"[^>]*>[\s\S]*?<\/a>[\s\S]{200}/gi));
    
    console.log(`📄 Found ${pdfMatches.length} PDF link contexts:\n`);
    
    pdfMatches.slice(0, 3).forEach((match, i) => {
        console.log(`${i + 1}. PDF Context:`);
        console.log(match[0]);
        console.log('\n' + '='.repeat(80) + '\n');
    });
    
    // Also look for the pattern in the HTML structure
    const titlePatterns = [
        // Look for text patterns before PDF links
        /([^<>\n]*\(\d{4}\)[^<>\n]*)<[\s\S]*?href="[^"]*\.pdf"/gi,
        // Look for header patterns
        /<h\d[^>]*>([^<]*\(\d{4}\)[^<]*)<\/h\d>[\s\S]*?href="[^"]*\.pdf"/gi,
    ];
    
    titlePatterns.forEach((pattern, i) => {
        const matches = Array.from(html.matchAll(pattern));
        console.log(`🏷️ Title pattern ${i + 1}: ${matches.length} matches`);
        matches.slice(0, 3).forEach((match, j) => {
            console.log(`   ${j + 1}. "${match[1].trim()}"`);
        });
        console.log('');
    });
}

debugStandpuntenContext().catch(console.error);