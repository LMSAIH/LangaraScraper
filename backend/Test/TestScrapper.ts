import { CourseScrapper } from '../Controllers/CourseScrapper';

async function testScraper() {
    console.log('🎯 Starting Langara.ca scraper test...\n');

    try {
        // Test the quick scrape method
        const result = await CourseScrapper.quickScrape();
        
        console.log('\n📋 SCRAPING RESULTS:');
        console.log('='.repeat(50));
        console.log(`🌐 URL: ${result.url}`);
        console.log(`📝 Title: ${result.title}`);
        console.log(`⏰ Timestamp: ${result.timestamp}`);
        console.log(`📊 HTML Content Length: ${result.content.length} characters`);
        console.log(`📊 Text Content Length: ${result.textContent.length} characters`);
        
        // Show first 500 characters of text content as preview
        console.log('\n📖 TEXT CONTENT PREVIEW (first 500 chars):');
        console.log('-'.repeat(50));
        console.log(result.textContent.substring(0, 500) + '...');
        
        console.log('\n✅ Scraping completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during scraping:', error);
    }
}

// Run the test
testScraper();